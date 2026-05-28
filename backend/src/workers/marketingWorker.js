const cron = require('node-cron');
const humanLikeAgent = require('../services/humanLikeMarketingAgent');
const { connectDB } = require('../config/database');

cron.schedule('0 2 * * *', async () => {
  console.log('📢 Marketing Worker: Generating truthful ads...');
  await connectDB();
  await humanLikeAgent.runDailyPosting();
}, { timezone: 'Africa/Johannesburg' });

cron.schedule('0 * * * *', async () => {
  console.log('🕒 Marketing Worker: Checking ad schedule...');
  await connectDB();
  console.log('Ad schedule check complete.');
});

console.log('Marketing Worker started.');
