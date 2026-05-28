const express = require('express');
const { authMiddleware } = require('./auth');
const bronwyn = require('../services/bronwynChatbot');

const router = express.Router();

router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const response = await bronwyn.handleMessage(req.user.id, message, sessionId);
    res.json(response);
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
