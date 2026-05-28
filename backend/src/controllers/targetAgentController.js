const targetMarketingAgent = require('../services/targetMarketingAgent');
const TargetAgentLog = require('../models/TargetAgentLog');

exports.triggerDailyCampaign = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const results = await targetMarketingAgent.executeDailyCampaign();
    res.json(results);
  } catch (err) {
    console.error('Target agent error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await TargetAgentLog.find().sort('-date').limit(30);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
