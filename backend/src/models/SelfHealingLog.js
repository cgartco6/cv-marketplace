const mongoose = require('mongoose');

const selfHealingLogSchema = new mongoose.Schema({
  component: { type: String, required: true },
  issue: { type: String, required: true },
  detectedAt: { type: Date, default: Date.now },
  healedAt: Date,
  action: String,
  success: Boolean,
  retryCount: { type: Number, default: 0 }
});

selfHealingLogSchema.index({ detectedAt: -1 });

module.exports = mongoose.model('SelfHealingLog', selfHealingLogSchema);
