// ─── Template types ──────────────────────────────────────────────────────────

export interface TemplateNode {
  type: string;
  position: { x: number; y: number };
  config?: Record<string, any>;
}

export interface TemplateEdge {
  fromIdx: number;
  toIdx: number;
  fromHandle?: string; // default: 'output'
  toHandle?: string;   // default: 'input'
}

export type TemplateCategory = 'modération' | 'utilisateur' | 'serveur' | 'utilitaire';

export interface WorkflowTemplate {
  id: string;
  name: string;
  desc: string;
  category: TemplateCategory;
  emoji: string;
  preview: string[]; // up to 4 node type keys for the badge row
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

// ─── Helper for standard 3-node chain: handler → action → reply ──────────────
function cmd3(
  commandName: string,
  description: string,
  parameters: object[],
  actionType: string,
  actionConfig: Record<string, any>,
  replyContent: string,
  discordPermissions: string[] = [],
): Pick<WorkflowTemplate, 'nodes' | 'edges' | 'preview'> {
  return {
    preview: ['commandHandlerSuite', actionType, 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName,
          description,
          parameters,
          permissionType: 'discord',
          discordPermissions,
          customRoles: [],
        },
      },
      {
        type: actionType,
        position: { x: 240, y: 0 },
        config: actionConfig,
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: 0 },
        config: { content: replyContent, channelType: 'interaction' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'output', toHandle: 'input' },
    ],
  };
}

// ─── Templates library ────────────────────────────────────────────────────────

