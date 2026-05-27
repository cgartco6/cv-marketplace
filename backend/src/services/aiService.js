const { openai, AI_MODEL, cvRewritePrompt, atsScorePrompt, interviewQnAPrompt, aiTutorPrompt } = require('../config/ai');

class AIService {
  async rewriteCV(originalText, jobDescription = null, tier = 'starter') {
    const prompt = cvRewritePrompt(originalText, jobDescription);
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: tier === 'enterprise' ? 0.3 : 0.5,
      max_tokens: 4000,
    });
    return completion.choices[0].message.content;
  }

  async getATSScore(cvText) {
    const prompt = atsScorePrompt(cvText);
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1500,
    });
    const response = completion.choices[0].message.content;
    // Parse score from response
    const scoreMatch = response.match(/Overall score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    return { score, analysis: response };
  }

  async generateInterviewQuestions(jobTitle, company, cvSummary) {
    const prompt = interviewQnAPrompt(jobTitle, company, cvSummary);
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });
    return completion.choices[0].message.content;
  }

  async aiTutorFeedback(question, userAnswer, correctAnswer) {
    const prompt = aiTutorPrompt(question, userAnswer, correctAnswer);
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1000,
    });
    return completion.choices[0].message.content;
  }
}

module.exports = new AIService();
