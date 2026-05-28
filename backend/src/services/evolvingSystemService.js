const EvolvingConfig = require('../models/EvolvingConfig');
const Backtest = require('../models/Backtest');
const User = require('../models/User');
const Order = require('../models/Order');
const backtestService = require('./backtestService');

class EvolvingSystemService {
  async runEvolutionCycle() {
    console.log('🧬 Running evolution cycle...');
    
    await this.evolveFromFreeTierData();
    await this.evolveFromUpgradeData();
    await this.evolveAIPrompts();
    
    const backtest = new Backtest({
      name: `Evolution cycle ${new Date().toISOString()}`,
      target: 'pricing_strategy',
      historicalDataStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      historicalDataEnd: new Date(),
    });
    await backtest.save();
    await backtestService.runBacktest(backtest._id);
  }

  async evolveFromFreeTierData() {
    const freeUsers = await User.find({ tier: 'free', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const converted = freeUsers.filter(u => u.tier !== 'free');
    const conversionRate = freeUsers.length ? (converted.length / freeUsers.length) * 100 : 0;
    
    if (conversionRate < 5) {
      await this.updateConfig('free_tier_strategy', {
        credits: 3,
        features: ['Basic ATS score', 'Up to 3 CV rewrites', 'Email support'],
        upgradePromptTiming: 'after_ats_score',
        lastUpdated: new Date()
      });
    }
  }

  async evolveFromUpgradeData() {
    const paidOrders = await Order.find({ paymentStatus: 'paid' }).populate('userId');
    const featureUsage = { rewrite: 0, ats: 0, interview: 0, tutor: 0 };
    
    for (const order of paidOrders) {
      featureUsage.rewrite += order.tier !== 'free' ? 1 : 0;
      featureUsage.ats += 1;
      if (order.tier === 'professional' || order.tier === 'enterprise') featureUsage.interview += 1;
      if (order.tier === 'enterprise') featureUsage.tutor += 1;
    }
    
    const bestFeature = Object.entries(featureUsage).sort((a, b) => b[1] - a[1])[0][0];
    await this.updateConfig('feature_prioritization', {
      primaryFeature: bestFeature,
      secondaryFeatures: ['ats', 'rewrite'],
      lastUpdated: new Date()
    });
  }

  async evolveAIPrompts() {
    const currentConfig = await EvolvingConfig.findOne({ component: 'ai_prompt_templates' });
    const newVersion = (currentConfig?.version || 0) + 1;
    
    await this.updateConfig('ai_prompt_templates', {
      version: newVersion,
      templates: {
        ats_scoring: 'Be more specific about keyword matching with job descriptions',
        cv_rewrite: 'Add industry-specific terminology and emphasize quantifiable achievements',
        interview_qa: 'Include behavioral questions based on STAR method'
      },
      deployedAt: new Date()
    });
  }

  async updateConfig(component, newConfig) {
    await EvolvingConfig.findOneAndUpdate(
      { component },
      { $inc: { version: 1 }, $set: { config: newConfig, deployedAt: new Date() } },
      { upsert: true, new: true }
    );
    console.log(`✅ Updated config for ${component}`);
  }
}

module.exports = new EvolvingSystemService();
