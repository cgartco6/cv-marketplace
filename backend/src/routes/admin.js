const express = require('express');
const { authMiddleware } = require('./auth');
const User = require('../models/User');
const Backtest = require('../models/Backtest');
const SelfHealingLog = require('../models/SelfHealingLog');
const CodeReview = require('../models/CodeReview');
const EvolvingConfig = require('../models/EvolvingConfig');
const backtestService = require('../services/backtestService');
const payoutService = require('../services/payoutService');

const router = express.Router();
router.use(authMiddleware);

router.use((req, res, next) => {
  if (!['admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.put('/user/:id/role', async (req, res) => {
  const { role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ success: true });
});

router.post('/backtest/run', async (req, res) => {
  const backtest = new Backtest(req.body);
  await backtest.save();
  backtestService.runBacktest(backtest._id);
  res.json({ backtestId: backtest._id });
});

router.get('/backtest/:id', async (req, res) => {
  const backtest = await Backtest.findById(req.params.id);
  res.json(backtest);
});

router.get('/healing/logs', async (req, res) => {
  const logs = await SelfHealingLog.find().sort('-detectedAt').limit(100);
  res.json(logs);
});

router.get('/code-reviews', async (req, res) => {
  const reviews = await CodeReview.find().sort('-createdAt');
  res.json(reviews);
});

router.get('/evolution/configs', async (req, res) => {
  const configs = await EvolvingConfig.find();
  res.json(configs);
});

router.post('/force-payout', async (req, res) => {
  const result = await payoutService.processDailyPayout();
  res.json(result);
});

module.exports = router;
