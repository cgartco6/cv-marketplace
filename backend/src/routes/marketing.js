const express = require('express');
const { authMiddleware } = require('./auth');
const marketingController = require('../controllers/marketingController');

const router = express.Router();
router.use(authMiddleware);

router.post('/generate-truthful-ad', marketingController.generateTruthfulAds);
router.get('/ads', marketingController.getActiveAds);
router.get('/landing/:slug', marketingController.getLandingPage);
router.post('/track-conversion', marketingController.trackConversion);

module.exports = router;
