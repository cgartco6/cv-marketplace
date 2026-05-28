const mongoose = require('mongoose');

const abTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  variants: [{
    variantId: { type: String, required: true },
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
    landingPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'LandingPage' },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  }],
  winnerVariantId: String,
  status: { type: String, enum: ['draft', 'running', 'completed'], default: 'draft' },
  startDate: { type: Date },
  endDate: { type: Date },
  confidenceThreshold: { type: Number, default: 0.95 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ABTest', abTestSchema);
