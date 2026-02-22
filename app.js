const http = require('http');
const fs = require('fs');
const path = require('path');

// ===============================
// 🌐 WEB SERVER (Render Safe)
// ===============================
const PORT = process.env.PORT || 5000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot + Web server running!\n');
}).listen(PORT, () => {
  console.log(`🌍 Web server running on port ${PORT}`);
});

// ===============================
// 🤖 START BOT (AUTO-DETECT FILE)
// ===============================
const possibleFiles = ['index.js', 'bot.js', 'main.js'];

let botFile = null;

for (const file of possibleFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    botFile = file;
    break;
  }
}

if (!botFile) {
  console.error('❌ No bot file found! Expected one of:', possibleFiles);
  process.exit(1);
}

console.log(`🚀 Starting bot file: ${botFile}`);
require(`./${botFile}`);
