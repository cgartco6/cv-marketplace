const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  period: { type: String, enum: ['daily', 'weekly'], required: true },
  date: { type: Date, required: true, unique: true },
  totalRevenue: { type: Number, required: true },
  southAfricanBankShare: { type: Number, required: true },
  africanBankShare: { type: Number, required: true },
  upgradeShare: { type: Number, required: true },
  upgradeReserveAccumulated: { type: Number, default: 0 },
  paidToSouthAfricanBank: { type: Boolean, default: false },
  paidToAfricanBank: { type: Boolean, default: false },
  transferIds: {
    southAfrica: String,
    african: String,
  },
  createdAt: { type: Date, default: Date.now }
});

payoutSchema.index({ date: -1 });

module.exports = mongoose.model('Payout', payoutSchema);
