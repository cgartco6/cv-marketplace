const Order = require('../models/Order');
const User = require('../models/User');
const { stripe, paypalClient, payfast, ozow, eftReal } = require('../config/payments');
const paypal = require('@paypal/checkout-server-sdk');

const TIER_PRICES = {
  starter: { monthly: 149, once: 250 },
  professional: { monthly: 349, once: 699 },
  enterprise: { monthly: 699, once: 1499 },
};

exports.createCheckout = async (req, res) => {
  try {
    const { tier, billingPeriod, paymentMethod, successUrl, cancelUrl } = req.body;

    if (tier === 'free') {
      return res.status(400).json({ error: 'Free tier has no checkout' });
    }

    if (!TIER_PRICES[tier] || !billingPeriod || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = req.user.id;
    const amount = TIER_PRICES[tier][billingPeriod];

    const order = new Order({
      userId,
      tier,
      amount,
      billingPeriod,
      paymentMethod,
      paymentStatus: 'pending'
    });
    await order.save();

    let paymentUrl = null;
    let transactionId = null;

    switch (paymentMethod) {
      case 'stripe':
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'zar',
              product_data: { name: `CV Marketplace - ${tier} Plan (${billingPeriod})` },
              unit_amount: amount * 100,
            },
            quantity: 1,
          }],
          mode: billingPeriod === 'monthly' ? 'subscription' : 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: { orderId: order._id.toString() },
        });
        paymentUrl = session.url;
        transactionId = session.id;
        break;

      case 'paypal':
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { currency_code: 'ZAR', value: amount.toFixed(2) },
            reference_id: order._id.toString(),
          }],
          application_context: {
            return_url: successUrl,
            cancel_url: cancelUrl,
          },
        });
        const paypalOrder = await paypalClient.execute(request);
        paymentUrl = paypalOrder.result.links.find(l => l.rel === 'approve').href;
        transactionId = paypalOrder.result.id;
        break;

      case 'payfast':
        const pfData = {
          merchant_id: process.env.PAYFAST_MERCHANT_ID,
          merchant_key: process.env.PAYFAST_MERCHANT_KEY,
          return_url: successUrl,
          cancel_url: cancelUrl,
          notify_url: `${process.env.BACKEND_URL}/api/payment/payfast-webhook`,
          amount: amount.toFixed(2),
          item_name: `${tier} Plan (${billingPeriod})`,
          m_payment_id: order._id.toString(),
        };
        const pfUrl = process.env.NODE_ENV === 'production'
          ? 'https://www.payfast.co.za/eng/process'
          : 'https://sandbox.payfast.co.za/eng/process';
        paymentUrl = `${pfUrl}?${new URLSearchParams(pfData)}`;
        break;

      case 'ozow':
        const ozowData = {
          MerchantId: process.env.OZOW_MERCHANT_ID,
          MerchantKey: process.env.OZOW_MERCHANT_KEY,
          Amount: amount.toFixed(2),
          CurrencyCode: 'ZAR',
          SiteCode: process.env.OZOW_SITE_CODE,
          TransactionReference: order._id.toString(),
          SuccessUrl: successUrl,
          CancelUrl: cancelUrl,
          ErrorUrl: cancelUrl,
        };
        paymentUrl = `https://api.ozow.com/PaymentPage?${new URLSearchParams(ozowData)}`;
        break;

      case 'eft':
        const reference = eftReal.createReference(userId, order._id);
        order.paymentMetadata = {
          eftReference: reference,
          bankDetails: eftReal.bankAccount,
          instructions: `Please transfer R${amount} to ${eftReal.bankAccount.accountName}, account number ${eftReal.bankAccount.accountNumber}, bank code ${eftReal.bankAccount.bankCode}, using reference ${reference}. We will upgrade your account within 24 hours after confirmation.`
        };
        await order.save();
        paymentUrl = null;
        transactionId = reference;
        break;

      default:
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    order.transactionId = transactionId;
    await order.save();

    res.json({
      orderId: order._id,
      paymentUrl,
      eftDetails: paymentMethod === 'eft' ? order.paymentMetadata : null
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await finalizeOrder(session.metadata.orderId, 'stripe', session.id);
  }

  res.json({ received: true });
};

exports.payfastWebhook = async (req, res) => {
  const { m_payment_id, payment_status, pf_payment_id } = req.body;

  if (payment_status === 'COMPLETE') {
    await finalizeOrder(m_payment_id, 'payfast', pf_payment_id);
  }

  res.send('OK');
};

exports.ozowWebhook = async (req, res) => {
  const { TransactionReference, Status } = req.body;
  if (Status === 'Success') {
    await finalizeOrder(TransactionReference, 'ozow', req.body.TransactionId);
  }
  res.send('OK');
};

exports.confirmEFT = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order || order.paymentMethod !== 'eft') {
      return res.status(404).json({ error: 'Order not found or not an EFT payment' });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Already paid' });
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    await order.save();

    await upgradeUserTier(order.userId, order.tier, order.billingPeriod);

    res.json({ success: true });
  } catch (err) {
    console.error('EFT confirmation error:', err);
    res.status(500).json({ error: err.message });
  }
};

async function finalizeOrder(orderId, method, transactionId) {
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === 'paid') return;

  order.paymentStatus = 'paid';
  order.transactionId = transactionId;
  order.paidAt = new Date();
  await order.save();

  await upgradeUserTier(order.userId, order.tier, order.billingPeriod);
}

async function upgradeUserTier(userId, tier, billingPeriod) {
  const user = await User.findById(userId);
  if (!user) return;

  user.tier = tier;

  if (billingPeriod === 'monthly') {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    user.tierExpiry = expiry;
  } else {
    user.tierExpiry = null;
  }

  await user.save();
}
