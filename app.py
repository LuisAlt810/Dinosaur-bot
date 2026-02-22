#!/usr/bin/env python3
import os
import sys
import time
import subprocess
from pathlib import Path
from textwrap import dedent

ROOT = Path.cwd()
BOT_PATH = ROOT / "bot.py"
ENV_PATH = ROOT / ".env"

# ---------- FULL BOT CODE (will be written to bot.py) ----------
BOT_CODE = dedent("""
    # bot.py
    import os
    import asyncio
    import time
    import random
    import math
    import ast
    from typing import Optional

    import aiohttp
    from aiohttp import web
    from dotenv import load_dotenv
    import discord
    from discord.ext import commands, tasks
    from discord import app_commands, ui, Interaction, Embed

    load_dotenv()

    # --- CONFIG ---
    DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
    PREFIX = "!"
    PRESENCE_SEQ = ["idle", "dnd", "idle", "dnd", "idle", "dnd"]
    PRESENCE_INTERVAL = 10  # seconds

    # --- BOT & INTENTS ---
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guilds = True
    intents.members = True

    bot = commands.Bot(command_prefix=PREFIX, intents=intents)
    tree = bot.tree

    START_TIME = time.time()

    # --- HELPER: safe math eval (only arithmetic) ---
    ALLOWED_NODES = {
        ast.Expression, ast.BinOp, ast.UnaryOp, ast.Num, ast.Load,
        ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow, ast.Mod, ast.USub,
        ast.FloorDiv, ast.LShift, ast.RShift, ast.BitAnd, ast.BitOr, ast.BitXor,
        ast.Call, ast.Name
    }
    SAFE_MATH_FUNCS = {name: getattr(math, name) for name in dir(math) if not name.startswith("_")}

    def safe_eval_math(expr: str):
        try:
            node = ast.parse(expr, mode="eval")
        except Exception:
            raise ValueError("Invalid expression")
        for n in ast.walk(node):
            if type(n) not in ALLOWED_NODES:
                raise ValueError("Invalid or unsafe expression")
        compiled = compile(node, "<ast>", "eval")
        return eval(compiled, {"__builtins__": {}}, SAFE_MATH_FUNCS)

    # --- PRESENCE CYCLE TASK ---
    @bot.event
    async def on_ready():
        print(f"🤖 Logged in as {bot.user} (id: {bot.user.id})")
        await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name=f"for {PREFIX}help"), status=discord.Status.online)
        if not presence_loop.is_running():
            presence_loop.start()
        try:
            await tree.sync()
            print("✅ Slash commands synced.")
        except Exception as e:
            print("Could not sync slash commands:", e)

    @tasks.loop(seconds=PRESENCE_INTERVAL)
    async def presence_loop():
        if not bot.is_ready():
            return
        idx = int((time.time() - START_TIME) // PRESENCE_INTERVAL) % len(PRESENCE_SEQ)
        status_name = PRESENCE_SEQ[idx]
        status = discord.Status.idle if status_name == "idle" else discord.Status.dnd
        try:
            await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name=f"for {PREFIX}help"), status=status)
            print(f"Presence set -> {status_name}")
        except Exception as e:
            print("Failed to set presence:", e)

    # --- UI: Buttons View ---
    class SimpleButtons(ui.View):
        def __init__(self, timeout: Optional[float] = 180.0):
            super().__init__(timeout=timeout)

        @ui.button(label="Say Hello", style=discord.ButtonStyle.primary, custom_id="btn_hello")
        async def hello_btn(self, button: ui.Button, interaction: Interaction):
            await interaction.response.send_message(f"Hello, {interaction.user.mention}! 👋", ephemeral=True)

        @ui.button(label="Who am I?", style=discord.ButtonStyle.secondary, custom_id="btn_info")
        async def info_btn(self, button: ui.Button, interaction: Interaction):
            await interaction.response.send_message(f"You are {interaction.user} — ID: {interaction.user.id}", ephemeral=True)

    # --- COMMANDS ---
    @bot.command(name="ping", help="Check bot latency")
    async def ping_cmd(ctx: commands.Context):
        started = time.perf_counter()
        msg = await ctx.reply("Pinging...")
        elapsed = (time.perf_counter() - started) * 1000
        await msg.edit(content=f"Pong! Latency ~ {int(bot.latency*1000)}ms | RTT ~ {int(elapsed)}ms")

    @bot.command(name="avatar", help="Display user avatar")
    async def avatar_cmd(ctx: commands.Context, member: discord.Member = None):
        member = member or ctx.author
        await ctx.reply(member.display_avatar.with_size(512).url)

    @bot.command(name="serverinfo", help="Show server information")
    async def serverinfo_cmd(ctx: commands.Context):
        g = ctx.guild
        embed = discord.Embed(title=g.name)
        embed.add_field(name="Members", value=str(g.member_count), inline=True)
        embed.add_field(name="Created", value=g.created_at.strftime("%Y-%m-%d"), inline=True)
        await ctx.reply(embed=embed)

    @bot.command(name="userinfo", help="Show user information")
    async def userinfo_cmd(ctx: commands.Context, member: discord.Member = None):
        member = member or ctx.author
        embed = discord.Embed(title=str(member))
        embed.set_thumbnail(url=member.display_avatar.with_size(256).url)
        embed.add_field(name="ID", value=str(member.id), inline=True)
        embed.add_field(name="Joined Discord", value=member.created_at.strftime("%Y-%m-%d"), inline=True)
        await ctx.reply(embed=embed)

    @bot.command(name="say", help="Make the bot say something")
    async def say_cmd(ctx: commands.Context, *, text: str = None):
        if not text:
            return await ctx.reply("Please provide text to say.")
        try:
            await ctx.message.delete()
        except Exception:
            pass
        await ctx.send(text)

    @bot.command(name="helpme", help="List all commands")
    async def help_cmd(ctx: commands.Context):
        cmds = []
        for c in bot.commands:
            cmds.append(f"**{PREFIX}{c.name}**: {c.help}")
        embed = discord.Embed(title="Help Menu", description="\\n".join(cmds))
        await ctx.reply(embed=embed)

    @bot.command(name="roll", help="Roll a 6-sided dice")
    async def roll_cmd(ctx: commands.Context):
        await ctx.reply(f"🎲 You rolled a {random.randint(1,6)}")

    @bot.command(name="flip", help="Flip a coin")
    async def flip_cmd(ctx: commands.Context):
        await ctx.reply("🪙 " + ("Heads" if random.random() < 0.5 else "Tails"))

    @bot.command(name="8ball", help="Magic 8-ball")
    async def eightball_cmd(ctx: commands.Context, *, q: str = ""):
        responses = ["Yes", "No", "Maybe", "Ask again later"]
        await ctx.reply("🔮 " + random.choice(responses))

    @bot.command(name="joke", help="Tell a joke")
    async def joke_cmd(ctx: commands.Context):
        url = "https://official-joke-api.appspot.com/random_joke"
        try:
            async with aiohttp.ClientSession() as s:
                async with s.get(url, timeout=10) as r:
                    if r.status == 200:
                        data = await r.json()
                        await ctx.reply(f"😂 {data.get('setup')} — {data.get('punchline')}")
                        return
        except Exception:
            pass
        await ctx.reply("Could not fetch a joke right now.")

    @bot.command(name="meme", help="Fetch a random meme")
    async def meme_cmd(ctx: commands.Context):
        url = "https://meme-api.herokuapp.com/gimme"
        try:
            async with aiohttp.ClientSession() as s:
                async with s.get(url, timeout=10) as r:
                    if r.status == 200:
                        data = await r.json()
                        await ctx.reply(data.get("url"))
                        return
        except Exception:
            pass
        await ctx.reply("Could not fetch a meme.")

    @bot.command(name="cat", help="Random cat pic")
    async def cat_cmd(ctx: commands.Context):
        url = "https://aws.random.cat/meow"
        try:
            async with aiohttp.ClientSession() as s:
                async with s.get(url, timeout=10) as r:
                    if r.status == 200:
                        data = await r.json()
                        await ctx.reply(data.get("file"))
                        return
        except Exception:
            pass
        await ctx.reply("Could not fetch a cat pic.")

    @bot.command(name="dog", help="Random dog pic")
    async def dog_cmd(ctx: commands.Context):
        url = "https://random.dog/woof.json"
        try:
            async with aiohttp.ClientSession() as s:
                async with s.get(url, timeout=10) as r:
                    if r.status == 200:
                        data = await r.json()
                        await ctx.reply(data.get("url") or data.get("file"))
                        return
        except Exception:
            pass
        await ctx.reply("Could not fetch a dog pic.")

    @bot.command(name="hug", help="Send a hug")
    async def hug_cmd(ctx: commands.Context, member: discord.Member = None):
        member = member or ctx.author
        await ctx.reply(f"🤗 {ctx.author.mention} hugs {member.mention}")

    @bot.command(name="slap", help="Slap someone")
    async def slap_cmd(ctx: commands.Context, member: discord.Member = None):
        await ctx.reply(f"👋 {ctx.author.mention} slaps {member.mention if member else 'the air'}!")

    # Moderation / utility examples
    @bot.command(name="kick", help="Kick a member")
    @commands.has_permissions(kick_members=True)
    async def kick_cmd(ctx: commands.Context, member: discord.Member = None):
        if not member:
            return await ctx.reply("Mention someone to kick.")
        try:
            await member.kick()
            await ctx.reply(f"👢 Kicked {member}")
        except Exception:
            await ctx.reply("Failed to kick.")

    @bot.command(name="ban", help="Ban a member")
    @commands.has_permissions(ban_members=True)
    async def ban_cmd(ctx: commands.Context, member: discord.Member = None):
        if not member:
            return await ctx.reply("Mention someone to ban.")
        try:
            await member.ban()
            await ctx.reply(f"🔨 Banned {member}")
        except Exception:
            await ctx.reply("Failed to ban.")

    @bot.command(name="mute", help="Mute a member (adds role 'Muted')")
    @commands.has_permissions(manage_roles=True)
    async def mute_cmd(ctx: commands.Context, member: discord.Member = None):
        if not member:
            return await ctx.reply("Mention someone to mute.")
        guild = ctx.guild
        mute_role = discord.utils.get(guild.roles, name="Muted")
        if not mute_role:
            try:
                mute_role = await guild.create_role(name="Muted", permissions=discord.Permissions(send_messages=False))
                for ch in guild.channels:
                    try:
                        await ch.set_permissions(mute_role, send_messages=False)
                    except Exception:
                        pass
            except Exception:
                return await ctx.reply("Failed to create mute role.")
        try:
            await member.add_roles(mute_role)
            await ctx.reply(f"🔇 Muted {member}")
        except Exception:
            await ctx.reply("Failed to mute.")

    @bot.command(name="unmute", help="Unmute a member")
    @commands.has_permissions(manage_roles=True)
    async def unmute_cmd(ctx: commands.Context, member: discord.Member = None):
        if not member:
            return await ctx.reply("Mention someone to unmute.")
        guild = ctx.guild
        mute_role = discord.utils.get(guild.roles, name="Muted")
        if not mute_role:
            return await ctx.reply("No mute role found.")
        try:
            await member.remove_roles(mute_role)
            await ctx.reply(f"🔈 Unmuted {member}")
        except Exception:
            await ctx.reply("Failed to unmute.")

    @bot.command(name="warn", help="Warn a member")
    @commands.has_permissions(kick_members=True)
    async def warn_cmd(ctx: commands.Context, member: discord.Member = None):
        if not member:
            return await ctx.reply("Mention someone to warn.")
        await ctx.reply(f"⚠️ {member.mention}, you have been warned.")

    @bot.command(name="clear", help="Clear messages")
    @commands.has_permissions(manage_messages=True)
    async def clear_cmd(ctx: commands.Context, amount: int = 5):
        try:
            deleted = await ctx.channel.purge(limit=amount + 1)
            m = await ctx.reply(f"🧹 Deleted {len(deleted)-1} messages.")
            await asyncio.sleep(5)
            try:
                await m.delete()
            except Exception:
                pass
        except Exception:
            await ctx.reply("Failed to delete.")

    @bot.command(name="lockdown", help="Lock the channel")
    @commands.has_permissions(manage_channels=True)
    async def lockdown_cmd(ctx: commands.Context):
        try:
            await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=False)
            await ctx.reply("🔒 Channel locked.")
        except Exception:
            await ctx.reply("Failed to lock channel.")

    @bot.command(name="unlock", help="Unlock the channel")
    @commands.has_permissions(manage_channels=True)
    async def unlock_cmd(ctx: commands.Context):
        try:
            await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=True)
            await ctx.reply("🔓 Channel unlocked.")
        except Exception:
            await ctx.reply("Failed to unlock channel.")

    @bot.command(name="slowmode", help="Set channel slowmode")
    @commands.has_permissions(manage_channels=True)
    async def slowmode_cmd(ctx: commands.Context, sec: int = 0):
        try:
            await ctx.channel.edit(rate_limit_per_user=sec)
            await ctx.reply(f"🐌 Slowmode: {sec}s")
        except Exception:
            await ctx.reply("Failed.")

    @bot.command(name="poll", help="Create a poll: !poll question | option1 | option2 ...")
    async def poll_cmd(ctx: commands.Context, *, rest: str):
        parts = [p.strip() for p in rest.split("|")]
        if len(parts) < 2:
            return await ctx.reply("Usage: !poll question | option1 | option2 ...")
        question = parts[0]
        opts = parts[1:]
        embed = Embed(title=f"Poll: {question}", description="\\n".join(f"{i+1}. {o}" for i, o in enumerate(opts)))
        poll_msg = await ctx.send(embed=embed)
        emojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
        for i in range(len(opts)):
            await poll_msg.add_reaction(emojis[i])

    @bot.command(name="remind", help="Set a reminder: !remind <seconds> <message>")
    async def remind_cmd(ctx: commands.Context, seconds: int, *, text: str):
        await ctx.reply(f"⏰ Reminder set for {seconds}s")
        async def _reminder():
            await asyncio.sleep(seconds)
            try:
                await ctx.reply(f"🔔 Reminder: {text}")
            except Exception:
                pass
        bot.loop.create_task(_reminder())

    @bot.command(name="math", help="Simple math eval")
    async def math_cmd(ctx: commands.Context, *, expr: str):
        try:
            res = safe_eval_math(expr)
            await ctx.reply(f"🧮 Result: {res}")
        except Exception:
            await ctx.reply("Invalid expression.")

    @bot.command(name="translate", help="Translate text (placeholder)")
    async def translate_cmd(ctx: commands.Context, *, text: str):
        await ctx.reply(f"Translated: {text}")

    @bot.command(name="uptime", help="Show bot uptime")
    async def uptime_cmd(ctx: commands.Context):
        up = int(time.time() - START_TIME)
        await ctx.reply(f"⏱️ Uptime: {up}s")

    @bot.command(name="invite", help="Generate invite link")
    async def invite_cmd(ctx: commands.Context):
        try:
            link = discord.utils.oauth_url(bot.user.id, permissions=discord.Permissions(8))
        except Exception:
            link = f"https://discord.com/oauth2/authorize?client_id={bot.user.id}&permissions=8&scope=bot%20applications.commands"
        await ctx.reply(f"🔗 Invite me: {link}")

    @bot.command(name="stats", help="Bot statistics")
    async def stats_cmd(ctx: commands.Context):
        await ctx.reply(f"📊 Servers: {len(bot.guilds)} | Users: {len(bot.users)}")

    @bot.command(name="buttons", help="Send a button message the bot will respond to")
    async def buttons_cmd(ctx: commands.Context):
        view = SimpleButtons()
        await ctx.send("Press a button:", view=view)

    @bot.command(name="whoami", help="Quick whoami")
    async def whoami_cmd(ctx: commands.Context):
        await ctx.reply(f"You are {ctx.author} ({ctx.author.id})")

    # --- Interaction (slash) commands ---
    @tree.command(name="ping", description="Check bot latency")
    async def slash_ping(interaction: Interaction):
        await interaction.response.send_message(f"Pong! Latency: {int(bot.latency*1000)}ms")

    @tree.command(name="whoami", description="Show your tag and id")
    async def slash_whoami(interaction: Interaction):
        await interaction.response.send_message(f"{interaction.user} — {interaction.user.id}")

    @tree.command(name="buttons", description="Send a buttons message")
    async def slash_buttons(interaction: Interaction):
        await interaction.response.send_message("Press a button (slash)", view=SimpleButtons(), ephemeral=False)

    # --- Error handlers for commands ---
    @bot.event
    async def on_command_error(ctx, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.reply("You lack permission.")
        elif isinstance(error, commands.BadArgument):
            await ctx.reply("Bad argument.")
        else:
            print("Command error:", error)

    # --- Minimal webserver using aiohttp to keep hosters happy ---
    async def index(request):
        return web.Response(text="Bot + Web server is running!")

    async def start_webserver():
        app = web.Application()
        app.router.add_get("/", index)
        runner = web.AppRunner(app)
        await runner.setup()
        port = int(os.getenv("PORT", 5000))
        site = web.TCPSite(runner, "0.0.0.0", port)
        await site.start()
        print(f"Web server running on port {port}")

    # --- ENTRYPOINT ---
    async def main():
        await start_webserver()
        await bot.start(DISCORD_TOKEN)

    if __name__ == "__main__":
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print("Shutting down...")
    """)

