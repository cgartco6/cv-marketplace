const aiService = require('./aiService');

class ATSService {
  async analyze(cvText) {
    const { score, analysis } = await aiService.getATSScore(cvText);
    
    const keywordDensity = this.extractKeywords(analysis);
    const formattingIssues = this.extractFormattingIssues(analysis);
    const missingSections = this.extractMissingSections(analysis);
    const recommendations = this.extractRecommendations(analysis);
    
    return {
      score,
      keywordDensity,
      formattingIssues,
      missingSections,
      recommendations,
    };
  }

  extractKeywords(analysis) {
    const match = analysis.match(/keyword density[:\s]*([^\n]+)/i);
    return match ? match[1] : 'Not analyzed';
  }

  extractFormattingIssues(analysis) {
    const issues = [];
    if (analysis.toLowerCase().includes('tables')) issues.push('Tables detected – may break ATS parsing');
    if (analysis.toLowerCase().includes('images')) issues.push('Images detected – ATS may ignore text in images');
    if (analysis.toLowerCase().includes('columns')) issues.push('Columns detected – use single column layout');
    return issues;
  }

  extractMissingSections(analysis) {
    const missing = [];
    if (analysis.toLowerCase().includes('missing contact')) missing.push('Contact information');
    if (analysis.toLowerCase().includes('missing summary')) missing.push('Professional summary');
    if (analysis.toLowerCase().includes('missing experience')) missing.push('Work experience');
    if (analysis.toLowerCase().includes('missing education')) missing.push('Education');
    if (analysis.toLowerCase().includes('missing skills')) missing.push('Skills section');
    return missing;
  }

  extractRecommendations(analysis) {
    const lines = analysis.split('\n');
    return lines
      .filter(l => l.toLowerCase().includes('recommend') || l.toLowerCase().includes('suggest'))
      .slice(0, 5);
  }
}

module.exports = new ATSService();
