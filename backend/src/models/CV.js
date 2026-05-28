const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  originalText: { type: String, required: true },
  originalFileUrl: { type: String },
  rewrittenText: { type: String },
  rewrittenFileUrls: {
    pdf: String,
    docx: String,
    zip: String,
  },
  atsScore: { type: Number, min: 0, max: 100 },
  atsAnalysis: {
    keywordDensity: mongoose.Schema.Types.Mixed,
    formattingIssues: [String],
    missingSections: [String],
    actionVerbsCount: Number,
    achievementsCount: Number,
    recommendations: [String],
  },
  jobDescription: { type: String },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

cvSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

cvSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CV', cvSchema);
