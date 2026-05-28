const mongoose = require('mongoose');

const evolvingConfigSchema = new mongoose.Schema({
  component: { type: String, required: true, unique: true },
  version: { type: Number, default: 1 },
  config: { type: mongoose.Schema.Types.Mixed, required: true },
  deployedAt: { type: Date, default: Date.now },
  deployedBy: { type: String, default: 'system' },
  performanceMetrics: {
    conversionRate: Number,
    userSatisfaction: Number,
    revenueImpact: Number,
  }
});

module.exports = mongoose.model('EvolvingConfig', evolvingConfigSchema);
