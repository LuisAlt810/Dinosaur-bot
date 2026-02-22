const http = require('http');
const { spawn } = require('child_process');

// ===============================
// 🌐 SIMPLE WEB SERVER (PORT 5000)
// ===============================
const PORT = 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot + Web server is running!\n');
});

server.listen(PORT, () => {
  console.log(`🌍 Web server running on port ${PORT}`);
});

// ===============================
// 🤖 START DISCORD BOT (index.js)
// ===============================
function startBot() {
  console.log('🚀 Starting index.js...');

  const bot = spawn('node', ['index.js'], {
    stdio: 'inherit'
  });

  bot.on('close', (code) => {
    console.log(`⚠️ Bot exited with code ${code}`);
  });

  bot.on('error', (err) => {
    console.error('❌ Failed to start bot:', err);
  });
}

startBot();
