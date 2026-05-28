const express = require('express');
const { authMiddleware } = require('./auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-checkout', authMiddleware, paymentController.createCheckout);
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
router.post('/payfast-webhook', paymentController.payfastWebhook);
router.post('/ozow-webhook', paymentController.ozowWebhook);
router.post('/confirm-eft', authMiddleware, paymentController.confirmEFT);

module.exports = router;
