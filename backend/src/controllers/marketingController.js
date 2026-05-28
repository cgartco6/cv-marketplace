const TruthfulMarketingService = require('../services/truthfulMarketingService');
const Ad = require('../models/Ad');
const LandingPage = require('../models/LandingPage');

exports.generateTruthfulAds = async (req, res) => {
  try {
    const { tier, platform } = req.body;

    if (!tier || !platform) {
      return res.status(400).json({ error: 'Tier and platform are required' });
    }

    const ad = await TruthfulMarketingService.generateTruthfulAd(tier, platform);
    res.json(ad);
  } catch (err) {
    console.error('Generate ad error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'active' }).sort('-createdAt').limit(50);
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLandingPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await LandingPage.findOne({ slug, status: 'published' });

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    page.visits += 1;
    await page.save();

    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackConversion = async (req, res) => {
  try {
    const { adId, landingPageId } = req.body;

    await Ad.findByIdAndUpdate(adId, { $inc: { 'metrics.conversions': 1 } });
    await LandingPage.findByIdAndUpdate(landingPageId, { $inc: { conversions: 1 } });

    const Tracker = require('../models/Tracker');
    await Tracker.create({
      type: 'conversion',
      adId,
      landingPageId,
      userId: req.user?.id,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
