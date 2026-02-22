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
const PRESENCE_SEQ = ['idle','dnd','idle','dnd','idle','dnd']; // exact sequence requested
const PRESENCE_INTERVAL_MS = 10000; // 10 seconds

// --- LOADING SEQUENCE (unchanged but still async) ---
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

// --- COMMAND HANDLER SETUP (prefix commands) ---
const commands = new Map();
function register(name, description, execute) {
  commands.set(name, { description, execute });
}

// --- PREFIX COMMAND DEFINITIONS (your existing ones + extras) ---
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
  msg.delete().catch(() => {});
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
  try {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke').then(r => r.json());
    msg.reply(`😂 ${res.setup} — ${res.punchline}`);
  } catch {
    msg.reply('Could not fetch a joke right now.');
  }
});
register('meme', 'Fetch a random meme', async (msg) => {
  try {
    const res = await fetch('https://meme-api.herokuapp.com/gimme').then(r => r.json());
    msg.reply(res.url);
  } catch {
    msg.reply('Could not fetch a meme.');
  }
});
register('cat', 'Random cat pic', async (msg) => {
  try {
    const res = await fetch('https://aws.random.cat/meow').then(r => r.json());
    msg.reply(res.file);
  } catch {
    msg.reply('Could not fetch a cat pic.');
  }
});
register('dog', 'Random dog pic', async (msg) => {
  try {
    const res = await fetch('https://random.dog/woof.json').then(r => r.json());
    msg.reply(res.url);
  } catch {
    msg.reply('Could not fetch a dog pic.');
  }
});
register('buttons', 'Send a button message the bot will respond to', async (msg) => {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_hello')
      .setLabel('Say Hello')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_info')
      .setLabel('Who am I?')
      .setStyle(ButtonStyle.Secondary)
  );

  await msg.channel.send({ content: 'Press a button:', components: [row] });
});
register('whoami', 'Quick whoami', (msg) => {
  msg.reply(`You are ${msg.author.tag} (${msg.author.id})`);
});
register('slashhelp', 'Show basic slash command help', (msg) => {
  msg.reply('Use `/ping` or `/whoami` as slash commands (try them!)');
});

// Moderation / utility examples (keeps your existing ones)
register('kick', 'Kick a member', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return msg.reply('You lack permission.');
  const member = msg.mentions.members.first();
  if (!member) return msg.reply('Mention someone to kick.');
  await member.kick().catch(() => msg.reply('Failed to kick.'));
  msg.reply(`👢 Kicked ${member}`);
});
register('ban', 'Ban a member', async (msg, args) => {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return msg.reply('You lack permission.');
  const member = msg.mentions.members.first();
  if (!member) return msg.reply('Mention someone to ban.');
  await member.ban().catch(() => msg.reply('Failed to ban.'));
  msg.reply(`🔨 Banned ${member}`);
});

// a couple more admin commands for convenience
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
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // Set initial presence activity
  client.user.setActivity(`for ${PREFIX}help`, { type: ActivityType.Watching });

  // PRESENCE CYCLE: idle, dnd, idle, dnd, idle, dnd every 10 seconds
  let idx = 0;
  // ensure only one interval runs
  if (!client._presenceInterval) {
    client._presenceInterval = setInterval(() => {
      const status = PRESENCE_SEQ[idx % PRESENCE_SEQ.length]; // 'idle' or 'dnd'
      idx++;
      // keep the same activity text but change status
      client.user.setPresence({
        activities: [{ name: `for ${PREFIX}help`, type: ActivityType.Watching }],
        status: status
      }).catch(console.error);
      console.log(`Presence set -> ${status}`);
    }, PRESENCE_INTERVAL_MS);
  }

  // Register simple slash commands for each guild (so they appear quickly)
  try {
    const slashCommands = [
      { name: 'ping', description: 'Check bot latency' },
      { name: 'whoami', description: 'Show your tag and id' },
      { name: 'buttons', description: 'Send a buttons message' }
      // add further slash commands here if desired
    ];
    // register per-guild (faster updates than global)
    for (const guild of client.guilds.cache.values()) {
      await guild.commands.set(slashCommands);
      console.log(`Registered ${slashCommands.length} slash commands to ${guild.name}`);
    }
  } catch (e) {
    console.error('Failed to register slash commands:', e);
  }
});

// prefix message handling
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

// interaction (slash + button) handling
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand && interaction.commandName) {
      // slash commands
      if (interaction.commandName === 'ping') {
        await interaction.reply(`Pong! Latency: ${Date.now() - interaction.createdTimestamp}ms`);
      } else if (interaction.commandName === 'whoami') {
        await interaction.reply(`${interaction.user.tag} — ${interaction.user.id}`);
      } else if (interaction.commandName === 'buttons') {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('btn_hello')
            .setLabel('Say Hello')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('btn_info')
            .setLabel('Who am I?')
            .setStyle(ButtonStyle.Secondary)
        );
        await interaction.reply({ content: 'Press a button (slash)', components: [row] });
      } else {
        await interaction.reply({ content: 'Command not implemented yet.', ephemeral: true });
      }
    } else if (interaction.isButton && interaction.customId) {
      // button clicks
      if (interaction.customId === 'btn_hello') {
        await interaction.reply({ content: `Hello, ${interaction.user.username}! 👋`, ephemeral: true });
      } else if (interaction.customId === 'btn_info') {
        await interaction.reply({ content: `You are ${interaction.user.tag} — ID: ${interaction.user.id}`, ephemeral: true });
      } else {
        await interaction.reply({ content: 'Button not recognized.', ephemeral: true });
      }
    }
  } catch (err) {
    console.error('Interaction handler error:', err);
    if (interaction.replied || interaction.deferred) return;
    try { await interaction.reply({ content: 'Error handling interaction', ephemeral: true }); } catch {}
  }
});

// --- BOT LOGIN ---
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN missing');
} else {
  client.login(token).catch(err => console.error('Login failed:', err));
}
