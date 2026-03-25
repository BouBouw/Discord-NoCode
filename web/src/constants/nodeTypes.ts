import { Bot, CheckCircle, Clock, Database, Globe, Link, Send, Shield, LogOut, Ban as BanIcon, Terminal, GitBranch, Image, Pencil, Trash2, CornerDownLeft, FileCode, UserMinus, UserCheck, Timer, Tag, Hash, Plus, Repeat, GitFork, Shuffle, Filter, Calculator, Layers, Mic, MicOff, Music, Volume2, VolumeX, StopCircle, Activity, Mail, Smile, Pin, MessageSquare, Archive, Search, Settings2, Type, List, Braces, ArrowLeftRight, Calendar, RefreshCw, MousePointerClick, ChevronDown, LayoutDashboard, Zap, Hourglass, Users, ShieldAlert, Server, PartyPopper, UserPlus, DoorOpen, Ticket, TicketX, Heart, ScrollText, MessageCircle, Star, ShieldBan, MessageSquareWarning, BarChart3, AlarmClock, Gauge, Coins, Wallet, Trophy, Gift, GiftIcon, Palette, Twitch, Youtube } from 'lucide-react';

export type NodeType =
  // Core
  | 'coreBot'
  // Logic
  | 'condition'
  | 'delay'
  | 'variable'
  | 'forEach'
  | 'switchCase'
  | 'random'
  | 'counter'
  | 'filter'
  | 'mathOperation'
  | 'stringOperation'
  | 'arrayOperation'
  | 'jsonParse'
  | 'jsonStringify'
  | 'typeConvert'
  | 'getDate'
  | 'loopWhile'
  // HTTP
  | 'httpRequest'
  | 'webhook'
  // Discord – Messaging
  | 'sendMessage'
  | 'editMessage'
  | 'deleteMessage'
  | 'replyToMessage'
  // Discord – Roles
  | 'addRole'
  | 'removeRole'
  | 'createRole'
  // Discord – Moderation
  | 'kick'
  | 'ban'
  | 'unban'
  | 'timeout'
  | 'unmute'
  | 'bulkDeleteMessages'
  | 'setNickname'
  // Discord – Channels
  | 'createChannel'
  | 'deleteChannel'
  // Handlers
  | 'commandHandlerSuite'
  | 'eventHandlerSuite'
  // Database
  | 'sqlDatabase'
  // Code
  | 'codeExec'
  // Canvas
  | 'canvasCard'
  // Discord – Voice
  | 'joinVoiceChannel'
  | 'leaveVoiceChannel'
  | 'playAudio'
  | 'stopAudio'
  | 'moveToVoice'
  | 'disconnectFromVoice'
  // Discord – Bot Management
  | 'setBotPresence'
  | 'setBotNickname'
  | 'setBotAvatar'
  // Discord – Interactions
  | 'sendDM'
  | 'addReaction'
  | 'pinMessage'
  | 'unpinMessage'
  | 'createThread'
  | 'archiveThread'
  | 'editChannel'
  | 'createInvite'
  // Discord – Guild Extended
  | 'editGuild'
  | 'editRole'
  | 'deleteRole'
  | 'createEmoji'
  | 'deleteEmoji'
  | 'editEmoji'
  | 'createSticker'
  | 'deleteSticker'
  | 'createEvent'
  | 'editEvent'
  | 'deleteEvent'
  | 'createGuildWebhook'
  | 'deleteGuildWebhook'
  | 'executeWebhook'
  | 'fetchAuditLog'
  | 'fetchMembers'
  | 'serverMuteMember'
  | 'serverDeafenMember'
  | 'fetchUserInfo'
  // Discord – Components
  | 'sendButtons'
  | 'sendStringSelectMenu'
  | 'sendUserSelectMenu'
  | 'sendRoleSelectMenu'
  | 'sendChannelSelectMenu'
  | 'sendModal'
  | 'awaitButtonClick'
  | 'awaitSelectMenu'
  // Discord – Interaction Handlers
  | 'buttonInteractionHandler'
  | 'selectMenuInteractionHandler'
  | 'modalSubmitHandler'
  // ─── Phase 1: Beginner Essentials ──────────────────────────────────────────
  | 'welcomeMessage'
  | 'goodbyeMessage'
  | 'autoRole'
  | 'ticketPanel'
  | 'ticketClose'
  | 'reactionRole'
  | 'logAction'
  | 'comment'
  // ─── Phase 2: Engagement ───────────────────────────────────────────────────
  | 'xpGive'
  | 'xpCheck'
  | 'levelCheck'
  | 'antiSpam'
  | 'badWordFilter'
  | 'createPoll'
  | 'scheduledTrigger'
  | 'cooldown'
  // ─── Phase 3: Differentiation ──────────────────────────────────────────────
  | 'economyGive'
  | 'economyTake'
  | 'economyBalance'
  | 'economyLeaderboard'
  | 'giveawayCreate'
  | 'giveawayEnd'
  | 'embedBuilder'
  | 'twitchLive'
  | 'youtubeNewVideo';

