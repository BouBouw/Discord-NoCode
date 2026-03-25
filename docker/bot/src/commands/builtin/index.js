/**
 * Built-in slash commands — always registered regardless of workflow content.
 *
 * /ping    — Pong! :ping_pong:
 * /speed   — API latency, discord.js version, DB latency
 * /powered — Powered by Disflow credit embed
 * /help    — paginated embed of all registered workflow commands (10/page)
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, version as djsVersion } from 'discord.js';

// ─── Command definitions (passed to application.commands.set) ────────────────
export const BUILTIN_COMMAND_DEFS = [
  {
    name:        'ping',
    description: 'Vérifie si le bot répond correctement',
  },
  {
    name:        'speed',
    description: 'Affiche les latences du bot (API, Discord.js, base de données)',
  },
  {
    name:        'powered',
    description: 'Crédits et informations sur la plateforme Disflow',
  },
  {
    name:        'help',
    description: 'Liste toutes les commandes enregistrées dans ce workflow',
    options: [
      {
        name:        'page',
        description: 'Numéro de page à afficher',
        type:        4, // INTEGER
        required:    false,
        min_value:   1,
      },
    ],
  },
];

// ─── Names for fast look-up ───────────────────────────────────────────────────
const BUILTIN_NAMES = new Set(BUILTIN_COMMAND_DEFS.map(c => c.name));
export function isBuiltin(name) { return BUILTIN_NAMES.has(name); }

// ─── Main dispatcher ─────────────────────────────────────────────────────────
/**
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').Client}      client
 * @param {object}                           db        mysql2 connection
 * @param {object[]}                         cmdNodes  workflow commandHandlerSuite nodes
 */
export async function handleBuiltinCommand(interaction, client, db, cmdNodes = []) {
  const name = interaction.commandName;

  // ── /ping ──────────────────────────────────────────────────────────────────
  if (name === 'ping') {
    return interaction.reply({ content: 'Pong! :ping_pong:' });
  }

  // ── /powered ───────────────────────────────────────────────────────────────
  if (name === 'powered') {
    const embed = new EmbedBuilder()
      .setTitle('⚡ Powered by Disflow')
      .setDescription(
        'Ce bot est propulsé par **[Disflow](https://disflow.fr)** — la plateforme no-code pour créer des bots Discord sans écrire de code.\n\n' +
        '> Créez, configurez et déployez vos workflows Discord en quelques clics.'
      )
      .setColor(0xe8643a)
      .setThumbnail('https://disflow.fr/logo.png')
      .setFooter({ text: 'Disflow — disflow.fr' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ── /speed ─────────────────────────────────────────────────────────────────
  if (name === 'speed') {
    const apiLatency = Math.round(client.ws.ping);
    const start      = Date.now();

    // Measure DB latency
    let dbLatency = -1;
    try {
      await new Promise((resolve_, reject) => {
        db.query('SELECT 1', err => err ? reject(err) : resolve_());
      });
      dbLatency = Date.now() - start;
    } catch { /* db unavailable */ }

    const botLatency = Date.now() - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Latences du bot')
      .setColor(0x5865f2)
      .addFields(
        { name: '📡 Réponse API (bot → Discord)',  value: `\`${botLatency} ms\``,                         inline: true },
        { name: '💓 Heartbeat WebSocket',           value: `\`${apiLatency >= 0 ? apiLatency : '–'} ms\``, inline: true },
        { name: '🗄️  Base de données',              value: dbLatency >= 0 ? `\`${dbLatency} ms\`` : '`N/A`', inline: true },
        { name: '📦 Discord.js',                    value: `\`v${djsVersion}\``,                           inline: true },
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ── /help ──────────────────────────────────────────────────────────────────
  if (name === 'help') {
    const PAGE_SIZE = 10;

    // Build list from workflow command nodes
    const cmds = cmdNodes.map(n => ({
      name:        n.config?.commandName?.toLowerCase().replace(/\s+/g, '_') ?? '?',
      description: n.config?.description || '—',
    }));

    // Always include the 4 built-ins at the end
    for (const def of BUILTIN_COMMAND_DEFS) {
      cmds.push({ name: def.name, description: def.description });
    }

    if (!cmds.length) {
      return interaction.reply({ content: '📭 Aucune commande enregistrée pour ce bot.', ephemeral: true });
    }

    const totalPages = Math.ceil(cmds.length / PAGE_SIZE);
    const requestedPage = interaction.options?.getInteger('page') ?? 1;
    let page = Math.max(1, Math.min(requestedPage, totalPages));

    const buildEmbed = (p) => {
      const slice = cmds.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
      const desc  = slice.map(c => `\`/${c.name}\` — ${c.description}`).join('\n');
      return new EmbedBuilder()
        .setTitle('📋 Commandes disponibles')
        .setDescription(desc)
        .setColor(0x5865f2)
        .setFooter({ text: `Page ${p}/${totalPages} · ${cmds.length} commande(s) au total` })
        .setTimestamp();
    };

    const buildRow = (p) => {
      if (totalPages <= 1) return null;
      const prev = new ButtonBuilder()
        .setCustomId(`__help_prev_${p}`)
        .setLabel('◀ Précédente')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(p <= 1);
      const next = new ButtonBuilder()
        .setCustomId(`__help_next_${p}`)
        .setLabel('Suivante ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(p >= totalPages);
      return new ActionRowBuilder().addComponents(prev, next);
    };

    const row = buildRow(page);
    const components = row ? [row] : [];
    await interaction.reply({ embeds: [buildEmbed(page)], components, ephemeral: false });

    // Pagination collector (3 minutes)
    if (totalPages > 1) {
      const reply  = await interaction.fetchReply();
      const collector = reply.createMessageComponentCollector({
        filter:  i => i.user.id === interaction.user.id && (i.customId.startsWith('__help_prev_') || i.customId.startsWith('__help_next_')),
        time:    3 * 60 * 1000,
      });

      collector.on('collect', async i => {
        page = i.customId.startsWith('__help_prev_') ? page - 1 : page + 1;
        page = Math.max(1, Math.min(page, totalPages));
        const newRow = buildRow(page);
        await i.update({ embeds: [buildEmbed(page)], components: newRow ? [newRow] : [] });
      });

      collector.on('end', async () => {
        // Disable buttons when expired
        const disabledRow = buildRow(page);
        if (disabledRow) {
          disabledRow.components.forEach(b => b.setDisabled(true));
          interaction.editReply({ components: [disabledRow] }).catch(() => {});
        }
      });
    }

    return;
  }
}
