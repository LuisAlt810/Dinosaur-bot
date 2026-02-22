const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// --- FULL BOT CODE AS STRING ---
const BOT_CODE = `
// --- DEPENDENCIES ---
require('dotenv').config();
const fetch = require('node-fetch'); // For API calls
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

// --- CLIENT INITIALIZATION ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// --- CONFIG ---
const PREFIX = '!';
const PRESENCE_SEQ = ['idle','dnd','idle','dnd','idle','dnd'];
const PRESENCE_INTERVAL_MS = 10000;

// --- LOADING SEQUENCE ---
async function loadingSequence() {
  const botName = client.user.username;
  console.log(\`🔄 Initiating Mega Launch Sequence for \${botName}...\`);
  console.log('=====================================================');
  const diagnostics = [
    'Establishing core protocols',
    'Authenticating token integrity',
    'Decrypting environment configurations',
    'Validating gateway intents',
    'Performing code integrity scan'
  ];
  for (const step of diagnostics) {
    process.stdout.write(\`🔧 \${step}...\`);
    await new Promise(r => setTimeout(r, 500));
    process.stdout.write(' ✅\\n');
  }
  console.log('\\n📦 Loading system modules...');
  console.log('-----------------------------------------------------');
  const totalMB = 2048;
  for (let i = 1; i <= 20; i++) {
    const percent = Math.floor((i / 20) * 100);
    const speed = Math.floor(Math.random() * 70) + 130;
    const loaded = Math.floor((percent / 100) * totalMB);
    const barLen = 40;
    const filled = Math.floor((percent / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
    console.log(\`🚀 [\${bar}] \${percent}% | \${loaded}MB/\${totalMB}MB | \${speed}MB/s\`);
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('\\n⚙️ Initializing subsystems...');
  console.log('-----------------------------------------------------');
  const subsystems = [
    'Spawning command handlers',
    'Loading music modules',
    'Setting up event listeners',
    'Allocating memory buffers',
    'Priming WebSocket connections',
    'Calibrating presence status',
    'Final handshake with Discord'
  ];
  for (const task of subsystems) {
    process.stdout.write(\`🔄 \${task}...\`);
    await new Promise(r => setTimeout(r, 300));
    process.stdout.write(' ✅\\n');
  }
  console.log(\`\\n✅ MEGA LAUNCH COMPLETE - \${botName} is now operational!\`);
  console.log('=====================================================');
}

// --- COMMAND HANDLER SETUP ---
const commands = new Map();
function register(name, description, execute) {
  commands.set(name, { description, execute });
}

// --- PREFIX COMMANDS ---
register('ping', 'Check bot latency', async (msg) => {
  const sent = await msg.reply('Pinging...');
  sent.edit(\`Pong! Latency is \${sent.createdTimestamp - msg.createdTimestamp}ms\`);
});
register('avatar', 'Display user avatar', (msg) => {
  const user = msg.mentions.users.first() || msg.author;
  msg.reply(user.displayAvatarURL({ dynamic: true, size: 512 }));
});
register('serverinfo', 'Show server information', (msg) => {
  const { guild } = msg;
  msg.reply({ embeds: [new EmbedBuilder()
    .setTitle(guild.name)
    .addFields(
      { name: 'Members', value: \`\${guild.memberCount}\`, inline: true },
      { name: 'Created', value: guild.createdAt.toDateString(), inline: true }
    )
  ]});
});
register('userinfo', 'Show user information', (msg) => {
  const user = msg.mentions.users.first() || msg.author;
  msg.reply({ embeds: [new EmbedBuilder()
    .setTitle(user.tag)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Joined Discord', value: user.createdAt.toDateString(), inline: true }
    )
  ]});
});
register('say', 'Make the bot say something', (msg, args) => {
  if (!args.length) return msg.reply('Please provide text to say.');
  msg.delete().catch(() => {});
  msg.channel.send(args.join(' '));
});
register('help', 'List all commands', (msg) => {
  const embed = new EmbedBuilder()
    .setTitle('Help Menu')
    .setDescription([...commands.entries()]
      .map(([n, c]) => \`**\${PREFIX}\${n}**: \${c.description}\`)
      .join('\\n'));
  msg.reply({ embeds: [embed] });
});
register('roll', 'Roll a 6-sided dice', (msg) => {
  const num = Math.floor(Math.random() * 6) + 1;
  msg.reply(\`🎲 You rolled a \${num}\`);
});
register('flip', 'Flip a coin', (msg) => {
  const res = Math.random() < 0.5 ? 'Heads' : 'Tails';
  msg.reply(\`🪙 \${res}\`);
});
register('8ball', 'Magic 8-ball', (msg, args) => {
  const responses = ['Yes', 'No', 'Maybe', 'Ask again later'];
  msg.reply(\`🔮 \${responses[Math.floor(Math.random() * responses.length)]}\`);
});
register('joke', 'Tell a joke', async (msg) => {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke').then(r => r.json());
    msg.reply(\`😂 \${res.setup} — \${res.punchline}\`);
  } catch { msg.reply('Could not fetch a joke right now.'); }
});
register('meme', 'Fetch a random meme', async (msg) => {
  try {
    const res = await fetch('https://meme-api.herokuapp.com/gimme').then(r => r.json());
    msg.reply(res.url);
  } catch { msg.reply('Could not fetch a meme.'); }
});
register('cat', 'Random cat pic', async (msg) => {
  try {
    const res = await fetch('https://aws.random.cat/meow').then(r => r.json());
    msg.reply(res.file);
  } catch { msg.reply('Could not fetch a cat pic.'); }
});
register('dog', 'Random dog pic', async (msg) => {
  try {
    const res = await fetch('https://random.dog/woof.json').then(r => r.json());
    msg.reply(res.url);
  } catch { msg.reply('Could not fetch a dog pic.'); }
});
register('buttons', 'Send a button message the bot will respond to', async (msg) => {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('btn_hello').setLabel('Say Hello').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('btn_info').setLabel('Who am I?').setStyle(ButtonStyle.Secondary)
  );
  await msg.channel.send({ content: 'Press a button:', components: [row] });
});
register('whoami', 'Quick whoami', (msg) => { msg.reply(\`You are \${msg.author.tag} (\${msg.author.id})\`); });
register('slashhelp', 'Show basic slash command help', (msg) => { msg.reply('Use `/ping` or `/whoami` as slash commands (try them!)'); });

// Moderation commands
register('kick', 'Kick a member', async (msg) => {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return msg.reply('You lack permission.');
  const member = msg.mentions.members.first();
  if (!member) return msg.reply('Mention someone to kick.');
  await member.kick().catch(() => msg.reply('Failed to kick.'));
  msg.reply(\`👢 Kicked \${member}\`);
});
register('ban', 'Ban a member', async (msg) => {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return msg.reply('You lack permission.');
  const member = msg.mentions.members.first();
  if (!member) return msg.reply('Mention someone to ban.');
  await member.ban().catch(() => msg.reply('Failed to ban.'));
  msg.reply(\`🔨 Banned \${member}\`);
});
register('lockdown', 'Lock the channel', async (msg) => {
  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: false });
  msg.reply('🔒 Channel locked.');
});
register('unlock', 'Unlock the channel', async (msg) => {
  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: true });
  msg.reply('🔓 Channel unlocked.');
});

// --- EVENT HANDLERS ---
client.once('ready', async () => {
  await loadingSequence();
  console.log(\`🤖 Logged in as \${client.user.tag}\`);
  client.user.setActivity(\`for \${PREFIX}help\`, { type: ActivityType.Watching });
  let idx = 0;
  if (!client._presenceInterval) {
    client._presenceInterval = setInterval(() => {
      const status = PRESENCE_SEQ[idx % PRESENCE_SEQ.length];
      idx++;
      client.user.setPresence({ activities: [{ name: \`for \${PREFIX}help\`, type: ActivityType.Watching }], status }).catch(console.error);
      console.log(\`Presence set -> \${status}\`);
    }, PRESENCE_INTERVAL_MS);
  }
});

// Message handling
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild || !message.content.startsWith(PREFIX)) return;
  const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/\\s+/);
  const command = commands.get(cmd.toLowerCase());
  if (!command) return;
  try { await command.execute(message, args); } catch (e) { console.error(e); message.reply('❌ Error executing command.'); }
});

// Interaction handling
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand && interaction.commandName) {
      if (interaction.commandName === 'ping') await interaction.reply(\`Pong! Latency: \${Date.now() - interaction.createdTimestamp}ms\`);
      else if (interaction.commandName === 'whoami') await interaction.reply(\`\${interaction.user.tag} — \${interaction.user.id}\`);
      else if (interaction.commandName === 'buttons') {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_hello').setLabel('Say Hello').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('btn_info').setLabel('Who am I?').setStyle(ButtonStyle.Secondary)
        );
        await interaction.reply({ content: 'Press a button (slash)', components: [row] });
      } else await interaction.reply({ content: 'Command not implemented yet.', ephemeral: true });
    } else if (interaction.isButton && interaction.customId) {
      if (interaction.customId === 'btn_hello') await interaction.reply({ content: \`Hello, \${interaction.user.username}! 👋\`, ephemeral: true });
      else if (interaction.customId === 'btn_info') await interaction.reply({ content: \`You are \${interaction.user.tag} — ID: \${interaction.user.id}\`, ephemeral: true });
      else await interaction.reply({ content: 'Button not recognized.', ephemeral: true });
    }
  } catch (err) { console.error('Interaction handler error:', err); }
});

// --- LOGIN ---
if (!process.env.DISCORD_TOKEN) console.error('❌ DISCORD_TOKEN missing');
else client.login(process.env.DISCORD_TOKEN).catch(err => console.error('Login failed:', err));
`;

