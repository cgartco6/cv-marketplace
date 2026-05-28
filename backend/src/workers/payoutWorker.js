const cron = require('node-cron');
const payoutService = require('../services/payoutService');
const { connectDB } = require('../config/database');

cron.schedule('0 9 * * *', async () => {
  console.log('💰 Payout Worker: Processing daily payouts...');
  await connectDB();
  const result = await payoutService.processDailyPayout();
  console.log('Payout result:', result);
}, { timezone: 'Africa/Johannesburg' });

console.log('Payout Worker started, waiting for schedule...');
