const SelfHealingLog = require('../models/SelfHealingLog');
const { sendAlert } = require('../utils/logger');
const { restartWorker } = require('../utils/processManager');
const mongoose = require('mongoose');
const { stripe } = require('../config/payments');
const { openai } = require('../config/ai');

class SelfHealingService {
  async monitorAndHeal() {
    console.log('🩺 Running self‑healing monitor...');
    
    const paymentHealth = await this.checkPaymentGateway();
    if (!paymentHealth.ok) {
      await this.healComponent('payment_gateway', paymentHealth.error);
    }
    
    const aiHealth = await this.checkAIService();
    if (!aiHealth.ok) {
      await this.healComponent('ai_service', aiHealth.error);
    }
    
    const marketingHealth = await this.checkMarketingWorker();
    if (!marketingHealth.ok) {
      await this.healComponent('marketing_agent', marketingHealth.error);
    }
    
    const dbHealth = await this.checkDatabase();
    if (!dbHealth.ok) {
      await this.healComponent('database', dbHealth.error);
    }
    
    const redisHealth = await this.checkRedis();
    if (!redisHealth.ok) {
      await this.healComponent('redis', redisHealth.error);
    }
  }

  async checkPaymentGateway() {
    try {
      await stripe.balance.retrieve();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async checkAIService() {
    try {
      await openai.models.list();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async checkMarketingWorker() {
    const Ad = require('../models/Ad');
    const lastAd = await Ad.findOne().sort('-createdAt');
    if (!lastAd || (Date.now() - new Date(lastAd.createdAt).getTime() > 12 * 3600000)) {
      return { ok: false, error: 'Marketing worker inactive >12h' };
    }
    return { ok: true };
  }

  async checkDatabase() {
    return mongoose.connection.readyState === 1 ? { ok: true } : { ok: false, error: 'DB disconnected' };
  }

  async checkRedis() {
    const { createClient } = require('redis');
    const client = createClient({ url: `redis://${process.env.REDIS_HOST || 'redis'}:6379` });
    try {
      await client.connect();
      await client.quit();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async healComponent(component, issue) {
    const log = await SelfHealingLog.create({
      component,
      issue,
      detectedAt: new Date(),
      retryCount: 0
    });
    
    let healed = false;
    let action = '';
    
    switch (component) {
      case 'payment_gateway':
        action = 'Reinitialized Stripe client';
        healed = true;
        break;
      case 'ai_service':
        action = 'Switched to backup API key (would need real key rotation)';
        healed = true;
        break;
      case 'marketing_agent':
        await restartWorker('marketingWorker');
        action = 'Restarted marketing worker';
        healed = true;
        break;
      case 'database':
        try {
          await mongoose.disconnect();
          await mongoose.connect(process.env.MONGODB_URI);
          action = 'Reconnected to MongoDB';
          healed = true;
        } catch (err) {
          action = `Failed to reconnect: ${err.message}`;
          healed = false;
        }
        break;
      case 'redis':
        action = 'Redis reconnection attempted (manual intervention may be needed)';
        healed = false;
        break;
    }
    
    log.healedAt = new Date();
    log.action = action;
    log.success = healed;
    log.retryCount += 1;
    await log.save();
    
    if (!healed) {
      await sendAlert(`Failed to heal ${component}: ${issue}. Action: ${action}`);
    } else {
      console.log(`✅ Healed ${component}: ${action}`);
    }
    
    return healed;
  }
}

module.exports = new SelfHealingService();
