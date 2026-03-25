import { resolve } from '../context.js';

export async function executeAction(type, config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild ?? ctx.event?.[1]?.guild;
  if (!guild) { console.warn(`[${type}] No guild in context`); return { nextHandle: 'output' }; }

  const reason = config.reason ? resolve(config.reason, ctx) : undefined;

  // ── editGuild ─────────────────────────────────────────────────────────────
  if (type === 'editGuild') {
    const editData = {};
    if (config.name)        editData.name        = resolve(config.name, ctx);
    if (config.description) editData.description = resolve(config.description, ctx);
    if (config.icon)        editData.icon        = resolve(config.icon, ctx);
    if (config.banner)      editData.banner      = resolve(config.banner, ctx);
    if (config.splash)      editData.splash      = resolve(config.splash, ctx);
    await guild.edit(editData, reason);
    return { nextHandle: 'output' };
  }

  // ── editRole ──────────────────────────────────────────────────────────────
  if (type === 'editRole') {
    const roleId = resolve(config.roleId || '', ctx);
    const role = guild.roles.cache.get(roleId) ?? await guild.roles.fetch(roleId).catch(() => null);
    if (!role) return { nextHandle: 'output' };
    const editData = {};
    if (config.name)                   editData.name        = resolve(config.name, ctx);
    if (config.color)                  editData.color       = resolve(config.color, ctx);
    if (config.hoist !== undefined)    editData.hoist       = !!config.hoist;
    if (config.mentionable !== undefined) editData.mentionable = !!config.mentionable;
    await role.edit(editData, reason);
    return { nextHandle: 'output' };
  }

  // ── deleteRole ────────────────────────────────────────────────────────────
  if (type === 'deleteRole') {
    const roleId = resolve(config.roleId || '', ctx);
    const role = guild.roles.cache.get(roleId) ?? await guild.roles.fetch(roleId).catch(() => null);
    if (role) await role.delete(reason);
    return { nextHandle: 'output' };
  }

  // ── createEmoji ───────────────────────────────────────────────────────────
  if (type === 'createEmoji') {
    try {
      const emoji = await guild.emojis.create({
        name:       resolve(config.name || 'emoji', ctx),
        attachment: resolve(config.imageUrl || '', ctx),
        reason,
      });
      if (config.outputVar) ctx.variables[config.outputVar] = emoji.id;
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_emojiError'] = err.message;
      return { nextHandle: 'error' };
    }
  }

  // ── deleteEmoji ───────────────────────────────────────────────────────────
  if (type === 'deleteEmoji') {
    const emojiId = resolve(config.emojiId || '', ctx);
    const emoji = guild.emojis.cache.get(emojiId) ?? await guild.emojis.fetch(emojiId).catch(() => null);
    if (emoji) await emoji.delete(reason);
    return { nextHandle: 'output' };
  }

  // ── editEmoji ─────────────────────────────────────────────────────────────
  if (type === 'editEmoji') {
    const emojiId = resolve(config.emojiId || '', ctx);
    const emoji = guild.emojis.cache.get(emojiId) ?? await guild.emojis.fetch(emojiId).catch(() => null);
    if (!emoji) return { nextHandle: 'output' };
    const editData = {};
    if (config.name) editData.name = resolve(config.name, ctx);
    await emoji.edit(editData, reason);
    return { nextHandle: 'output' };
  }

  // ── createSticker ─────────────────────────────────────────────────────────
  if (type === 'createSticker') {
    try {
      const sticker = await guild.stickers.create({
        name:        resolve(config.name || 'sticker', ctx),
        description: resolve(config.description || '', ctx),
        tags:        resolve(config.emoji || '🙂', ctx),
        file:        resolve(config.fileUrl || '', ctx),
        reason,
      });
      if (config.outputVar) ctx.variables[config.outputVar] = sticker.id;
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_stickerError'] = err.message;
      return { nextHandle: 'error' };
    }
  }

  // ── deleteSticker ─────────────────────────────────────────────────────────
  if (type === 'deleteSticker') {
    const stickerId = resolve(config.stickerId || '', ctx);
    const sticker = guild.stickers.cache.get(stickerId) ?? await guild.stickers.fetch(stickerId).catch(() => null);
    if (sticker) await sticker.delete(reason);
    return { nextHandle: 'output' };
  }

  // ── createEvent ───────────────────────────────────────────────────────────
  if (type === 'createEvent') {
    try {
      const { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } = await import('discord.js');
      const entityTypeMap = { voice: GuildScheduledEventEntityType.Voice, stage: GuildScheduledEventEntityType.StageInstance, external: GuildScheduledEventEntityType.External };
      const entityType = entityTypeMap[config.entityType] ?? GuildScheduledEventEntityType.External;
      const isExternal = entityType === GuildScheduledEventEntityType.External;
      const event = await guild.scheduledEvents.create({
        name:               resolve(config.name || 'Event', ctx),
        description:        config.description ? resolve(config.description, ctx) : undefined,
        scheduledStartTime: new Date(resolve(config.startTime || '', ctx)),
        scheduledEndTime:   config.endTime ? new Date(resolve(config.endTime, ctx)) : undefined,
        privacyLevel:       GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType,
        channel:        !isExternal ? resolve(config.channelId || '', ctx) : undefined,
        entityMetadata: isExternal  ? { location: resolve(config.location || 'TBD', ctx) } : undefined,
        image:          config.coverImage ? resolve(config.coverImage, ctx) : undefined,
        reason,
      });
      if (config.outputVar) ctx.variables[config.outputVar] = event.id;
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_eventError'] = err.message;
      return { nextHandle: 'error' };
    }
  }

  // ── editEvent ─────────────────────────────────────────────────────────────
  if (type === 'editEvent') {
    const eventId = resolve(config.eventId || '', ctx);
    const event = guild.scheduledEvents.cache.get(eventId) ?? await guild.scheduledEvents.fetch(eventId).catch(() => null);
    if (!event) return { nextHandle: 'output' };
    const editData = {};
    if (config.name)        editData.name               = resolve(config.name, ctx);
    if (config.description) editData.description        = resolve(config.description, ctx);
    if (config.startTime)   editData.scheduledStartTime = new Date(resolve(config.startTime, ctx));
    if (config.endTime)     editData.scheduledEndTime   = new Date(resolve(config.endTime, ctx));
    if (config.coverImage)  editData.image              = resolve(config.coverImage, ctx);
    await event.edit(editData);
    return { nextHandle: 'output' };
  }

  // ── deleteEvent ───────────────────────────────────────────────────────────
  if (type === 'deleteEvent') {
    const eventId = resolve(config.eventId || '', ctx);
    const event = guild.scheduledEvents.cache.get(eventId) ?? await guild.scheduledEvents.fetch(eventId).catch(() => null);
    if (event) await event.delete();
    return { nextHandle: 'output' };
  }

  // ── createGuildWebhook ────────────────────────────────────────────────────
  if (type === 'createGuildWebhook') {
    try {
      const channelId = resolve(config.channelId || '', ctx);
      const channel = guild.channels.cache.get(channelId) ?? await ctx.client.channels.fetch(channelId).catch(() => null);
      if (!channel) return { nextHandle: 'error' };
      const webhook = await channel.createWebhook({
        name:   resolve(config.name || 'Workflow Webhook', ctx),
        avatar: config.avatar ? resolve(config.avatar, ctx) : undefined,
        reason,
      });
      if (config.outputVar)   ctx.variables[config.outputVar]   = webhook.url;
      if (config.outputIdVar) ctx.variables[config.outputIdVar] = webhook.id;
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_webhookError'] = err.message;
      return { nextHandle: 'error' };
    }
  }

  // ── deleteGuildWebhook ────────────────────────────────────────────────────
  if (type === 'deleteGuildWebhook') {
    const webhookId = resolve(config.webhookId || '', ctx);
    try {
      const webhook = await ctx.client.fetchWebhook(webhookId).catch(() => null);
      if (webhook) await webhook.delete(reason);
      return { nextHandle: 'output' };
    } catch (err) {
      ctx.variables['_webhookError'] = err.message;
      return { nextHandle: 'output' };
    }
  }

  // ── fetchAuditLog ─────────────────────────────────────────────────────────
  if (type === 'fetchAuditLog') {
    try {
      const { AuditLogEvent } = await import('discord.js');
      const options = { limit: Math.min(parseInt(resolve(config.limit || '10', ctx)) || 10, 100) };
      if (config.userId) options.user = resolve(config.userId, ctx);
      if (config.action && AuditLogEvent[config.action] !== undefined) options.type = AuditLogEvent[config.action];
      const logs = await guild.fetchAuditLogs(options);
      const entries = [...logs.entries.values()].map(e => ({
        id:         e.id,
        action:     e.action,
        targetId:   e.targetId,
        executorId: e.executorId,
        reason:     e.reason,
        createdAt:  e.createdAt?.toISOString(),
      }));
      ctx.variables[config.outputVar || '_auditLogs'] = JSON.stringify(entries);
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_auditError'] = err.message;
      return { nextHandle: 'error' };
    }
  }

  // ── fetchMembers ──────────────────────────────────────────────────────────
  if (type === 'fetchMembers') {
    try {
      const options = {};
      if (config.query) options.query = resolve(config.query, ctx);
      if (config.limit) options.limit = Math.min(parseInt(resolve(config.limit, ctx)) || 100, 1000);
      const membersCollection = await guild.members.fetch(options);
      const list = [...membersCollection.values()].map(m => ({
        id:          m.id,
        username:    m.user.username,
        displayName: m.displayName,
        roles:       [...m.roles.cache.keys()],
        joinedAt:    m.joinedAt?.toISOString(),
      }));
      ctx.variables[config.outputVar || '_members'] = JSON.stringify(list);
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_membersError'] = err.message;
      return { nextHandle: 'error' };
    }
  }

  return null;
}