// ===============================
// 🌐 CREATE index.js IF MISSING
// ===============================
function findIndexJs(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isFile() && f.name === 'index.js') return full;
    if (f.isDirectory()) {
      const found = findIndexJs(full);
      if (found) return found;
    }
  }
  return null;
}

let indexPath = findIndexJs(process.cwd());

if (!indexPath) {
  indexPath = path.join(process.cwd(), 'index.js');
  fs.writeFileSync(indexPath, BOT_CODE, 'utf8');
  console.log('✅ index.js created with full bot code!');
} else {
  console.log(`✅ Found existing index.js at: ${indexPath}`);
}

// ===============================
// 🌐 WEB SERVER (PORT 5000)
// ===============================
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot + Web server is running!\n');
}).listen(PORT, () => {
  console.log(`🌍 Web server running on port ${PORT}`);
});

// ===============================
// 🤖 START BOT PROCESS
// ===============================
function startBot() {
  console.log('🚀 Starting Discord bot...');
  const bot = spawn(process.execPath, [indexPath], { stdio: 'inherit' });

  bot.on('close', (code) => {
    console.log(`⚠️ Bot exited with code ${code}. Restarting in 5s...`);
    setTimeout(startBot, 5000);
  });

  bot.on('error', (err) => {
    console.error('❌ Failed to start bot:', err);
  });
}

startBot();
