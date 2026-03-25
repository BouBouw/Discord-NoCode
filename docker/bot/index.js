
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import { join } from 'path';
import { pathToFileURL } from 'url';
import colors from 'colors';

dotenv.config();

// ── Forward console output to the browser Console panel in real-time ─────────
;(function patchConsole() {
  const apiUrl = (process.env.API_URL || 'http://host.docker.internal:3099').replace(/\/$/, '');
  const secret = process.env.INTERNAL_SECRET || '';
  const wfId   = process.env.WORKFLOW_ID;
  if (!wfId) return;

  const post = (level, args) => {
    const msg = args
      .map(a => (typeof a === 'string' ? a : JSON.stringify(a)))
      .join(' ')
      .replace(/\x1b\[[0-9;]*m/g, ''); // strip ANSI colour codes
    fetch(`${apiUrl}/api/internal/execution-event`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body:    JSON.stringify({ workflowId: parseInt(wfId), type: 'log', level, message: msg }),
    }).catch(() => {});
  };

  const o = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  console.log   = (...a) => { o.log(...a);   post('info',  a); };
  console.info  = (...a) => { o.info(...a);  post('info',  a); };
  console.warn  = (...a) => { o.warn(...a);  post('warn',  a); };
  console.error = (...a) => { o.error(...a); post('error', a); };
})();

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map(a => GatewayIntentBits[a]),
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
    ],
});

client.commands = new Collection();

const connection = mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    user:     process.env.DB_USER     || 'botuser',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || '',
    port:     parseInt(process.env.DB_PORT || '3306'),
});

client.once('clientReady', async () => {
    console.log(`[Bot] Ready as ${client.user.tag}`.green.bold);

    const workflowId = process.env.WORKFLOW_ID ? parseInt(process.env.WORKFLOW_ID, 10) : null;

    if (workflowId && !isNaN(workflowId)) {
        // ── Workflow mode: fetch workflow from API and register nodes ──────────
        console.log(`[Bot] Workflow mode — loading workflow #${workflowId}`);
        const { WorkflowHandler } = await import('./handlers/workflowHandler.js');
        const wh = new WorkflowHandler(client, connection);
        try {
            await wh.loadWorkflow(workflowId);
            await wh.register();
        } catch (err) {
            console.error('[Bot] Failed to load workflow:'.red, err.message);
        }
    } else {
        // ── Static mode: load commands/events from files ───────────────────────
        console.log('[Bot] Static mode — loading commands and events from files');
        const { Handler } = await import('./handlers/handler.js');
        const handler = new Handler(client, connection);
        await handler.loadCommands();
        await handler.loadEvents();

        // Register and handle the 4 built-in commands in static mode
        const { BUILTIN_COMMAND_DEFS, handleBuiltinCommand, isBuiltin } = await import('./src/commands/builtin/index.js');
        if (client.application?.commands) {
            const existing = await client.application.commands.fetch();
            const existingNames = new Set(existing.map(c => c.name));
            const missing = BUILTIN_COMMAND_DEFS.filter(d => !existingNames.has(d.name));
            if (missing.length) await client.application.commands.set([...existing.values(), ...missing]);
        }
        client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;
            if (isBuiltin(interaction.commandName)) {
                return handleBuiltinCommand(interaction, client, connection, []).catch(err =>
                    console.error('[Bot] Built-in command error:', err)
                );
            }
            const cmd = client.commands.get(interaction.commandName);
            if (cmd?.execute) cmd.execute(interaction, client, connection).catch(console.error);
        });

        // Run legacy clientReady handler if present
        try {
            const mod = await import(pathToFileURL(join(process.cwd(), 'src', 'events', 'client', 'clientReady.js')));
            const { execute } = mod.default || mod;
            if (typeof execute === 'function') await execute(client, connection);
        } catch {}
    }
});

// Support both DISCORD_TOKEN (injected by dockerService) and legacy TOKEN
const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!token) {
    console.error('[Bot] ERROR: No Discord token provided. Set DISCORD_TOKEN env var.'.red);
    process.exit(1);
}

try {
    await client.login(token);
} catch (err) {
    console.error('[Bot] ERROR: Failed to login to Discord:'.red, err.message);
    console.error('[Bot] Check that your Discord token is valid.');
    process.exit(1);
}

export default { client, connection };