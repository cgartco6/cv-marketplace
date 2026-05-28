const CV = require('../models/CV');
const User = require('../models/User');
const aiService = require('../services/aiService');
const documentService = require('../services/documentService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

exports.upload = upload;

exports.uploadCV = async (req, res) => {
  try {
    const { title, jobDescription } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text = '';
    const filePath = file.path;

    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (file.mimetype.includes('word') || file.originalname.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (file.mimetype === 'text/plain') {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file.' });
    }

    const cv = new CV({
      userId: req.user.id,
      title: title || file.originalname,
      originalText: text,
      originalFileUrl: filePath,
      jobDescription: jobDescription || null
    });
    await cv.save();

    res.json({ cvId: cv._id, message: 'CV uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.rewriteCV = async (req, res) => {
  try {
    const { cvId, jobDescription } = req.body;

    const cv = await CV.findOne({ _id: cvId, userId: req.user.id });
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const user = await User.findById(req.user.id);

    if (user.tier === 'free') {
      if (user.credits <= 0) {
        return res.status(403).json({
          error: 'No free rewrites left. Upgrade to Starter plan (R149/month).'
        });
      }
      await user.useCredit();
    }

    const rewritten = await aiService.rewriteCV(cv.originalText, jobDescription || cv.jobDescription, user.tier);

    cv.rewrittenText = rewritten;
    cv.version += 1;
    cv.updatedAt = new Date();
    await cv.save();

    res.json({ rewrittenText: rewritten });
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getATSScore = async (req, res) => {
  try {
    const { cvId } = req.params;

    const cv = await CV.findOne({ _id: cvId, userId: req.user.id });
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const textToScore = cv.rewrittenText || cv.originalText;
    const { score, analysis } = await aiService.getATSScore(textToScore);

    cv.atsScore = score;
    await cv.save();

    res.json({ atsScore: score, analysis });
  } catch (err) {
    console.error('ATS scoring error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.downloadCV = async (req, res) => {
  try {
    const { cvId, format } = req.params;

    const cv = await CV.findOne({ _id: cvId, userId: req.user.id });
    if (!cv || !cv.rewrittenText) {
      return res.status(404).json({ error: 'Rewritten CV not found' });
    }

    const outputDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let filePath;
    if (format === 'pdf') {
      filePath = path.join(outputDir, `cv_${cvId}_${Date.now()}.pdf`);
      await documentService.generatePDF(cv.rewrittenText, filePath);
    } else if (format === 'docx') {
      filePath = path.join(outputDir, `cv_${cvId}_${Date.now()}.docx`);
      await documentService.generateDOCX(cv.rewrittenText, filePath);
    } else if (format === 'zip') {
      const pdfPath = path.join(outputDir, `cv_${cvId}_${Date.now()}.pdf`);
      const docxPath = path.join(outputDir, `cv_${cvId}_${Date.now()}.docx`);
      await documentService.generatePDF(cv.rewrittenText, pdfPath);
      await documentService.generateDOCX(cv.rewrittenText, docxPath);
      filePath = path.join(outputDir, `cv_${cvId}_${Date.now()}.zip`);
      await documentService.createZip([
        { path: pdfPath, name: 'cv.pdf' },
        { path: docxPath, name: 'cv.docx' }
      ], filePath);
      setTimeout(() => documentService.cleanupFiles([pdfPath, docxPath]), 1000);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use pdf, docx, or zip.' });
    }

    res.download(filePath, `cv_rewritten.${format === 'zip' ? 'zip' : format}`, (err) => {
      if (err) console.error('Download error:', err);
      setTimeout(() => fs.unlinkSync(filePath), 60000);
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.generateInterviewQA = async (req, res) => {
  try {
    const { jobTitle, company, cvSummary } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({ error: 'Job title and company are required' });
    }

    const questions = await aiService.generateInterviewQuestions(jobTitle, company, cvSummary || '');
    res.json({ questions });
  } catch (err) {
    console.error('Interview QA error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.aiTutorFeedback = async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Question and user answer are required' });
    }

    const feedback = await aiService.aiTutorFeedback(question, userAnswer, correctAnswer || '');
    res.json({ feedback });
  } catch (err) {
    console.error('Tutor error:', err);
    res.status(500).json({ error: err.message });
  }
};
