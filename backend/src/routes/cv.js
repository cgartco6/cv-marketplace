const express = require('express');
const { authMiddleware } = require('./auth');
const cvController = require('../controllers/cvController');

const router = express.Router();
router.use(authMiddleware);

router.post('/upload', cvController.upload.single('cv'), cvController.uploadCV);
router.post('/rewrite', cvController.rewriteCV);
router.get('/ats-score/:cvId', cvController.getATSScore);
router.get('/download/:cvId/:format', cvController.downloadCV);
router.post('/generate-interview-qa', cvController.generateInterviewQA);
router.post('/ai-tutor-feedback', cvController.aiTutorFeedback);

module.exports = router;
