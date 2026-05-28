const mongoose = require('mongoose');

const backtestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  target: { type: String, enum: ['ai_rewrite', 'ats_scoring', 'payout_algorithm', 'marketing_campaign', 'pricing_strategy'], required: true },
  historicalDataStart: { type: Date },
  historicalDataEnd: { type: Date },
  parameters: { type: mongoose.Schema.Types.Mixed },
  results: {
    accuracy: Number,
    revenueImpact: Number,
    userRetention: Number,
    errorRate: Number,
    suggestions: [String],
  },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Backtest', backtestSchema);
