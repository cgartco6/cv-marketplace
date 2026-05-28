const ABTest = require('../models/ABTest');
const Ad = require('../models/Ad');
const LandingPage = require('../models/LandingPage');

class ABTestingService {
  async createTest(name, variants, durationDays = 7) {
    const test = new ABTest({
      name,
      variants: variants.map(v => ({
        variantId: v.id,
        adId: v.adId,
        landingPageId: v.landingPageId,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      })),
      status: 'running',
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 86400000),
    });
    await test.save();
    return test;
  }

  async recordConversion(adId, landingPageId, revenue = 0) {
    const test = await ABTest.findOne({ 'variants.adId': adId, status: 'running' });
    if (!test) return;
    
    const variant = test.variants.find(v => v.adId.toString() === adId);
    if (!variant) return;
    
    variant.conversions += 1;
    variant.revenue += revenue;
    await test.save();
    
    await this.evaluateWinner(test);
  }

  async evaluateWinner(test) {
    if (test.status !== 'running') return;
    if (new Date() < test.endDate) return;
    
    let bestVariant = null;
    let bestConversionRate = 0;
    
    for (const variant of test.variants) {
      const clicks = variant.clicks || 1;
      const conversions = variant.conversions || 0;
      const rate = conversions / clicks;
      if (rate > bestConversionRate) {
        bestConversionRate = rate;
        bestVariant = variant.variantId;
      }
    }
    
    test.winnerVariantId = bestVariant;
    test.status = 'completed';
    await test.save();
    
    for (const variant of test.variants) {
      if (variant.variantId !== bestVariant && variant.adId) {
        await Ad.findByIdAndUpdate(variant.adId, { status: 'paused' });
      }
    }
  }

  async getResults(testId) {
    return ABTest.findById(testId).populate('variants.adId variants.landingPageId');
  }
}

module.exports = new ABTestingService();
