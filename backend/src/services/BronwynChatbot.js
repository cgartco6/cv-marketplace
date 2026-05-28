const { openai } = require('../config/ai');
const User = require('../models/User');
const Order = require('../models/Order');

class BronwynChatbot {
  constructor() {
    this.personality = `You are Bronwyn, a friendly, empathetic, and highly knowledgeable customer support AI for CV Marketplace. 
    You speak naturally, use occasional South African slang (e.g., "howzit", "lekker", "shap shap"), and always aim to solve user problems. 
    You never sound robotic. You have access to user account info (if provided) and can check order status, CV rewrites, and payment issues. 
    You are authorized to offer small discounts (up to 20%) for unhappy customers. You always comply with company policies.
    You never make false claims or promises. You are truthful and helpful.`;
  }

  async handleMessage(userId, message, sessionId) {
    try {
      const user = await User.findById(userId).select('name email tier credits');
      const orders = await Order.find({ userId }).sort('-createdAt').limit(3);

      const systemPrompt = `${this.personality}
Current user: ${user?.name || 'Guest'} (${user?.email || 'unknown'}), Tier: ${user?.tier || 'free'}, Credits: ${user?.credits || 0}
Recent orders: ${orders.map(o => `${o.tier} - R${o.amount} - ${o.paymentStatus}`).join(', ')}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      let reply = completion.choices[0].message.content;
      reply = reply.replace(/as an AI/g, '').replace(/I'm sorry, but/g, 'Ah, sorry');
      if (Math.random() > 0.8) reply += " 😊";

      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('refund')) {
        reply += " If you'd like to request a refund, please provide your order ID and I'll escalate it for you.";
      }
      if (lowerMsg.includes('discount')) {
        reply += " Actually, I can offer you a 15% discount code: BRONWYN15. Valid for 24 hours.";
      }
      if (lowerMsg.includes('credit') && user.tier === 'free') {
        reply += ` You currently have ${user.credits} free rewrite credits left this month.`;
      }

      return {
        reply,
        intent: this.detectIntent(message),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        reply: "Howzit! I'm having a bit of trouble right now. Please try again in a moment or email support@cvmarketplace.com.",
        intent: 'error'
      };
    }
  }

  detectIntent(message) {
    const lower = message.toLowerCase();
    if (lower.includes('refund')) return 'refund';
    if (lower.includes('download') || lower.includes('pdf')) return 'download';
    if (lower.includes('payment') || lower.includes('paid') || lower.includes('stripe')) return 'payment';
    if (lower.includes('cv rewrite') || lower.includes('ats')) return 'cv_help';
    if (lower.includes('interview')) return 'interview';
    if (lower.includes('tutor')) return 'tutor';
    if (lower.includes('upgrade') || lower.includes('price')) return 'upgrade';
    return 'general';
  }
}

module.exports = new BronwynChatbot();
