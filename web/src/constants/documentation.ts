// ─── Documentation data ───────────────────────────────────────────────────────
// Each section has a slug (used in ?help=slug), i18n key prefix, icon, and articles.
// Article bodies are stored as i18n keys so every locale can provide translations.

import {
  LayoutDashboard, GitBranch, Terminal, Send, Shield, Database,
  MousePointerClick, Server, Volume2, Bot, Zap, Code, Layers,
  Rocket,
} from 'lucide-react';
import type React from 'react';

export interface DocArticle {
  /** Unique slug used in ?help=section&article=slug */
  slug: string;
  /** i18n key for the title (inside docs section) */
  titleKey: string;
  /** i18n key for the body markdown (inside docs section) */
  bodyKey: string;
}

export interface DocSection {
  /** Unique slug used in ?help=slug */
  slug: string;
  /** i18n key for the section title */
  titleKey: string;
  /** i18n key for the section description */
  descKey: string;
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Icon colour class */
  iconColor: string;
  /** Background colour class */
  iconBg: string;
  /** Articles inside this section */
  articles: DocArticle[];
}

export const DOC_SECTIONS: DocSection[] = [
  // ── Getting Started ─────────────────────────────────────────────────────
  {
    slug: 'getting-started',
    titleKey: 'gettingStartedTitle',
    descKey: 'gettingStartedDesc',
    icon: Rocket,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    articles: [
      { slug: 'what-is-disflow', titleKey: 'whatIsDisflowTitle', bodyKey: 'whatIsDisflowBody' },
      { slug: 'create-account', titleKey: 'createAccountTitle', bodyKey: 'createAccountBody' },
      { slug: 'first-bot', titleKey: 'firstBotTitle', bodyKey: 'firstBotBody' },
      { slug: 'discord-token', titleKey: 'discordTokenTitle', bodyKey: 'discordTokenBody' },
    ],
  },
  // ── Dashboard ───────────────────────────────────────────────────────────
  {
    slug: 'dashboard',
    titleKey: 'dashboardTitle',
    descKey: 'dashboardDesc',
    icon: LayoutDashboard,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    articles: [
      { slug: 'overview', titleKey: 'dashOverviewTitle', bodyKey: 'dashOverviewBody' },
      { slug: 'stats-widgets', titleKey: 'dashStatsTitle', bodyKey: 'dashStatsBody' },
      { slug: 'manage-instances', titleKey: 'dashInstancesTitle', bodyKey: 'dashInstancesBody' },
      { slug: 'settings', titleKey: 'dashSettingsTitle', bodyKey: 'dashSettingsBody' },
    ],
  },
  // ── Canvas & Editor ─────────────────────────────────────────────────────
  {
    slug: 'canvas',
    titleKey: 'canvasTitle',
    descKey: 'canvasDesc',
    icon: GitBranch,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15',
    articles: [
      { slug: 'canvas-basics', titleKey: 'canvasBasicsTitle', bodyKey: 'canvasBasicsBody' },
      { slug: 'add-nodes', titleKey: 'addNodesTitle', bodyKey: 'addNodesBody' },
      { slug: 'connect-nodes', titleKey: 'connectNodesTitle', bodyKey: 'connectNodesBody' },
      { slug: 'configure-nodes', titleKey: 'configureNodesTitle', bodyKey: 'configureNodesBody' },
      { slug: 'keyboard-shortcuts', titleKey: 'shortcutsTitle', bodyKey: 'shortcutsBody' },
      { slug: 'import-export', titleKey: 'importExportTitle', bodyKey: 'importExportBody' },
    ],
  },
  // ── Handlers / Triggers ────────────────────────────────────────────────
  {
    slug: 'handlers',
    titleKey: 'handlersTitle',
    descKey: 'handlersDesc',
    icon: Terminal,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15',
    articles: [
      { slug: 'command-handler', titleKey: 'commandHandlerTitle', bodyKey: 'commandHandlerBody' },
      { slug: 'event-handler', titleKey: 'eventHandlerTitle', bodyKey: 'eventHandlerBody' },
      { slug: 'button-handler', titleKey: 'buttonHandlerTitle', bodyKey: 'buttonHandlerBody' },
      { slug: 'select-menu-handler', titleKey: 'selectMenuHandlerTitle', bodyKey: 'selectMenuHandlerBody' },
      { slug: 'modal-handler', titleKey: 'modalHandlerTitle', bodyKey: 'modalHandlerBody' },
    ],
  },
  // ── Actions ─────────────────────────────────────────────────────────────
  {
    slug: 'actions',
    titleKey: 'actionsTitle',
    descKey: 'actionsDesc',
    icon: Send,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15',
    articles: [
      { slug: 'send-message', titleKey: 'sendMessageTitle', bodyKey: 'sendMessageBody' },
      { slug: 'edit-delete-message', titleKey: 'editDeleteTitle', bodyKey: 'editDeleteBody' },
      { slug: 'embeds', titleKey: 'embedsTitle', bodyKey: 'embedsBody' },
      { slug: 'reactions-pins', titleKey: 'reactionsPinsTitle', bodyKey: 'reactionsPinsBody' },
      { slug: 'threads', titleKey: 'threadsTitle', bodyKey: 'threadsBody' },
      { slug: 'dm', titleKey: 'dmTitle', bodyKey: 'dmBody' },
    ],
  },
  // ── Interactions ────────────────────────────────────────────────────────
  {
    slug: 'interactions',
    titleKey: 'interactionsTitle',
    descKey: 'interactionsDesc',
    icon: MousePointerClick,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15',
    articles: [
      { slug: 'buttons', titleKey: 'buttonsTitle', bodyKey: 'buttonsBody' },
      { slug: 'select-menus', titleKey: 'selectMenusTitle', bodyKey: 'selectMenusBody' },
      { slug: 'modals', titleKey: 'modalsTitle', bodyKey: 'modalsBody' },
    ],
  },
  // ── Moderation ──────────────────────────────────────────────────────────
  {
    slug: 'moderation',
    titleKey: 'moderationTitle',
    descKey: 'moderationDesc',
    icon: Shield,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/15',
    articles: [
      { slug: 'kick-ban', titleKey: 'kickBanTitle', bodyKey: 'kickBanBody' },
      { slug: 'timeout-mute', titleKey: 'timeoutMuteTitle', bodyKey: 'timeoutMuteBody' },
      { slug: 'bulk-delete', titleKey: 'bulkDeleteTitle', bodyKey: 'bulkDeleteBody' },
      { slug: 'permissions', titleKey: 'permissionsTitle', bodyKey: 'permissionsBody' },
    ],
  },
  // ── Roles & Guild ──────────────────────────────────────────────────────
  {
    slug: 'guild',
    titleKey: 'guildTitle',
    descKey: 'guildDesc',
    icon: Server,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    articles: [
      { slug: 'roles', titleKey: 'rolesTitle', bodyKey: 'rolesBody' },
      { slug: 'channels', titleKey: 'channelsTitle', bodyKey: 'channelsBody' },
      { slug: 'emojis-stickers', titleKey: 'emojisStickersTitle', bodyKey: 'emojisStickersBody' },
      { slug: 'invites-webhooks', titleKey: 'invitesWebhooksTitle', bodyKey: 'invitesWebhooksBody' },
    ],
  },
  // ── Voice ───────────────────────────────────────────────────────────────
  {
    slug: 'voice',
    titleKey: 'voiceTitle',
    descKey: 'voiceDesc',
    icon: Volume2,
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/15',
    articles: [
      { slug: 'join-leave', titleKey: 'joinLeaveTitle', bodyKey: 'joinLeaveBody' },
      { slug: 'play-audio', titleKey: 'playAudioTitle', bodyKey: 'playAudioBody' },
      { slug: 'move-disconnect', titleKey: 'moveDisconnectTitle', bodyKey: 'moveDisconnectBody' },
    ],
  },
  // ── Bot Settings ────────────────────────────────────────────────────────
  {
    slug: 'bot',
    titleKey: 'botTitle',
    descKey: 'botDesc',
    icon: Bot,
    iconColor: 'text-fuchsia-400',
    iconBg: 'bg-fuchsia-500/15',
    articles: [
      { slug: 'presence', titleKey: 'presenceTitle', bodyKey: 'presenceBody' },
      { slug: 'nickname-avatar', titleKey: 'nicknameAvatarTitle', bodyKey: 'nicknameAvatarBody' },
    ],
  },
  // ── Logic ───────────────────────────────────────────────────────────────
  {
    slug: 'logic',
    titleKey: 'logicTitle',
    descKey: 'logicDesc',
    icon: Zap,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/15',
    articles: [
      { slug: 'conditions', titleKey: 'conditionsTitle', bodyKey: 'conditionsBody' },
      { slug: 'loops', titleKey: 'loopsTitle', bodyKey: 'loopsBody' },
      { slug: 'variables', titleKey: 'variablesTitle', bodyKey: 'variablesBody' },
      { slug: 'math-string', titleKey: 'mathStringTitle', bodyKey: 'mathStringBody' },
      { slug: 'http-webhook', titleKey: 'httpWebhookTitle', bodyKey: 'httpWebhookBody' },
    ],
  },
  // ── Database ────────────────────────────────────────────────────────────
  {
    slug: 'database',
    titleKey: 'databaseTitle',
    descKey: 'databaseDesc',
    icon: Database,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
    articles: [
      { slug: 'sql-basics', titleKey: 'sqlBasicsTitle', bodyKey: 'sqlBasicsBody' },
      { slug: 'create-table', titleKey: 'createTableTitle', bodyKey: 'createTableBody' },
      { slug: 'select-insert', titleKey: 'selectInsertTitle', bodyKey: 'selectInsertBody' },
      { slug: 'db-viewer', titleKey: 'dbViewerTitle', bodyKey: 'dbViewerBody' },
    ],
  },
  // ── Canvas Node ─────────────────────────────────────────────────────────
  {
    slug: 'advanced',
    titleKey: 'advancedTitle',
    descKey: 'advancedDesc',
    icon: Code,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    articles: [
      { slug: 'code-exec', titleKey: 'codeExecTitle', bodyKey: 'codeExecBody' },
      { slug: 'canvas-card', titleKey: 'canvasCardTitle', bodyKey: 'canvasCardBody' },
      { slug: 'templates', titleKey: 'templatesTitle', bodyKey: 'templatesBody' },
      { slug: 'ai-chat', titleKey: 'aiChatTitle', bodyKey: 'aiChatBody' },
    ],
  },
  // ── Deployment ──────────────────────────────────────────────────────────
  {
    slug: 'deployment',
    titleKey: 'deploymentTitle',
    descKey: 'deploymentDesc',
    icon: Layers,
    iconColor: 'text-lime-400',
    iconBg: 'bg-lime-500/15',
    articles: [
      { slug: 'save-deploy', titleKey: 'saveDeployTitle', bodyKey: 'saveDeployBody' },
      { slug: 'collaboration', titleKey: 'collaborationTitle', bodyKey: 'collaborationBody' },
      { slug: 'troubleshooting', titleKey: 'troubleshootingTitle', bodyKey: 'troubleshootingBody' },
    ],
  },
];

/** Flat lookup: slug → section */
export const SECTION_BY_SLUG = Object.fromEntries(DOC_SECTIONS.map(s => [s.slug, s]));

/** Flat lookup: article slug → { section, article } */
export const ARTICLE_LOOKUP = Object.fromEntries(
  DOC_SECTIONS.flatMap(s =>
    s.articles.map(a => [a.slug, { section: s, article: a }])
  )
);
