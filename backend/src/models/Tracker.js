const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema({
  type: { type: String, enum: ['marketing', 'ad_performance', 'landing_page_visit', 'conversion', 'bounce'], required: true },
  adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
  landingPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'LandingPage' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, index: true },
  ip: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

trackerSchema.index({ timestamp: -1, type: 1 });
trackerSchema.index({ adId: 1, timestamp: -1 });
trackerSchema.index({ landingPageId: 1, timestamp: -1 });

module.exports = mongoose.model('Tracker', trackerSchema);
