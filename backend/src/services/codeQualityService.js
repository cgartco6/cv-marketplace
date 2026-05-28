const fs = require('fs').promises;
const path = require('path');
const CodeReview = require('../models/CodeReview');

class CodeQualityService {
  async verifyAllCode() {
    const directories = ['../backend/src', '../frontend/src', '../mobile/src'];
    const results = [];
    
    for (const dir of directories) {
      const fullPath = path.join(__dirname, dir);
      try {
        const files = await this.getFiles(fullPath);
        for (const file of files) {
          const review = await this.reviewFile(file);
          if (review.issues.length > 0) {
            await CodeReview.create({
              filePath: file,
              component: path.basename(path.dirname(file)),
              issues: review.issues,
              status: 'pending'
            });
            results.push(review);
          }
        }
      } catch (err) {
        console.error(`Error scanning ${dir}:`, err);
      }
    }
    
    return results;
  }

  async getFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return this.getFiles(res);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
        return res;
      }
      return [];
    }));
    return files.flat();
  }

  async reviewFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('await ') && !line.includes('.catch(') && !line.includes('try {')) {
        issues.push({
          severity: 'warning',
          line: i + 1,
          message: 'Missing error handling for async operation',
          suggestedFix: 'Wrap in try-catch or add .catch()'
        });
      }
      
      const secretPattern = /(sk_live|pk_live|secret|password|api_key)\s*=\s*['"][^'"]+['"]/i;
      if (secretPattern.test(line)) {
        issues.push({
          severity: 'critical',
          line: i + 1,
          message: 'Hardcoded secret detected',
          suggestedFix: 'Use environment variables'
        });
      }
      
      if (line.includes('console.log') && !line.includes('// console.log')) {
        issues.push({
          severity: 'warning',
          line: i + 1,
          message: 'console.log in production code',
          suggestedFix: 'Remove or replace with logger'
        });
      }
    }
    
    return { filePath, issues };
  }

  async autoFixIssues() {
    const reviews = await CodeReview.find({ status: 'pending', 'issues.severity': 'critical' });
    let fixedCount = 0;
    
    for (const review of reviews) {
      const filePath = review.filePath;
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;
      
      for (const issue of review.issues) {
        if (issue.suggestedFix && issue.severity === 'critical') {
          if (issue.message.includes('Hardcoded secret')) {
            const lines = content.split('\n');
            const lineIdx = issue.line - 1;
            const line = lines[lineIdx];
            const match = line.match(/(\w+)\s*=\s*['"][^'"]+['"]/);
            if (match) {
              const varName = match[1];
              lines[lineIdx] = line.replace(/['"][^'"]+['"]/, `process.env.${varName.toUpperCase()}`);
              content = lines.join('\n');
              modified = true;
            }
          }
        }
      }
      
      if (modified) {
        await fs.writeFile(filePath, content);
        review.status = 'fixed';
        review.fixedAt = new Date();
        await review.save();
        fixedCount++;
      }
    }
    
    return { fixed: fixedCount };
  }
}

module.exports = new CodeQualityService();