# ---------- WRITE bot.py (overwrite to ensure full code) ----------
try:
    BOT_PATH.write_text(BOT_CODE, encoding="utf8")
    print(f"✅ Wrote {BOT_PATH}")
except Exception as e:
    print("❌ Failed to write bot.py:", e)
    sys.exit(1)

# ---------- CREATE .env IF MISSING ----------
if not ENV_PATH.exists():
    try:
        ENV_PATH.write_text("DISCORD_TOKEN=\n", encoding="utf8")
        print("✅ Created .env (add your token to DISCORD_TOKEN=)")
    except Exception as e:
        print("❌ Failed to create .env:", e)

# ---------- RUN bot.py with auto-restart ----------
def start_bot_loop():
    python = sys.executable or "python3"
    while True:
        print("🚀 Starting bot.py ...")
        proc = subprocess.Popen([python, str(BOT_PATH)], stdout=None, stderr=None)
        exit_code = None
        try:
            exit_code = proc.wait()
        except KeyboardInterrupt:
            print("Shutdown requested, terminating child.")
            try:
                proc.terminate()
            except Exception:
                pass
            break
        print(f"⚠️ bot.py exited with code {exit_code}. Restarting in 5s...")
        time.sleep(5)

if __name__ == "__main__":
    start_bot_loop()
