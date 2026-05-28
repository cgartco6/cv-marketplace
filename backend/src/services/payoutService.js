const Payout = require('../models/Payout');
const Order = require('../models/Order');
const Revenue = require('../models/Revenue');
const axios = require('axios');

class PayoutService {
  async processDailyPayout() {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await Payout.findOne({ period: 'daily', date: { $gte: new Date(today) } });
    if (existing) {
      return { skipped: true, reason: 'Already processed today' };
    }

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const paidOrders = await Order.find({
      paymentStatus: 'paid',
      paidAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    if (totalRevenue === 0) {
      return { skipped: true, reason: 'No revenue today' };
    }

    const saShare = totalRevenue * (parseFloat(process.env.SOUTH_AFRICAN_BANK_PERCENT) / 100);
    const africanShare = totalRevenue * (parseFloat(process.env.AFRICAN_BANK_PERCENT) / 100);
    const upgradeShare = totalRevenue * (parseFloat(process.env.UPGRADE_PERCENT) / 100);

    let saTransferId = null;
    let afTransferId = null;

    if (saShare > 0) {
      saTransferId = await this.transferToSouthAfricanBank(saShare);
    }
    if (africanShare > 0) {
      afTransferId = await this.transferToAfricanBank(africanShare);
    }

    let upgradeReserveAcc = await this.getUpgradeReserveAccumulated();
    upgradeReserveAcc += upgradeShare;

    if (upgradeReserveAcc >= 5000) {
      console.log(`🎉 Upgrade reserve reached R${upgradeReserveAcc}. Ready for company registration.`);
    }

    const payout = new Payout({
      period: 'daily',
      date: new Date(today),
      totalRevenue,
      southAfricanBankShare: saShare,
      africanBankShare: africanShare,
      upgradeShare,
      upgradeReserveAccumulated: upgradeReserveAcc,
      paidToSouthAfricanBank: !!saTransferId,
      paidToAfricanBank: !!afTransferId,
      transferIds: { southAfrica: saTransferId, african: afTransferId },
    });
    await payout.save();

    await Revenue.create({
      source: 'payout',
      amount: totalRevenue,
      payoutId: payout._id,
      description: `Daily payout for ${today}`
    });

    return { processed: true, saShare, africanShare, upgradeShare, upgradeReserve: upgradeReserveAcc };
  }

  async transferToSouthAfricanBank(amount) {
    try {
      const response = await axios.post('https://api.payfast.co.za/payouts', {
        amount: amount.toFixed(2),
        bank_account: process.env.SA_BANK_ACCOUNT,
        bank_code: process.env.SA_BANK_CODE,
        reference: `payout_${Date.now()}`,
      }, {
        headers: {
          'merchant-id': process.env.PAYFAST_MERCHANT_ID,
          'api-key': process.env.PAYFAST_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      return response.data.id;
    } catch (error) {
      console.error('SA bank transfer failed:', error.response?.data || error.message);
      return null;
    }
  }

  async transferToAfricanBank(amount) {
    try {
      const response = await axios.post('https://api.flutterwave.com/v3/transfers', {
        amount: amount.toFixed(2),
        currency: 'ZAR',
        recipient: process.env.AFRICAN_BANK_RECIPIENT,
        narration: 'CV Marketplace daily payout',
        reference: `cv_payout_${Date.now()}`,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data.id;
    } catch (error) {
      console.error('African bank transfer failed:', error.response?.data || error.message);
      return null;
    }
  }

  async getUpgradeReserveAccumulated() {
    const lastPayout = await Payout.findOne().sort('-date');
    return lastPayout ? lastPayout.upgradeReserveAccumulated : 0;
  }
}

module.exports = new PayoutService();
