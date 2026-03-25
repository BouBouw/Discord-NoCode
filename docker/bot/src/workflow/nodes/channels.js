import { ChannelType } from 'discord.js';
import { resolve } from '../context.js';

const CHANNEL_TYPE_MAP = {
  text:         ChannelType.GuildText,
  voice:        ChannelType.GuildVoice,
  category:     ChannelType.GuildCategory,
  forum:        ChannelType.GuildForum,
  announcement: ChannelType.GuildAnnouncement,
};

export async function executeAction(type, config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild ?? ctx.event?.[1]?.guild;
  if (!guild) { console.warn(`[${type}] No guild in context`); return { nextHandle: 'output' }; }

  // ── createChannel ──────────────────────────────────────────────────────────
  if (type === 'createChannel') {
    const name   = resolve(config.name || 'new-channel', ctx);
    const reason = config.reason ? resolve(config.reason, ctx) : undefined;
    await guild.channels.create({
      name,
      type:   CHANNEL_TYPE_MAP[config.channelType || 'text'] ?? ChannelType.GuildText,
      topic:  config.topic    ? resolve(config.topic,    ctx) : undefined,
      parent: config.parentId ? resolve(config.parentId, ctx) : undefined,
      nsfw:   !!config.nsfw,
      reason,
    });
    return { nextHandle: 'output' };
  }

  // ── deleteChannel ──────────────────────────────────────────────────────────
  if (type === 'deleteChannel') {
    const channelId = resolve(config.channelId || '', ctx);
    if (!channelId) return { nextHandle: 'output' };
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (channel) {
      const reason = config.reason ? resolve(config.reason, ctx) : undefined;
      await channel.delete(reason);
    }
    return { nextHandle: 'output' };
  }

  return null;
}
