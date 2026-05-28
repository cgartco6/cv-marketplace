const Tracker = require('../models/Tracker');
const Ad = require('../models/Ad');
const LandingPage = require('../models/LandingPage');

class TrackerService {
  async trackAdImpression(adId, sessionId = null, ip = null, userAgent = null) {
    const tracker = new Tracker({
      type: 'ad_performance',
      adId,
      sessionId,
      ip,
      userAgent,
      metadata: { impression: true }
    });
    await tracker.save();
    await Ad.findByIdAndUpdate(adId, { $inc: { 'metrics.impressions': 1 } });
  }

  async trackLandingPageVisit(landingPageId, userId = null, sessionId, referrer, ip, userAgent, bounced = false) {
    const tracker = new Tracker({
      type: 'landing_page_visit',
      landingPageId,
      userId,
      sessionId,
      ip,
      userAgent,
      referrer,
      metadata: { bounced }
    });
    await tracker.save();
    
    await LandingPage.findByIdAndUpdate(landingPageId, { $inc: { visits: 1 } });
    if (bounced) {
      await LandingPage.findByIdAndUpdate(landingPageId, { $inc: { bounceRate: 1 } });
    }
  }

  async trackConversion(adId, landingPageId, userId, orderId) {
    const tracker = new Tracker({
      type: 'conversion',
      adId,
      landingPageId,
      userId,
      metadata: { orderId, converted: true }
    });
    await tracker.save();
    
    await Ad.findByIdAndUpdate(adId, { $inc: { 'metrics.conversions': 1 } });
    await LandingPage.findByIdAndUpdate(landingPageId, { $inc: { conversions: 1 } });
  }

  async getMarketingMetrics(startDate, endDate) {
    const ads = await Tracker.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      } }
    ]);
    
    const totalImpressions = await Ad.aggregate([
      { $group: { _id: null, total: { $sum: '$metrics.impressions' } } }
    ]);
    
    const totalConversions = await Ad.aggregate([
      { $group: { _id: null, total: { $sum: '$metrics.conversions' } } }
    ]);
    
    return {
      events: ads,
      totalImpressions: totalImpressions[0]?.total || 0,
      totalConversions: totalConversions[0]?.total || 0,
      conversionRate: totalImpressions[0]?.total ? (totalConversions[0]?.total / totalImpressions[0]?.total) * 100 : 0
    };
  }
}

module.exports = new TrackerService();
