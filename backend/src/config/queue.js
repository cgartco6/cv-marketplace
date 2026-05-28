const Bull = require('bull');
const redisConfig = { host: process.env.REDIS_HOST || 'redis', port: 6379, retryStrategy: (times) => Math.min(times * 50, 2000) };

const payoutQueue = new Bull('payout', { redis: redisConfig });
const marketingQueue = new Bull('marketing', { redis: redisConfig });
const targetAgentQueue = new Bull('targetAgent', { redis: redisConfig });

const setupQueues = async () => {
  try {
    await payoutQueue.empty();
    await marketingQueue.empty();
    await targetAgentQueue.empty();
    console.log('✅ Bull queues initialized');
  } catch (error) {
    console.error('Queue initialization error:', error);
  }
};

module.exports = { payoutQueue, marketingQueue, targetAgentQueue, setupQueues };
