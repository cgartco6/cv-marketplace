const mongoose = require('mongoose');

const socialPlatformRuleSchema = new mongoose.Schema({
  platform: { type: String, enum: ['facebook', 'google', 'linkedin', 'twitter', 'instagram'], required: true, unique: true },
  prohibitedKeywords: [String],
  requiredDisclaimers: [String],
  allowedCallToActions: [String],
  characterLimits: {
    headline: Number,
    description: Number,
  },
  imageRequirements: {
    minWidth: Number,
    minHeight: Number,
    maxSizeMB: Number,
  },
  videoRequirements: {
    maxDurationSec: Number,
    maxSizeMB: Number,
  },
  specialRestrictions: [String],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SocialPlatformRule', socialPlatformRuleSchema);
