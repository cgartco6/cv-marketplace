const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  offerTier: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'] },
  headline: { type: String, required: true },
  subheadline: String,
  body: { type: String, required: true },
  ctaText: { type: String, required: true },
  ctaUrl: String,
  images: [String],
  videoUrl: String,
  testimonials: [{
    name: String,
    text: String,
    rating: Number,
  }],
  pricingDisplay: {
    monthly: Number,
    once: Number,
  },
  complianceFlags: {
    hasDisclaimer: { type: Boolean, default: true },
    noFalseClaims: { type: Boolean, default: true },
    noGuaranteedIncome: { type: Boolean, default: true },
    hasPrivacyLink: { type: Boolean, default: true },
    hasTermsLink: { type: Boolean, default: true },
  },
  platformRestrictions: {
    facebook: { allowed: Boolean, reason: String },
    google: { allowed: Boolean, reason: String },
    linkedin: { allowed: Boolean, reason: String },
    twitter: { allowed: Boolean, reason: String },
    instagram: { allowed: Boolean, reason: String },
  },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  abTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ABTest' },
  visits: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

landingPageSchema.index({ slug: 1, status: 1 });

module.exports = mongoose.model('LandingPage', landingPageSchema);
