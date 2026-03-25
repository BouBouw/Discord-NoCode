/**
 * Discord Message Components nodes:
 *   sendButtons, sendStringSelectMenu, sendUserSelectMenu,
 *   sendRoleSelectMenu, sendChannelSelectMenu,
 *   sendModal, awaitButtonClick, awaitSelectMenu
 *
 * Handler trigger nodes (buttonInteractionHandler, selectMenuInteractionHandler,
 * modalSubmitHandler) are registered by WorkflowHandler, not executed here.
 */

import {
  ActionRowBuilder,
  ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  ComponentType,
} from 'discord.js';
import { resolve, resolveChannel } from '../context.js';

// ─── Shared: route a component payload to the right Discord reply method ─────
async function sendComponent(config, ctx, payload) {
  const isCurrent = (config.channelSourceMode ?? 'current') === 'current';
  const interaction = ctx.interaction;

  if (isCurrent && interaction) {
    if (!interaction.replied && !interaction.deferred) {
      const msg = await interaction.reply({ ...payload, fetchReply: true });
      ctx.lastMessage = msg;
      return msg;
    }
    if (interaction.deferred && !interaction.replied) {
      return interaction.editReply(payload);
    }
    const channel = interaction.channel;
    if (channel) {
      const msg = await channel.send(payload);
      ctx.lastMessage = msg;
      return msg;
    }
  }

  const channel = await resolveChannel(config, ctx);
  if (!channel) { console.warn('[components] Channel not found'); return null; }
  const msg = await channel.send(payload);
  ctx.lastMessage = msg;
  return msg;
}

// ─── Button style map ──────────────────────────────────────────────────────────
const BTN_STYLE = {
  Primary:   ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success:   ButtonStyle.Success,
  Danger:    ButtonStyle.Danger,
  Link:      ButtonStyle.Link,
};

