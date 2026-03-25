import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { resolve } from '../context.js';

/**
 * Phase 1 — Ticket system nodes:
 *   ticketPanel, ticketClose
 */
export async function executeAction(type, config, ctx) {
  switch (type) {
    case 'ticketPanel': return ticketPanel(config, ctx);
    case 'ticketClose': return ticketClose(config, ctx);
    default: return null;
  }
}

// ─── Ticket Panel ────────────────────────────────────────────────────────────

async function ticketPanel(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  if (!guild) throw new Error('ticketPanel: no guild in context');

  const channelId = resolve(config.channelId || '', ctx);
  const channel   = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : ctx.interaction?.channel;

  if (!channel?.send) throw new Error('ticketPanel: target channel not found');

  const title       = resolve(config.title       || '🎫 Support Tickets', ctx);
  const description = resolve(config.description || 'Click the button below to open a ticket.', ctx);
  const buttonLabel = resolve(config.buttonLabel  || '📩 Open Ticket', ctx);
  const color       = parseInt((config.color || '#5865f2').replace('#', ''), 16);
  const categoryId  = resolve(config.categoryId || '', ctx);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  const customId = `ticket_open_${Date.now()}`;
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(buttonLabel)
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);
  const msg = await channel.send({ embeds: [embed], components: [row] });

  // Store the customId so a buttonInteractionHandler can match it
  ctx.variables['ticket.panelCustomId']  = customId;
  ctx.variables['ticket.panelMessageId'] = msg.id;
  ctx.variables['ticket.categoryId']     = categoryId;

  // Register a collector for this button
  const staffRoleId = resolve(config.staffRoleId || '', ctx);

  const collector = channel.createMessageComponentCollector({ filter: i => i.customId === customId });
  collector.on('collect', async interaction => {
    try {
      const existingTicket = guild.channels.cache.find(
        ch => ch.name === `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && ch.parentId === (categoryId || undefined)
      );
      if (existingTicket) {
        return interaction.reply({ content: `❌ You already have an open ticket: <#${existingTicket.id}>`, ephemeral: true });
      }

      const permissionOverwrites = [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ];
      if (staffRoleId) {
        permissionOverwrites.push({
          id: staffRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      const ticketChannel = await guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        type: ChannelType.GuildText,
        parent: categoryId || undefined,
        permissionOverwrites,
      });

      const closeBtn = new ButtonBuilder()
        .setCustomId(`ticket_close_${ticketChannel.id}`)
        .setLabel('🔒 Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🎫 Ticket Opened')
        .setDescription(resolve(config.welcomeMessage || 'Support will be with you shortly.\nClick 🔒 to close this ticket.', ctx))
        .setColor(0x22c55e)
        .setTimestamp();

      await ticketChannel.send({
        content: `<@${interaction.user.id}>` + (staffRoleId ? ` <@&${staffRoleId}>` : ''),
        embeds: [welcomeEmbed],
        components: [new ActionRowBuilder().addComponents(closeBtn)],
      });

      await interaction.reply({ content: `✅ Your ticket has been created: <#${ticketChannel.id}>`, ephemeral: true });
    } catch (err) {
      console.error('[ticketPanel] Error creating ticket:', err);
      if (!interaction.replied) {
        interaction.reply({ content: '❌ Failed to create ticket.', ephemeral: true }).catch(() => {});
      }
    }
  });

  return { nextHandle: 'output' };
}

// ─── Ticket Close ────────────────────────────────────────────────────────────

async function ticketClose(config, ctx) {
  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const channel = ctx.interaction?.channel;

  if (!guild || !channel) throw new Error('ticketClose: no guild/channel');

  // Save transcript if configured
  if (config.saveTranscript) {
    const logChannelId = resolve(config.transcriptChannelId || '', ctx);
    if (logChannelId) {
      const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.send) {
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcript = messages
          .reverse()
          .map(m => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`)
          .join('\n');

        const embed = new EmbedBuilder()
          .setTitle(`📄 Transcript: #${channel.name}`)
          .setDescription(transcript.substring(0, 4000) || 'Empty ticket')
          .setColor(0x6366f1)
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }
  }

  // Notify then delete after delay
  const deleteDelay = Math.min(Number(config.deleteDelay) || 5, 60) * 1000;

  if (ctx.interaction && !ctx.interaction.replied) {
    await ctx.interaction.reply({ content: `🔒 Ticket will be closed in ${deleteDelay / 1000}s…` });
  }

  setTimeout(() => {
    channel.delete().catch(err => console.error('[ticketClose] Delete error:', err));
  }, deleteDelay);

  ctx.variables['ticket.closedChannel'] = channel.name;
  return { nextHandle: 'output' };
}
