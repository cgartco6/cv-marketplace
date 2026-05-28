const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });

function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  const line = JSON.stringify(entry) + '\n';
  
  if (level === 'error') {
    console.error(message, meta);
  } else {
    console.log(message, meta);
  }
  
  logFile.write(line);
}

async function sendAlert(message, severity = 'error') {
  log(severity, 'ALERT', { alert: message });
  console.error(`🚨 ALERT: ${message}`);
}

module.exports = { log, sendAlert };
