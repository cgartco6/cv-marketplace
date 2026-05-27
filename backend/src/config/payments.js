const Stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const PayFast = require('payfast');
const Ozow = require('ozow');

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PayPal
const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalSecret = process.env.PAYPAL_SECRET;
const paypalEnvironment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment() 
  : new paypal.core.SandboxEnvironment(paypalClientId, paypalSecret);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// PayFast
const payfastConfig = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  passphrase: process.env.PAYFAST_PASSPHRASE,
  test_mode: process.env.NODE_ENV !== 'production',
};
const payfast = new PayFast(payfastConfig);

// Ozow
const ozowConfig = {
  merchantId: process.env.OZOW_MERCHANT_ID,
  apiKey: process.env.OZOW_API_KEY,
  siteCode: process.env.OZOW_SITE_CODE,
  testMode: process.env.NODE_ENV !== 'production',
};
const ozow = new Ozow(ozowConfig);

// EFT Simulation (Direct bank transfer)
const eftSimulation = {
  bankAccount: {
    accountName: process.env.EFT_BANK_ACCOUNT_NAME,
    accountNumber: process.env.EFT_BANK_ACCOUNT_NUMBER,
    bankCode: process.env.EFT_BANK_CODE,
    referencePrefix: 'CV',
  },
  createReference: (userId, orderId) => `${eftSimulation.bankAccount.referencePrefix}${userId.slice(-4)}${orderId.slice(-6)}`,
  verifyPayment: async (reference, amount) => {
    // In production, integrate with bank API (e.g., Standard Bank API, Ozow EFT)
    // Here we simulate with a webhook or manual confirmation
    return { verified: false, pending: true };
  }
};

module.exports = { stripe, paypalClient, payfast, ozow, eftSimulation };
