const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

async function setupIndexes() {
  await connectDB();
  
  const models = [
    'User', 'CV', 'Order', 'Payout', 'Ad', 'LandingPage', 'ABTest',
    'Tracker', 'TargetAgentLog', 'SocialPlatformRule', 'Backtest',
    'SelfHealingLog', 'CodeReview', 'EvolvingConfig'
  ];
  
  for (const modelName of models) {
    try {
      const Model = require(`../models/${modelName}`);
      await Model.createIndexes();
      console.log(`✅ Indexes created for ${modelName}`);
    } catch (err) {
      console.error(`❌ Failed to create indexes for ${modelName}:`, err.message);
    }
  }
  
  console.log('All indexes created successfully');
  process.exit(0);
}

setupIndexes();
