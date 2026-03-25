import { EmbedBuilder } from 'discord.js';
import { resolve, resolveChannel } from '../context.js';

/**
 * Route a message payload to the right Discord API method based on context.
 *
 * - Slash command, not yet replied → interaction.reply()
 * - Slash command, deferred        → interaction.editReply()
 * - Slash command, already replied → interaction.followUp()
 * - Any other case (event / custom channel) → channel.send()
 */
async function send(config, ctx, payload) {
  const isCurrent = (config.channelSourceMode ?? 'current') === 'current';
  const interaction = ctx.interaction;

  if (isCurrent && interaction) {
    // ── First response to this interaction ──────────────────────────────────
    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply(payload);
    }
    // ── Deferred but not yet replied (e.g. deferReply was called) ───────────
    if (interaction.deferred && !interaction.replied) {
      return interaction.editReply(payload);
    }
    // ── Already replied: send a plain channel message (not a follow-up) ─────
    const channel = interaction.channel;
    if (channel) return channel.send(payload);
    return interaction.followUp(payload); // last-resort fallback
  }

  const channel = await resolveChannel(config, ctx);
  if (!channel) { console.warn('[messaging] Channel not found'); return; }
  return channel.send(payload);
}

export async function executeAction(type, config, ctx) {

  // ── sendMessage (unified: text + optional embed + optional image + optional file) ─────
  if (type === 'sendMessage') {
    const payload = {};

    // Text content
    const text = resolve(config.content || '', ctx);
    if (text) payload.content = text;
    if (config.tts) payload.tts = true;
    if (config.ephemeral) payload.flags = 64;

    // Embed
    if (config.includeEmbed) {
      const embed = new EmbedBuilder();
      if (config.title)        embed.setTitle(resolve(config.title, ctx));
      if (config.description)  embed.setDescription(resolve(config.description, ctx));
      if (config.color) {
        const hex = String(config.color).replace(/^#/, '');
        const colorInt = parseInt(hex, 16);
        if (!isNaN(colorInt) && colorInt >= 0 && colorInt <= 0xFFFFFF) embed.setColor(colorInt);
      }
      if (config.authorName)   embed.setAuthor({ name: resolve(config.authorName, ctx), iconURL: config.authorIconUrl ? resolve(config.authorIconUrl, ctx) : undefined });
      if (config.footerText)   embed.setFooter({ text: resolve(config.footerText, ctx) });
      if (config.imageUrl)     embed.setImage(resolve(config.imageUrl, ctx));
      if (config.thumbnailUrl) embed.setThumbnail(resolve(config.thumbnailUrl, ctx));
      if (config.fields?.length > 0) {
        embed.setFields(config.fields.map(f => ({
          name:   resolve(f.name  || '\u200b', ctx),
          value:  resolve(f.value || '\u200b', ctx),
          inline: !!f.inline,
        })));
      }
      payload.embeds = [embed];
    }

    // Image file attachment
    if (config.includeImage && config.imageUrl) {
      const url  = resolve(config.imageUrl, ctx);
      const name = config.imageSpoiler ? 'SPOILER_image.png' : 'image.png';
      payload.files = [...(payload.files ?? []), { attachment: url, name }];
      if (config.imageCaption) {
        const caption = resolve(config.imageCaption, ctx);
        payload.content = payload.content ? `${payload.content}\n${caption}` : caption;
      }
    }

    // File attachment
    if (config.includeFile && config.fileUrl) {
      const url  = resolve(config.fileUrl, ctx);
      const baseName = config.fileName || 'file';
      const name = config.fileSpoiler ? `SPOILER_${baseName}` : baseName;
      payload.files = [...(payload.files ?? []), {
        attachment:  url,
        name,
        description: config.fileDescription ? resolve(config.fileDescription, ctx) : undefined,
      }];
    }

    await send(config, ctx, payload);
    return { nextHandle: 'output' };
  }

  // ── editMessage ────────────────────────────────────────────────────────────
  if (type === 'editMessage') {
    const channel = await resolveChannel(config, ctx);
    if (!channel) return { nextHandle: 'output' };
    const msgId = resolve(config.messageId || '', ctx);
    if (!msgId) return { nextHandle: 'output' };
    const msg = await channel.messages.fetch(msgId).catch(() => null);
    if (msg) await msg.edit({ content: resolve(config.newContent || '', ctx) });
    return { nextHandle: 'output' };
  }

  // ── deleteMessage ──────────────────────────────────────────────────────────
  if (type === 'deleteMessage') {
    const channel = await resolveChannel(config, ctx);
    if (!channel) return { nextHandle: 'output' };
    const msgId = resolve(config.messageId || '', ctx);
    if (!msgId) return { nextHandle: 'output' };
    const msg = await channel.messages.fetch(msgId).catch(() => null);
    if (msg) await msg.delete().catch(() => {});
    return { nextHandle: 'output' };
  }

  // ── replyToMessage ─────────────────────────────────────────────────────────
  if (type === 'replyToMessage') {
    const content     = resolve(config.content || '', ctx);
    const interaction = ctx.interaction;
    const message     = ctx.event?.[0];

    if (interaction) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content });
      } else {
        await interaction.reply({ content, tts: !!config.tts });
      }
    } else if (message?.reply) {
      await message.reply({
        content,
        allowedMentions: { repliedUser: config.mentionAuthor !== false },
      });
    }
    return { nextHandle: 'output' };
  }

  return null;
}
