import { EmbedBuilder } from 'discord.js';
import { resolve, resolveChannel } from '../context.js';

/**
 * Phase 1 — Beginner-essential nodes:
 *   welcomeMessage, goodbyeMessage, autoRole, logAction, embedBuilder
 */
export async function executeAction(type, config, ctx) {
  switch (type) {
    case 'welcomeMessage': return welcomeMessage(config, ctx);
    case 'goodbyeMessage': return goodbyeMessage(config, ctx);
    case 'autoRole':       return autoRole(config, ctx);
    case 'logAction':      return logAction(config, ctx);
    case 'embedBuilder':   return embedBuilder(config, ctx);
    default: return null;
  }
}

// ─── Welcome Message ─────────────────────────────────────────────────────────

async function welcomeMessage(config, ctx) {
  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const member  = ctx.event?.[0]; // guildMemberAdd passes the member

  if (!guild) throw new Error('welcomeMessage: no guild in context');

  const channelId = resolve(config.channelId || '', ctx);
  const channel   = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : ctx.interaction?.channel ?? ctx.event?.[0]?.guild?.systemChannel;

  if (!channel?.send) throw new Error('welcomeMessage: target channel not found');

  const text = resolve(config.message || 'Welcome {user}!', ctx)
    .replace(/\{user\}/g,      member ? `<@${member.id}>` : '')
    .replace(/\{username\}/g,  member?.user?.username ?? '')
    .replace(/\{server\}/g,    guild.name)
    .replace(/\{memberCount\}/g, String(guild.memberCount));

  const payload = {};

  if (config.useEmbed) {
    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor(parseInt((config.color || '#22c55e').replace('#', ''), 16))
      .setTimestamp();
    if (config.title) embed.setTitle(resolve(config.title, ctx));
    if (config.thumbnail === 'avatar' && member?.user) {
      embed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
    }
    payload.embeds = [embed];
  } else {
    payload.content = text;
  }

  await channel.send(payload);
  ctx.variables['welcome.channelId'] = channel.id;
  ctx.variables['welcome.memberId']  = member?.id ?? '';
  return { nextHandle: 'output' };
}

// ─── Goodbye Message ─────────────────────────────────────────────────────────

async function goodbyeMessage(config, ctx) {
  const guild  = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const member = ctx.event?.[0]; // guildMemberRemove passes the member

  if (!guild) throw new Error('goodbyeMessage: no guild in context');

  const channelId = resolve(config.channelId || '', ctx);
  const channel   = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : ctx.interaction?.channel ?? guild.systemChannel;

  if (!channel?.send) throw new Error('goodbyeMessage: target channel not found');

  const text = resolve(config.message || 'Goodbye {username}!', ctx)
    .replace(/\{user\}/g,      member ? `<@${member.id}>` : '')
    .replace(/\{username\}/g,  member?.user?.username ?? '')
    .replace(/\{server\}/g,    guild.name)
    .replace(/\{memberCount\}/g, String(guild.memberCount));

  const payload = {};

  if (config.useEmbed) {
    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor(parseInt((config.color || '#ef4444').replace('#', ''), 16))
      .setTimestamp();
    if (config.title) embed.setTitle(resolve(config.title, ctx));
    if (config.thumbnail === 'avatar' && member?.user) {
      embed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
    }
    payload.embeds = [embed];
  } else {
    payload.content = text;
  }

  await channel.send(payload);
  ctx.variables['goodbye.channelId'] = channel.id;
  ctx.variables['goodbye.memberId']  = member?.id ?? '';
  return { nextHandle: 'output' };
}

// ─── Auto Role ───────────────────────────────────────────────────────────────

