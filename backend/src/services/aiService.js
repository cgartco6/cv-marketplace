const { openai, AI_MODEL, cvRewritePrompt, atsScorePrompt, interviewQnAPrompt, aiTutorPrompt } = require('../config/ai');

class AIService {
  async rewriteCV(originalText, jobDescription = null, tier = 'starter') {
    const prompt = cvRewritePrompt(originalText, jobDescription);
    const temperature = tier === 'enterprise' ? 0.3 : (tier === 'professional' ? 0.4 : 0.5);
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: 4000,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI rewrite error:', error);
      throw new Error('AI rewrite failed. Please try again.');
    }
  }

  async getATSScore(cvText) {
    const prompt = atsScorePrompt(cvText);
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
      });
      const response = completion.choices[0].message.content;
      const scoreMatch = response.match(/Overall score[:\s]*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      return { score, analysis: response };
    } catch (error) {
      console.error('OpenAI ATS error:', error);
      return { score: 0, analysis: 'ATS scoring failed. Please try again.' };
    }
  }

  async generateInterviewQuestions(jobTitle, company, cvSummary) {
    const prompt = interviewQnAPrompt(jobTitle, company, cvSummary);
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI interview error:', error);
      throw new Error('Failed to generate interview questions.');
    }
  }

  async aiTutorFeedback(question, userAnswer, correctAnswer) {
    const prompt = aiTutorPrompt(question, userAnswer, correctAnswer);
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1000,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI tutor error:', error);
      throw new Error('Failed to generate feedback.');
    }
  }
}

module.exports = new AIService();
