const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

// ===============================
// 🌐 WEB SERVER (RENDER SAFE)
// ===============================
const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot + Web server is running!\n');
});

server.listen(PORT, () => {
  console.log(`🌍 Web server running on port ${PORT}`);
});

// ===============================
// 🤖 START DISCORD BOT
// ===============================
function startBot() {
  const botPath = path.join(__dirname, 'index.js');

  console.log(`🚀 Starting bot from: ${botPath}`);

  const bot = spawn(process.execPath, [botPath], {
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
