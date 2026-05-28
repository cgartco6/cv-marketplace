const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  platform: { type: String, enum: ['facebook', 'linkedin', 'twitter', 'instagram', 'google'], required: true },
  offerTier: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], required: true },
  headline: { type: String, required: true },
  description: { type: String, required: true },
  cta: { type: String, required: true },
  imageUrl: { type: String },
  videoUrl: { type: String },
  targetUrl: { type: String, required: true },
  status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' },
  platformAdId: { type: String },
  schedule: {
    startAt: Date,
    endAt: Date,
    bestTimeToPost: Date,
    lastPosted: Date,
  },
  budget: { type: Number },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    ctr: { type: Number },
    conversionRate: { type: Number },
    costPerConversion: { type: Number },
  },
  abTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ABTest' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

adSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.metrics.impressions > 0) {
    this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions) * 100;
  }
  if (this.metrics.clicks > 0) {
    this.metrics.conversionRate = (this.metrics.conversions / this.metrics.clicks) * 100;
  }
  next();
});

module.exports = mongoose.model('Ad', adSchema);
