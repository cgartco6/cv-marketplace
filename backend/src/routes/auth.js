const express = require('express');
const { register, login, getMe, authMiddleware } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

module.exports = { router, authMiddleware };
