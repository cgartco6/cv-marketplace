const mongoose = require('mongoose');

const abTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  variants: [{
    variantId: String,
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
    landingPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'LandingPage' },
    impressions: Number,
    clicks: Number,
    conversions: Number,
    revenue: Number,
  }],
  winnerVariantId: String,
  status: { type: String, enum: ['draft', 'running', 'completed'], default: 'draft' },
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ABTest', abTestSchema);
