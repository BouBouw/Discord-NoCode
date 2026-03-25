import { EmbedBuilder } from 'discord.js';
import { resolve } from '../context.js';

/**
 * Phase 1 — Reaction Role node:
 *   reactionRole
 */
export async function executeAction(type, config, ctx) {
  if (type !== 'reactionRole') return null;
  return reactionRole(config, ctx);
}

// ─── Reaction Role ───────────────────────────────────────────────────────────

async function reactionRole(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  if (!guild) throw new Error('reactionRole: no guild in context');

  const channelId = resolve(config.channelId || '', ctx);
  const channel   = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : ctx.interaction?.channel;

  if (!channel?.send) throw new Error('reactionRole: target channel not found');

  // mappings = [{ emoji: '🔴', roleId: '12345' }, ...]
  const mappings = config.mappings || [];
  if (mappings.length === 0) throw new Error('reactionRole: no emoji→role mappings configured');

  // Build the embed showing available roles
  const title       = resolve(config.title       || '🎭 Reaction Roles', ctx);
  const description = resolve(config.description || '', ctx) ||
    mappings.map(m => `${m.emoji} → <@&${resolve(m.roleId, ctx)}>`).join('\n');

  const color = parseInt((config.color || '#5865f2').replace('#', ''), 16);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

  const msg = await channel.send({ embeds: [embed] });

  // Add reactions
  for (const m of mappings) {
    await msg.react(m.emoji).catch(() => {});
  }

  // Build a lookup map emoji→roleId
  const emojiToRole = {};
  for (const m of mappings) {
    emojiToRole[m.emoji] = resolve(m.roleId, ctx);
  }

  // Set up reaction collectors
  const client = ctx.client;

  const handleReaction = async (reaction, user, add) => {
    if (user.bot) return;
    if (reaction.message.id !== msg.id) return;

    const emoji  = reaction.emoji.name;
    const roleId = emojiToRole[emoji];
    if (!roleId) return;

    try {
      const member = await guild.members.fetch(user.id);
      if (add) {
        await member.roles.add(roleId);
      } else {
        await member.roles.remove(roleId);
      }
    } catch (err) {
      console.warn(`[reactionRole] Failed to ${add ? 'add' : 'remove'} role ${roleId}:`, err.message);
    }
  };

  client.on('messageReactionAdd',    (reaction, user) => handleReaction(reaction, user, true));
  client.on('messageReactionRemove', (reaction, user) => handleReaction(reaction, user, false));

  ctx.variables['reactionRole.messageId'] = msg.id;
  ctx.variables['reactionRole.channelId'] = channel.id;
  return { nextHandle: 'output' };
}
