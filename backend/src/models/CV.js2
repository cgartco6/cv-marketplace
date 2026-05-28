const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  originalText: { type: String, required: true },
  originalFileUrl: String, // path to uploaded file
  rewrittenText: String,
  rewrittenFileUrls: {
    pdf: String,
    docx: String,
    zip: String,
  },
  atsScore: { type: Number, min: 0, max: 100 },
  atsAnalysis: {
    keywordDensity: Object,
    formattingIssues: [String],
    missingSections: [String],
    actionVerbsCount: Number,
    achievementsCount: Number,
    recommendations: [String],
  },
  jobDescription: String, // optional for targeted rewrite
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

cvSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CV', cvSchema);
