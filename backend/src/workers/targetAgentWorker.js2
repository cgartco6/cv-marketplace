const cron = require('node-cron');
const targetMarketingAgent = require('../services/targetMarketingAgent');
const { connectDB } = require('../config/database');

// Run daily at 8:00 AM SAST
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Running Target Marketing Agent daily job...');
  await connectDB();
  await targetMarketingAgent.executeDailyCampaign();
}, { timezone: 'Africa/Johannesburg' });

console.log('Target Agent Worker started, waiting for schedule...');
