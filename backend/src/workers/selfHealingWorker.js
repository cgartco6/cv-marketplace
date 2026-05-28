const cron = require('node-cron');
const selfHealing = require('../services/selfHealingService');
const codeQuality = require('../services/codeQualityService');
const evolvingSystem = require('../services/evolvingSystemService');
const { connectDB } = require('../config/database');

cron.schedule('*/15 * * * *', async () => {
  console.log('🩺 Self-Healing Worker: Monitoring system...');
  await connectDB();
  await selfHealing.monitorAndHeal();
});

cron.schedule('0 3 * * *', async () => {
  console.log('🔍 Code Quality Worker: Verifying code...');
  await connectDB();
  await codeQuality.verifyAllCode();
  await codeQuality.autoFixIssues();
});

cron.schedule('0 4 * * *', async () => {
  console.log('🧬 Evolution Worker: Running evolution cycle...');
  await connectDB();
  await evolvingSystem.runEvolutionCycle();
});

console.log('Self-Healing & Evolution Workers started.');
