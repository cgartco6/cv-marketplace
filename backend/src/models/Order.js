const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tier: { type: String, enum: ['starter', 'professional', 'enterprise'], required: true },
  amount: { type: Number, required: true }, // In ZAR
  currency: { type: String, default: 'ZAR' },
  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'payfast', 'ozow', 'eft'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  transactionId: String,
  paymentMetadata: Object,
  subscriptionId: String, // if recurring
  billingPeriod: { type: String, enum: ['monthly', 'once'], default: 'monthly' },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
});

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