export const TEMPLATES: WorkflowTemplate[] = [

  // ── Modération ──────────────────────────────────────────────────────────────

  {
    id: 'mod-ban',
    name: '/ban — Bannir un membre',
    desc: 'Commande slash qui bannit un membre avec une raison optionnelle, puis confirme dans le salon.',
    category: 'modération',
    emoji: '🔨',
    ...cmd3(
      'ban',
      'Bannit un membre du serveur',
      [
        { name: 'user',   type: 'user',   required: true,  description: 'Membre à bannir' },
        { name: 'reason', type: 'string', required: false, description: 'Raison du ban' },
      ],
      'ban',
      { targetUser: '{{options.user}}', reason: '{{options.reason}}' },
      '🔨 **{{options.user}}** a été banni.\nRaison : {{options.reason || "Aucune raison fournie"}}',
      ['BanMembers'],
    ),
  },

  {
    id: 'mod-kick',
    name: '/kick — Expulser un membre',
    desc: 'Expulse un membre du serveur. Le membre peut revenir via invitation.',
    category: 'modération',
    emoji: '👢',
    ...cmd3(
      'kick',
      'Expulse un membre du serveur',
      [
        { name: 'user',   type: 'user',   required: true,  description: 'Membre à expulser' },
        { name: 'reason', type: 'string', required: false, description: 'Raison' },
      ],
      'kick',
      { targetUser: '{{options.user}}', reason: '{{options.reason}}' },
      '👢 **{{options.user}}** a été expulsé du serveur.',
      ['KickMembers'],
    ),
  },

  {
    id: 'mod-timeout',
    name: '/timeout — Mettre en sourdine',
    desc: 'Met un membre en timeout pour une durée définie (en minutes).',
    category: 'modération',
    emoji: '🔇',
    ...cmd3(
      'timeout',
      'Met un membre en timeout',
      [
        { name: 'user',     type: 'user',    required: true,  description: 'Membre à muter' },
        { name: 'duration', type: 'integer', required: true,  description: 'Durée en minutes' },
        { name: 'reason',   type: 'string',  required: false, description: 'Raison' },
      ],
      'timeout',
      { targetUser: '{{options.user}}', duration: '{{options.duration}}', reason: '{{options.reason}}' },
      '🔇 **{{options.user}}** a été mis en timeout pour **{{options.duration}} min**.',
      ['ModerateMembers'],
    ),
  },

  {
    id: 'mod-unmute',
    name: '/unmute — Retirer le timeout',
    desc: 'Retire le timeout d\'un membre avant la fin de la durée.',
    category: 'modération',
    emoji: '🔊',
    ...cmd3(
      'unmute',
      'Retire le timeout d\'un membre',
      [{ name: 'user', type: 'user', required: true, description: 'Membre à démuter' }],
      'unmute',
      { targetUser: '{{options.user}}' },
      '🔊 Le timeout de **{{options.user}}** a été retiré.',
      ['ModerateMembers'],
    ),
  },

  {
    id: 'mod-warn',
    name: '/warn — Avertir en MP',
    desc: 'Envoie un avertissement en message privé au membre, puis confirme dans le salon.',
    category: 'modération',
    emoji: '⚠️',
    preview: ['commandHandlerSuite', 'sendDM', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName: 'warn',
          description: 'Avertit un membre via MP',
          parameters: [
            { name: 'user',   type: 'user',   required: true,  description: 'Membre à avertir' },
            { name: 'reason', type: 'string', required: true,  description: 'Raison de l\'avertissement' },
          ],
          permissionType: 'discord',
          discordPermissions: ['KickMembers'],
          customRoles: [],
        },
      },
      {
        type: 'sendDM',
        position: { x: 240, y: 0 },
        config: { targetUser: '{{options.user}}', content: '⚠️ Vous avez reçu un avertissement sur **{{guild.name}}** :\n> {{options.reason}}' },
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: 0 },
        config: { content: '⚠️ **{{options.user}}** a été averti en MP.', channelType: 'interaction' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'output', toHandle: 'input' },
    ],
  },

  {
    id: 'mod-clear',
    name: '/clear — Supprimer des messages',
    desc: 'Supprime en masse jusqu\'à 100 messages dans le salon courant.',
    category: 'modération',
    emoji: '🗑️',
    preview: ['commandHandlerSuite', 'bulkDeleteMessages', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName: 'clear',
          description: 'Supprime des messages en masse',
          parameters: [{ name: 'amount', type: 'integer', required: true, description: 'Nombre de messages (1–100)' }],
          permissionType: 'discord',
          discordPermissions: ['ManageMessages'],
          customRoles: [],
        },
      },
      {
        type: 'bulkDeleteMessages',
        position: { x: 240, y: 0 },
        config: { amount: '{{options.amount}}' },
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: -50 },
        config: { content: '🗑️ **{{options.amount}}** messages supprimés.', channelType: 'interaction' },
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: 50 },
        config: { content: '❌ Impossible de supprimer les messages.', channelType: 'interaction' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'success', toHandle: 'input' },
      { fromIdx: 1, toIdx: 3, fromHandle: 'error',   toHandle: 'input' },
    ],
  },

  {
    id: 'mod-unban',
    name: '/unban — Débannir un membre',
    desc: 'Retire un ban par ID Discord.',
    category: 'modération',
    emoji: '✅',
    ...cmd3(
      'unban',
      'Retire un ban d\'un utilisateur',
      [{ name: 'userid', type: 'string', required: true, description: 'ID Discord de l\'utilisateur' }],
      'unban',
      { targetUserId: '{{options.userid}}' },
      '✅ L\'utilisateur `{{options.userid}}` a été débanni.',
      ['BanMembers'],
    ),
  },

  // ── Utilisateur ─────────────────────────────────────────────────────────────

  {
    id: 'user-info',
    name: '/userinfo — Infos membre',
    desc: 'Affiche les informations d\'un membre (pseudo, rôles, date d\'arrivée…).',
    category: 'utilisateur',
    emoji: '👤',
    preview: ['commandHandlerSuite', 'fetchUserInfo', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName: 'userinfo',
          description: 'Affiche les infos d\'un membre',
          parameters: [{ name: 'user', type: 'user', required: false, description: 'Membre (vous-même par défaut)' }],
          permissionType: 'discord',
          discordPermissions: [],
          customRoles: [],
        },
      },
      {
        type: 'fetchUserInfo',
        position: { x: 240, y: 0 },
        config: { targetUser: '{{options.user || interaction.user}}' },
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: 0 },
        config: {
          channelType: 'interaction',
          content: '👤 **{{user.username}}**\nID: `{{user.id}}`\nRejoint le : {{member.joinedAt}}\nRôles : {{member.roles}}',
        },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'output', toHandle: 'input' },
    ],
  },

  {
    id: 'user-nick',
    name: '/nick — Changer le pseudo',
    desc: 'Modifie le pseudonyme d\'un membre sur le serveur.',
    category: 'utilisateur',
    emoji: '✏️',
    ...cmd3(
      'nick',
      'Change le pseudo d\'un membre',
      [
        { name: 'user', type: 'user',   required: true, description: 'Membre ciblé' },
        { name: 'name', type: 'string', required: true, description: 'Nouveau pseudo' },
      ],
      'setNickname',
      { targetUser: '{{options.user}}', nickname: '{{options.name}}' },
      '✏️ Pseudo de **{{options.user}}** changé en **{{options.name}}**.',
      ['ManageNicknames'],
    ),
  },

  {
    id: 'user-addrole',
    name: '/addrole — Ajouter un rôle',
    desc: 'Attribue un rôle à un membre.',
    category: 'utilisateur',
    emoji: '🏷️',
    ...cmd3(
      'addrole',
      'Ajoute un rôle à un membre',
      [
        { name: 'user', type: 'user', required: true, description: 'Membre ciblé' },
        { name: 'role', type: 'role', required: true, description: 'Rôle à attribuer' },
      ],
      'addRole',
      { targetUser: '{{options.user}}', role: '{{options.role}}' },
      '✅ Rôle **{{options.role}}** ajouté à **{{options.user}}**.',
      ['ManageRoles'],
    ),
  },

  {
    id: 'user-remrole',
    name: '/remrole — Retirer un rôle',
    desc: 'Retire un rôle d\'un membre.',
    category: 'utilisateur',
    emoji: '🏷️',
    ...cmd3(
      'remrole',
      'Retire un rôle d\'un membre',
      [
        { name: 'user', type: 'user', required: true, description: 'Membre ciblé' },
        { name: 'role', type: 'role', required: true, description: 'Rôle à retirer' },
      ],
      'removeRole',
      { targetUser: '{{options.user}}', role: '{{options.role}}' },
      '✅ Rôle **{{options.role}}** retiré de **{{options.user}}**.',
      ['ManageRoles'],
    ),
  },

  // ── Serveur ──────────────────────────────────────────────────────────────────

  {
    id: 'srv-serverinfo',
    name: '/serverinfo — Infos serveur',
    desc: 'Affiche les statistiques du serveur (membres, date de création, etc.).',
    category: 'serveur',
    emoji: '🏠',
    preview: ['commandHandlerSuite', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: { commandName: 'serverinfo', description: 'Affiche les infos du serveur', parameters: [], permissionType: 'discord', discordPermissions: [], customRoles: [] },
      },
      {
        type: 'sendMessage',
        position: { x: 240, y: 0 },
        config: {
          channelType: 'interaction',
          content: '🏠 **{{guild.name}}**\nID : `{{guild.id}}`\nMembres : {{guild.memberCount}}\nCréé le : {{guild.createdAt}}\nPropriétaire : {{guild.owner}}',
        },
      },
    ],
    edges: [{ fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' }],
  },

  {
    id: 'srv-invite',
    name: '/invite — Créer une invitation',
    desc: 'Génère une invitation pour le salon courant et l\'envoie en réponse.',
    category: 'serveur',
    emoji: '🔗',
    preview: ['commandHandlerSuite', 'createInvite', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName: 'invite',
          description: 'Crée une invitation pour ce salon',
          parameters: [{ name: 'maxuses', type: 'integer', required: false, description: 'Utilisations max (0 = illimité)' }],
          permissionType: 'discord',
          discordPermissions: ['CreateInstantInvite'],
          customRoles: [],
        },
      },
      {
        type: 'createInvite',
        position: { x: 240, y: 0 },
        config: { maxUses: '{{options.maxuses || 0}}', maxAge: 86400 },
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: 0 },
        config: { channelType: 'interaction', content: '🔗 Invitation créée : {{invite.url}}' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'output', toHandle: 'input' },
    ],
  },

  {
    id: 'srv-automod',
    name: 'Auto-mod — Filtre de mots',
    desc: 'Écoute chaque message, vérifie une condition de filtre et supprime le message si besoin.',
    category: 'serveur',
    emoji: '🛡️',
    preview: ['eventHandlerSuite', 'condition', 'deleteMessage', 'sendDM'],
    nodes: [
      {
        type: 'eventHandlerSuite',
        position: { x: 0, y: 0 },
        config: { eventName: 'messageCreate' },
      },
      {
        type: 'condition',
        position: { x: 220, y: 0 },
        config: { condition: '{{message.content}}.toLowerCase().includes("motInterdit")' },
      },
      {
        type: 'deleteMessage',
        position: { x: 440, y: -60 },
        config: { messageId: '{{message.id}}', channelId: '{{message.channelId}}' },
      },
      {
        type: 'sendDM',
        position: { x: 660, y: -60 },
        config: { targetUser: '{{message.author}}', content: '⚠️ Votre message contient un mot interdit et a été supprimé.' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output',  toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'true',    toHandle: 'input' },
      { fromIdx: 2, toIdx: 3, fromHandle: 'output',  toHandle: 'input' },
    ],
  },

  // ── Utilitaire ──────────────────────────────────────────────────────────────

  {
    id: 'util-ping',
    name: '/ping — Latence du bot',
    desc: 'Répond avec la latence du bot et de l\'API Discord.',
    category: 'utilitaire',
    emoji: '🏓',
    preview: ['commandHandlerSuite', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: { commandName: 'ping', description: 'Affiche la latence du bot', parameters: [], permissionType: 'discord', discordPermissions: [], customRoles: [] },
      },
      {
        type: 'sendMessage',
        position: { x: 240, y: 0 },
        config: { channelType: 'interaction', content: '🏓 Pong ! Latence : `{{bot.ping}}ms`' },
      },
    ],
    edges: [{ fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' }],
  },

  {
    id: 'util-roll',
    name: '/roll — Lancer un dé',
    desc: 'Lance un dé à N faces et affiche le résultat aléatoire.',
    category: 'utilitaire',
    emoji: '🎲',
    preview: ['commandHandlerSuite', 'random', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName: 'roll',
          description: 'Lance un dé',
          parameters: [{ name: 'faces', type: 'integer', required: false, description: 'Nombre de faces (défaut : 6)' }],
          permissionType: 'discord',
          discordPermissions: [],
          customRoles: [],
        },
      },
      {
        type: 'random',
        position: { x: 240, y: 0 },
        config: { min: 1, max: '{{options.faces || 6}}' },
      },
      {
        type: 'sendMessage',
        position: { x: 480, y: 0 },
        config: { channelType: 'interaction', content: '🎲 Résultat : **{{random.value}}** (1–{{options.faces || 6}})' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'output', toHandle: 'input' },
    ],
  },

  {
    id: 'util-choose',
    name: '/choose — Choisir au hasard',
    desc: 'Choisit aléatoirement une option parmi une liste séparée par des virgules.',
    category: 'utilitaire',
    emoji: '🪄',
    preview: ['commandHandlerSuite', 'stringOperation', 'random', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: {
          commandName: 'choose',
          description: 'Choisit au hasard parmi une liste',
          parameters: [{ name: 'options', type: 'string', required: true, description: 'Options séparées par des virgules' }],
          permissionType: 'discord',
          discordPermissions: [],
          customRoles: [],
        },
      },
      {
        type: 'sendMessage',
        position: { x: 240, y: 0 },
        config: { channelType: 'interaction', content: '🪄 Mon choix : **{{options.options.split(",")[Math.floor(Math.random()*options.options.split(",").length)].trim()}}**' },
      },
    ],
    edges: [{ fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' }],
  },

  {
    id: 'util-delay-msg',
    name: 'Message avec délai',
    desc: 'Envoie un premier message immédiatement, attend X secondes, puis envoie un message de suivi.',
    category: 'utilitaire',
    emoji: '⏱️',
    preview: ['commandHandlerSuite', 'sendMessage', 'delay', 'sendMessage'],
    nodes: [
      {
        type: 'commandHandlerSuite',
        position: { x: 0, y: 0 },
        config: { commandName: 'remind', description: 'Envoie un rappel différé', parameters: [], permissionType: 'discord', discordPermissions: [], customRoles: [] },
      },
      {
        type: 'sendMessage',
        position: { x: 220, y: 0 },
        config: { channelType: 'interaction', content: '✅ Rappel programmé dans 10 secondes…' },
      },
      {
        type: 'delay',
        position: { x: 440, y: 0 },
        config: { seconds: 10 },
      },
      {
        type: 'sendMessage',
        position: { x: 660, y: 0 },
        config: { channelType: 'interaction', content: '⏰ Rappel : c\'est l\'heure !' },
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 1, toIdx: 2, fromHandle: 'output', toHandle: 'input' },
      { fromIdx: 2, toIdx: 3, fromHandle: 'output', toHandle: 'input' },
    ],
  },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ['modération', 'utilisateur', 'serveur', 'utilitaire'];

export const CATEGORY_META: Record<TemplateCategory, { label: string; color: string; bg: string; border: string }> = {
  'modération': { label: 'Modération', color: '#f87171', bg: '#1a0a0a', border: '#3a1515' },
  'utilisateur': { label: 'Utilisateur', color: '#60a5fa', bg: '#0a121a', border: '#152030' },
  'serveur':    { label: 'Serveur',    color: '#34d399', bg: '#0a1a12', border: '#153525' },
  'utilitaire': { label: 'Utilitaire', color: '#a78bfa', bg: '#110a1a', border: '#251535' },
};
