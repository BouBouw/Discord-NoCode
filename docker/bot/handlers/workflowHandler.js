import { PermissionFlagsBits } from 'discord.js';
import { BUILTIN_COMMAND_DEFS, handleBuiltinCommand, isBuiltin } from '../src/commands/builtin/index.js';

// Slash command option type mapping (Discord API integers)
const OPTION_TYPE = {
  string: 3, integer: 4, number: 10, boolean: 5,
  user: 6, role: 8, channel: 7, mentionable: 9, attachment: 11,
};

// Discord permission name → PermissionFlagsBits
const PERMISSION_MAP = {
  Administrator:          PermissionFlagsBits.Administrator,
  BanMembers:             PermissionFlagsBits.BanMembers,
  KickMembers:            PermissionFlagsBits.KickMembers,
  ManageChannels:         PermissionFlagsBits.ManageChannels,
  ManageGuild:            PermissionFlagsBits.ManageGuild,
  ManageMessages:         PermissionFlagsBits.ManageMessages,
  ManageNicknames:        PermissionFlagsBits.ManageNicknames,
  ManageRoles:            PermissionFlagsBits.ManageRoles,
  ManageThreads:          PermissionFlagsBits.ManageThreads,
  ManageWebhooks:         PermissionFlagsBits.ManageWebhooks,
  ManageEvents:           PermissionFlagsBits.ManageEvents,
  ModerateMembers:        PermissionFlagsBits.ModerateMembers,
  MentionEveryone:        PermissionFlagsBits.MentionEveryone,
  MoveMembers:            PermissionFlagsBits.MoveMembers,
  MuteMembers:            PermissionFlagsBits.MuteMembers,
  DeafenMembers:          PermissionFlagsBits.DeafenMembers,
  ReadMessageHistory:     PermissionFlagsBits.ReadMessageHistory,
  SendMessages:           PermissionFlagsBits.SendMessages,
  ViewChannel:            PermissionFlagsBits.ViewChannel,
  ViewAuditLog:           PermissionFlagsBits.ViewAuditLog,
  UseApplicationCommands: PermissionFlagsBits.UseApplicationCommands,
  AttachFiles:            PermissionFlagsBits.AttachFiles,
  EmbedLinks:             PermissionFlagsBits.EmbedLinks,
  AddReactions:           PermissionFlagsBits.AddReactions,
  Connect:                PermissionFlagsBits.Connect,
  Speak:                  PermissionFlagsBits.Speak,
  CreatePublicThreads:    PermissionFlagsBits.CreatePublicThreads,
  CreatePrivateThreads:   PermissionFlagsBits.CreatePrivateThreads,
};

export class WorkflowHandler {
  constructor(client, db) {
    this.client      = client;
    this.db          = db;
    this.workflow    = null;
    this.nodeMap     = new Map(); // id → node
    this.edgesBySource = new Map(); // nodeId → [{target, sourceHandle}]
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  async loadWorkflow(workflowId) {
    const apiUrl = (process.env.API_URL || 'http://host.docker.internal:3099').replace(/\/$/, '');
    const secret = process.env.INTERNAL_SECRET || '';

    const res = await fetch(`${apiUrl}/api/internal/workflow/${workflowId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching workflow ${workflowId}`);
    }

    this.workflow = await res.json();
    this._buildGraph();

    console.log(`[Workflow] Loaded "${this.workflow.name}" — ${this.workflow.nodes.length} nodes, ${this.workflow.connections.length} edges`);
  }

  _buildGraph() {
    this.nodeMap.clear();
    this.edgesBySource.clear();

    for (const node of this.workflow.nodes) {
      this.nodeMap.set(node.id, node);
    }
    for (const conn of this.workflow.connections) {
      const src = conn.source;
      if (!this.edgesBySource.has(src)) this.edgesBySource.set(src, []);
      this.edgesBySource.get(src).push({
        target:       conn.target,
        sourceHandle: conn.source_handle ?? conn.sourceHandle ?? 'output',
      });
    }
  }

  // ─── Register ─────────────────────────────────────────────────────────────

