const mongoose = require('mongoose');

const targetAgentLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  targets: {
    free: Number,
    starter: Number,
    professional: Number,
    enterprise: Number,
  },
  achieved: {
    free: { achieved: Number, revenue: Number },
    starter: { achieved: Number, revenue: Number },
    professional: { achieved: Number, revenue: Number },
    enterprise: { achieved: Number, revenue: Number },
  },
  revenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

targetAgentLogSchema.index({ date: -1 });

module.exports = mongoose.model('TargetAgentLog', targetAgentLogSchema);