export async function executeAction(type, config, ctx) {

  // ── sendButtons ─────────────────────────────────────────────────────────────
  if (type === 'sendButtons') {
    const btnDefs = (config.buttons || []).slice(0, 5);
    if (!btnDefs.length) return { nextHandle: 'sent' };

    const buttons = btnDefs.map(b => {
      const btn = new ButtonBuilder()
        .setLabel(resolve(b.label || 'Button', ctx))
        .setStyle(BTN_STYLE[b.style] ?? ButtonStyle.Primary);

      if (b.style === 'Link') {
        btn.setURL(resolve(b.url || 'https://disflow.fr', ctx));
      } else {
        btn.setCustomId(resolve(b.customId || `btn_${Date.now()}`, ctx));
      }
      if (b.emoji) {
        try { btn.setEmoji(resolve(b.emoji, ctx)); } catch { /* ignore invalid emoji */ }
      }
      return btn;
    });

    const row = new ActionRowBuilder().addComponents(buttons);
    const content = resolve(config.content || '', ctx) || undefined;
    const payload = { components: [row], ...(content ? { content } : {}) };
    if (config.ephemeral) payload.flags = 64;

    const msg = await sendComponent(config, ctx, payload);
    if (config.outputVar && msg?.id) ctx.variables[config.outputVar] = msg.id;
    return { nextHandle: 'sent' };
  }

  // ── sendStringSelectMenu ────────────────────────────────────────────────────
  if (type === 'sendStringSelectMenu') {
    const opts = (config.options || []).slice(0, 25);
    if (!opts.length) return { nextHandle: 'sent' };

    const menu = new StringSelectMenuBuilder()
      .setCustomId(resolve(config.customId || `select_${Date.now()}`, ctx))
      .setPlaceholder(resolve(config.placeholder || 'Choisissez…', ctx))
      .setMinValues(Number(config.minValues) || 1)
      .setMaxValues(Math.min(Number(config.maxValues) || 1, opts.length))
      .addOptions(opts.map(o => {
        const opt = new StringSelectMenuOptionBuilder()
          .setLabel(resolve(o.label || 'Option', ctx))
          .setValue(resolve(o.value || `val_${Date.now()}`, ctx));
        if (o.description) opt.setDescription(resolve(o.description, ctx));
        if (o.emoji) { try { opt.setEmoji(resolve(o.emoji, ctx)); } catch { /* ignore */ } }
        if (o.default) opt.setDefault(true);
        return opt;
      }));

    const row = new ActionRowBuilder().addComponents(menu);
    const content = resolve(config.content || '', ctx) || undefined;
    const payload = { components: [row], ...(content ? { content } : {}) };
    if (config.ephemeral) payload.flags = 64;

    const msg = await sendComponent(config, ctx, payload);
    if (config.outputVar && msg?.id) ctx.variables[config.outputVar] = msg.id;
    return { nextHandle: 'sent' };
  }

  // ── sendUserSelectMenu ──────────────────────────────────────────────────────
  if (type === 'sendUserSelectMenu') {
    const menu = new UserSelectMenuBuilder()
      .setCustomId(resolve(config.customId || `usel_${Date.now()}`, ctx))
      .setPlaceholder(resolve(config.placeholder || 'Choisissez des utilisateurs…', ctx))
      .setMinValues(Number(config.minValues) || 1)
      .setMaxValues(Number(config.maxValues) || 1);

    const row = new ActionRowBuilder().addComponents(menu);
    const content = resolve(config.content || '', ctx) || undefined;
    const payload = { components: [row], ...(content ? { content } : {}) };
    if (config.ephemeral) payload.flags = 64;

    const msg = await sendComponent(config, ctx, payload);
    if (config.outputVar && msg?.id) ctx.variables[config.outputVar] = msg.id;
    return { nextHandle: 'sent' };
  }

  // ── sendRoleSelectMenu ──────────────────────────────────────────────────────
  if (type === 'sendRoleSelectMenu') {
    const menu = new RoleSelectMenuBuilder()
      .setCustomId(resolve(config.customId || `rsel_${Date.now()}`, ctx))
      .setPlaceholder(resolve(config.placeholder || 'Choisissez des rôles…', ctx))
      .setMinValues(Number(config.minValues) || 1)
      .setMaxValues(Number(config.maxValues) || 1);

    const row = new ActionRowBuilder().addComponents(menu);
    const content = resolve(config.content || '', ctx) || undefined;
    const payload = { components: [row], ...(content ? { content } : {}) };
    if (config.ephemeral) payload.flags = 64;

    const msg = await sendComponent(config, ctx, payload);
    if (config.outputVar && msg?.id) ctx.variables[config.outputVar] = msg.id;
    return { nextHandle: 'sent' };
  }

  // ── sendChannelSelectMenu ───────────────────────────────────────────────────
  if (type === 'sendChannelSelectMenu') {
    const menu = new ChannelSelectMenuBuilder()
      .setCustomId(resolve(config.customId || `csel_${Date.now()}`, ctx))
      .setPlaceholder(resolve(config.placeholder || 'Choisissez des salons…', ctx))
      .setMinValues(Number(config.minValues) || 1)
      .setMaxValues(Number(config.maxValues) || 1);

    if (config.channelTypes?.length) {
      // ChannelType values: Text=0, Voice=2, Category=4, Announcement=5, Thread(public)=11, Thread(private)=12, Stage=13, Forum=15
      const CT = { text: 0, voice: 2, category: 4, announcement: 5, forum: 15, stage: 13 };
      const types = config.channelTypes.map(t => CT[t] ?? Number(t)).filter(n => !isNaN(n));
      if (types.length) menu.setChannelTypes(types);
    }

    const row = new ActionRowBuilder().addComponents(menu);
    const content = resolve(config.content || '', ctx) || undefined;
    const payload = { components: [row], ...(content ? { content } : {}) };
    if (config.ephemeral) payload.flags = 64;

    const msg = await sendComponent(config, ctx, payload);
    if (config.outputVar && msg?.id) ctx.variables[config.outputVar] = msg.id;
    return { nextHandle: 'sent' };
  }

  // ── sendModal ───────────────────────────────────────────────────────────────
  if (type === 'sendModal') {
    const interaction = ctx.interaction;
    if (!interaction) throw new Error('sendModal: an interaction context is required (modals can only be shown in response to an interaction)');
    if (interaction.replied || interaction.deferred) throw new Error('sendModal: interaction has already been replied to');

    const customId = resolve(config.customId || `modal_${Date.now()}`, ctx);
    const title    = resolve(config.title || 'Formulaire', ctx).slice(0, 45);
    const fields   = (config.fields || []).slice(0, 5);

    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(title);

    const components = fields.map(f => {
      const input = new TextInputBuilder()
        .setCustomId(resolve(f.customId || `field_${Date.now()}`, ctx))
        .setLabel(resolve(f.label || 'Champ', ctx).slice(0, 45))
        .setStyle(f.style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(f.required !== false);

      if (f.placeholder) input.setPlaceholder(resolve(f.placeholder, ctx).slice(0, 100));
      if (f.minLength > 0) input.setMinLength(Math.min(Number(f.minLength), 4000));
      if (f.maxLength > 0) input.setMaxLength(Math.min(Number(f.maxLength), 4000));

      return new ActionRowBuilder().addComponents(input);
    });

    modal.addComponents(components);
    await interaction.showModal(modal);
    return { nextHandle: 'shown' };
  }

  // ── awaitButtonClick ────────────────────────────────────────────────────────
  if (type === 'awaitButtonClick') {
    const time         = Number(config.time) || 60_000;
    const filterCustomId = config.filterCustomId ? resolve(config.filterCustomId, ctx) : null;
    const filterUserId   = config.filterUserId   ? resolve(config.filterUserId,   ctx) : null;
    const messageId      = config.messageId      ? resolve(config.messageId,       ctx) : null;

    // Resolve the message to listen on
    let targetMsg = null;
    if (messageId) {
      const interaction = ctx.interaction;
      const channel = interaction?.channel ?? ctx.event?.[0]?.channel;
      if (channel) targetMsg = await channel.messages.fetch(messageId).catch(() => null);
    }
    if (!targetMsg && ctx.lastMessage) targetMsg = ctx.lastMessage;
    if (!targetMsg && ctx.interaction) {
      try { targetMsg = await ctx.interaction.fetchReply(); } catch { /* no reply yet */ }
    }

    const filter = i => {
      if (i.componentType !== ComponentType.Button) return false;
      if (filterCustomId) {
        const cid = i.customId;
        const matchType = config.filterMatchType || 'startsWith';
        if (matchType === 'exact' && cid !== filterCustomId) return false;
        if (matchType === 'startsWith' && !cid.startsWith(filterCustomId)) return false;
        if (matchType === 'contains' && !cid.includes(filterCustomId)) return false;
        if (matchType === 'regex') {
          try { if (!new RegExp(filterCustomId).test(cid)) return false; } catch { return false; }
        }
      }
      if (filterUserId && i.user.id !== filterUserId) return false;
      return true;
    };

    const source = targetMsg ?? ctx.interaction?.channel;
    if (!source) throw new Error('awaitButtonClick: no message or channel to attach collector to');

    const collector = source.createMessageComponentCollector({ filter, max: 1, time });

    return new Promise(res => {
      collector.on('collect', async i => {
        const prefix = config.outputVar || 'buttonClick';
        ctx.variables[`${prefix}.customId`]  = i.customId;
        ctx.variables[`${prefix}.userId`]    = i.user.id;
        ctx.variables[`${prefix}.messageId`] = i.message.id;
        ctx.interaction = i; // hand off context to the button interaction
        collector.stop('collected');
        res({ nextHandle: 'clicked' });
      });
      collector.on('end', (_, reason) => {
        if (reason !== 'collected') res({ nextHandle: 'timeout' });
      });
    });
  }

  // ── awaitSelectMenu ─────────────────────────────────────────────────────────
  if (type === 'awaitSelectMenu') {
    const time         = Number(config.time) || 60_000;
    const filterCustomId = config.filterCustomId ? resolve(config.filterCustomId, ctx) : null;
    const filterUserId   = config.filterUserId   ? resolve(config.filterUserId,   ctx) : null;

    const selectTypes = new Set([
      ComponentType.StringSelect,
      ComponentType.UserSelect,
      ComponentType.RoleSelect,
      ComponentType.ChannelSelect,
      ComponentType.MentionableSelect,
    ]);

    let targetMsg = null;
    if (ctx.lastMessage) targetMsg = ctx.lastMessage;
    if (!targetMsg && ctx.interaction) {
      try { targetMsg = await ctx.interaction.fetchReply(); } catch { /* */ }
    }

    const filter = i => {
      if (!selectTypes.has(i.componentType)) return false;
      if (filterCustomId && i.customId !== filterCustomId) return false;
      if (filterUserId && i.user.id !== filterUserId) return false;
      return true;
    };

    const source = targetMsg ?? ctx.interaction?.channel;
    if (!source) throw new Error('awaitSelectMenu: no message or channel to attach collector to');

    const collector = source.createMessageComponentCollector({ filter, max: 1, time });

    return new Promise(res => {
      collector.on('collect', async i => {
        const prefix = config.outputVar || 'selectResult';
        ctx.variables[`${prefix}.values`]    = JSON.stringify(i.values ?? []);
        ctx.variables[`${prefix}.customId`]  = i.customId;
        ctx.variables[`${prefix}.userId`]    = i.user.id;
        ctx.variables[`${prefix}.messageId`] = i.message.id;
        ctx.interaction = i;
        collector.stop('collected');
        res({ nextHandle: 'selected' });
      });
      collector.on('end', (_, reason) => {
        if (reason !== 'collected') res({ nextHandle: 'timeout' });
      });
    });
  }

  return null;
}
