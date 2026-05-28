const { spawn } = require('child_process');
const path = require('path');

const workers = new Map();

function restartWorker(workerName) {
  const workerPath = path.join(__dirname, `../workers/${workerName}.js`);
  
  if (workers.has(workerName)) {
    const oldWorker = workers.get(workerName);
    oldWorker.kill('SIGTERM');
    workers.delete(workerName);
  }
  
  const newWorker = spawn('node', [workerPath], { detached: false, stdio: 'inherit' });
  workers.set(workerName, newWorker);
  
  newWorker.on('error', (err) => {
    console.error(`Worker ${workerName} error:`, err);
  });
  
  newWorker.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Worker ${workerName} exited with code ${code}, attempting restart in 5 seconds...`);
      setTimeout(() => restartWorker(workerName), 5000);
    }
  });
  
  console.log(`🔄 Restarted worker: ${workerName}`);
  return newWorker;
}

function startAllWorkers() {
  const workerNames = ['payoutWorker', 'marketingWorker', 'targetAgentWorker', 'selfHealingWorker'];
  workerNames.forEach(name => restartWorker(name));
  console.log('✅ All workers started');
}

module.exports = { restartWorker, startAllWorkers };