async function autoRole(config, ctx) {
  const guild  = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const member = ctx.event?.[0]; // guildMemberAdd

  if (!guild) throw new Error('autoRole: no guild in context');
  if (!member?.roles) throw new Error('autoRole: no member in context');

  const roleIds = (config.roleIds || '')
    .split(',')
    .map(r => resolve(r.trim(), ctx))
    .filter(Boolean);

  if (roleIds.length === 0) throw new Error('autoRole: no roles configured');

  for (const roleId of roleIds) {
    await member.roles.add(roleId).catch(err => {
      console.warn(`[autoRole] Could not add role ${roleId}:`, err.message);
    });
  }

  ctx.variables['autoRole.addedCount'] = String(roleIds.length);
  ctx.variables['autoRole.memberId']   = member.id;
  return { nextHandle: 'output' };
}

// ─── Log Action ──────────────────────────────────────────────────────────────

async function logAction(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  if (!guild) throw new Error('logAction: no guild in context');

  const channelId = resolve(config.channelId || '', ctx);
  if (!channelId) throw new Error('logAction: no channelId configured');

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.send) throw new Error('logAction: log channel not found');

  const title       = resolve(config.title       || 'Log', ctx);
  const description = resolve(config.description || '',    ctx);
  const color       = parseInt((config.color || '#6366f1').replace('#', ''), 16);
  const footer      = resolve(config.footer || '', ctx);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp();

  if (description) embed.setDescription(description);
  if (footer) embed.setFooter({ text: footer });

  // Optional fields
  if (Array.isArray(config.fields)) {
    for (const f of config.fields) {
      embed.addFields({
        name:   resolve(f.name  || 'Field', ctx),
        value:  resolve(f.value || '-', ctx),
        inline: !!f.inline,
      });
    }
  }

  await channel.send({ embeds: [embed] });
  ctx.variables['log.channelId'] = channel.id;
  return { nextHandle: 'output' };
}

// ─── Embed Builder ───────────────────────────────────────────────────────────

async function embedBuilder(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;

  const embed = new EmbedBuilder();

  if (config.title)       embed.setTitle(resolve(config.title, ctx));
  if (config.description) embed.setDescription(resolve(config.description, ctx));
  if (config.url)         embed.setURL(resolve(config.url, ctx));
  if (config.color)       embed.setColor(parseInt(config.color.replace('#', ''), 16));
  if (config.thumbnail)   embed.setThumbnail(resolve(config.thumbnail, ctx));
  if (config.image)       embed.setImage(resolve(config.image, ctx));
  if (config.timestamp)   embed.setTimestamp();

  if (config.author?.name) {
    embed.setAuthor({
      name:    resolve(config.author.name, ctx),
      iconURL: config.author.iconURL ? resolve(config.author.iconURL, ctx) : undefined,
      url:     config.author.url     ? resolve(config.author.url, ctx)     : undefined,
    });
  }

  if (config.footer?.text) {
    embed.setFooter({
      text:    resolve(config.footer.text, ctx),
      iconURL: config.footer.iconURL ? resolve(config.footer.iconURL, ctx) : undefined,
    });
  }

  if (Array.isArray(config.fields)) {
    for (const f of config.fields) {
      embed.addFields({
        name:   resolve(f.name  || 'Field', ctx),
        value:  resolve(f.value || '-', ctx),
        inline: !!f.inline,
      });
    }
  }

  const payload = { embeds: [embed] };
  if (config.content) payload.content = resolve(config.content, ctx);

  // Send
  const channelId = resolve(config.channelId || '', ctx);
  if (channelId && guild) {
    const ch = await guild.channels.fetch(channelId).catch(() => null);
    if (!ch?.send) throw new Error('embedBuilder: channel not found');
    const msg = await ch.send(payload);
    ctx.variables['embed.messageId'] = msg.id;
  } else if (ctx.interaction) {
    if (!ctx.interaction.replied && !ctx.interaction.deferred) {
      await ctx.interaction.reply(payload);
    } else if (ctx.interaction.deferred && !ctx.interaction.replied) {
      await ctx.interaction.editReply(payload);
    } else {
      const ch = ctx.interaction.channel;
      if (ch) {
        const msg = await ch.send(payload);
        ctx.variables['embed.messageId'] = msg.id;
      }
    }
  } else {
    throw new Error('embedBuilder: no channel or interaction available');
  }

  return { nextHandle: 'output' };
}
