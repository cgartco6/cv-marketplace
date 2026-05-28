const CV = require('../models/CV');
const User = require('../models/User');
const aiService = require('../services/aiService');
const atsService = require('../services/atsService');
const documentService = require('../services/documentService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const upload = multer({ dest: 'uploads/' });

exports.uploadCV = async (req, res) => {
  try {
    const { title, jobDescription } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    
    let text = '';
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: file.path });
      text = result.value;
    } else {
      text = fs.readFileSync(file.path, 'utf8');
    }
    
    const cv = new CV({
      userId: req.user.id,
      title,
      originalText: text,
      originalFileUrl: file.path,
      jobDescription: jobDescription || null,
    });
    await cv.save();
    
    res.json({ cvId: cv._id, message: 'CV uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.rewriteCV = async (req, res) => {
  try {
    const { cvId, jobDescription } = req.body;
    const cv = await CV.findOne({ _id: cvId, userId: req.user.id });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    
    const user = await User.findById(req.user.id);
    // Check tier limits
    if (user.tier === 'free' && cv.version >= 2) {
      return res.status(403).json({ error: 'Free tier limited to 1 rewrite. Upgrade to continue.' });
    }
    
    const rewritten = await aiService.rewriteCV(cv.originalText, jobDescription || cv.jobDescription, user.tier);
    cv.rewrittenText = rewritten;
    cv.version += 1;
    cv.updatedAt = new Date();
    await cv.save();
    
    res.json({ rewrittenText: rewritten });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Rewrite failed' });
  }
};

exports.getATSScore = async (req, res) => {
  try {
    const { cvId } = req.params;
    const cv = await CV.findOne({ _id: cvId, userId: req.user.id });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    
    const textToScore = cv.rewrittenText || cv.originalText;
    const { score, analysis } = await aiService.getATSScore(textToScore);
    cv.atsScore = score;
    await cv.save();
    
    res.json({ atsScore: score, analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ATS scoring failed' });
  }
};

exports.downloadCV = async (req, res) => {
  try {
    const { cvId, format } = req.params; // pdf, docx, zip
    const cv = await CV.findOne({ _id: cvId, userId: req.user.id });
    if (!cv || !cv.rewrittenText) return res.status(404).json({ error: 'Rewritten CV not found' });
    
    const timestamp = Date.now();
    const outputDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    let filePath;
    if (format === 'pdf') {
      filePath = path.join(outputDir, `cv_${cvId}_${timestamp}.pdf`);
      await documentService.generatePDF(cv.rewrittenText, filePath);
    } else if (format === 'docx') {
      filePath = path.join(outputDir, `cv_${cvId}_${timestamp}.docx`);
      await documentService.generateDOCX(cv.rewrittenText, filePath);
    } else if (format === 'zip') {
      const pdfPath = path.join(outputDir, `cv_${cvId}_${timestamp}.pdf`);
      const docxPath = path.join(outputDir, `cv_${cvId}_${timestamp}.docx`);
      await documentService.generatePDF(cv.rewrittenText, pdfPath);
      await documentService.generateDOCX(cv.rewrittenText, docxPath);
      filePath = path.join(outputDir, `cv_${cvId}_${timestamp}.zip`);
      await documentService.createZip([
        { path: pdfPath, name: 'cv.pdf' },
        { path: docxPath, name: 'cv.docx' }
      ], filePath);
      // Cleanup temp files after zip
      setTimeout(() => documentService.cleanupFiles([pdfPath, docxPath]), 1000);
    } else {
      return res.status(400).json({ error: 'Invalid format' });
    }
    
    res.download(filePath, `cv_rewritten.${format === 'zip' ? 'zip' : format}`, (err) => {
      if (err) console.error(err);
      setTimeout(() => fs.unlinkSync(filePath), 60000);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Download failed' });
  }
};

exports.generateInterviewQA = async (req, res) => {
  try {
    const { jobTitle, company, cvSummary } = req.body;
    const questions = await aiService.generateInterviewQuestions(jobTitle, company, cvSummary);
    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate Q&A' });
  }
};

exports.aiTutorFeedback = async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;
    const feedback = await aiService.aiTutorFeedback(question, userAnswer, correctAnswer);
    res.json({ feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tutor feedback failed' });
  }
};
