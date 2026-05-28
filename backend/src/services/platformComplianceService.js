const SocialPlatformRule = require('../models/SocialPlatformRule');

class PlatformComplianceService {
  constructor() {
    this.defaultRules = {
      facebook: {
        prohibitedKeywords: ['guaranteed', 'instant', '100%', 'free money', 'miracle'],
        requiredDisclaimers: ['Results may vary'],
        allowedCallToActions: ['Learn More', 'Sign Up', 'Get Started'],
        characterLimits: { headline: 40, description: 125 },
        specialRestrictions: ['No before/after images', 'No targeting based on sensitive data'],
      },
      google: {
        prohibitedKeywords: ['best', '#1', 'guaranteed', 'free cv'],
        allowedCallToActions: ['Get Quote', 'Contact Us', 'Subscribe'],
        characterLimits: { headline: 30, description: 90 },
        specialRestrictions: ['No misleading claims', 'Must disclose pricing clearly'],
      },
      linkedin: {
        prohibitedKeywords: ['unemployed', 'desperate'],
        allowedCallToActions: ['Apply Now', 'Learn More'],
        characterLimits: { headline: 150, description: 300 },
        specialRestrictions: ['No spam InMails', 'Must be relevant to professionals'],
      },
      twitter: {
        prohibitedKeywords: ['scam', 'make money fast'],
        allowedCallToActions: ['Tweet', 'Share'],
        characterLimits: { headline: 70, description: 280 },
        specialRestrictions: ['No profanity', 'No misleading claims'],
      },
      instagram: {
        prohibitedKeywords: ['naked', 'violence', 'hate'],
        allowedCallToActions: ['Swipe Up', 'Link in Bio'],
        characterLimits: { headline: 125, description: 2200 },
        specialRestrictions: ['No weight loss claims', 'No before/after images'],
      },
    };
  }

  async loadOrCreateRules() {
    for (const [platform, rules] of Object.entries(this.defaultRules)) {
      await SocialPlatformRule.findOneAndUpdate(
        { platform },
        { ...rules, lastUpdated: new Date() },
        { upsert: true }
      );
    }
  }

  async validateAdContent(platform, headline, description, cta, imageUrl) {
    const rule = await SocialPlatformRule.findOne({ platform });
    if (!rule) return { valid: false, errors: ['Platform rules not found'] };
    
    const errors = [];
    if (headline.length > rule.characterLimits.headline) {
      errors.push(`Headline exceeds ${rule.characterLimits.headline} chars`);
    }
    if (description.length > rule.characterLimits.description) {
      errors.push(`Description exceeds ${rule.characterLimits.description} chars`);
    }
    
    const lower = (headline + ' ' + description).toLowerCase();
    for (const kw of rule.prohibitedKeywords) {
      if (lower.includes(kw)) errors.push(`Contains prohibited keyword: "${kw}"`);
    }
    
    if (!rule.allowedCallToActions.includes(cta)) {
      errors.push(`CTA "${cta}" not allowed. Allowed: ${rule.allowedCallToActions.join(', ')}`);
    }
    
    return { valid: errors.length === 0, errors };
  }

  async validateLandingPage(lp) {
    const errors = [];
    if (!lp.body.includes('privacy')) errors.push('Missing privacy policy');
    if (lp.headline.toLowerCase().includes('guaranteed')) errors.push('No guarantee claims');
    return { valid: errors.length === 0, errors };
  }

  async getBestTimeToPost(platform) {
    const times = { facebook: 13, linkedin: 9, twitter: 12, instagram: 18, google: 10 };
    return times[platform] || 12;
  }

  async getPostingFrequency(platform) {
    const freqs = { facebook: 2, linkedin: 1, twitter: 5, instagram: 3, google: 1 };
    return freqs[platform] || 2;
  }
}

module.exports = new PlatformComplianceService();
