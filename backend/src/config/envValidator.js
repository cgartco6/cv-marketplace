const requiredEnv = [
  'PORT', 'NODE_ENV', 'MONGODB_URI', 'REDIS_HOST',
  'OPENAI_API_KEY', 'JWT_SECRET',
  'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
  'PAYPAL_CLIENT_ID', 'PAYPAL_SECRET',
  'PAYFAST_MERCHANT_ID', 'PAYFAST_MERCHANT_KEY', 'PAYFAST_PASSPHRASE',
  'OZOW_MERCHANT_ID', 'OZOW_API_KEY', 'OZOW_SITE_CODE',
  'EFT_BANK_ACCOUNT_NAME', 'EFT_BANK_ACCOUNT_NUMBER', 'EFT_BANK_CODE',
  'SOUTH_AFRICAN_BANK_PERCENT', 'AFRICAN_BANK_PERCENT', 'UPGRADE_PERCENT'
];

function validateEnv() {
  const missing = requiredEnv.filter(key => !process.env[key]);
  if (missing.length) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    throw new Error(`Missing ${missing.length} environment variables. Check .env.${process.env.NODE_ENV} file.`);
  }
  console.log('✅ All environment variables present');
}

module.exports = { validateEnv };
