const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tier: { type: String, enum: ['starter', 'professional', 'enterprise'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'ZAR' },
  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'payfast', 'ozow', 'eft'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  paymentMetadata: { type: mongoose.Schema.Types.Mixed },
  billingPeriod: { type: String, enum: ['monthly', 'once'], default: 'monthly' },
  subscriptionId: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, paidAt: 1 });

module.exports = mongoose.model('Order', orderSchema);
