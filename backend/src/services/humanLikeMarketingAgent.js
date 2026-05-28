const TruthfulMarketingService = require('./truthfulMarketingService');
const Ad = require('../models/Ad');

class HumanLikeMarketingAgent {
  async runDailyPosting() {
    const tiers = ['free', 'starter', 'professional', 'enterprise'];
    const platforms = ['facebook', 'linkedin', 'twitter', 'instagram', 'google'];

    for (const tier of tiers) {
      for (const platform of platforms) {
        try {
          const existingAd = await Ad.findOne({ platform, offerTier: tier, status: 'active' });
          if (!existingAd) {
            await TruthfulMarketingService.generateTruthfulAd(tier, platform);
            await TruthfulMarketingService.createTruthfulLandingPage(tier);
            console.log(`📢 Truthful ad generated for ${tier} on ${platform}`);
          } else {
            console.log(`✅ Ad already exists for ${tier} on ${platform}`);
          }
        } catch (error) {
          console.error(`Failed to generate ad for ${tier} on ${platform}:`, error);
        }
      }
    }
  }

  async postAdWithDelay(ad) {
    const delay = Math.floor(Math.random() * 30000) + 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`🤖 Posting to ${ad.platform}: ${ad.headline.substring(0, 60)}...`);
    return { posted: true, platform: ad.platform, adId: ad._id };
  }
}

module.exports = new HumanLikeMarketingAgent();
