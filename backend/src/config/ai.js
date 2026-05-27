const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AI_MODEL = 'gpt-4-turbo-preview';

const cvRewritePrompt = (original, jobDescription = null) => `
You are an expert CV writer for ATS systems. Rewrite the following CV to be ATS-optimized, professional, and impactful. 
${jobDescription ? `Target this job description: ${jobDescription}` : 'General professional optimization.'}
Use keywords, action verbs, quantifiable achievements, and clean formatting. Return in markdown format with clear sections.

Original CV:
${original}
`;

const atsScorePrompt = (cvText) => `
Analyze this CV for ATS compatibility. Provide:
1. Overall score (0-100)
2. Keyword density analysis
3. Formatting issues (tables, images, columns)
4. Missing critical sections (contact, summary, experience, education, skills)
5. Action verb usage
6. Quantifiable achievements count
7. Recommendations to improve

CV:
${cvText}
`;

const interviewQnAPrompt = (jobTitle, company, cvSummary) => `
You are an interview coach. Generate 10 realistic interview questions for a ${jobTitle} position at ${company}, based on this candidate's CV: ${cvSummary}. For each question, provide a model answer tailored to the candidate's experience.
`;

const aiTutorPrompt = (question, userAnswer, correctAnswer) => `
You are an AI interview tutor. The user answered: "${userAnswer}" to the question: "${question}". 
The ideal answer includes: ${correctAnswer}. 
Provide constructive feedback, improve their answer, and give tips for delivery.
`;

module.exports = { openai, AI_MODEL, cvRewritePrompt, atsScorePrompt, interviewQnAPrompt, aiTutorPrompt };