  async register() {
    const cmdNodes           = this.workflow.nodes.filter(n => n.type === 'commandHandlerSuite' && n.config?.commandName);
    const evtNodes           = this.workflow.nodes.filter(n => n.type === 'eventHandlerSuite'   && n.config?.eventName);
    const btnHandlerNodes    = this.workflow.nodes.filter(n => n.type === 'buttonInteractionHandler');
    const selectHandlerNodes = this.workflow.nodes.filter(n => n.type === 'selectMenuInteractionHandler');
    const modalHandlerNodes  = this.workflow.nodes.filter(n => n.type === 'modalSubmitHandler');

    // ── Register slash commands (workflow + built-ins) ─────────────────────────
    {
      const workflowDefs = cmdNodes.map(n => this._buildCommandDef(n));
      const allDefs = [...workflowDefs, ...BUILTIN_COMMAND_DEFS];
      await this.client.application.commands.set(allDefs);
      console.log(
        `[Workflow] Registered ${workflowDefs.length} workflow command(s) + ${BUILTIN_COMMAND_DEFS.length} built-in(s): ` +
        allDefs.map(d => `/${d.name}`).join(', ')
      );
    }

    // ── interactionCreate: slash commands (workflow + built-ins) ───────────────
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;

      // Built-in commands take priority
      if (isBuiltin(interaction.commandName)) {
        return handleBuiltinCommand(interaction, this.client, this.db, cmdNodes).catch(err =>
          console.error('[Workflow] Built-in command error:', err)
        );
      }

      const node = cmdNodes.find(n => n.config.commandName === interaction.commandName);
      if (!node) return;

      if (!this._checkPermissions(node.config, interaction)) {
        return interaction.reply({ content: '❌ You lack the required permissions.', ephemeral: true });
      }

      const ctx = this._makeCtx({ interaction });
      this._emit('node_start', { nodeId: String(node.id) });
      try {
        await this._executeFrom(node, ctx, 'output');
        this._emit('node_done', { nodeId: String(node.id) });
      } catch (err) {
        console.error('[Workflow] Command execution error:', err);
        this._emit('node_error', { nodeId: String(node.id) });
        if (interaction.deferred || interaction.replied) {
          interaction.editReply({ content: '❌ An error occurred.' }).catch(() => {});
        } else {
          interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
        }
      }
    });

    // ── interactionCreate: component & modal handlers (trigger nodes) ──────────
    if (btnHandlerNodes.length || selectHandlerNodes.length || modalHandlerNodes.length) {
      this.client.on('interactionCreate', async interaction => {
        // Button click
        if (interaction.isButton()) {
          for (const node of btnHandlerNodes) {
            if (!this._matchCustomId(interaction.customId, node.config)) continue;
            const ctx = this._makeCtx({ interaction });
            this._storeInteractionVars(node.config, interaction, ctx);
            this._emit('node_start', { nodeId: String(node.id) });
            try {
              await this._executeFrom(node, ctx, 'output');
              this._emit('node_done', { nodeId: String(node.id) });
            } catch (err) {
              console.error('[Workflow] buttonInteractionHandler error:', err);
              this._emit('node_error', { nodeId: String(node.id), error: err.message });
            }
          }
        }

        // Select menu (any type)
        if (interaction.isAnySelectMenu()) {
          for (const node of selectHandlerNodes) {
            if (!this._matchCustomId(interaction.customId, node.config)) continue;
            const ctx = this._makeCtx({ interaction });
            this._storeInteractionVars(node.config, interaction, ctx);
            ctx.variables[(node.config.outputVar || 'interaction') + '.values'] = JSON.stringify(interaction.values ?? []);
            this._emit('node_start', { nodeId: String(node.id) });
            try {
              await this._executeFrom(node, ctx, 'output');
              this._emit('node_done', { nodeId: String(node.id) });
            } catch (err) {
              console.error('[Workflow] selectMenuInteractionHandler error:', err);
              this._emit('node_error', { nodeId: String(node.id), error: err.message });
            }
          }
        }

        // Modal submit
        if (interaction.isModalSubmit()) {
          for (const node of modalHandlerNodes) {
            if (!this._matchCustomId(interaction.customId, node.config)) continue;
            const ctx = this._makeCtx({ interaction });
            this._storeInteractionVars(node.config, interaction, ctx);
            // Expose modal fields as variables
            const prefix = node.config.outputVar || 'interaction';
            const fields = {};
            for (const [key, comp] of interaction.fields.fields) {
              fields[key] = comp.value;
              ctx.variables[`${prefix}.fields.${key}`] = comp.value;
            }
            ctx.variables[`${prefix}.fields`] = JSON.stringify(fields);
            this._emit('node_start', { nodeId: String(node.id) });
            try {
              await this._executeFrom(node, ctx, 'output');
              this._emit('node_done', { nodeId: String(node.id) });
            } catch (err) {
              console.error('[Workflow] modalSubmitHandler error:', err);
              this._emit('node_error', { nodeId: String(node.id), error: err.message });
            }
          }
        }
      });
    }

    // ── Event handlers ─────────────────────────────────────────────────────────
    for (const node of evtNodes) {
      this._registerEvent(node);
    }

    // ── Scheduled triggers ──────────────────────────────────────────────────────
    const scheduledNodes = this.workflow.nodes.filter(n => n.type === 'scheduledTrigger');
    for (const node of scheduledNodes) {
      this._registerScheduled(node);
    }

    // ── Integration triggers (Twitch, YouTube) ──────────────────────────────────
    const twitchNodes  = this.workflow.nodes.filter(n => n.type === 'twitchLive');
    const youtubeNodes = this.workflow.nodes.filter(n => n.type === 'youtubeNewVideo');

    if (twitchNodes.length || youtubeNodes.length) {
      const { registerTwitchLive, registerYoutubeNewVideo } = await import('../src/workflow/nodes/integrations.js');
      for (const node of twitchNodes)  registerTwitchLive(node, this);
      for (const node of youtubeNodes) registerYoutubeNewVideo(node, this);
    }
  }

  /** Check if a customId matches a node's filter config */
  _matchCustomId(customId, cfg) {
    const filter    = cfg.customIdFilter || '';
    const matchType = cfg.matchType || 'prefix';
    if (!filter) return true;
    switch (matchType) {
      case 'exact':    return customId === filter;
      case 'contains': return customId.includes(filter);
      case 'regex':    try { return new RegExp(filter).test(customId); } catch { return false; }
      default:         return customId.startsWith(filter); // 'prefix'
    }
  }

  /** Store common interaction variables into ctx */
  _storeInteractionVars(cfg, interaction, ctx) {
    const prefix = cfg.outputVar || 'interaction';
    ctx.variables[`${prefix}.customId`]  = interaction.customId;
    ctx.variables[`${prefix}.userId`]    = interaction.user.id;
    ctx.variables[`${prefix}.username`]  = interaction.user.username;
    ctx.variables[`${prefix}.guildId`]   = interaction.guildId ?? '';
    ctx.variables[`${prefix}.channelId`] = interaction.channelId ?? '';
    ctx.variables[`${prefix}.messageId`] = interaction.message?.id ?? '';
  }

  _checkPermissions(cfg, interaction) {
    if (cfg.permissionType === 'discord' && cfg.discordPermissions?.length > 0) {
      const required = cfg.discordPermissions
        .map(p => PERMISSION_MAP[p])
        .filter(Boolean)
        .reduce((acc, p) => acc | p, 0n);
      if (required && !interaction.memberPermissions?.has(required)) return false;
    }
    if (cfg.permissionType === 'custom' && cfg.customRoles?.length > 0) {
      const hasRole = cfg.customRoles.some(r =>
        interaction.member?.roles?.cache?.some(mr => mr.name === r)
      );
      if (!hasRole) return false;
    }
    return true;
  }

  _buildCommandDef(node) {
    const cfg = node.config;
    return {
      name:        cfg.commandName.toLowerCase().replace(/\s+/g, '_'),
      description: cfg.description || 'No description',
      options: (cfg.parameters || []).filter(p => p.name).map(p => ({
        name:        p.name.toLowerCase().replace(/\s+/g, '_'),
        description: p.description || 'No description',
        type:        OPTION_TYPE[p.type] ?? 3,
        required:    !!p.required,
      })),
    };
  }

  _registerEvent(node) {
    const { eventName, executeOnce } = node.config;
    const handler = async (...args) => {
      const ctx = this._makeCtx({ event: args });
      try {
        await this._executeFrom(node, ctx, 'output');
      } catch (err) {
        console.error(`[Workflow] Event handler error (${eventName}):`, err);
      }
    };

    if (executeOnce) this.client.once(eventName, handler);
    else             this.client.on(eventName, handler);

    console.log(`[Workflow] Event registered: ${eventName}${executeOnce ? ' (once)' : ''}`);
  }

  _registerScheduled(node) {
    const config      = node.config || {};
    const intervalSec = Math.max(10, Number(config.interval) || 60); // min 10s

    const tick = async () => {
      const ctx = this._makeCtx({});
      ctx.variables['scheduled.timestamp'] = new Date().toISOString();
      ctx.variables['scheduled.interval']  = String(intervalSec);
      this._emit('node_start', { nodeId: String(node.id) });
      try {
        await this._executeFrom(node, ctx, 'output');
        this._emit('node_done', { nodeId: String(node.id) });
      } catch (err) {
        console.error('[Workflow] Scheduled trigger error:', err);
        this._emit('node_error', { nodeId: String(node.id), error: err.message });
      }
    };

    setInterval(tick, intervalSec * 1000);
    console.log(`[Workflow] Scheduled trigger every ${intervalSec}s`);
  }

  // ─── Execution event emitter (fire-and-forget) ────────────────────────────

  _emit(type, extra = {}) {
    if (!this.workflow?.id) return;
    const apiUrl = (process.env.API_URL || 'http://host.docker.internal:3099').replace(/\/$/, '');
    const secret = process.env.INTERNAL_SECRET || '';
    fetch(`${apiUrl}/api/internal/execution-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ workflowId: this.workflow.id, type, ...extra }),
    }).catch(() => {});
  }

  // ─── Graph traversal ──────────────────────────────────────────────────────

  async _executeFrom(node, ctx, handle) {
    const edges = (this.edgesBySource.get(node.id) || []).filter(e => e.sourceHandle === handle);
    for (const edge of edges) {
      const next = this.nodeMap.get(edge.target);
      if (next) {
        this._emit('edge_active', { sourceId: String(node.id), targetId: String(edge.target) });
        await this._executeNode(next, ctx);
      }
    }
  }

  async _executeNode(node, ctx) {
    // Trigger nodes are entry points only, not executable actions
    if (['commandHandlerSuite', 'eventHandlerSuite', 'coreBot',
         'buttonInteractionHandler', 'selectMenuInteractionHandler', 'modalSubmitHandler',
         'scheduledTrigger', 'twitchLive', 'youtubeNewVideo'].includes(node.type)) return;

    this._emit('node_start', { nodeId: String(node.id), snapshot: this._makeSnapshot(ctx) });
    let nextHandle = 'output';
    try {
      const result = await this._dispatch(node, ctx);
      if (result?.nextHandle) nextHandle = result.nextHandle;

      // ── forEach special handling ───────────────────────────────────────────
      if (result?._forEach) {
        const { items, itemVar } = result._forEach;
        for (const item of items) {
          ctx.variables[itemVar] = typeof item === 'object' ? JSON.stringify(item) : String(item);
          await this._executeFrom(node, ctx, 'loop');
        }
        nextHandle = 'done';
      }

      this._emit('node_done', { nodeId: String(node.id), nextHandle });
    } catch (err) {
      console.error(`[Workflow] Node error (${node.type}):`, err.message);
      this._emit('node_error', { nodeId: String(node.id), error: err.message });
      nextHandle = 'error';
    }

    await this._executeFrom(node, ctx, nextHandle);
  }

  /** Extract a JSON-safe snapshot of the current execution context. */
  _makeSnapshot(ctx) {
    const snap = {};
    // Slash command arguments
    if (ctx.interaction?.options?.data?.length) {
      snap.args = {};
      for (const opt of ctx.interaction.options.data) {
        snap.args[opt.name] = opt.value;
      }
    }
    // User context
    const user = ctx.interaction?.user ?? ctx.event?.[0]?.user ?? ctx.event?.[0]?.author;
    if (user) snap.user = { id: user.id, username: user.username };
    // Guild / Channel
    const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
    if (guild) snap.guild = { id: guild.id, name: guild.name };
    const channel = ctx.interaction?.channel ?? ctx.event?.[0]?.channel;
    if (channel) snap.channel = { id: channel.id, name: channel.name };
    // Message (message events)
    const msg = ctx.event?.[0];
    if (msg?.content !== undefined) snap.message = { id: msg.id, content: msg.content };
    // Runtime variables
    if (ctx.variables && Object.keys(ctx.variables).length > 0) {
      snap.variables = { ...ctx.variables };
    }
    return snap;
  }

  async _dispatch(node, ctx) {
    const type   = node.type;
    const config = node.config || {};

    if (['sendMessage', 'sendEmbed', 'sendImage', 'sendFile', 'editMessage', 'deleteMessage', 'replyToMessage'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/messaging.js');
      return executeAction(type, config, ctx);
    }
    if (['addRole', 'removeRole', 'createRole'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/roles.js');
      return executeAction(type, config, ctx);
    }
    if (['kick', 'ban', 'unban', 'timeout', 'unmute', 'bulkDeleteMessages', 'setNickname'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/moderation.js');
      return executeAction(type, config, ctx);
    }
    if (['createChannel', 'deleteChannel'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/channels.js');
      return executeAction(type, config, ctx);
    }
    if (['editGuild', 'editRole', 'deleteRole',
         'createEmoji', 'deleteEmoji', 'editEmoji',
         'createSticker', 'deleteSticker',
         'createEvent', 'editEvent', 'deleteEvent',
         'createGuildWebhook', 'deleteGuildWebhook',
         'fetchAuditLog', 'fetchMembers'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/guild.js');
      return executeAction(type, config, ctx);
    }
    if (['condition', 'delay', 'variable', 'forEach', 'switchCase', 'random', 'counter', 'filter',
         'mathOperation', 'stringOperation', 'arrayOperation', 'jsonParse', 'jsonStringify',
         'typeConvert', 'getDate', 'loopWhile', 'codeExec'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/logic.js');
      return executeAction(type, config, ctx);
    }
    if (type === 'httpRequest') {
      const { executeAction } = await import('../src/workflow/nodes/http.js');
      return executeAction(type, config, ctx);
    }
    if (type === 'sqlDatabase') {
      const { executeAction } = await import('../src/workflow/nodes/database.js');
      return executeAction(type, config, ctx);
    }
    if (type === 'canvasCard') {
      const { executeAction } = await import('../src/workflow/nodes/canvas.js');
      return executeAction(type, config, ctx);
    }
    if (['sendDM','addReaction','pinMessage','unpinMessage','createThread','archiveThread',
         'editChannel','createInvite','serverMuteMember','serverDeafenMember','fetchUserInfo'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/interactions.js');
      return executeAction(type, config, ctx);
    }
    if (['joinVoiceChannel','leaveVoiceChannel','playAudio','stopAudio',
         'moveToVoice','disconnectFromVoice'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/voice.js');
      return executeAction(type, config, ctx);
    }
    if (['setBotPresence','setBotNickname','setBotAvatar'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/botManagement.js');
      return executeAction(type, config, ctx);
    }
    if (['sendButtons','sendStringSelectMenu','sendUserSelectMenu','sendRoleSelectMenu',
         'sendChannelSelectMenu','sendModal','awaitButtonClick','awaitSelectMenu'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/components.js');
      return executeAction(type, config, ctx);
    }

    // ── Phase 1: Beginner Essentials ──────────────────────────────────────────
    if (['welcomeMessage','goodbyeMessage','autoRole','logAction','embedBuilder'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/essentials.js');
      return executeAction(type, config, ctx);
    }
    if (['ticketPanel','ticketClose'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/tickets.js');
      return executeAction(type, config, ctx);
    }
    if (type === 'reactionRole') {
      const { executeAction } = await import('../src/workflow/nodes/reactionRoles.js');
      return executeAction(type, config, ctx);
    }

    // ── Phase 2: Engagement ───────────────────────────────────────────────────
    if (['xpGive','xpCheck','levelCheck','createPoll','giveawayCreate','giveawayEnd'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/engagement.js');
      return executeAction(type, config, ctx);
    }
    if (['antiSpam','badWordFilter'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/automod.js');
      return executeAction(type, config, ctx);
    }
    if (type === 'cooldown') {
      const { executeAction } = await import('../src/workflow/nodes/cooldown.js');
      ctx._currentNodeId = node.id;
      return executeAction(type, config, ctx);
    }

    // ── Phase 3: Economy ──────────────────────────────────────────────────────
    if (['economyGive','economyTake','economyBalance','economyLeaderboard'].includes(type)) {
      const { executeAction } = await import('../src/workflow/nodes/economy.js');
      return executeAction(type, config, ctx);
    }

    // ── Comment node: no-op ───────────────────────────────────────────────────
    if (type === 'comment') return null;

    console.warn(`[Workflow] Unknown node type skipped: ${type}`);
    return null;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _makeCtx(initial = {}) {
    return { client: this.client, db: this.db, variables: {}, ...initial };
  }
}