export type NodeCategory = 'all' | 'handlers' | 'bot' | 'actions' | 'users' | 'interactions' | 'guild' | 'voice' | 'mods' | 'canvas' | 'database' | 'logic' | 'core' | 'integrations';

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  category: NodeCategory;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  required: boolean;
  inputs: HandleConfig[];
  outputs: HandleConfig[];
}

export interface HandleConfig {
  id: string;
  label?: string;
  type: 'source' | 'target';
  description?: string;
}

export interface CommandParameter {
  id: string;
  name: string;
  type: 'string' | 'integer' | 'number' | 'boolean' | 'user' | 'role' | 'channel' | 'mentionable' | 'attachment';
  description: string;
  required: boolean;
}

export interface CommandHandlerConfig {
  commandName: string;
  description: string;
  parameters: CommandParameter[];
  permissionType: 'discord' | 'custom';
  discordPermissions: string[];
  customRoles: string[];
}

export interface EventHandlerConfig {
  eventName: string;
  executeOnce: boolean;
}

export interface NodeData {
  label: string;
  type: NodeType;
  category: NodeCategory;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  isRequired?: boolean;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  config?: CommandHandlerConfig | EventHandlerConfig | Record<string, any> | null;
}

export const NODE_TYPES: Record<NodeType, NodeTypeConfig> = {
  // Core
  coreBot: {
    type: 'coreBot',
    label: 'Core Bot',
    category: 'core',
    description: 'The starting point of your workflow',
    icon: Bot,
    color: 'blue',
    required: true,
    inputs: [],
    outputs: [{ id: 'output', label: 'Start', type: 'source' }],
  },

  // Logic
  condition: {
    type: 'condition',
    label: 'Condition',
    category: 'logic',
    description: 'Branch based on a condition',
    icon: CheckCircle,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'true', label: 'True', type: 'source' },
      { id: 'false', label: 'False', type: 'source' },
    ],
  },

  delay: {
    type: 'delay',
    label: 'Delay',
    category: 'logic',
    description: 'Wait for a specified time',
    icon: Clock,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target', description: 'Delay duration' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  variable: {
    type: 'variable',
    label: 'Variable',
    category: 'logic',
    description: 'Store or retrieve variables',
    icon: Database,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  forEach: {
    type: 'forEach',
    label: 'For Each',
    category: 'logic',
    description: 'Iterate over each item in a list',
    icon: Repeat,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'item', label: 'Item', type: 'source' },
      { id: 'done', label: 'Done', type: 'source' },
    ],
  },

  switchCase: {
    type: 'switchCase',
    label: 'Switch',
    category: 'logic',
    description: 'Branch execution across multiple cases',
    icon: GitFork,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'case1',   label: 'Case 1',  type: 'source' },
      { id: 'case2',   label: 'Case 2',  type: 'source' },
      { id: 'case3',   label: 'Case 3',  type: 'source' },
      { id: 'case4',   label: 'Case 4',  type: 'source' },
      { id: 'default', label: 'Default', type: 'source' },
    ],
  },

  random: {
    type: 'random',
    label: 'Random',
    category: 'logic',
    description: 'Generate a random value or pick a random item',
    icon: Shuffle,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Result', type: 'source' }],
  },

  counter: {
    type: 'counter',
    label: 'Counter',
    category: 'logic',
    description: 'Increment or decrement a counter value',
    icon: Plus,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Value', type: 'source' }],
  },

  filter: {
    type: 'filter',
    label: 'Filter',
    category: 'logic',
    description: 'Filter items in a list based on a condition',
    icon: Filter,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'match',   label: 'Match',    type: 'source' },
      { id: 'noMatch', label: 'No Match', type: 'source' },
    ],
  },

  mathOperation: {
    type: 'mathOperation',
    label: 'Math',
    category: 'logic',
    description: 'Perform arithmetic operations on values',
    icon: Calculator,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Result', type: 'source' }],
  },

  stringOperation: {
    type: 'stringOperation',
    label: 'String',
    category: 'logic',
    description: 'Manipulate text strings (majuscules, découpe, remplacement…)',
    icon: Type,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Résultat', type: 'source' }],
  },

  arrayOperation: {
    type: 'arrayOperation',
    label: 'Array',
    category: 'logic',
    description: 'Manipulate arrays: push, pop, join, sort, slice…',
    icon: List,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  jsonParse: {
    type: 'jsonParse',
    label: 'JSON Parse',
    category: 'logic',
    description: 'Parse a JSON string into a variable',
    icon: Braces,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'OK', type: 'source' },
      { id: 'error', label: 'Erreur', type: 'source' },
    ],
  },

  jsonStringify: {
    type: 'jsonStringify',
    label: 'JSON Stringify',
    category: 'logic',
    description: 'Convert a variable to a JSON string',
    icon: Braces,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  typeConvert: {
    type: 'typeConvert',
    label: 'Convertir',
    category: 'logic',
    description: 'Convert a value between types (string, number, boolean…)',
    icon: ArrowLeftRight,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Résultat', type: 'source' }],
  },

  getDate: {
    type: 'getDate',
    label: 'Date & Heure',
    category: 'logic',
    description: 'Get the current date and time into variables',
    icon: Calendar,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  loopWhile: {
    type: 'loopWhile',
    label: 'Loop While',
    category: 'logic',
    description: 'Repeat while a condition is true (max 100 iterations)',
    icon: RefreshCw,
    color: 'green',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'loop', label: 'Boucle', type: 'source' },
      { id: 'done', label: 'Terminé', type: 'source' },
    ],
  },

  // HTTP
  httpRequest: {
    type: 'httpRequest',
    label: 'HTTP Request',
    category: 'logic',
    description: 'Make an HTTP request',
    icon: Globe,
    color: 'orange',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target', description: 'URL' }, { id: 'input', label: 'In', type: 'target', description: 'Method' }, { id: 'input', label: 'In', type: 'target', description: 'Body' }, { id: 'input', label: 'In', type: 'target', description: 'Headers' }],
    outputs: [
      { id: 'success', label: 'Success', type: 'source' },
      { id: 'error', label: 'Error', type: 'source' },
    ],
  },

  webhook: {
    type: 'webhook',
    label: 'Webhook',
    category: 'logic',
    description: 'Create a webhook endpoint',
    icon: Link,
    color: 'orange',
    required: false,
    inputs: [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },

  // Discord Actions
  sendMessage: {
    type: 'sendMessage',
    label: 'Send Message',
    category: 'actions',
    description: 'Envoie un message (texte, embed riche, image, fichier) dans un canal',
    icon: Send,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  editMessage: {
    type: 'editMessage',
    label: 'Edit Message',
    category: 'actions',
    description: 'Edit the content of an existing message',
    icon: Pencil,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  deleteMessage: {
    type: 'deleteMessage',
    label: 'Delete Message',
    category: 'actions',
    description: 'Delete a message from a channel',
    icon: Trash2,
    color: 'rose',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  replyToMessage: {
    type: 'replyToMessage',
    label: 'Reply',
    category: 'actions',
    description: 'Reply to an existing message',
    icon: CornerDownLeft,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  addRole: {
    type: 'addRole',
    label: 'Add Role',
    category: 'guild',
    description: 'Add a role to a member',
    icon: Shield,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  removeRole: {
    type: 'removeRole',
    label: 'Remove Role',
    category: 'guild',
    description: 'Remove a role from a member',
    icon: UserMinus,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  createRole: {
    type: 'createRole',
    label: 'Create Role',
    category: 'guild',
    description: 'Create a new role',
    icon: Shield,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  kick: {
    type: 'kick',
    label: 'Kick',
    category: 'mods',
    description: 'Kick a member from the server',
    icon: LogOut,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  ban: {
    type: 'ban',
    label: 'Ban',
    category: 'mods',
    description: 'Ban a member from the server',
    icon: BanIcon,
    color: 'rose',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  unban: {
    type: 'unban',
    label: 'Unban',
    category: 'mods',
    description: 'Remove a ban from a user',
    icon: UserCheck,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  timeout: {
    type: 'timeout',
    label: 'Timeout',
    category: 'mods',
    description: 'Temporarily mute a member for a duration',
    icon: Timer,
    color: 'rose',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  unmute: {
    type: 'unmute',
    label: 'Unmute',
    category: 'mods',
    description: "Retire le timeout d'un membre (démute avant la fin)",
    icon: UserCheck,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  bulkDeleteMessages: {
    type: 'bulkDeleteMessages',
    label: 'Bulk Delete Messages',
    category: 'mods',
    description: 'Supprime en masse plusieurs messages récents dans un salon (max 100, < 14 jours)',
    icon: Trash2,
    color: 'rose',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Supprimés', type: 'source' },
      { id: 'error',   label: 'Erreur',    type: 'source' },
    ],
  },

  setNickname: {
    type: 'setNickname',
    label: 'Set Nickname',
    category: 'mods',
    description: "Change a member's server nickname",
    icon: Tag,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  createChannel: {
    type: 'createChannel',
    label: 'Create Channel',
    category: 'guild',
    description: 'Create a new text or voice channel',
    icon: Hash,
    color: 'blue',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  deleteChannel: {
    type: 'deleteChannel',
    label: 'Delete Channel',
    category: 'guild',
    description: 'Permanently delete a channel',
    icon: Trash2,
    color: 'rose',
    required: false,
    inputs: [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  // Command Handler Suite
  commandHandlerSuite: {
    type: 'commandHandlerSuite',
    label: 'Command Handler Suite',
    category: 'handlers',
    description: 'Register and execute Discord slash commands',
    icon: Terminal,
    color: 'indigo-600',
    required: false,
    inputs: [
      { id: 'commandName', label: 'Command Name', type: 'target', description: 'Name of the slash command' },
      { id: 'handlerCode', label: 'Handler Code', type: 'source', description: 'JavaScript code to handle the command' },
    ],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  // Event Handler Suite
  eventHandlerSuite: {
    type: 'eventHandlerSuite',
    label: 'Event Handler Suite',
    category: 'handlers',
    description: 'Trigger workflows on Discord events',
    icon: Terminal,
    color: 'amber-600',
    required: false,
    inputs: [
      { id: 'eventName', label: 'Event Name', type: 'target', description: 'Name of the Discord event' },
      { id: 'workflowId', label: 'Workflow ID', type: 'target', description: 'Workflow to execute' },
    ],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  // Database
  sqlDatabase: {
    type: 'sqlDatabase',
    label: 'SQL Query',
    category: 'database',
    description: 'Execute a SQL query on the instance database',
    icon: Database,
    color: 'teal',
    required: false,
    inputs: [{ id: 'input', label: 'Trigger', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Result', type: 'source' },
      { id: 'error',   label: 'Error',  type: 'source' },
    ],
  },

  // Code execution
  codeExec: {
    type: 'codeExec',
    label: 'Node.js',
    category: 'logic',
    description: 'Exécute du code JavaScript personnalisé avec accès au contexte Discord',
    icon: FileCode,
    color: 'green-600',
    required: false,
    inputs:  [{ id: 'input',   label: 'Trigger',  type: 'target' }],
    outputs: [
      { id: 'success', label: 'Success', type: 'source' },
      { id: 'error',   label: 'Error',   type: 'source' },
    ],
  },

  // Canvas
  canvasCard: {
    type: 'canvasCard',
    label: 'Canvas Card',
    category: 'canvas',
    description: 'Génère une image (carte de profil, bannière…) via un builder visuel de calques',
    icon: Layers,
    color: 'violet',
    required: false,
    inputs:  [{ id: 'input',   label: 'Trigger', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Succès', type: 'source' },
      { id: 'error',   label: 'Erreur', type: 'source' },
    ],
  },

  // Discord – Voice
  joinVoiceChannel: {
    type: 'joinVoiceChannel', label: 'Join Voice', category: 'voice',
    description: 'Connecte le bot à un canal vocal',
    icon: Mic, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  leaveVoiceChannel: {
    type: 'leaveVoiceChannel', label: 'Leave Voice', category: 'voice',
    description: 'Déconnecte le bot du canal vocal actuel',
    icon: MicOff, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  playAudio: {
    type: 'playAudio', label: 'Play Audio', category: 'voice',
    description: 'Joue un fichier audio (YouTube, MP3, OGG) dans le canal vocal',
    icon: Music, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Terminé', type: 'source' },
      { id: 'error',   label: 'Erreur',  type: 'source' },
    ],
  },
  stopAudio: {
    type: 'stopAudio', label: 'Stop Audio', category: 'voice',
    description: 'Arrête la lecture audio en cours',
    icon: StopCircle, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  moveToVoice: {
    type: 'moveToVoice', label: 'Move to Voice', category: 'voice',
    description: 'Déplace un membre vers un canal vocal',
    icon: UserCheck, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  disconnectFromVoice: {
    type: 'disconnectFromVoice', label: 'Disconnect Voice', category: 'voice',
    description: 'Déconnecte un membre du canal vocal',
    icon: UserMinus, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  // Bot Management
  setBotPresence: {
    type: 'setBotPresence', label: 'Set Presence', category: 'bot',
    description: "Modifie le statut et l'activité du bot (fixe ou rotation)",
    icon: Activity, color: 'pink', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  setBotNickname: {
    type: 'setBotNickname', label: 'Set Nickname', category: 'bot',
    description: "Change le surnom du bot dans le serveur",
    icon: Tag, color: 'pink', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  setBotAvatar: {
    type: 'setBotAvatar', label: 'Set Avatar', category: 'bot',
    description: "Change l'avatar global du bot",
    icon: Image, color: 'pink', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  // Discord – Interactions
  sendDM: {
    type: 'sendDM', label: 'Send DM', category: 'users',
    description: 'Envoie un message privé à un utilisateur',
    icon: Mail, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  addReaction: {
    type: 'addReaction', label: 'Add Reaction', category: 'guild',
    description: 'Ajoute une réaction emoji à un message',
    icon: Smile, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  pinMessage: {
    type: 'pinMessage', label: 'Pin Message', category: 'guild',
    description: 'Épingle un message dans un canal',
    icon: Pin, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  unpinMessage: {
    type: 'unpinMessage', label: 'Unpin Message', category: 'guild',
    description: 'Désépingle un message dans un canal',
    icon: Pin, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  createThread: {
    type: 'createThread', label: 'Create Thread', category: 'guild',
    description: 'Crée un fil de discussion depuis un message ou un canal',
    icon: MessageSquare, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  archiveThread: {
    type: 'archiveThread', label: 'Archive Thread', category: 'guild',
    description: 'Archive ou ferme un fil de discussion',
    icon: Archive, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  editChannel: {
    type: 'editChannel', label: 'Edit Channel', category: 'guild',
    description: "Modifie le nom, le topic ou le slowmode d'un canal",
    icon: Settings2, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  createInvite: {
    type: 'createInvite', label: 'Create Invite', category: 'guild',
    description: "Génère un lien d'invitation pour un canal",
    icon: Link, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },

  // Guild Extended
  editGuild: {
    type: 'editGuild', label: 'Edit Guild', category: 'guild',
    description: 'Modifie les paramètres du serveur (nom, icône, bannière, description…)',
    icon: Settings2, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  editRole: {
    type: 'editRole', label: 'Edit Role', category: 'guild',
    description: "Modifie les propriétés d'un rôle (nom, couleur, permissions, position…)",
    icon: Pencil, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  deleteRole: {
    type: 'deleteRole', label: 'Delete Role', category: 'guild',
    description: 'Supprime définitivement un rôle du serveur',
    icon: Trash2, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  createEmoji: {
    type: 'createEmoji', label: 'Create Emoji', category: 'guild',
    description: "Crée un emoji personnalisé à partir d'une URL d'image",
    icon: Smile, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Créé',   type: 'source' },
      { id: 'error',   label: 'Erreur', type: 'source' },
    ],
  },
  deleteEmoji: {
    type: 'deleteEmoji', label: 'Delete Emoji', category: 'guild',
    description: 'Supprime un emoji personnalisé du serveur',
    icon: Smile, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  editEmoji: {
    type: 'editEmoji', label: 'Edit Emoji', category: 'guild',
    description: 'Renomme un emoji ou modifie ses rôles autorisés',
    icon: Pencil, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  createSticker: {
    type: 'createSticker', label: 'Create Sticker', category: 'guild',
    description: 'Crée un sticker personnalisé depuis un fichier image ou Lottie',
    icon: Tag, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Créé',   type: 'source' },
      { id: 'error',   label: 'Erreur', type: 'source' },
    ],
  },
  deleteSticker: {
    type: 'deleteSticker', label: 'Delete Sticker', category: 'guild',
    description: 'Supprime un sticker du serveur',
    icon: Trash2, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  createEvent: {
    type: 'createEvent', label: 'Create Event', category: 'guild',
    description: 'Crée un événement planifié dans le serveur',
    icon: Calendar, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Créé',   type: 'source' },
      { id: 'error',   label: 'Erreur', type: 'source' },
    ],
  },
  editEvent: {
    type: 'editEvent', label: 'Edit Event', category: 'guild',
    description: 'Modifie un événement planifié (titre, description, date, image…)',
    icon: Pencil, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  deleteEvent: {
    type: 'deleteEvent', label: 'Delete Event', category: 'guild',
    description: 'Annule et supprime un événement planifié',
    icon: Trash2, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  createGuildWebhook: {
    type: 'createGuildWebhook', label: 'Create Webhook', category: 'guild',
    description: 'Crée un webhook dans un canal du serveur',
    icon: Link, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Créé',   type: 'source' },
      { id: 'error',   label: 'Erreur', type: 'source' },
    ],
  },
  deleteGuildWebhook: {
    type: 'deleteGuildWebhook', label: 'Delete Webhook', category: 'guild',
    description: 'Supprime un webhook du serveur',
    icon: Trash2, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  executeWebhook: {
    type: 'executeWebhook', label: 'Execute Webhook', category: 'guild',
    description: 'Envoie un message via un webhook Discord (texte, embed, fichier)',
    icon: Send, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Envoyé', type: 'source' },
      { id: 'error',   label: 'Erreur',  type: 'source' },
    ],
  },
  fetchAuditLog: {
    type: 'fetchAuditLog', label: 'Fetch Audit Log', category: 'guild',
    description: "Récupère les entrées du journal d'audit du serveur",
    icon: Search, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Entrées', type: 'source' },
      { id: 'error',   label: 'Erreur',  type: 'source' },
    ],
  },
  fetchMembers: {
    type: 'fetchMembers', label: 'Fetch Members', category: 'guild',
    description: 'Récupère la liste des membres du serveur avec filtres optionnels',
    icon: Users, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Membres', type: 'source' },
      { id: 'error',   label: 'Erreur',  type: 'source' },
    ],
  },

  serverMuteMember: {
    type: 'serverMuteMember', label: 'Server Mute', category: 'voice',
    description: "Coupe le micro d'un membre en vocal (server mute)",
    icon: VolumeX, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  serverDeafenMember: {
    type: 'serverDeafenMember', label: 'Server Deafen', category: 'voice',
    description: 'Assourdit un membre en vocal (server deafen)',
    icon: VolumeX, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [{ id: 'output', label: 'Next', type: 'source' }],
  },
  fetchUserInfo: {
    type: 'fetchUserInfo', label: 'Fetch User Info', category: 'users',
    description: "Récupère les infos d'un utilisateur et les stocke en variables",
    icon: Search, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'success', label: 'Trouvé',     type: 'source' },
      { id: 'error',   label: 'Introuvable', type: 'source' },
    ],
  },

  // Discord – Components (Message Components)
  sendButtons: {
    type: 'sendButtons', label: 'Send Buttons', category: 'interactions',
    description: 'Envoie un message avec des boutons cliquables',
    icon: MousePointerClick, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'sent',  label: 'Envoyé', type: 'source' },
      { id: 'error', label: 'Erreur',  type: 'source' },
    ],
  },
  sendStringSelectMenu: {
    type: 'sendStringSelectMenu', label: 'String Select', category: 'interactions',
    description: 'Envoie un menu déroulant avec des options textuelles',
    icon: ChevronDown, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'sent',  label: 'Envoyé', type: 'source' },
      { id: 'error', label: 'Erreur',  type: 'source' },
    ],
  },
  sendUserSelectMenu: {
    type: 'sendUserSelectMenu', label: 'User Select', category: 'interactions',
    description: 'Envoie un sélecteur d’utilisateurs',
    icon: UserCheck, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'sent',  label: 'Envoyé', type: 'source' },
      { id: 'error', label: 'Erreur',  type: 'source' },
    ],
  },
  sendRoleSelectMenu: {
    type: 'sendRoleSelectMenu', label: 'Role Select', category: 'interactions',
    description: 'Envoie un sélecteur de rôles',
    icon: Shield, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'sent',  label: 'Envoyé', type: 'source' },
      { id: 'error', label: 'Erreur',  type: 'source' },
    ],
  },
  sendChannelSelectMenu: {
    type: 'sendChannelSelectMenu', label: 'Channel Select', category: 'interactions',
    description: 'Envoie un sélecteur de canaux',
    icon: Hash, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'sent',  label: 'Envoyé', type: 'source' },
      { id: 'error', label: 'Erreur',  type: 'source' },
    ],
  },
  sendModal: {
    type: 'sendModal', label: 'Send Modal', category: 'interactions',
    description: 'Affiche une fenêtre modale avec des champs de formulaire',
    icon: LayoutDashboard, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'shown', label: 'Affiché', type: 'source' },
      { id: 'error', label: 'Erreur',  type: 'source' },
    ],
  },
  awaitButtonClick: {
    type: 'awaitButtonClick', label: 'Await Button', category: 'interactions',
    description: 'Attend le clic sur un bouton avec un timeout',
    icon: Hourglass, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'clicked',  label: 'Cliqué',  type: 'source' },
      { id: 'timeout',  label: 'Timeout', type: 'source' },
      { id: 'error',    label: 'Erreur',  type: 'source' },
    ],
  },
  awaitSelectMenu: {
    type: 'awaitSelectMenu', label: 'Await Select', category: 'interactions',
    description: 'Attend la sélection dans un menu déroulant avec timeout',
    icon: Hourglass, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'selected', label: 'Sélectionné', type: 'source' },
      { id: 'timeout',  label: 'Timeout',       type: 'source' },
      { id: 'error',    label: 'Erreur',         type: 'source' },
    ],
  },

  // Discord – Interaction Handlers
  buttonInteractionHandler: {
    type: 'buttonInteractionHandler', label: 'Button Handler', category: 'interactions',
    description: 'Déclenche le workflow lorsqu’un bouton correpondant est cliqué',
    icon: Zap, color: 'indigo-600', required: false,
    inputs:  [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },
  selectMenuInteractionHandler: {
    type: 'selectMenuInteractionHandler', label: 'Select Handler', category: 'interactions',
    description: 'Déclenche le workflow lorsqu’une option de menu est sélectionnée',
    icon: Zap, color: 'indigo-600', required: false,
    inputs:  [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },
  modalSubmitHandler: {
    type: 'modalSubmitHandler', label: 'Modal Handler', category: 'interactions',
    description: 'Déclenche le workflow lorsqu’un formulaire modal est soumis',
    icon: Zap, color: 'indigo-600', required: false,
    inputs:  [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 1 — Beginner Essentials
  // ═══════════════════════════════════════════════════════════════════════════

  welcomeMessage: {
    type: 'welcomeMessage', label: 'Welcome', category: 'actions',
    description: 'Envoie automatiquement un message de bienvenue quand un membre rejoint le serveur',
    icon: PartyPopper, color: 'emerald', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  goodbyeMessage: {
    type: 'goodbyeMessage', label: 'Goodbye', category: 'actions',
    description: "Envoie un message d'au revoir quand un membre quitte le serveur",
    icon: DoorOpen, color: 'amber', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  autoRole: {
    type: 'autoRole', label: 'Auto Role', category: 'guild',
    description: 'Attribue automatiquement un ou plusieurs rôles aux nouveaux membres',
    icon: UserPlus, color: 'blue', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  ticketPanel: {
    type: 'ticketPanel', label: 'Ticket Panel', category: 'interactions',
    description: 'Envoie un embed avec bouton pour ouvrir un ticket (crée un salon privé)',
    icon: Ticket, color: 'sky', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  ticketClose: {
    type: 'ticketClose', label: 'Close Ticket', category: 'interactions',
    description: 'Ferme et supprime un ticket (canal) avec un transcript optionnel',
    icon: TicketX, color: 'rose', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  reactionRole: {
    type: 'reactionRole', label: 'Reaction Role', category: 'interactions',
    description: 'Attribue/retire un rôle quand un utilisateur réagit avec un emoji',
    icon: Heart, color: 'pink', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  logAction: {
    type: 'logAction', label: 'Log Action', category: 'actions',
    description: 'Envoie un log formaté (embed) dans un canal de logs',
    icon: ScrollText, color: 'slate', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  comment: {
    type: 'comment', label: 'Comment', category: 'logic',
    description: 'Note visuelle sur le canvas — aucune exécution, juste un mémo',
    icon: MessageCircle, color: 'yellow', required: false,
    inputs:  [],
    outputs: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 2 — Engagement
  // ═══════════════════════════════════════════════════════════════════════════

  xpGive: {
    type: 'xpGive', label: 'Give XP', category: 'actions',
    description: "Donne de l'XP à un utilisateur (stocké en base de données)",
    icon: Star, color: 'amber', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output',  label: 'Next', type: 'source' },
      { id: 'levelUp', label: 'Level Up!', type: 'source' },
      { id: 'error',   label: 'Erreur', type: 'source' },
    ],
  },

  xpCheck: {
    type: 'xpCheck', label: 'Check XP', category: 'actions',
    description: "Récupère l'XP et le niveau actuel d'un utilisateur",
    icon: Star, color: 'amber', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  levelCheck: {
    type: 'levelCheck', label: 'Level Check', category: 'actions',
    description: 'Vérifie si un utilisateur a atteint un certain niveau',
    icon: Trophy, color: 'amber', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'true',  label: 'Oui', type: 'source' },
      { id: 'false', label: 'Non', type: 'source' },
    ],
  },

  antiSpam: {
    type: 'antiSpam', label: 'Anti-Spam', category: 'mods',
    description: 'Détecte le spam (messages rapides, duplications) et applique une action',
    icon: ShieldBan, color: 'red', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'spam',    label: 'Spam détecté', type: 'source' },
      { id: 'clean',   label: 'OK', type: 'source' },
    ],
  },

  badWordFilter: {
    type: 'badWordFilter', label: 'Bad Word Filter', category: 'mods',
    description: 'Filtre les messages contenant des mots interdits et applique une action',
    icon: MessageSquareWarning, color: 'red', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'blocked', label: 'Bloqué', type: 'source' },
      { id: 'clean',   label: 'OK', type: 'source' },
    ],
  },

  createPoll: {
    type: 'createPoll', label: 'Create Poll', category: 'actions',
    description: 'Crée un sondage avec des réactions emoji comme options de vote',
    icon: BarChart3, color: 'indigo', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  scheduledTrigger: {
    type: 'scheduledTrigger', label: 'Scheduled Trigger', category: 'handlers',
    description: 'Déclenche le workflow à intervalle régulier (toutes les X minutes/heures)',
    icon: AlarmClock, color: 'indigo-600', required: false,
    inputs:  [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },

  cooldown: {
    type: 'cooldown', label: 'Cooldown', category: 'logic',
    description: "Bloque l'exécution si l'utilisateur est en cooldown",
    icon: Gauge, color: 'orange', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'ready',    label: 'Prêt', type: 'source' },
      { id: 'cooldown', label: 'En cooldown', type: 'source' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 3 — Differentiation
  // ═══════════════════════════════════════════════════════════════════════════

  economyGive: {
    type: 'economyGive', label: 'Give Currency', category: 'actions',
    description: "Ajoute de la monnaie virtuelle au portefeuille d'un utilisateur",
    icon: Coins, color: 'yellow', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  economyTake: {
    type: 'economyTake', label: 'Take Currency', category: 'actions',
    description: "Retire de la monnaie virtuelle du portefeuille d'un utilisateur",
    icon: Wallet, color: 'yellow', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output',       label: 'Next', type: 'source' },
      { id: 'insufficient', label: 'Insuffisant', type: 'source' },
      { id: 'error',        label: 'Erreur', type: 'source' },
    ],
  },

  economyBalance: {
    type: 'economyBalance', label: 'Check Balance', category: 'actions',
    description: "Récupère le solde d'un utilisateur et le stocke en variable",
    icon: Wallet, color: 'yellow', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  economyLeaderboard: {
    type: 'economyLeaderboard', label: 'Leaderboard', category: 'actions',
    description: 'Affiche le classement des utilisateurs les plus riches',
    icon: Trophy, color: 'yellow', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  giveawayCreate: {
    type: 'giveawayCreate', label: 'Create Giveaway', category: 'actions',
    description: 'Crée un giveaway avec durée, prix et nombre de gagnants',
    icon: Gift, color: 'pink', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  giveawayEnd: {
    type: 'giveawayEnd', label: 'End Giveaway', category: 'actions',
    description: 'Termine un giveaway et sélectionne les gagnants aléatoirement',
    icon: GiftIcon, color: 'pink', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  embedBuilder: {
    type: 'embedBuilder', label: 'Embed Builder', category: 'actions',
    description: 'Construit et envoie un embed Discord riche (titre, description, champs, couleur, image…)',
    icon: Palette, color: 'violet', required: false,
    inputs:  [{ id: 'input', label: 'In', type: 'target' }],
    outputs: [
      { id: 'output', label: 'Next', type: 'source' },
      { id: 'error',  label: 'Erreur', type: 'source' },
    ],
  },

  twitchLive: {
    type: 'twitchLive', label: 'Twitch Live', category: 'integrations',
    description: 'Déclenche quand un streamer Twitch passe en live (polling)',
    icon: Twitch, color: 'purple', required: false,
    inputs:  [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },

  youtubeNewVideo: {
    type: 'youtubeNewVideo', label: 'YouTube Video', category: 'integrations',
    description: 'Déclenche quand une nouvelle vidéo YouTube est publiée (RSS polling)',
    icon: Youtube, color: 'red', required: false,
    inputs:  [],
    outputs: [{ id: 'output', label: 'Trigger', type: 'source' }],
  },
};

// ─── Sidebar hierarchy ───────────────────────────────────────────────────────

export interface CategoryDef {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  iconCircle: string;
  types: NodeType[];
}

export const SIDEBAR_HIERARCHY: CategoryDef[] = [
  {
    id: 'handlers',
    label: 'Handlers',
    description: "Déclenchez votre workflow depuis une commande slash ou un événement Discord",
    icon: Terminal,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    iconCircle: 'bg-indigo-500/20',
    types: ['commandHandlerSuite', 'eventHandlerSuite', 'scheduledTrigger'],
  },
  {
    id: 'bot',
    label: 'Bot',
    description: "Gérer la présence, l'avatar et le surnom du bot",
    icon: Bot,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-400',
    iconCircle: 'bg-pink-500/20',
    types: ['setBotPresence', 'setBotNickname', 'setBotAvatar'],
  },
  {
    id: 'actions',
    label: 'Actions',
    description: "Envoyer, modifier ou supprimer des messages dans les salons",
    icon: Send,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-400',
    iconCircle: 'bg-blue-500/20',
    types: ['sendMessage', 'editMessage', 'deleteMessage', 'replyToMessage', 'welcomeMessage', 'goodbyeMessage', 'logAction', 'embedBuilder', 'xpGive', 'xpCheck', 'levelCheck', 'createPoll', 'giveawayCreate', 'giveawayEnd', 'economyGive', 'economyTake', 'economyBalance', 'economyLeaderboard'],
  },
  {
    id: 'users',
    label: 'Users',
    description: "Messages privés, informations et gestion des utilisateurs",
    icon: Users,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-500',
    iconCircle: 'bg-cyan-500/20',
    types: ['sendDM', 'fetchUserInfo'],
  },
  {
    id: 'interactions',
    label: 'Interactions',
    description: "Boutons, menus déroulants, modals et gestionnaires d'interactions",
    icon: MousePointerClick,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-500',
    iconCircle: 'bg-sky-500/20',
    types: [
      'buttonInteractionHandler', 'selectMenuInteractionHandler', 'modalSubmitHandler',
      'sendButtons', 'sendStringSelectMenu', 'sendUserSelectMenu', 'sendRoleSelectMenu',
      'sendChannelSelectMenu', 'sendModal', 'awaitButtonClick', 'awaitSelectMenu',
      'ticketPanel', 'ticketClose', 'reactionRole',
    ],
  },
  {
    id: 'guild',
    label: 'Guild',
    description: "Rôles, salons, fils, réactions, épingles et invitations",
    icon: Server,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
    iconCircle: 'bg-violet-500/20',
    types: [
      'addRole', 'removeRole', 'createRole',
      'createChannel', 'deleteChannel', 'editChannel',
      'createThread', 'archiveThread',
      'addReaction', 'pinMessage', 'unpinMessage', 'createInvite',
      'editGuild', 'editRole', 'deleteRole',
      'createEmoji', 'deleteEmoji', 'editEmoji',
      'createSticker', 'deleteSticker',
      'createEvent', 'editEvent', 'deleteEvent',
      'createGuildWebhook', 'deleteGuildWebhook', 'executeWebhook',
      'fetchAuditLog', 'fetchMembers',
      'autoRole',
    ],
  },
  {
    id: 'voice',
    label: 'Voice',
    description: "Salons vocaux, lecture audio et gestion des membres connectés",
    icon: Volume2,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    iconCircle: 'bg-orange-500/20',
    types: ['joinVoiceChannel', 'leaveVoiceChannel', 'playAudio', 'stopAudio', 'moveToVoice', 'disconnectFromVoice', 'serverMuteMember', 'serverDeafenMember'],
  },
  {
    id: 'mods',
    label: 'Modération',
    description: "Expulsion, bannissement, timeout et gestion des surnoms",
    icon: ShieldAlert,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    iconCircle: 'bg-red-500/20',
    types: ['kick', 'ban', 'unban', 'timeout', 'unmute', 'bulkDeleteMessages', 'setNickname', 'antiSpam', 'badWordFilter'],
  },
  {
    id: 'canvas',
    label: 'Canvas',
    description: "Générer des images et des cartes graphiques personnalisées",
    icon: Layers,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-400',
    iconCircle: 'bg-violet-500/20',
    types: ['canvasCard'],
  },
  {
    id: 'database',
    label: 'Database',
    description: "Lire et écrire dans une base de données SQL",
    icon: Database,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-500',
    iconCircle: 'bg-teal-500/20',
    types: ['sqlDatabase'],
  },
  {
    id: 'logic',
    label: 'Logic',
    description: "Conditions, boucles, variables, transformations, HTTP et webhooks",
    icon: GitBranch,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    iconCircle: 'bg-green-500/20',
    types: ['condition', 'delay', 'variable', 'forEach', 'switchCase', 'random', 'counter', 'filter', 'mathOperation', 'stringOperation', 'arrayOperation', 'jsonParse', 'jsonStringify', 'typeConvert', 'getDate', 'loopWhile', 'cooldown', 'comment', 'codeExec', 'httpRequest', 'webhook'],
  },
  {
    id: 'core',
    label: 'Core Bot',
    description: "Nœud racine du workflow — configurez votre bot Discord",
    icon: Bot,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-400',
    iconCircle: 'bg-slate-500/20',
    types: ['coreBot'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Twitch, YouTube et services tiers',
    icon: Globe,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
    iconCircle: 'bg-purple-500/20',
    types: ['twitchLive', 'youtubeNewVideo'],
  },
];

