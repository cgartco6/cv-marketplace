const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  platform: { type: String, enum: ['facebook', 'linkedin', 'twitter', 'instagram', 'google'], required: true },
  offerTier: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'] },
  headline: { type: String, required: true },
  description: { type: String, required: true },
  cta: { type: String, required: true },
  imageUrl: String,
  videoUrl: String,
  targetUrl: { type: String, required: true }, // landing page URL
  status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' },
  platformAdId: String, // ID from social platform
  schedule: {
    startAt: Date,
    endAt: Date,
    bestTimeToPost: Date, // computed by algorithm
  },
  budget: Number,
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    ctr: Number,
    conversionRate: Number,
    costPerConversion: Number,
  },
  abTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ABTest' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Ad', adSchema);
