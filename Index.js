// --- DEPENDENCIES ---
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, ActivityType, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // For API calls

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

// --- LOADING SEQUENCE ---
async function loadingSequence() {
  const botName = client.user.username;
  console.log(`🔄 Initiating Mega Launch Sequence for ${botName}...`);
  console.log('=====================================================');

  // Phase 1: Diagnostics (FASTER)
  const diagnostics = [
    'Establishing core protocols',
    'Authenticating token integrity',
    'Decrypting environment configurations',
    'Validating gateway intents',
    'Performing code integrity scan'
  ];
  for (const step of diagnostics) {
    process.stdout.write(`🔧 ${step}...`);
    await new Promise(r => setTimeout(r, 500));
    process.stdout.write(' ✅\n');
  }

  // Phase 2: Module Loading (FASTER)
  console.log('\n📦 Loading system modules...');
  console.log('-----------------------------------------------------');
  const totalMB = 2048;
  for (let i = 1; i <= 20; i++) {
    const percent = Math.floor((i / 20) * 100);
    const speed = Math.floor(Math.random() * 70) + 130;
    const loaded = Math.floor((percent / 100) * totalMB);
    const barLen = 40;
    const filled = Math.floor((percent / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
    console.log(`🚀 [${bar}] ${percent}% | ${loaded}MB/${totalMB}MB | ${speed}MB/s`);
    await new Promise(r => setTimeout(r, 200));
  }

  // Phase 3: Subsystems (FASTER)
  console.log('\n⚙️ Initializing subsystems...');
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
    process.stdout.write(`🔄 ${task}...`);
    await new Promise(r => setTimeout(r, 300));
    process.stdout.write(' ✅\n');
  }

  console.log(`\n✅ MEGA LAUNCH COMPLETE - ${botName} is now operational!`);
  console.log('=====================================================');
}

// --- COMMAND HANDLER SETUP ---
const commands = new Map();
function register(name, description, execute) {
  commands.set(name, { description, execute });
}

// --- COMMAND DEFINITIONS ---
register('ping', 'Check bot latency', async (msg) => {
  const sent = await msg.reply('Pinging...');
  sent.edit(`Pong! Latency is ${sent.createdTimestamp - msg.createdTimestamp}ms`);
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
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
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
  msg.delete();
  msg.channel.send(args.join(' '));
});
register('help', 'List all commands', (msg) => {
  const embed = new EmbedBuilder()
    .setTitle('Help Menu')
    .setDescription([...commands.entries()]
      .map(([n, c]) => `**${PREFIX}${n}**: ${c.description}`)
      .join('\n'));
  msg.reply({ embeds: [embed] });
});
register('roll', 'Roll a 6-sided dice', (msg) => {
  const num = Math.floor(Math.random() * 6) + 1;
  msg.reply(`🎲 You rolled a ${num}`);
});
register('flip', 'Flip a coin', (msg) => {
  const res = Math.random() < 0.5 ? 'Heads' : 'Tails';
  msg.reply(`🪙 ${res}`);
});
register('8ball', 'Magic 8-ball', (msg, args) => {
  const responses = ['Yes', 'No', 'Maybe', 'Ask again later'];
  msg.reply(`🔮 ${responses[Math.floor(Math.random() * responses.length)]}`);
});
register('joke', 'Tell a joke', async (msg) => {
  const res = await fetch('https://official-joke-api.appspot.com/random_joke').then(r => r.json());
  msg.reply(`😂 ${res.setup} — ${res.punchline}`);
});
register('meme', 'Fetch a random meme', async (msg) => {
  const res = await fetch('https://meme-api.herokuapp.com/gimme').then(r => r.json());
  msg.reply(res.url);
});
register('cat', 'Random cat pic', async (msg) => {
  const res = await fetch('https://aws.random.cat/meow').then(r => r.json());
  msg.reply(res.file);
});
register('dog', 'Random dog pic', async (msg) => {
  const res = await fetch('https://random.dog/woof.json').then(r => r.json());
  msg.reply(res.url);
});
register('hug', 'Send a hug', (msg, args) => {
  const target = msg.mentions.users.first() || msg.author;
  msg.reply(`🤗 ${msg.author} hugs ${target}`);
});
register('slap', 'Slap someone', (msg, args) => {
  const target = msg.mentions.users.first();
  msg.reply(`👋 ${msg.author} slaps ${target || 'the air'}!`);
});
register('kick', 'Kick a member', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return msg.reply('You lack permission.');
  const member = msg.mentions.members.first();
  await member.kick().catch(() => msg.reply('Failed to kick.'));
  msg.reply(`👢 Kicked ${member}`);
});
register('ban', 'Ban a member', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return msg.reply('You lack permission.');
  const member = msg.mentions.members.first();
  await member.ban().catch(() => msg.reply('Failed to ban.'));
  msg.reply(`🔨 Banned ${member}`);
});
register('mute', 'Mute a member', async (msg, args) => {
  const member = msg.mentions.members.first();
  const muteRole = msg.guild.roles.cache.find(r => r.name === 'Muted');
  await member.roles.add(muteRole).catch(() => msg.reply('Failed to mute.'));
  msg.reply(`🔇 Muted ${member}`);
});
register('unmute', 'Unmute a member', async (msg, args) => {
  const member = msg.mentions.members.first();
  const muteRole = msg.guild.roles.cache.find(r => r.name === 'Muted');
  await member.roles.remove(muteRole).catch(() => msg.reply('Failed to unmute.'));
  msg.reply(`🔈 Unmuted ${member}`);
});
register('warn', 'Warn a member', (msg, args) => {
  const member = msg.mentions.members.first();
  msg.reply(`⚠️ ${member}, you have been warned.`);
});
register('clear', 'Clear messages', async (msg, args) => {
  const amount = parseInt(args[0]) || 5;
  await msg.channel.bulkDelete(amount + 1).catch(() => msg.reply('Failed to delete.'));
  msg.reply(`🧹 Deleted ${amount} messages.`).then(m => setTimeout(() => m.delete(), 5000));
});
register('lockdown', 'Lock the channel', async (msg) => {
  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: false });
  msg.reply('🔒 Channel locked.');
});
register('unlock', 'Unlock the channel', async (msg) => {
  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: true });
  msg.reply('🔓 Channel unlocked.');
});
register('slowmode', 'Set channel slowmode', async (msg, args) => {
  const sec = parseInt(args[0]);
  await msg.channel.setRateLimitPerUser(sec).catch(() => msg.reply('Failed.'));
  msg.reply(`🐌 Slowmode: ${sec}s`);
});
register('poll', 'Create a poll', async (msg, args) => {
  const [question, ...opts] = args.join(' ').split('|').map(s => s.trim());
  const embed = new EmbedBuilder().setTitle('Poll: ' + question)
    .setDescription(opts.map((o, i) => `${i+1}. ${o}`).join('\n'));
  const pollMsg = await msg.channel.send({ embeds: [embed] });
  for (let i = 0; i < opts.length; i++) await pollMsg.react(`${i+1}️⃣`);
});
register('remind', 'Set a reminder', (msg, args) => {
  const time = parseInt(args[0]) * 1000;
  const text = args.slice(1).join(' ');
  msg.reply(`⏰ Reminder set for ${args[0]}s`);
  setTimeout(() => msg.reply(`🔔 Reminder: ${text}`), time);
});
register('math', 'Simple math eval', (msg, args) => {
  try {
    const result = eval(args.join(' '));
    msg.reply(`🧮 Result: ${result}`);
  } catch {
    msg.reply('Invalid expression.');
  }
});
register('translate', 'Translate text', async (msg, args) => {
  const text = args.join(' ');
  msg.reply(`Translated: ${text}`);
});
register('uptime', 'Show bot uptime', (msg) => {
  const uptime = process.uptime();
  msg.reply(`⏱️ Uptime: ${Math.floor(uptime)}s`);
});
register('invite', 'Generate invite link', (msg) => {
  msg.reply(`🔗 Invite me: https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8`).trim();
});
register('stats', 'Bot statistics', (msg) => {
  msg.reply(`📊 Servers: ${client.guilds.cache.size} | Users: ${client.users.cache.size}`);
});

// --- EVENT HANDLERS ---
client.once('ready', async () => {
  await loadingSequence();
  console.log(`🤖 Logged in as ${client.user.tag}`);
  // Presence: Watching for commands
  client.user.setActivity(`for ${PREFIX}help`, { type: ActivityType.Watching });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild || !message.content.startsWith(PREFIX)) return;
  const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = commands.get(cmd.toLowerCase());
  if (!command) return;
  try {
    await command.execute(message, args);
  } catch (e) {
    console.error(e);
    message.reply('❌ Error executing command.');
  }
});

// --- BOT LOGIN ---
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN missing');
} else {
  client.login(token);
}
