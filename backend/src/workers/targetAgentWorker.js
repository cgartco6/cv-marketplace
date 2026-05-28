const cron = require('node-cron');
const targetMarketingAgent = require('../services/targetMarketingAgent');
const { connectDB } = require('../config/database');

cron.schedule('0 8 * * *', async () => {
  console.log('🎯 Target Agent Worker: Running daily campaign...');
  await connectDB();
  const result = await targetMarketingAgent.executeDailyCampaign();
  console.log('Target Agent result:', result);
}, { timezone: 'Africa/Johannesburg' });

console.log('Target Agent Worker started.');
