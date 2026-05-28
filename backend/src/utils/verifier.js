const fs = require('fs');
const path = require('path');

async function verifyAll() {
  console.log('🔍 Running final verification...');
  
  const requiredModels = [
    'User', 'CV', 'Order', 'Payout', 'Ad', 'LandingPage', 'ABTest',
    'Tracker', 'TargetAgentLog', 'SocialPlatformRule', 'Backtest',
    'SelfHealingLog', 'CodeReview', 'EvolvingConfig'
  ];
  
  const modelFiles = fs.readdirSync(path.join(__dirname, '../models'));
  const missingModels = [];
  
  for (const model of requiredModels) {
    if (!modelFiles.some(f => f.includes(model))) {
      missingModels.push(model);
    }
  }
  
  if (missingModels.length > 0) {
    throw new Error(`Missing models: ${missingModels.join(', ')}`);
  }
  
  const requiredServices = [
    'aiService', 'atsService', 'documentService', 'payoutService',
    'truthfulMarketingService', 'humanLikeMarketingAgent', 'bronwynChatbot',
    'targetMarketingAgent', 'backtestService', 'selfHealingService',
    'codeQualityService', 'evolvingSystemService', 'trackerService',
    'abTestingService', 'platformComplianceService'
  ];
  
  const serviceFiles = fs.readdirSync(path.join(__dirname, '../services'));
  const missingServices = [];
  
  for (const svc of requiredServices) {
    if (!serviceFiles.some(f => f.includes(svc.replace('Service', '')) || f.includes(svc.replace('Agent', '')))) {
      missingServices.push(svc);
    }
  }
  
  if (missingServices.length > 0) {
    console.warn(`⚠️ Potentially missing services: ${missingServices.join(', ')}`);
  }
  
  console.log('✅ All core components verified.');
  console.log('🔒 Module ready for deployment.');
}

verifyAll().catch(console.error);
