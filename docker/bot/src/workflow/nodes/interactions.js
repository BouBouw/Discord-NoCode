import { resolve, resolveChannel } from '../context.js';

export async function executeAction(type, config, ctx) {
  const guild = ctx.guild ?? ctx.message?.guild ?? ctx.interaction?.guild;

  // ── Send DM ────────────────────────────────────────────────────────────────
  if (type === 'sendDM') {
    const userId = resolve(config.userId || '', ctx);
    const content = resolve(config.content || '', ctx);
    if (!userId) throw new Error('sendDM: userId required');
    const user = await ctx.client.users.fetch(userId);
    await user.send(content);
    return { nextHandle: 'output' };
  }

  // ── Add Reaction ───────────────────────────────────────────────────────────
  if (type === 'addReaction') {
    const channel = await resolveChannel(config, ctx);
    if (!channel) throw new Error('addReaction: channel not found');
    const msgId = resolve(config.messageId || '', ctx);
    const msg = await channel.messages.fetch(msgId);
    await msg.react(resolve(config.emoji || '👍', ctx));
    return { nextHandle: 'output' };
  }

  // ── Pin / Unpin ────────────────────────────────────────────────────────────
  if (type === 'pinMessage' || type === 'unpinMessage') {
    const channel = await resolveChannel(config, ctx);
    if (!channel) throw new Error(`${type}: channel not found`);
    const msg = await channel.messages.fetch(resolve(config.messageId || '', ctx));
    if (type === 'pinMessage') await msg.pin();
    else await msg.unpin();
    return { nextHandle: 'output' };
  }

  // ── Create Thread ──────────────────────────────────────────────────────────
  if (type === 'createThread') {
    const channel = await resolveChannel(config, ctx);
    if (!channel) throw new Error('createThread: channel not found');
    const name = resolve(config.threadName || 'Thread', ctx);
    const autoArchiveDuration = Number(config.autoArchiveDuration) || 1440;
    const invitable = !config.privateThread;
    if (config.threadSource === 'message') {
      const msg = await channel.messages.fetch(resolve(config.messageId || '', ctx));
      await msg.startThread({ name, autoArchiveDuration });
    } else {
      await channel.threads.create({
        name, autoArchiveDuration,
        type: config.privateThread ? 12 : 11, // PrivateThread : PublicThread
        invitable: invitable,
      });
    }
    return { nextHandle: 'output' };
  }

  // ── Archive Thread ─────────────────────────────────────────────────────────
  if (type === 'archiveThread') {
    const threadId = resolve(config.threadId || '', ctx);
    const thread = await ctx.client.channels.fetch(threadId);
    if (!thread?.isThread()) throw new Error('archiveThread: not a thread channel');
    await thread.setArchived(true);
    if (config.locked) await thread.setLocked(true);
    return { nextHandle: 'output' };
  }

  // ── Edit Channel ───────────────────────────────────────────────────────────
  if (type === 'editChannel') {
    const channelId = resolve(config.channelId || '', ctx);
    const channel = await ctx.client.channels.fetch(channelId);
    if (!channel) throw new Error('editChannel: channel not found');
    const patch = {};
    if (config.newName)  patch.name      = resolve(config.newName, ctx).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (config.newTopic) patch.topic     = resolve(config.newTopic, ctx);
    if (config.slowmode !== undefined) patch.rateLimitPerUser = Number(config.slowmode);
    await channel.edit(patch);
    return { nextHandle: 'output' };
  }

  // ── Create Invite ──────────────────────────────────────────────────────────
  if (type === 'createInvite') {
    const channel = await resolveChannel(config, ctx);
    if (!channel) throw new Error('createInvite: channel not found');
    const invite = await channel.createInvite({
      maxAge:   Number(config.maxAge)  || 86400,
      maxUses:  Number(config.maxUses) || 0,
      unique:   !!config.unique,
    });
    if (config.outputVar) ctx.variables[config.outputVar] = invite.url;
    return { nextHandle: 'output' };
  }

  // ── Server Mute ────────────────────────────────────────────────────────────
  if (type === 'serverMuteMember') {
    const userId = resolve(config.userId || '', ctx);
    if (!guild) throw new Error('serverMuteMember: guild not available');
    const member = await guild.members.fetch(userId);
    await member.voice.setMute(config.enable !== false);
    return { nextHandle: 'output' };
  }

  // ── Server Deafen ──────────────────────────────────────────────────────────
  if (type === 'serverDeafenMember') {
    const userId = resolve(config.userId || '', ctx);
    if (!guild) throw new Error('serverDeafenMember: guild not available');
    const member = await guild.members.fetch(userId);
    await member.voice.setDeaf(config.enable !== false);
    return { nextHandle: 'output' };
  }

  // ── Fetch User Info ────────────────────────────────────────────────────────
  if (type === 'fetchUserInfo') {
    const userId = resolve(config.userId || '', ctx);
    const prefix = config.outputVar || 'fetchedUser';
    const user = await ctx.client.users.fetch(userId);
    ctx.variables[`${prefix}.id`]            = user.id;
    ctx.variables[`${prefix}.username`]      = user.username;
    ctx.variables[`${prefix}.discriminator`] = user.discriminator;
    ctx.variables[`${prefix}.tag`]           = user.tag;
    ctx.variables[`${prefix}.avatar`]        = user.displayAvatarURL({ size: 256 });
    ctx.variables[`${prefix}.bot`]           = user.bot;
    ctx.variables[`${prefix}.createdAt`]     = user.createdAt.toISOString();

    if (config.fetchMember !== false && guild) {
      try {
        const member = await guild.members.fetch(userId);
        ctx.variables[`${prefix}.nickname`]  = member.nickname ?? user.username;
        ctx.variables[`${prefix}.joinedAt`]  = member.joinedAt?.toISOString() ?? '';
        ctx.variables[`${prefix}.roles`]     = member.roles.cache.map(r => r.name).join(', ');
      } catch { /* user not in guild */ }
    }
    return { nextHandle: 'success' };
  }

  return null;
}
