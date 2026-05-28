const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  period: { type: String, required: true }, // 'daily', 'weekly'
  date: { type: Date, required: true },
  totalRevenue: { type: Number, required: true },
  southAfricanBankShare: { type: Number, required: true }, // 50%
  africanBankShare: { type: Number, required: true }, // 10%
  upgradeShare: { type: Number, required: true }, // 40%
  upgradeReserveAccumulated: { type: Number, default: 0 },
  paidToSouthAfricanBank: { type: Boolean, default: false },
  paidToAfricanBank: { type: Boolean, default: false },
  transferIds: {
    southAfrica: String,
    african: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payout', payoutSchema);
