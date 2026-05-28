const mongoose = require('mongoose');

const codeReviewSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  component: String,
  reviewedBy: { type: String, enum: ['ai_verifier', 'admin'], default: 'ai_verifier' },
  issues: [{
    severity: { type: String, enum: ['critical', 'warning', 'info'] },
    line: Number,
    message: String,
    suggestedFix: String,
  }],
  status: { type: String, enum: ['pending', 'approved', 'fixed', 'deployed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  fixedAt: Date
});

codeReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema);
