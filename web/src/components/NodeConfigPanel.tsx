import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Bot, Info, CornerDownLeft, Hash, Database, ChevronDown, ChevronRight, Zap, ExternalLink, RefreshCw, Eye, EyeOff, FileCode, Image, FileText } from 'lucide-react';
import type { Node, Edge } from 'reactflow';
import type { NodeData, CommandHandlerConfig, CommandParameter, EventHandlerConfig } from '../constants/nodeTypes';
import { NODE_TYPES } from '../constants/nodeTypes';
import { botAPI } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKeys } from '../i18n';

// --- Constants ----------------------------------------------------------------

const DISCORD_EVENT_GROUPS = [
  { group: 'Core',     events: ['ready', 'interactionCreate'] },
  { group: 'Messages', events: ['messageCreate', 'messageUpdate', 'messageDelete', 'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove', 'messageReactionRemoveAll', 'typingStart'] },
  { group: 'Guild',    events: ['guildCreate', 'guildDelete', 'guildUpdate', 'guildBanAdd', 'guildBanRemove', 'guildEmojisUpdate'] },
  { group: 'Members',  events: ['guildMemberAdd', 'guildMemberRemove', 'guildMemberUpdate', 'userUpdate', 'presenceUpdate'] },
  { group: 'Channels', events: ['channelCreate', 'channelDelete', 'channelUpdate', 'threadCreate', 'threadDelete', 'threadUpdate'] },
  { group: 'Roles',    events: ['roleCreate', 'roleDelete', 'roleUpdate'] },
  { group: 'Voice',    events: ['voiceStateUpdate'] },
  { group: 'Invites',  events: ['inviteCreate', 'inviteDelete'] },
];

const DISCORD_PERMISSIONS = [
  'Administrator', 'BanMembers', 'KickMembers', 'ManageChannels',
  'ManageGuild', 'ManageMessages', 'ManageNicknames', 'ManageRoles',
  'ManageThreads', 'ManageWebhooks', 'ManageEvents', 'ModerateMembers',
  'MentionEveryone', 'MoveMembers', 'MuteMembers', 'DeafenMembers',
  'ReadMessageHistory', 'SendMessages', 'ViewChannel', 'ViewAuditLog',
  'UseApplicationCommands', 'AttachFiles', 'EmbedLinks', 'AddReactions',
  'Connect', 'Speak', 'CreatePublicThreads', 'CreatePrivateThreads',
];

const PARAM_TYPES = [
  { value: 'string',      label: 'String' },
  { value: 'integer',     label: 'Integer' },
  { value: 'number',      label: 'Number' },
  { value: 'boolean',     label: 'Boolean' },
  { value: 'user',        label: 'User' },
  { value: 'role',        label: 'Role' },
  { value: 'channel',     label: 'Channel' },
  { value: 'mentionable', label: 'Mentionable' },
  { value: 'attachment',  label: 'Attachment' },
] as const;

// --- Defaults -----------------------------------------------------------------

function sanitizeCmdConfig(raw: unknown): CommandHandlerConfig {
  const d = defaultCmdConfig();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, any>;
  return {
    commandName:        typeof r.commandName === 'string'   ? r.commandName        : d.commandName,
    description:        typeof r.description === 'string'   ? r.description        : d.description,
    parameters:         Array.isArray(r.parameters)         ? r.parameters         : d.parameters,
    permissionType:     ['discord','role','everyone'].includes(r.permissionType) ? r.permissionType : d.permissionType,
    discordPermissions: Array.isArray(r.discordPermissions) ? r.discordPermissions : d.discordPermissions,
    customRoles:        Array.isArray(r.customRoles)        ? r.customRoles        : d.customRoles,
  };
}

const defaultCmdConfig = (): CommandHandlerConfig => ({
  commandName: '',
  description: '',
  parameters: [],
  permissionType: 'discord',
  discordPermissions: [],
  customRoles: [],
});

const defaultEvtConfig = (): EventHandlerConfig => ({
  eventName: 'messageCreate',
  executeOnce: false,
});

function makeParam(): CommandParameter {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    type: 'string',
    description: '',
    required: false,
  };
}

// --- UI helpers ---------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold text-[var(--t-m)] uppercase tracking-wider mt-5 mb-2 first:mt-0">
      {children}
    </h3>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full px-3 py-2 bg-[var(--t-bg)] border border-[var(--t-bd)] rounded-lg text-sm text-[var(--t-tx)] outline-none focus:ring-1 focus:ring-[var(--t-a)] focus:border-[var(--t-a)] placeholder:text-[var(--t-m)] ${className}`}
    />
  );
}

function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      rows={3}
      {...rest}
      className={`w-full px-3 py-2 bg-[var(--t-bg)] border border-[var(--t-bd)] rounded-lg text-sm text-[var(--t-tx)] outline-none focus:ring-1 focus:ring-[var(--t-a)] focus:border-[var(--t-a)] resize-none placeholder:text-[var(--t-m)] ${className}`}
    />
  );
}

function Toggle({ checked, onChange, label, hint }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-center justify-between p-3 bg-[var(--t-bg)] rounded-xl cursor-pointer hover:bg-[var(--t-bd)] transition border border-[var(--t-bd)] select-none">
      <div>
        <p className="text-sm font-medium text-[var(--t-tx)]">{label}</p>
        {hint && <p className="text-xs text-[var(--t-sub)] mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-[var(--t-a)]' : 'bg-[var(--t-bd)]'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

// --- Channel source picker ---------------------------------------------------

type ChannelSourceMode = 'current' | 'custom';
type ChannelCustomMode = 'id' | 'db';

function ChannelPicker({ config, setField, botId }: {
  config: Record<string, any>;
  setField: (k: string, v: unknown) => void;
  botId?: number;
}) {
  const { t } = useTranslation();
  const mode       = (config.channelSourceMode ?? 'current') as ChannelSourceMode;
  const customMode = (config.channelCustomMode ?? 'id')      as ChannelCustomMode;

  // DB builder state
  const [tables,      setTables]      = useState<string[]>([]);
  const [columns,     setColumns]     = useState<string[]>([]);
  const [loadingTbl,  setLoadingTbl]  = useState(false);
  const [loadingCols, setLoadingCols] = useState(false);
  const [dbErr,       setDbErr]       = useState<'no_bot' | 'unavailable' | null>(null);

  const dbTable = (config.channelDbTable ?? '') as string;

  const loadTables = () => {
    if (!botId) { setDbErr('no_bot'); return; }
    setLoadingTbl(true); setDbErr(null);
    botAPI.dbListTables(botId)
      .then(ts => setTables(ts.map((t: any) => t.name)))
      .catch(() => setDbErr('unavailable'))
      .finally(() => setLoadingTbl(false));
  };

  useEffect(() => {
    if (customMode === 'db' && mode === 'custom') loadTables();
  }, [customMode, mode, botId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!botId || !dbTable) { setColumns([]); return; }
    setLoadingCols(true);
    botAPI.dbTableStructure(botId, dbTable)
      .then((s: any) => setColumns((s.columns ?? []).map((c: any) => c.Field ?? c.name).filter(Boolean)))
      .catch(() => setColumns([]))
      .finally(() => setLoadingCols(false));
  }, [botId, dbTable]); // eslint-disable-line react-hooks/exhaustive-deps

  const modeOptions = [
    { id: 'current' as const, icon: CornerDownLeft, title: t.nodeConfig.currentChannel,  hint: t.nodeConfig.currentChannel },
    { id: 'custom'  as const, icon: Hash,           title: t.nodeConfig.custom,  hint: t.nodeConfig.fromDatabase },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {modeOptions.map(({ id, icon: Icon, title, hint }) => (
          <button
            key={id}
            type="button"
            onClick={() => setField('channelSourceMode', id)}
            className={`p-3 rounded-xl border-2 text-left transition space-y-1 ${
              mode === id ? 'border-[var(--t-a)] bg-[var(--t-aa)]' : 'border-[var(--t-bd)] hover:border-[var(--t-s3)] bg-[var(--t-s2)]'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${mode === id ? 'text-[var(--t-a)]' : 'text-[var(--t-m)]'}`} />
            <p className={`text-xs font-semibold ${mode === id ? 'text-[var(--t-a)]' : 'text-[var(--t-tx)]'}`}>{title}</p>
            <p className="text-xs text-[var(--t-m)] leading-tight">{hint}</p>
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="space-y-3">
          {/* Sub-mode switcher */}
          <div className="flex gap-1 bg-[var(--t-s2)] rounded-lg p-1">
            {([{ id: 'id' as const, label: t.nodeConfig.directId }, { id: 'db' as const, label: t.nodeConfig.fromDatabase }]).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setField('channelCustomMode', id)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                  customMode === id ? 'bg-[var(--t-s)] text-[var(--t-a)] shadow-sm' : 'text-[var(--t-m)] hover:text-[var(--t-tx)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {customMode === 'id' && (
            <div>
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.channelIdRequired} <span className="text-red-500">*</span></label>
              <FieldInput
                placeholder="e.g. 123456789012345678"
                value={(config.channelId ?? '') as string}
                onChange={e => setField('channelId', e.target.value)}
              />
              <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.directId} <code className="bg-[var(--t-s2)] px-1 rounded">{'{channel.id}'}</code></p>
            </div>
          )}

          {customMode === 'db' && (
            <div className="space-y-3 bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[var(--t-a)]" />
                  <p className="text-xs font-semibold text-[var(--t-a)]">{t.nodeConfig.fetchChannelIdFromDb}</p>
                </div>
                <button type="button" onClick={loadTables}
                  className="p-1 text-[var(--t-m)] hover:text-[var(--t-a)] transition" title={t.nodeConfig.refreshBtn}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Error states */}
              {dbErr === 'no_bot' && <p className="text-xs text-[var(--t-sub)]">{t.nodeConfig.noBotAssociated}</p>}
              {dbErr === 'unavailable' && <p className="text-xs text-red-600">{t.nodeConfig.dbInaccessible} <button type="button" className="underline" onClick={loadTables}>{t.nodeConfig.retryBtn}</button></p>}

              {/* Table selector */}
              {!dbErr && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--t-sub)] mb-1">{t.nodeConfig.table}</label>
                    <div className="flex gap-2">
                      <select
                        value={dbTable}
                        onChange={e => { setField('channelDbTable', e.target.value); setField('channelDbColumn', ''); }}
                        className="flex-1 px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
                      >
                        <option value="">— {t.nodeConfig.selectTable} —</option>
                        {tables.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {loadingTbl && <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.loadingColumns}</p>}
                  </div>

                  {dbTable && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--t-sub)] mb-1">{t.nodeConfig.columnChannelId}</label>
                      {loadingCols ? (
                        <p className="text-xs text-[var(--t-m)]">{t.nodeConfig.loadingColumns}</p>
                      ) : columns.length > 0 ? (
                        <select
                          value={(config.channelDbColumn ?? '') as string}
                          onChange={e => setField('channelDbColumn', e.target.value)}
                          className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
                        >
                          <option value="">— {t.nodeConfig.selectColumn} —</option>
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <FieldInput
                          placeholder="channel_id"
                          value={(config.channelDbColumn ?? '') as string}
                          onChange={e => setField('channelDbColumn', e.target.value)}
                        />
                      )}
                    </div>
                  )}

                  {dbTable && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--t-sub)] mb-1">{t.nodeConfig.whereConditions} <span className="text-[var(--t-m)] font-normal">({t.nodeConfig.optionalLabel})</span></label>
                      <WhereBuilder
                        columns={columns}
                        clause={config.channelDbWhere ?? emptyWhereClause()}
                        onChange={c => setField('channelDbWhere', c)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Voice channel picker --------------------------------------------------

function VoiceChannelPicker({ config, setField, fieldKey = 'voiceChannelId', modeKey = 'voiceChannelMode', label }: {
  config:   Record<string, any>;
  setField: (k: string, v: unknown) => void;
  fieldKey?: string;
  modeKey?:  string;
  label?:    string;
}) {
  const { t } = useTranslation();
  const mode = (config[modeKey] ?? 'user') as 'user' | 'custom';
  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-[var(--t-tx)]">{label}</p>
      <div className="flex rounded-xl border border-[var(--t-bd)] overflow-hidden text-xs font-semibold">
        <button
          type="button"
          onClick={() => setField(modeKey, 'user')}
          className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition ${
            mode === 'user'
              ? 'bg-[var(--t-a)] text-[var(--t-btn-text)]'
              : 'bg-[var(--t-s2)] text-[var(--t-sub)] hover:bg-[var(--t-s)]'
          }`}
        >
          {t.nodeConfig.userChannel}
        </button>
        <button
          type="button"
          onClick={() => setField(modeKey, 'custom')}
          className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition border-l border-[var(--t-bd)] ${
            mode === 'custom'
              ? 'bg-[var(--t-a)] text-[var(--t-btn-text)]'
              : 'bg-[var(--t-s2)] text-[var(--t-sub)] hover:bg-[var(--t-s)]'
          }`}
        >
          {t.nodeConfig.idVariable}
        </button>
      </div>
      {mode === 'user' ? (
        <div className="flex gap-2 rounded-xl p-3 text-xs border" style={{ background: 'var(--t-aa)', color: 'var(--t-a)', borderColor: 'var(--t-bd)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--t-a)]" />
          <span>{t.nodeConfig.autoVoiceHint}</span>
        </div>
      ) : (
        <FieldInput
          placeholder={t.nodeConfig.idVariable}
          value={(config[fieldKey] ?? '') as string}
          onChange={e => setField(fieldKey, e.target.value)}
        />
      )}
    </div>
  );
}

// --- Variable system ---------------------------------------------------------

const CONTEXT_VARS: Array<{ token: string; label: string }> = [
  { token: '{user.id}',        label: 'User ID' },
  { token: '{user.username}',  label: 'Username' },
  { token: '{user.tag}',       label: 'User Tag' },
  { token: '{guild.id}',       label: 'Guild ID' },
  { token: '{guild.name}',     label: 'Guild Name' },
  { token: '{channel.id}',     label: 'Channel ID' },
  { token: '{channel.name}',   label: 'Channel Name' },
  { token: '{bot.id}',         label: 'Bot ID' },
  { token: '{bot.username}',   label: 'Bot Username' },
];

type VarEntry = { token: string; label: string };
type UpstreamGroup = { nodeId: string; label: string; vars: VarEntry[]; nodeType: string; color: string; hasSnapshot: boolean };

const NODE_ICON_COLORS: Record<string, string> = {
  blue: '#4a9eff', purple: '#a855f7', green: '#22c55e', orange: '#e8643a',
  teal: '#2dd4bf', rose: '#fb7185', 'indigo-600': '#818cf8', 'amber-600': '#fbbf24',
  violet: '#8b5cf6', pink: '#ec4899', sky: '#38bdf8',
};

/** Recursively flatten a snapshot object into draggable token entries. */
function flattenSnapshotVars(obj: any, prefix: string, out: VarEntry[], depth = 0): void {
  if (depth > 3 || out.length >= 60 || typeof obj !== 'object' || obj === null) return;
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    const token = `{${path}}`;
    if (Array.isArray(v)) {
      out.push({ token, label: `${path} (array[${(v as any[]).length}])` });
    } else if (typeof v === 'object' && v !== null) {
      out.push({ token, label: path });
      flattenSnapshotVars(v, path, out, depth + 1);
    } else {
      out.push({ token, label: `${path} = ${String(v).slice(0, 40)}` });
    }
  }
}

function buildUpstreamGroups(
  nodeId: string,
  nodes: Node<NodeData>[],
  edges: Edge[],
  allExecData: Record<string, { snapshot?: Record<string, any>; nextHandle?: string; error?: string; ts: number }> = {},
): UpstreamGroup[] {
  // BFS backward through edges to find all upstream nodes in order
  const visited = new Set<string>();
  const order: string[] = [];
  const queue = [nodeId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const e of edges) {
      if (e.target === cur && !visited.has(e.source)) {
        visited.add(e.source);
        order.push(e.source);
        queue.push(e.source);
      }
    }
  }
  const groups: UpstreamGroup[] = [];
  for (const id of order) {
    const n = nodes.find(x => x.id === id);
    if (!n) continue;
    const exec = allExecData[id];
    const hasSnapshot = !!(exec?.snapshot && Object.keys(exec.snapshot).length > 0);
    const vars: VarEntry[] = [];
    const color = n.data.color || 'blue';
    if (n.data.type === 'commandHandlerSuite') {
      const params = (n.data.config as CommandHandlerConfig)?.parameters ?? [];
      const cmdName = (n.data.config as CommandHandlerConfig)?.commandName || 'cmd';
      params.filter(p => p.name).forEach(p =>
        vars.push({ token: `{args.${p.name}}`, label: `${p.name} (${p.type})` }),
      );
      if (hasSnapshot) flattenSnapshotVars(exec!.snapshot!, '', vars);
      else CONTEXT_VARS.forEach(v => vars.push(v));
      groups.push({ nodeId: id, label: `/${cmdName}`, vars, nodeType: n.data.type, color, hasSnapshot });
    } else if (n.data.type === 'eventHandlerSuite') {
      const evtName = (n.data.config as EventHandlerConfig)?.eventName || 'event';
      if (hasSnapshot) flattenSnapshotVars(exec!.snapshot!, '', vars);
      else CONTEXT_VARS.forEach(v => vars.push(v));
      groups.push({ nodeId: id, label: `on:${evtName}`, vars, nodeType: n.data.type, color, hasSnapshot });
    } else if (n.data.type === 'variable' && (n.data.config as any)?.name) {
      vars.push({ token: `{variable.${(n.data.config as any).name}}`, label: (n.data.config as any).name });
      if (hasSnapshot) flattenSnapshotVars(exec!.snapshot!, '', vars);
      groups.push({ nodeId: id, label: n.data.label, vars, nodeType: n.data.type, color, hasSnapshot });
    } else {
      if (hasSnapshot) flattenSnapshotVars(exec!.snapshot!, '', vars);
      groups.push({ nodeId: id, label: n.data.label, vars, nodeType: n.data.type, color, hasSnapshot });
    }
  }
  return groups;
}

/** Insert token at the cursor position of `el` (defaults to document.activeElement). */
function insertToken(token: string, el?: HTMLInputElement | HTMLTextAreaElement | null) {
  const target = el ?? (document.activeElement as HTMLInputElement | HTMLTextAreaElement | null);
  const tag = target?.tagName?.toLowerCase();
  if (!target || (tag !== 'input' && tag !== 'textarea')) return;
  const start = target.selectionStart ?? target.value.length;
  const end   = target.selectionEnd   ?? target.value.length;
  const newVal = target.value.slice(0, start) + token + target.value.slice(end);
  const proto  = tag === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(target, newVal);
  target.dispatchEvent(new Event('input', { bubbles: true }));
  const pos = start + token.length;
  requestAnimationFrame(() => target.setSelectionRange(pos, pos));
}

/** A draggable & clickable variable badge. */
function DraggableVar({ token, label }: VarEntry) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', token);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onMouseDown={e => { e.preventDefault(); insertToken(token); }}
      title={token}
      className="cursor-grab active:cursor-grabbing bg-[var(--t-bg)] hover:bg-[var(--t-bd)] border border-[var(--t-bd)] hover:border-[var(--t-a)] rounded-lg px-2 py-1.5 select-none transition"
    >
      <span className="font-mono text-[10px] text-[var(--t-a)] leading-tight block truncate">{token}</span>
      <span className="text-[10px] text-[var(--t-sub)] leading-tight block truncate">{label}</span>
    </div>
  );
}

/** Simple collapsible JSON tree for the output panel. */
function JsonNode({ data, depth = 0 }: { data: any; depth?: number }): React.ReactNode {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(depth > 1);
  if (data === null || data === undefined) return <span className="text-[var(--t-sub)]">{String(data)}</span>;
  if (typeof data === 'boolean') return <span className="text-amber-400">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-[var(--t-a)]">{data}</span>;
  if (typeof data === 'string') {
    const s = data.length > 80 ? data.slice(0, 80) + '…' : data;
    return <span className="text-emerald-400">"{s}"</span>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-[var(--t-sub)]">[]</span>;
    return (
      <span>
        <button type="button" onClick={() => setCollapsed(c => !c)} className="text-[var(--t-sub)] hover:text-[var(--t-tx)] transition">
          {collapsed ? <span className="text-[var(--t-m)]">[<span className="text-[var(--t-sub)]">{data.length}</span>]</span> : '['}
        </button>
        {!collapsed && (
          <>
            {data.slice(0, 20).map((item, i) => (
              <div key={i} style={{ paddingLeft: 14 }}>
                <span className="text-[var(--t-m)]">{i}: </span>
                <JsonNode data={item} depth={depth + 1} />
              </div>
            ))}
            {data.length > 20 && <div style={{ paddingLeft: 14 }} className="text-[var(--t-m)] italic">…{data.length - 20} {t.nodeConfig.moreItems}</div>}
            <span className="text-[var(--t-sub)]">]</span>
          </>
        )}
      </span>
    );
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-[var(--t-sub)]">{'{}'}</span>;
    return (
      <span>
        <button type="button" onClick={() => setCollapsed(c => !c)} className="text-[var(--t-sub)] hover:text-[var(--t-tx)] transition">
          {collapsed ? <span className="text-[var(--t-m)]">{'{'}…<span className="text-[var(--t-sub)]">{keys.length}</span>{'}'}</span> : '{'}
        </button>
        {!collapsed && (
          <>
            {keys.slice(0, 30).map(k => (
              <div key={k} style={{ paddingLeft: 14 }}>
                <span className="text-blue-300">{k}</span>
                <span className="text-[var(--t-m)]">: </span>
                <JsonNode data={data[k]} depth={depth + 1} />
              </div>
            ))}
            {keys.length > 30 && <div style={{ paddingLeft: 14 }} className="text-[var(--t-m)] italic">…{keys.length - 30} {t.nodeConfig.moreKeys}</div>}
            <span className="text-[var(--t-sub)]">{'}'}</span>
          </>
        )}
      </span>
    );
  }
  return <span className="text-[var(--t-tx)]">{String(data)}</span>;
}

function JsonTreeView({ data }: { data: Record<string, any> }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--t-bd)', background: 'var(--t-bg)' }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid var(--t-bd)', background: 'var(--t-bg)' }}>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.outputJson}</span>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] transition" style={{ color: copied ? '#22c55e' : 'var(--t-m)' }}
        >
          {copied ? '?' : '??'}
        </button>
      </div>
      <div className="px-3 py-2 font-mono text-[10px] leading-relaxed overflow-y-auto" style={{ maxHeight: 220 }}>
        <JsonNode data={data} depth={0} />
      </div>
    </div>
  );
}

/** Left sidebar: upstream node variables, with node tabs. */
function UpstreamVarsPanel({ nodeId, nodes, edges, allExecData = {} }: {
  nodeId: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  allExecData?: Record<string, { snapshot?: Record<string, any>; nextHandle?: string; error?: string; ts: number }>;
}) {
  const { t } = useTranslation();
  const groups = buildUpstreamGroups(nodeId, nodes, edges, allExecData);
  const [activeGroupTab, setActiveGroupTab] = useState(0);
  const safeTab = Math.min(activeGroupTab, Math.max(0, groups.length - 1));
  const active = groups[safeTab];

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--t-m)] py-8 px-3 text-center">
        <span className="text-3xl">?|</span>
        <p className="text-xs leading-snug">{t.nodeConfig.noInputData}</p>
        <p className="text-[10px] opacity-60 leading-snug">{t.nodeConfig.connectUpstream}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Node tabs */}
      <div className="flex flex-col gap-0.5 px-2 py-1.5 shrink-0 border-b border-[var(--t-bd)] overflow-y-auto" style={{ maxHeight: 160 }}>
        {groups.map((g, i) => {
          const nodeRef = nodes.find(n => n.id === g.nodeId);
          const NodeTypeIcon = nodeRef?.data?.icon as React.ElementType | undefined;
          const iconColor = NODE_ICON_COLORS[g.color] ?? 'var(--t-sub)';
          return (
            <button
              key={g.nodeId}
              type="button"
              onClick={() => setActiveGroupTab(i)}
              className={`text-left px-2 py-1.5 rounded flex items-center gap-2 transition ${
                safeTab === i
                  ? 'bg-[var(--t-aa)] text-[var(--t-a)]'
                  : 'text-[var(--t-sub)] hover:bg-[var(--t-s2)] hover:text-[var(--t-tx)]'
              }`}
            >
              {NodeTypeIcon
                ? <NodeTypeIcon style={{ width: 12, height: 12, color: iconColor, flexShrink: 0 }} strokeWidth={1.5} />
                : <span className="w-2 h-2 rounded-full shrink-0" style={{ background: iconColor }} />}
              <span className="text-[10px] font-medium truncate flex-1">{g.label}</span>
              {g.hasSnapshot
                ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title={t.nodeConfig.availableData} />
                : <span className="w-1.5 h-1.5 rounded-full bg-[var(--t-bd)] shrink-0" title={t.nodeConfig.notExecutedYet} />}
            </button>
          );
        })}
      </div>

      {/* Vars / empty state */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {!active ? null :
          active.vars.length === 0 ? (
            <div className="px-1 pt-2 text-center">
              <p className="text-[10px] text-[var(--t-m)] italic leading-snug">
                {active.hasSnapshot ? t.nodeConfig.noFieldsAvailable : t.nodeConfig.executeWorkflow}
              </p>
            </div>
          ) : (
            active.vars.map(v => <DraggableVar key={v.token} token={v.token} label={v.label} />)
          )}
      </div>
    </div>
  );
}

/** Small "?" button that reveals common Discord context variables (draggable). */
function ContextVarsButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // Close on outside click
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={t.nodeConfig.discordCommonVars}
        className="inline-flex items-center gap-1 text-[11px] text-[var(--t-sub)] hover:text-[var(--t-a)] border border-[var(--t-bd)] hover:border-[var(--t-a)] rounded-full px-2.5 py-0.5 transition bg-[var(--t-s2)]"
      >
        <Zap className="w-3 h-3 text-[var(--t-a)]" strokeWidth={2} />
        {t.nodeConfig.context}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-xl shadow-2xl p-3 w-52">
          <p className="text-[10px] font-bold text-[var(--t-m)] uppercase tracking-wider mb-2">{t.nodeConfig.discordCommonVars}</p>
          <p className="text-[10px] text-[var(--t-m)] mb-2">{t.nodeConfig.dragOrClickVar}</p>
          <div className="space-y-1">
            {CONTEXT_VARS.map(v => {
              const ctxLabels: Record<string, string> = { 'User ID': t.nodeConfig.ctxUserId, 'Username': t.nodeConfig.ctxUsername, 'User Tag': t.nodeConfig.ctxUserTag, 'Guild ID': t.nodeConfig.ctxGuildId, 'Guild Name': t.nodeConfig.ctxGuildName, 'Channel ID': t.nodeConfig.ctxChannelId, 'Channel Name': t.nodeConfig.ctxChannelName, 'Bot ID': t.nodeConfig.ctxBotId, 'Bot Username': t.nodeConfig.ctxBotUsername };
              return <DraggableVar key={v.token} token={v.token} label={ctxLabels[v.label] ?? v.label} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Discord Markdown renderer (subset) --------------------------------------

function applyInlineMd(text: string, kp = ''): React.ReactNode {
  const parts: Array<{ key: string; node: React.ReactNode }> = [];
  const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|~~(.+?)~~|`([^`]+?)`)/gs;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ key: `${kp}t${last}`, node: text.slice(last, m.index) });
    const k = `${kp}m${m.index}`;
    if      (m[2]) parts.push({ key: k, node: <strong><em>{m[2]}</em></strong> });
    else if (m[3]) parts.push({ key: k, node: <strong>{m[3]}</strong> });
    else if (m[4]) parts.push({ key: k, node: <em>{m[4]}</em> });
    else if (m[5]) parts.push({ key: k, node: <u>{m[5]}</u> });
    else if (m[6]) parts.push({ key: k, node: <del>{m[6]}</del> });
    else if (m[7]) parts.push({ key: k, node: <code className="bg-black/20 rounded px-0.5 font-mono text-[0.85em]">{m[7]}</code> });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ key: `${kp}t${last}`, node: text.slice(last) });
  if (parts.length === 0) return text;
  if (parts.length === 1) return parts[0].node;
  return <>{parts.map(p => <React.Fragment key={p.key}>{p.node}</React.Fragment>)}</>;
}

function renderDiscordMd(text: string): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      nodes.push(<pre key={`cb${i}`} className="rounded p-2 text-xs font-mono overflow-x-auto my-1 whitespace-pre-wrap" style={{ background: 'var(--t-bg)', color: 'var(--t-sub)' }}>{codeLines.join('\n')}</pre>);
    } else if (line.startsWith('> ')) {
      nodes.push(
        <div key={`bq${i}`} className="flex gap-2 my-0.5 opacity-80">
          <div className="w-1 bg-[var(--t-m)] rounded-full shrink-0" />
          <span>{applyInlineMd(line.slice(2), `bq${i}`)}</span>
        </div>
      );
    } else {
      nodes.push(<div key={`l${i}`}>{line ? applyInlineMd(line, `l${i}`) : <br />}</div>);
    }
    i++;
  }
  return <>{nodes}</>;
}

/** Dark-themed textarea with Edit / Preview toggle — for use inside the dark config panel. */
function DarkMarkdownTextarea({ value, onChange, placeholder, rows = 5 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--t-bd)' }}>
      <div className="flex items-center justify-between px-2" style={{ background: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}>
        <div className="flex">
          <button type="button" onClick={() => setPreview(false)}
            className="px-3 py-1.5 text-xs font-medium transition"
            style={{ color: !preview ? 'var(--t-a)' : 'var(--t-m)', borderBottom: !preview ? '2px solid var(--t-a)' : '2px solid transparent' }}>
            {t.nodeConfig.edit}
          </button>
          <button type="button" onClick={() => setPreview(true)}
            className="px-3 py-1.5 text-xs font-medium transition flex items-center gap-1"
            style={{ color: preview ? 'var(--t-a)' : 'var(--t-m)', borderBottom: preview ? '2px solid var(--t-a)' : '2px solid transparent' }}>
            <Eye className="w-3 h-3" /> {t.nodeConfig.preview}
          </button>
        </div>
        <span className="text-[10px] pr-1" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.markdown}</span>
      </div>
      {!preview ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm outline-none resize-y"
          style={{ background: 'var(--t-s2)', color: 'var(--t-tx)' }}
        />
      ) : (
        <div className="px-3 py-2 text-sm leading-relaxed" style={{ background: 'var(--t-s2)', color: 'var(--t-tx)', minHeight: 60 }}>
          {value ? renderDiscordMd(value) : <span style={{ color: 'var(--t-m)', fontStyle: 'italic' }}>{placeholder}</span>}
        </div>
      )}
    </div>
  );
}

/** Textarea with an Edit / Preview toggle. Preview renders Discord-flavored markdown. */
function MarkdownTextarea({ value, onChange, placeholder, rows = 4 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(false);
  return (
    <div className="border border-[var(--t-bd)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--t-a)]">
      <div className="flex items-center justify-between bg-[var(--t-s2)] border-b border-[var(--t-bd)] px-1.5">
        <div className="flex">
          <button type="button" onClick={() => setPreview(false)}
            className={`px-3 py-1.5 text-xs font-medium transition ${!preview ? 'text-[var(--t-a)] border-b-2 border-[var(--t-a)]' : 'text-[var(--t-m)] hover:text-[var(--t-tx)]'}`}>
            {t.nodeConfig.edit}
          </button>
          <button type="button" onClick={() => setPreview(true)}
            className={`px-3 py-1.5 text-xs font-medium transition flex items-center gap-1 ${preview ? 'text-[var(--t-a)] border-b-2 border-[var(--t-a)]' : 'text-[var(--t-m)] hover:text-[var(--t-tx)]'}`}>
            <Eye className="w-3 h-3" /> {t.nodeConfig.preview}
          </button>
        </div>
        <span className="text-[10px] text-[var(--t-m)] pr-1">{t.nodeConfig.markdownDiscord}</span>
      </div>
      {!preview ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm outline-none resize-y bg-[var(--t-s)] text-[var(--t-tx)]"
        />
      ) : (
        <div className="px-3 py-2 min-h-[80px] text-sm text-[var(--t-tx)] bg-[var(--t-s)] leading-relaxed">
          {value ? renderDiscordMd(value) : <span className="text-[var(--t-m)] italic">{placeholder}</span>}
        </div>
      )}
    </div>
  );
}

/** Live Discord-style embed preview */
function DiscordEmbedPreview({ config }: { config: Record<string, any> }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const color      = (config.color || '#5865F2') as string;
  const title      = (config.title || '') as string;
  const desc       = (config.description || '') as string;
  const authorName = (config.authorName || '') as string;
  const authorIcon = (config.authorIconUrl || '') as string;
  const footer     = (config.footerText || '') as string;
  const imageUrl   = (config.imageUrl || '') as string;
  const thumbUrl   = (config.thumbnailUrl || '') as string;
  const fields: EmbedField[] = config.fields ?? [];
  const hasContent = !!(title || desc || authorName || footer || imageUrl || thumbUrl || fields.some(f => f.name || f.value));

  return (
    <div className="border border-[var(--t-bd)] rounded-xl overflow-hidden">
      <button type="button" onClick={() => setVisible(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[var(--t-s2)] hover:bg-[var(--t-s)] transition text-xs font-semibold text-[var(--t-sub)]">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> {t.nodeConfig.discordPreview}
        </span>
        {visible ? <EyeOff className="w-3.5 h-3.5 text-[var(--t-m)]" /> : <Eye className="w-3.5 h-3.5 text-[var(--t-m)]" />}
      </button>
      {visible && (
        <div className="bg-[#313338] p-3">
          {!hasContent ? (
            <p className="text-xs text-[var(--t-m)] italic text-center py-4">{t.nodeConfig.fillFieldsPreview}</p>
          ) : (
            <div className="bg-[#2b2d31] rounded-lg overflow-hidden">
              <div className="flex" style={{ borderLeft: `4px solid ${color}` }}>
                <div className="flex-1 px-3 py-2.5 min-w-0">
                  {authorName && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {authorIcon && <img src={authorIcon} alt="" className="w-4 h-4 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
                      <span className="text-xs font-semibold text-[#dbdee1]">{authorName}</span>
                    </div>
                  )}
                  {title && <div className="font-bold text-sm text-white mb-1">{title}</div>}
                  {desc && <div className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed mb-2">{renderDiscordMd(desc)}</div>}
                  {fields.length > 0 && (
                    <div className="grid gap-x-4 gap-y-2 mb-2" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                      {fields.filter(f => f.name || f.value).map((f, idx) => (
                        <div key={idx} style={{ gridColumn: f.inline ? 'span 1' : 'span 3' }}>
                          {f.name && <p className="text-xs font-bold text-white mb-0.5">{f.name}</p>}
                          {f.value && <p className="text-xs text-[#dbdee1] whitespace-pre-wrap">{renderDiscordMd(f.value)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {imageUrl && <img src={imageUrl} alt="" className="w-full rounded-lg object-cover max-h-48 mb-2" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
                  {footer && <div className="text-[10px] text-[#87898c]">{footer}</div>}
                </div>
                {thumbUrl && (
                  <div className="shrink-0 p-2.5">
                    <img src={thumbUrl} alt="" className="w-16 h-16 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Node.js code execution panel */
function CodeNodePanel({ config, setField }: { config: Record<string, any>; setField: (k: string, v: unknown) => void }) {
  const { t } = useTranslation();
  const code      = (config.code ?? '') as string;
  const resultVar = (config.resultVar ?? '') as string;
  const note      = (config.note ?? '') as string;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1.5">
          {t.nodeConfig.noteOptional}
        </label>
        <MarkdownTextarea
          value={note}
          onChange={v => setField('note', v)}
          placeholder={t.nodeConfig.noteDesc}
          rows={3}
        />
      </div>

      <SectionTitle>{t.nodeConfig.codeNodeJs}</SectionTitle>
      <p className="text-xs text-[var(--t-m)] -mt-2">
        {t.nodeConfig.codeCtxPrefix} <code className="bg-[var(--t-s2)] px-1 rounded text-[var(--t-sub)]">ctx</code> {t.nodeConfig.codeCtxContains} <code className="bg-[var(--t-s2)] px-1 rounded text-[var(--t-sub)]">ctx.variables</code>,{' '}
        <code className="bg-[var(--t-s2)] px-1 rounded text-[var(--t-sub)]">ctx.user</code>,{' '}
        <code className="bg-[var(--t-s2)] px-1 rounded text-[var(--t-sub)]">ctx.guild</code>. {t.nodeConfig.codeCtxUseReturn} <code className="bg-[var(--t-s2)] px-1 rounded text-[var(--t-sub)]">return</code> {t.nodeConfig.codeCtxForResult}
      </p>
      <textarea
        rows={14}
        spellCheck={false}
        placeholder={t.nodeConfig.codeExamplePlaceholder}
        value={code}
        onChange={e => setField('code', e.target.value)}
        className="w-full px-4 py-3 border border-[var(--t-bd)] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--t-a)] resize-y bg-[var(--t-bg)] text-[var(--t-tx)] leading-relaxed"
      />

      <div className="bg-[var(--t-aa)] border border-[var(--t-a)] rounded-xl p-3 space-y-2">
        <label className="block text-xs font-semibold text-[var(--t-a)]">{t.nodeConfig.storeResultIn}</label>
        <input
          placeholder="result"
          value={resultVar}
          onChange={e => setField('resultVar', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-a)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
        />
        {resultVar && (
          <p className="text-xs text-[var(--t-sub)]">
            {t.nodeConfig.accessViaNextNodes} <code className="bg-[var(--t-s2)] px-1 rounded font-mono">{'{variable.' + resultVar + '}'}</code>
          </p>
        )}
      </div>
    </div>
  );
}

// --- Canvas Card Panel --------------------------------------------------------

interface CanvasLayer {
  id: string;
  type: 'background' | 'text' | 'image' | 'rect' | 'progressBar' | 'circle' | 'line' | 'badge';
  // common
  opacity?: number;
  // background
  bgMode?: 'solid' | 'gradient' | 'image';
  bgColor?: string;
  bgGradientFrom?: string;
  bgGradientTo?: string;
  bgGradientDir?: 'horizontal' | 'vertical' | 'diagonal';
  bgImageUrl?: string;
  // text / badge
  text?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  // image
  imageUrl?: string;
  imageSize?: number;
  rounded?: boolean;
  // rect / circle / badge
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  // badge extras
  paddingX?: number;
  paddingY?: number;
  // circle
  radius?: number;
  cx?: number;
  cy?: number;
  // line
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  lineWidth?: number;
  lineCap?: 'butt' | 'round' | 'square';
  // progress bar
  bgColorBar?: string;
  value?: string;
  maxValue?: number;
  // shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

function makeCanvasLayer(type: CanvasLayer['type']): CanvasLayer {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  if (type === 'background')  return { id, type, bgMode: 'solid', bgColor: '#2f3136' };
  if (type === 'text')        return { id, type, text: 'Hello {user.username}', x: 160, y: 80, fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', opacity: 1 };
  if (type === 'image')       return { id, type, imageUrl: '{user.avatar}', x: 30, y: 30, imageSize: 90, rounded: true, opacity: 1 };
  if (type === 'rect')        return { id, type, x: 0, y: 200, width: 800, height: 50, fillColor: '#5865F2', borderRadius: 0, opacity: 1 };
  if (type === 'progressBar') return { id, type, x: 160, y: 160, width: 400, height: 18, fillColor: '#5865F2', bgColorBar: '#4f545c', value: '50', maxValue: 100, borderRadius: 9, opacity: 1 };
  if (type === 'circle')      return { id, type, cx: 120, cy: 125, radius: 60, fillColor: '#5865F2', strokeColor: '', strokeWidth: 0, opacity: 1 };
  if (type === 'line')        return { id, type, x1: 0, y1: 200, x2: 800, y2: 200, strokeColor: '#5865F2', lineWidth: 3, lineCap: 'round', opacity: 1 };
  if (type === 'badge')       return { id, type, text: '{user.level}', x: 650, y: 30, fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', fillColor: '#5865F2', borderRadius: 20, paddingX: 14, paddingY: 6, opacity: 1 };
  return { id, type };
}

const CANVAS_PRESETS = [
  { label: 'Profile Card',   width: 800,  height: 250 },
  { label: 'Welcome Banner', width: 1200, height: 350 },
  { label: 'Rank Card',      width: 800,  height: 200 },
  { label: 'Square (512)',    width: 512,  height: 512 },
] as const;

const getLayerLabels = (t: TranslationKeys): Record<CanvasLayer['type'], string> => ({
  background:  t.nodeConfig.background,
  text:        t.nodeConfig.layerText,
  image:       t.nodeConfig.layerImageAvatar,
  rect:        t.nodeConfig.layerRectangle,
  progressBar: t.nodeConfig.layerProgressBar,
  circle:      t.nodeConfig.layerCircleEllipse,
  line:        t.nodeConfig.layerLine,
  badge:       t.nodeConfig.layerBadgeLabel,
});

const LAYER_ICONS: Record<CanvasLayer['type'], string> = {
  background:  '???',
  text:        'T',
  image:       '??',
  rect:        '?',
  progressBar: '█',
  circle:      '?',
  line:        '?',
  badge:       '???',
};

// --- Live Canvas Preview -----------------------------------------------------

function CanvasPreview({ layers, width, height }: { layers: CanvasLayer[]; width: number; height: number }) {
  const PREVIEW_W = 340;
  const scale = PREVIEW_W / width;
  const scaledH = Math.round(height * scale);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[var(--t-bd)]" style={{ width: PREVIEW_W, height: scaledH, background: '#1a1a2e' }}>
      <svg width={PREVIEW_W} height={scaledH} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        {layers.map((layer) => {
          const op = layer.opacity ?? 1;
          if (layer.type === 'background') {
            if (layer.bgMode === 'gradient') {
              const gradId = `g${layer.id}`;
              const isH = layer.bgGradientDir === 'horizontal' || !layer.bgGradientDir;
              const isD = layer.bgGradientDir === 'diagonal';
              return (
                <g key={layer.id} opacity={op}>
                  <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2={isH ? '100%' : isD ? '100%' : '0%'} y2={isH ? '0%' : '100%'}>
                      <stop offset="0%" stopColor={layer.bgGradientFrom ?? '#1a1a2e'} />
                      <stop offset="100%" stopColor={layer.bgGradientTo ?? '#16213e'} />
                    </linearGradient>
                  </defs>
                  <rect x={0} y={0} width={width} height={height} fill={`url(#${gradId})`} />
                </g>
              );
            }
            if (layer.bgMode === 'image') {
              return (
                <g key={layer.id} opacity={op}>
                  <rect x={0} y={0} width={width} height={height} fill="#333" />
                  <text x={width/2} y={height/2} textAnchor="middle" fill="#888" fontSize={14}>??? image</text>
                </g>
              );
            }
            return <rect key={layer.id} x={0} y={0} width={width} height={height} fill={layer.bgColor ?? '#2f3136'} opacity={op} />;
          }
          if (layer.type === 'rect') {
            const r = layer.borderRadius ?? 0;
            return <rect key={layer.id} x={layer.x ?? 0} y={layer.y ?? 0} width={layer.width ?? 200} height={layer.height ?? 20} rx={r} ry={r} fill={layer.fillColor ?? '#4f545c'} stroke={layer.strokeColor || 'none'} strokeWidth={layer.strokeWidth ?? 0} opacity={op} />;
          }
          if (layer.type === 'circle') {
            return <ellipse key={layer.id} cx={layer.cx ?? 120} cy={layer.cy ?? 125} rx={layer.radius ?? 60} ry={layer.radius ?? 60} fill={layer.fillColor ?? '#5865F2'} stroke={layer.strokeColor || 'none'} strokeWidth={layer.strokeWidth ?? 0} opacity={op} />;
          }
          if (layer.type === 'line') {
            return <line key={layer.id} x1={layer.x1 ?? 0} y1={layer.y1 ?? height/2} x2={layer.x2 ?? width} y2={layer.y2 ?? height/2} stroke={layer.strokeColor ?? '#5865F2'} strokeWidth={layer.lineWidth ?? 3} strokeLinecap={(layer.lineCap ?? 'round') as React.SVGAttributes<SVGLineElement>['strokeLinecap']} opacity={op} />;
          }
          if (layer.type === 'text') {
            return <text key={layer.id} x={layer.x ?? 0} y={(layer.y ?? 0) + (layer.fontSize ?? 24)} textAnchor={layer.textAlign === 'center' ? 'middle' : layer.textAlign === 'right' ? 'end' : 'start'} fill={layer.color ?? '#fff'} fontSize={layer.fontSize ?? 24} fontWeight={layer.fontWeight ?? 'normal'} opacity={op}>{layer.text ?? ''}</text>;
          }
          if (layer.type === 'badge') {
            const px = layer.paddingX ?? 14;
            const py = layer.paddingY ?? 6;
            const fs = layer.fontSize ?? 14;
            const charW = fs * 0.6;
            const textLen = (layer.text ?? '').length * charW;
            const bw = textLen + px * 2;
            const bh = fs + py * 2;
            const r = layer.borderRadius ?? 20;
            return (
              <g key={layer.id} opacity={op}>
                <rect x={layer.x ?? 0} y={layer.y ?? 0} width={bw} height={bh} rx={r} ry={r} fill={layer.fillColor ?? '#5865F2'} />
                <text x={(layer.x ?? 0) + px} y={(layer.y ?? 0) + py + fs * 0.85} fill={layer.color ?? '#fff'} fontSize={fs} fontWeight={layer.fontWeight ?? 'bold'}>{layer.text ?? ''}</text>
              </g>
            );
          }
          if (layer.type === 'image') {
            const sz = layer.imageSize ?? 90;
            return (
              <g key={layer.id} opacity={op}>
                <circle cx={(layer.x ?? 30) + sz/2} cy={(layer.y ?? 30) + sz/2} r={sz/2} fill="#4f545c" />
                <text x={(layer.x ?? 30) + sz/2} y={(layer.y ?? 30) + sz/2 + 5} textAnchor="middle" fill="#aaa" fontSize={sz * 0.4}>??</text>
              </g>
            );
          }
          if (layer.type === 'progressBar') {
            const x = layer.x ?? 160; const y = layer.y ?? 130;
            const mw = layer.width ?? 400; const h = layer.height ?? 20;
            const r = layer.borderRadius ?? 9;
            const pct = Math.max(0, Math.min(100, parseFloat(String(layer.value ?? '50')) || 0));
            const fw = (pct / 100) * mw;
            return (
              <g key={layer.id} opacity={op}>
                <rect x={x} y={y} width={mw} height={h} rx={r} ry={r} fill={layer.bgColorBar ?? '#4f545c'} />
                {fw > 0 && <rect x={x} y={y} width={fw} height={h} rx={r} ry={r} fill={layer.fillColor ?? '#5865F2'} />}
              </g>
            );
          }
          return null;
        })}
      </svg>
      <div className="absolute bottom-1.5 right-2 text-[9px] text-[var(--t-m)] font-mono bg-black/40 px-1 rounded">{width}×{height}</div>
    </div>
  );
}

function CanvasLayerEditor({ layer, onChange, onDelete, onDuplicate }: {
  layer: CanvasLayer;
  onChange: (updated: CanvasLayer) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState<'style' | 'position' | 'shadow'>('style');
  const set = (key: keyof CanvasLayer, val: unknown) => onChange({ ...layer, [key]: val });
  const nv  = (v: string | number, def = 0) => Number(v) || def;

  const ColorRow = ({ label, k, def }: { label: string; k: keyof CanvasLayer; def: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--t-m)] w-20 shrink-0">{label}</span>
      <input type="color" value={(layer[k] as string) ?? def} onChange={e => set(k, e.target.value)} className="w-7 h-6 rounded border border-[var(--t-bd)] cursor-pointer shrink-0 p-0" />
      <input type="text" value={(layer[k] as string) ?? def} onChange={e => set(k, e.target.value)} className="flex-1 px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] font-mono bg-[var(--t-s2)] text-[var(--t-tx)]" />
    </div>
  );

  const NumRow = ({ label, k, def, min, max }: { label: string; k: keyof CanvasLayer; def: number; min?: number; max?: number }) => (
    <div>
      <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{label}</label>
      <input type="number" min={min} max={max} value={(layer[k] as number) ?? def} onChange={e => set(k, nv(e.target.value, def))} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-s2)] text-[var(--t-tx)]" />
    </div>
  );

  const hasShadow = ['text', 'rect', 'circle', 'badge', 'image'].includes(layer.type);
  const hasPosition = layer.type !== 'background';

  return (
    <div className="bg-[var(--t-s)] border border-[var(--t-bd)] rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--t-bg)] transition select-none" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2 min-w-0">
          <ChevronRight className={`w-3 h-3 text-[var(--t-m)] shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} />
          <span className="text-[11px] font-mono text-[var(--t-a)] shrink-0">{LAYER_ICONS[layer.type]}</span>
          <span className="text-xs font-semibold text-[var(--t-tx)]">{getLayerLabels(t)[layer.type]}</span>
          {layer.type === 'text' && layer.text && <span className="text-[11px] text-[var(--t-m)] truncate max-w-[120px]">{layer.text}</span>}
          {layer.type === 'badge' && layer.text && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: layer.fillColor ?? '#5865F2', color: layer.color ?? '#fff' }}>{layer.text}</span>}
          {layer.type === 'background' && !layer.bgMode || layer.bgMode === 'solid' ? <span className="w-4 h-4 rounded border border-[var(--t-bd)] shrink-0 inline-block" style={{ backgroundColor: layer.bgColor ?? '#2f3136' }} /> : null}
          {(layer.opacity !== undefined && layer.opacity !== 1) && <span className="text-[10px] text-[var(--t-m)] ml-1">{Math.round((layer.opacity ?? 1) * 100)}%</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }} title={t.nodeConfig.duplicate} className="p-1 text-[var(--t-m)] hover:text-[var(--t-a)] hover:bg-[var(--t-aa)] rounded-lg transition">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2H4zm0 1h5a1 1 0 0 1 1 1v1H7a2 2 0 0 0-2 2v1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 3h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/></svg>
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} title={t.nodeConfig.deleteLayer} className="p-1 text-[var(--t-m)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--t-bd)] bg-[var(--t-s2)]">
          {/* Tab bar */}
          {hasPosition && (
            <div className="flex border-b border-[var(--t-bd)]">
              {(['style', 'position', ...(hasShadow ? ['shadow'] : [])] as const).map(tb => (
                <button key={tb} onClick={() => setTab(tb as typeof tab)}
                  className={`flex-1 py-1.5 text-[11px] font-medium transition ${tab === tb ? 'bg-[var(--t-s)] text-[var(--t-a)] border-b-2 border-[var(--t-a)]' : 'text-[var(--t-m)] hover:text-[var(--t-tx)]'}`}
                >
                  {tb === 'style' ? t.nodeConfig.tabStyle : tb === 'position' ? t.nodeConfig.tabPosition : t.nodeConfig.tabShadow}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 py-3 space-y-2.5">
            {/* Opacity — always visible */}
            {layer.type !== 'background' && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--t-m)] w-14 shrink-0">{t.nodeConfig.opacity}</span>
                <input type="range" min={0} max={1} step={0.05} value={layer.opacity ?? 1} onChange={e => set('opacity', parseFloat(e.target.value))} className="flex-1 accent-[var(--t-a)]" />
                <span className="text-[11px] font-mono text-[var(--t-m)] w-8 text-right">{Math.round((layer.opacity ?? 1) * 100)}%</span>
              </div>
            )}

            {/* -- STYLE TAB ------------------------------------------- */}
            {(!hasPosition || tab === 'style') && (<>

              {layer.type === 'background' && (<>
                <div className="grid grid-cols-3 gap-1">
                  {(['solid', 'gradient', 'image'] as const).map(m => (
                    <button key={m} onClick={() => set('bgMode', m)}
                      className={`py-1 rounded-lg text-[11px] font-medium border transition ${ (layer.bgMode ?? 'solid') === m ? 'bg-[var(--t-a)] text-[var(--t-btn-text)] border-[var(--t-a)]' : 'bg-[var(--t-s)] text-[var(--t-sub)] border-[var(--t-bd)] hover:bg-[var(--t-s2)]'}`}
                    >{m === 'solid' ? t.nodeConfig.solid : m === 'gradient' ? t.nodeConfig.gradient : t.nodeConfig.imageType}</button>
                  ))}
                </div>
                {(!layer.bgMode || layer.bgMode === 'solid') && <ColorRow label={t.nodeConfig.colorLabel} k="bgColor" def="#2f3136" />}
                {layer.bgMode === 'gradient' && (<>
                  <ColorRow label={t.nodeConfig.from} k="bgGradientFrom" def="#1a1a2e" />
                  <ColorRow label={t.nodeConfig.to} k="bgGradientTo" def="#16213e" />
                  <div>
                    <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.direction}</label>
                    <select value={layer.bgGradientDir ?? 'horizontal'} onChange={e => set('bgGradientDir', e.target.value)} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-bg)] text-[var(--t-tx)]">
                      <option value="horizontal">{t.nodeConfig.dirHorizontal}</option>
                      <option value="vertical">{t.nodeConfig.dirVertical}</option>
                      <option value="diagonal">{t.nodeConfig.dirDiagonal}</option>
                    </select>
                  </div>
                </>)}
                {layer.bgMode === 'image' && (
                  <div>
                    <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.imageUrlLabel}</label>
                    <input type="text" value={layer.bgImageUrl ?? ''} onChange={e => set('bgImageUrl', e.target.value)} placeholder={t.nodeConfig.phUrlOrVar} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-s2)] text-[var(--t-tx)]" />
                  </div>
                )}
              </>)}

              {(layer.type === 'text' || layer.type === 'badge') && (<>
                <div>
                  <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.content}</label>
                  <input type="text" value={layer.text ?? ''} onChange={e => set('text', e.target.value)} placeholder="Hello {user.username}" className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-s2)] text-[var(--t-tx)]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label={t.nodeConfig.sizePx} k="fontSize" def={24} min={6} max={200} />
                  <div>
                    <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.weight}</label>
                    <select value={layer.fontWeight ?? 'normal'} onChange={e => set('fontWeight', e.target.value)} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-bg)] text-[var(--t-tx)]">
                      <option value="normal">{t.nodeConfig.weightNormal}</option>
                      <option value="bold">{t.nodeConfig.weightBold}</option>
                      <option value="900">{t.nodeConfig.weightBlack}</option>
                    </select>
                  </div>
                </div>
                <ColorRow label={t.nodeConfig.textColor} k="color" def="#FFFFFF" />
                {layer.type === 'text' && (
                  <div>
                    <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.alignment}</label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(a => (
                        <button key={a} onClick={() => set('textAlign', a)} className={`flex-1 py-1 rounded-lg text-[11px] border transition ${layer.textAlign === a ? 'bg-[var(--t-a)] text-[var(--t-btn-text)] border-[var(--t-a)]' : 'bg-[var(--t-s)] text-[var(--t-sub)] border-[var(--t-bd)] hover:bg-[var(--t-s2)]'}`}>
                          {a === 'left' ? '?' : a === 'center' ? '?' : '?'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {layer.type === 'badge' && (<>
                  <ColorRow label={t.nodeConfig.badgeBg} k="fillColor" def="#5865F2" />
                  <div className="grid grid-cols-2 gap-2">
                    <NumRow label={t.nodeConfig.paddingX} k="paddingX" def={14} min={0} />
                    <NumRow label={t.nodeConfig.paddingY} k="paddingY" def={6} min={0} />
                  </div>
                  <NumRow label={t.nodeConfig.cornerRadius} k="borderRadius" def={20} min={0} />
                </>)}
              </>)}

              {layer.type === 'image' && (<>
                <div>
                  <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.imageUrlLabel}</label>
                  <input type="text" value={layer.imageUrl ?? ''} onChange={e => set('imageUrl', e.target.value)} placeholder={t.nodeConfig.phAvatarOrUrl} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-s2)] text-[var(--t-tx)]" />
                </div>
                <NumRow label={t.nodeConfig.sizePx} k="imageSize" def={90} min={8} />
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={layer.rounded ?? true} onChange={e => set('rounded', e.target.checked)} className="rounded text-[var(--t-a)] w-3.5 h-3.5" />
                  <span className="text-[11px] text-[var(--t-sub)]">{t.nodeConfig.circularCrop}</span>
                </label>
              </>)}

              {layer.type === 'rect' && (<>
                <ColorRow label={t.nodeConfig.bgColor2} k="fillColor" def="#4f545c" />
                <ColorRow label={t.nodeConfig.border} k="strokeColor" def="#000000" />
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label={t.nodeConfig.borderThickness} k="strokeWidth" def={0} min={0} />
                  <NumRow label={t.nodeConfig.cornerRadius} k="borderRadius" def={0} min={0} />
                </div>
              </>)}

              {layer.type === 'circle' && (<>
                <ColorRow label={t.nodeConfig.bgColor2} k="fillColor" def="#5865F2" />
                <ColorRow label={t.nodeConfig.border} k="strokeColor" def="#000000" />
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label={t.nodeConfig.radiusPx} k="radius" def={60} min={1} />
                  <NumRow label={t.nodeConfig.borderThickness} k="strokeWidth" def={0} min={0} />
                </div>
              </>)}

              {layer.type === 'line' && (<>
                <ColorRow label={t.nodeConfig.colorLabel} k="strokeColor" def="#5865F2" />
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label={t.nodeConfig.thicknessPx} k="lineWidth" def={3} min={1} />
                  <div>
                    <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.endings}</label>
                    <select value={layer.lineCap ?? 'round'} onChange={e => set('lineCap', e.target.value)} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-bg)] text-[var(--t-tx)]">
                      <option value="round">{t.nodeConfig.rounded}</option>
                      <option value="butt">{t.nodeConfig.straight}</option>
                      <option value="square">{t.nodeConfig.squareEnd}</option>
                    </select>
                  </div>
                </div>
              </>)}

              {layer.type === 'progressBar' && (<>
                <ColorRow label={t.nodeConfig.barColor} k="fillColor" def="#5865F2" />
                <ColorRow label={t.nodeConfig.bgColor2} k="bgColorBar" def="#4f545c" />
                <div>
                  <label className="block text-[11px] text-[var(--t-m)] mb-0.5">{t.nodeConfig.valueExpression}</label>
                  <input type="text" value={layer.value ?? '50'} onChange={e => set('value', e.target.value)} placeholder={t.nodeConfig.phXpOr50} className="w-full px-2 py-1 border border-[var(--t-bd)] rounded-lg text-[11px] bg-[var(--t-s2)] text-[var(--t-tx)]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label={t.nodeConfig.maxValueLabel} k="maxValue" def={100} min={1} />
                  <NumRow label={t.nodeConfig.cornerRadius} k="borderRadius" def={9} min={0} />
                </div>
              </>)}

            </>)}

            {/* -- POSITION TAB --------------------------------------- */}
            {hasPosition && tab === 'position' && (<>

              {(layer.type === 'text' || layer.type === 'badge' || layer.type === 'image' || layer.type === 'rect' || layer.type === 'progressBar') && (
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label="X (px)" k="x" def={0} />
                  <NumRow label="Y (px)" k="y" def={0} />
                  {(layer.type === 'rect' || layer.type === 'progressBar') && (<>
                    <NumRow label={t.nodeConfig.widthPx} k="width" def={200} min={1} />
                    <NumRow label={t.nodeConfig.heightPx} k="height" def={20} min={1} />
                  </>)}
                </div>
              )}

              {layer.type === 'circle' && (
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label={t.nodeConfig.centerX} k="cx" def={120} />
                  <NumRow label={t.nodeConfig.centerY} k="cy" def={125} />
                </div>
              )}

              {layer.type === 'line' && (
                <div className="grid grid-cols-2 gap-2">
                  <NumRow label="X1" k="x1" def={0} />
                  <NumRow label="Y1" k="y1" def={0} />
                  <NumRow label="X2" k="x2" def={800} />
                  <NumRow label="Y2" k="y2" def={0} />
                </div>
              )}

            </>)}

            {/* -- SHADOW TAB ----------------------------------------- */}
            {hasShadow && tab === 'shadow' && (<>
              <ColorRow label={t.nodeConfig.colorLabel} k="shadowColor" def="rgba(0,0,0,0.5)" />
              <div className="grid grid-cols-3 gap-2">
                <NumRow label={t.nodeConfig.blurPx} k="shadowBlur" def={0} min={0} />
                <NumRow label={t.nodeConfig.offsetX} k="shadowOffsetX" def={0} />
                <NumRow label={t.nodeConfig.offsetY} k="shadowOffsetY" def={0} />
              </div>
            </>)}

          </div>
        </div>
      )}
    </div>
  );
}

function CanvasCardPanel({ config, setField, botId }: { config: Record<string, any>; setField: (k: string, v: unknown) => void; botId?: number }) {
  const { t } = useTranslation();
  const layers: CanvasLayer[] = Array.isArray(config.layers) ? config.layers : [];
  const setLayers = (lys: CanvasLayer[]) => setField('layers', lys);
  const [showPreview, setShowPreview] = useState(true);

  const addLayer    = (type: CanvasLayer['type']) => setLayers([...layers, makeCanvasLayer(type)]);
  const removeLayer = (id: string)               => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (updated: CanvasLayer)     => setLayers(layers.map(l => l.id === updated.id ? updated : l));
  const duplicateLayer = (id: string) => {
    const src = layers.find(l => l.id === id);
    if (!src) return;
    const copy = { ...src, id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    const idx = layers.findIndex(l => l.id === id);
    const next = [...layers];
    next.splice(idx + 1, 0, copy);
    setLayers(next);
  };
  const moveLayer   = (idx: number, dir: -1|1)   => {
    const arr = [...layers]; const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]]; setLayers(arr);
  };

  const W = Number(config.width)  || 800;
  const H = Number(config.height) || 250;

  const ADD_TYPES: Array<{ type: CanvasLayer['type']; label: string }> = [
    { type: 'background',  label: t.nodeConfig.addBgLabel        },
    { type: 'rect',        label: t.nodeConfig.rectangleLabel   },
    { type: 'circle',      label: t.nodeConfig.addCircleLabel      },
    { type: 'line',        label: t.nodeConfig.addLineLabel       },
    { type: 'text',        label: t.nodeConfig.addTextLabel       },
    { type: 'badge',       label: t.nodeConfig.addBadgeLabel       },
    { type: 'image',       label: t.nodeConfig.imageLabel       },
    { type: 'progressBar', label: t.nodeConfig.addBarLabel       },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.dimensions}</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {CANVAS_PRESETS.map(p => {
          const labels: Record<string, string> = { 'Profile Card': t.nodeConfig.profileCard, 'Welcome Banner': t.nodeConfig.welcomeBanner, 'Rank Card': t.nodeConfig.rankCard, 'Square (512)': t.nodeConfig.squareLabel };
          return (
          <button key={p.label}
            onClick={() => { setField('width', p.width); setField('height', p.height); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
              W === p.width && H === p.height
                ? 'bg-[var(--t-a)] text-[var(--t-btn-text)] border-[var(--t-a)]'
                : 'bg-[var(--t-s2)] text-[var(--t-sub)] border-[var(--t-bd)] hover:bg-[var(--t-aa)] hover:border-[var(--t-a)]'
            }`}
          >{labels[p.label] ?? p.label} <span className="opacity-60">{p.width}×{p.height}</span></button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--t-sub)] mb-1">{t.nodeConfig.widthPx}</label>
          <FieldInput type="number" value={W} onChange={e => setField('width', Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--t-sub)] mb-1">{t.nodeConfig.heightPx}</label>
          <FieldInput type="number" value={H} onChange={e => setField('height', Number(e.target.value))} />
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>{t.nodeConfig.preview}</SectionTitle>
          <button onClick={() => setShowPreview(v => !v)} className="text-[11px] text-[var(--t-a)] hover:underline">
            {showPreview ? t.nodeConfig.hide : t.nodeConfig.show}
          </button>
        </div>
        {showPreview && (
          <div className="overflow-x-auto">
            <CanvasPreview layers={layers} width={W} height={H} />
          </div>
        )}
      </div>

      <SectionTitle>
        {t.nodeConfig.layersHeader} <span className="text-[var(--t-m)] font-normal normal-case">({layers.length} × {t.nodeConfig.bottomToTop})</span>
      </SectionTitle>
      {layers.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-[var(--t-bd)] rounded-xl text-[var(--t-m)] text-xs">
          {t.nodeConfig.noLayersHint}
        </div>
      )}
      {layers.map((layer, idx) => (
        <div key={layer.id} className="flex gap-1 items-start">
          <div className="flex flex-col mt-2 shrink-0">
            <button onClick={() => moveLayer(idx, -1)} disabled={idx === 0} title={t.nodeConfig.moveUp}
              className="p-0.5 text-[var(--t-m)] hover:text-[var(--t-tx)] disabled:opacity-20 transition text-[10px] leading-none">?</button>
            <button onClick={() => moveLayer(idx, 1)} disabled={idx === layers.length - 1} title={t.nodeConfig.moveDown}
              className="p-0.5 text-[var(--t-m)] hover:text-[var(--t-tx)] disabled:opacity-20 transition text-[10px] leading-none">?</button>
          </div>
          <div className="flex-1 min-w-0">
            <CanvasLayerEditor
              layer={layer}
              onChange={updateLayer}
              onDelete={() => removeLayer(layer.id)}
              onDuplicate={() => duplicateLayer(layer.id)}
            />
          </div>
        </div>
      ))}

      {/* Add layer buttons */}
      <div className="bg-[var(--t-s2)] rounded-xl border border-[var(--t-bd)] p-3">
        <p className="text-[11px] font-semibold text-[var(--t-m)] mb-2">{t.nodeConfig.addLayer}</p>
        <div className="flex flex-wrap gap-1.5">
          {ADD_TYPES.map(({ type, label }) => (
            <button key={type} onClick={() => addLayer(type)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[var(--t-s)] hover:bg-[var(--t-aa)] hover:text-[var(--t-a)] text-[var(--t-sub)] text-[11px] font-medium rounded-lg border border-[var(--t-bd)] hover:border-[var(--t-a)] transition"
            >
              <span className="text-[10px]">{LAYER_ICONS[type]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <SectionTitle>{t.nodeConfig.output}</SectionTitle>
      <div className="bg-[var(--t-aa)] border border-[var(--t-a)] rounded-xl p-3 space-y-2">
        <label className="block text-xs font-semibold text-[var(--t-a)]">{t.nodeConfig.storeImageInVar}</label>
        <FieldInput
          placeholder="cardImage"
          value={(config.outputVar ?? '') as string}
          onChange={e => setField('outputVar', e.target.value)}
        />
        {config.outputVar && (
          <p className="text-xs text-[var(--t-sub)]">
            {t.nodeConfig.codeCtxUseReturn} <code className="bg-[var(--t-s2)] px-1 rounded font-mono">{`{variable.${config.outputVar}}`}</code> {t.nodeConfig.inSendImageNode} <strong>{t.nodeConfig.sendImageNode}</strong>.
          </p>
        )}
      </div>

      <Toggle
        checked={!!config.sendDirect}
        onChange={v => setField('sendDirect', v)}
        label={t.nodeConfig.sendDirectToDiscord}
        hint={t.nodeConfig.canvasCardSendHint}
      />
      {config.sendDirect && (<>
        <SectionTitle>{t.nodeConfig.destChannel}</SectionTitle>
        <ChannelPicker config={config} setField={setField} botId={botId} />
      </>)}
    </div>
  );
}

// --- Execution viewer ---------------------------------------------------------

type ExecData = { snapshot?: Record<string, any>; nextHandle?: string; error?: string; ts: number } | undefined;

function ExecutionViewer({ execData }: { execData: ExecData }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  if (!execData) return null;

  const { snapshot = {}, nextHandle, error, ts } = execData;
  const time = new Date(ts).toLocaleTimeString();

  const renderTable = (obj: Record<string, any>) => (
    <table className="w-full text-xs">
      <tbody>
        {Object.entries(obj).map(([k, v]) => (
          <tr key={k} className="border-t border-[var(--t-bd)] first:border-0">
            <td className="py-0.5 pr-3 font-mono text-[var(--t-m)] whitespace-nowrap">{k}</td>
            <td className="py-0.5 font-mono text-[var(--t-tx)] break-all">{JSON.stringify(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="mt-6 border border-[var(--t-bd)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[var(--t-s2)] hover:bg-[var(--t-s)] transition text-sm font-medium text-[var(--t-sub)]"
      >
        <span className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
          {t.nodeConfig.lastExecution} <span className="font-normal text-[var(--t-m)] text-xs ml-1">{time}</span>
        </span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3 bg-[var(--t-s)] text-xs">
          {error && (
            <div className="rounded-lg px-3 py-2 font-mono" style={{ background: 'color-mix(in srgb, var(--t-bg), #ef4444 10%)', border: '1px solid color-mix(in srgb, var(--t-bd), #ef4444 30%)', color: '#ef4444' }}>{error}</div>
          )}
          {nextHandle && !error && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--t-m)]">{t.nodeConfig.outputLabel}</span>
              <span className="px-2 py-0.5 rounded font-mono font-semibold" style={{ background: 'color-mix(in srgb, var(--t-bg), #22c55e 15%)', color: '#22c55e' }}>{nextHandle}</span>
            </div>
          )}
          {snapshot.args && Object.keys(snapshot.args).length > 0 && (
            <div>
              <p className="font-semibold text-[var(--t-sub)] mb-1">{t.nodeConfig.arguments_}</p>
              {renderTable(snapshot.args)}
            </div>
          )}
          {snapshot.user && (
            <div>
              <p className="font-semibold text-[var(--t-sub)] mb-1">{t.nodeConfig.user}</p>
              {renderTable(snapshot.user)}
            </div>
          )}
          {snapshot.guild && (
            <div>
              <p className="font-semibold text-[var(--t-sub)] mb-1">{t.nodeConfig.server}</p>
              {renderTable(snapshot.guild)}
            </div>
          )}
          {snapshot.channel && (
            <div>
              <p className="font-semibold text-[var(--t-sub)] mb-1">{t.nodeConfig.channel}</p>
              {renderTable(snapshot.channel)}
            </div>
          )}
          {snapshot.message && (
            <div>
              <p className="font-semibold text-[var(--t-sub)] mb-1">{t.nodeConfig.message}</p>
              {renderTable(snapshot.message)}
            </div>
          )}
          {snapshot.variables && Object.keys(snapshot.variables).length > 0 && (
            <div>
              <p className="font-semibold text-[var(--t-sub)] mb-1">{t.nodeConfig.runtimeVars}</p>
              {renderTable(snapshot.variables)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Discord Action panel -----------------------------------------------------

export const DISCORD_ACTION_TYPES = new Set([
  // Logic
  'condition', 'delay', 'variable', 'mathOperation', 'random', 'counter', 'switchCase', 'forEach', 'filter',
  'stringOperation', 'arrayOperation', 'jsonParse', 'jsonStringify', 'typeConvert', 'getDate', 'loopWhile',
  // HTTP
  'httpRequest', 'webhook',
  // Messaging
  'sendMessage',
  'editMessage', 'deleteMessage', 'replyToMessage',
  'addRole', 'removeRole', 'createRole',
  'kick', 'ban', 'unban', 'timeout', 'unmute', 'bulkDeleteMessages', 'setNickname',
  'createChannel', 'deleteChannel',
  // Interactions
  'sendDM', 'addReaction', 'pinMessage', 'unpinMessage',
  'createThread', 'archiveThread', 'editChannel', 'createInvite',
  'fetchUserInfo',
  // Voice
  'joinVoiceChannel', 'leaveVoiceChannel', 'playAudio', 'stopAudio',
  'moveToVoice', 'disconnectFromVoice',
  'serverMuteMember', 'serverDeafenMember',
  // Bot Management
  'setBotPresence', 'setBotNickname', 'setBotAvatar',
  // Components
  'sendButtons', 'sendStringSelectMenu', 'sendUserSelectMenu', 'sendRoleSelectMenu', 'sendChannelSelectMenu',
  'sendModal', 'awaitButtonClick', 'awaitSelectMenu',
  'buttonInteractionHandler', 'selectMenuInteractionHandler', 'modalSubmitHandler',
  // Guild Extended
  'editGuild', 'editRole', 'deleteRole',
  'createEmoji', 'deleteEmoji', 'editEmoji',
  'createSticker', 'deleteSticker',
  'createEvent', 'editEvent', 'deleteEvent',
  'createGuildWebhook', 'deleteGuildWebhook', 'executeWebhook',
  'fetchAuditLog', 'fetchMembers',
]);

const CHANNEL_TYPES = [
  { value: 'text',         label: 'Text Channel' },
  { value: 'voice',        label: 'Voice Channel' },
  { value: 'category',     label: 'Category' },
  { value: 'forum',        label: 'Forum Channel' },
  { value: 'announcement', label: 'Announcement Channel' },
] as const;

const DURATION_UNITS = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours',   label: 'Hours'   },
  { value: 'days',    label: 'Days'    },
] as const;

interface EmbedField { id: string; name: string; value: string; inline: boolean; }
function makeEmbedField(): EmbedField {
  return { id: `${Date.now()}_${Math.random().toString(36).slice(2,5)}`, name: '', value: '', inline: false };
}

function getConditionOperators(t: any) {
  return [
    { value: '==',         label: t.nodeConfig.equals },
    { value: '!=',         label: t.nodeConfig.notEquals },
    { value: '>',          label: t.nodeConfig.greaterThan },
    { value: '<',          label: t.nodeConfig.lessThan },
    { value: '>=',         label: t.nodeConfig.greaterOrEqual },
    { value: '<=',         label: t.nodeConfig.lessOrEqual },
    { value: 'contains',   label: t.nodeConfig.contains },
    { value: 'startsWith', label: t.nodeConfig.startsWith },
    { value: 'endsWith',   label: t.nodeConfig.endsWith },
    { value: 'match',      label: t.nodeConfig.matchesRegex },
  ];
}

// --- Interaction Handler Panel (visual builder) -------------------------------
const INTERACTION_SOURCE_TYPES: Record<string, string[]> = {
  buttonInteractionHandler:     ['sendButtons'],
  selectMenuInteractionHandler: ['sendStringSelectMenu', 'sendUserSelectMenu', 'sendRoleSelectMenu', 'sendChannelSelectMenu'],
  modalSubmitHandler:           ['sendModal'],
};

function InteractionHandlerPanel({ type, config, setField, graphNodes }: {
  type: string;
  config: Record<string, any>;
  setField: (k: string, v: unknown) => void;
  graphNodes: Node<NodeData>[];
}) {
  const { t } = useTranslation();
  const s = (k: string, def = '') => (config[k] ?? def) as string;
  const [manualMode, setManualMode] = useState(false);
  const [pickedNodeId, setPickedNodeId] = useState<string>((config._linkedNodeId as string) ?? '');
  const sourceTypes = INTERACTION_SOURCE_TYPES[type] ?? [];
  const sourceNodes = graphNodes.filter(n => sourceTypes.includes(n.data.type as string));
  const typeLabel = type === 'buttonInteractionHandler' ? t.nodeConfig.button : type === 'selectMenuInteractionHandler' ? t.nodeConfig.selectMenu : t.nodeConfig.modal;
  const pickedNode = sourceNodes.find(n => n.id === pickedNodeId) ?? null;
  const pickedCfg  = (pickedNode?.data.config as Record<string, any>) ?? {};
  type BtnDef = { customId: string; label: string; style: string; emoji: string; };
  const pickedButtons: BtnDef[] = pickedNode?.data.type === 'sendButtons'
    ? ((pickedCfg.buttons ?? []) as BtnDef[]).filter((b: BtnDef) => b.style !== 'Link' && b.customId)
    : [];
  const styleColorMap: Record<string, string> = { Primary: '#5865F2', Secondary: '#4f545c', Success: '#3ba55d', Danger: '#ed4245' };

  const handleNodePick = (nodeId: string) => {
    setPickedNodeId(nodeId);
    setField('_linkedNodeId', nodeId);
    const node = sourceNodes.find(n => n.id === nodeId);
    if (!node) return;
    const cfg = (node.data.config as Record<string, any>) ?? {};
    if (node.data.type === 'sendModal' && cfg.customId) {
      setField('customIdFilter', cfg.customId);
      setField('matchType', 'exact');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-1" style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--t-a)' }}>{t.nodeConfig.interactionHandler}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--t-sub)' }}>
          {t.nodeConfig.interactionDesc.replace('{type}', typeLabel)}
        </p>
      </div>

      {sourceNodes.length > 0 && !manualMode ? (
        <div className="space-y-3">
          <SectionTitle>{t.nodeConfig.linkToNode}</SectionTitle>
          <div className="space-y-2">
            {sourceNodes.map(node => {
              const cfg = (node.data.config as Record<string, any>) ?? {};
              const picked = node.id === pickedNodeId;
              const subtitle = (cfg.content || cfg.title || cfg.placeholder || '') as string;
              return (
                <button key={node.id} type="button"
                  onClick={() => handleNodePick(node.id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 border transition flex items-start gap-2.5 ${picked ? 'border-[var(--t-a)] bg-[var(--t-s2)]' : 'border-[var(--t-bd)] bg-[var(--t-s)] hover:border-[var(--t-m)]'}`}>
                  <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${picked ? 'border-[var(--t-a)]' : 'border-[var(--t-m)]'}`}>
                    {picked && <span className="w-2 h-2 rounded-full bg-[var(--t-a)]" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--t-tx)]">{node.data.label}</p>
                    {subtitle && <p className="text-[10px] text-[var(--t-sub)] mt-0.5 truncate">{subtitle}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          {pickedNode?.data.type === 'sendButtons' && pickedButtons.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-2">{t.nodeConfig.reactiveButton}</label>
              <div className="flex flex-wrap gap-2">
                {pickedButtons.map((btn: BtnDef) => {
                  const active = s('customIdFilter') === btn.customId;
                  return (
                    <button key={btn.customId} type="button"
                      onClick={() => { setField('customIdFilter', btn.customId); setField('matchType', 'exact'); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                      style={{
                        background: active ? (styleColorMap[btn.style] ?? 'var(--t-sub)') : 'var(--t-s2)',
                        borderColor: active ? (styleColorMap[btn.style] ?? 'var(--t-sub)') : 'var(--t-bd)',
                        color: active ? 'var(--t-btn-text)' : 'var(--t-tx)',
                      }}>
                      {btn.emoji ? `${btn.emoji} ` : ''}{btn.label || btn.customId}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pickedNode?.data.type === 'sendModal' && (pickedCfg.customId as string) && (
            <p className="text-xs bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-lg px-3 py-2">
              ✅ {t.nodeConfig.customIdLabel2} <code className="bg-[var(--t-s2)] px-1 rounded">{pickedCfg.customId as string}</code> {t.nodeConfig.customIdApplied}
            </p>
          )}

          {s('customIdFilter') && (
            <div>
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.activeCustomId}</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--t-tx)] truncate">{s('customIdFilter')}</code>
                <button type="button"
                  onClick={() => { setField('customIdFilter', ''); setPickedNodeId(''); setField('_linkedNodeId', ''); }}
                  className="shrink-0 text-[var(--t-m)] hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}

          <button type="button" onClick={() => setManualMode(true)}
            className="text-xs text-[var(--t-m)] hover:text-[var(--t-tx)] underline transition">
            {t.nodeConfig.manualCustomId}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <SectionTitle>{t.nodeConfig.customIdFilter}</SectionTitle>
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.value}</label>
            <FieldInput placeholder={type === 'modalSubmitHandler' ? 'contact_form' : 'btn_role_'}
              value={s('customIdFilter')} onChange={e => setField('customIdFilter', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.matchType}</label>
            <select value={s('matchType', 'prefix')} onChange={e => setField('matchType', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm bg-[var(--t-bg)] text-[var(--t-tx)] outline-none focus:border-[var(--t-a)]/60">
              <option value="prefix">{t.nodeConfig.startsWithPrefix}</option>
              <option value="exact">{t.nodeConfig.exactlyEquals}</option>
              <option value="contains">{t.nodeConfig.containsMatch}</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          {sourceNodes.length > 0 && (
            <button type="button" onClick={() => setManualMode(false)}
              className="text-xs text-[var(--t-m)] hover:text-[var(--t-tx)] underline transition">
              ← {t.nodeConfig.backToVisualBuilder}
            </button>
          )}
        </div>
      )}

      <SectionTitle>{t.nodeConfig.output}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.interactionVariable}</label>
        <FieldInput placeholder="interaction" value={s('outputVar', 'interaction')}
          onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1 leading-relaxed">
          {t.nodeConfig.storesPrefix}{' '}
          <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar', 'interaction')}.customId{'}'}</code>,{' '}
          <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar', 'interaction')}.userId{'}'}</code>
          {type === 'selectMenuInteractionHandler' && <>, <code className="bg-[var(--t-bg)] px-1 rounded">{'{'}{s('outputVar', 'interaction')}.values{'}'}</code></>}
          {type === 'modalSubmitHandler' && <>, <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar', 'interaction')}.fields{'}'}</code></>}
        </p>
      </div>
    </div>
  );
}

function DiscordActionPanel({ type, config, setField, botId, graphNodes = [] }: {
  type: string;
  config: Record<string, any>;
  setField: (k: string, v: unknown) => void;
  botId?: number;
  graphNodes?: Node<NodeData>[];
}) {
  const { t } = useTranslation();
  const s = (k: string, def = '') => (config[k] ?? def) as string;
  const n = (k: string, def = 0)  => (config[k] ?? def) as number;
  const b = (k: string, def = false) => (config[k] ?? def) as boolean;

  // -- Condition -------------------------------------------------------------

  if (type === 'condition') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.conditionTitle}</SectionTitle>
      <p className="text-xs text-[var(--t-m)] bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-lg px-3 py-2 leading-relaxed">
        {t.nodeConfig.usesDynamicVars}{' '}
        <code className="bg-[var(--t-s2)] px-1 rounded">{'{args.nom}'}</code>,{' '}
        <code className="bg-[var(--t-s2)] px-1 rounded">{'{user.id}'}</code>,{' '}
        <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.maVar}'}</code>
      </p>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.leftValue} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="e.g. {args.age}"
          value={s('leftValue')}
          onChange={e => setField('leftValue', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operator} <span className="text-red-500">*</span></label>
        <select
          value={s('operator', '==')}
          onChange={e => setField('operator', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
        >
          {getConditionOperators(t).map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.rightValue} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="e.g. 18"
          value={s('rightValue')}
          onChange={e => setField('rightValue', e.target.value)}
        />
        {s('operator') === 'match' && (
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.regexHint} <code className="bg-[var(--t-s2)] px-1 rounded">^\d+$</code></p>
        )}
      </div>
      <div className="rounded-xl border border-[var(--t-bd)] bg-[var(--t-s2)] px-4 py-3">
        <p className="text-xs font-semibold text-[var(--t-m)] mb-1">{t.nodeConfig.preview}</p>
        <p className="text-sm font-mono text-[var(--t-tx)] truncate">
          <span className="text-[var(--t-a)]">{s('leftValue') || '…'}</span>
          {' '}
          <span className="text-[color-mix(in_srgb,var(--t-tx)_70%,orange)] font-bold">{s('operator', '==')}</span>
          {' '}
          <span className="text-[color-mix(in_srgb,var(--t-tx)_60%,green)]">{s('rightValue') || '…'}</span>
        </p>
      </div>
    </div>
  );

  // -- Delay -------------------------------------------------------------

  if (type === 'delay') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.duration}</SectionTitle>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.duration} <span className="text-red-500">*</span></label>
          <FieldInput
            type="number" min="1"
            placeholder="1000"
            value={String(n('duration', 1000))}
            onChange={e => setField('duration', Number(e.target.value))}
          />
        </div>
        <div className="w-36">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.unit}</label>
          <select
            value={s('unit', 'ms')}
            onChange={e => setField('unit', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
          >
            <option value="ms">{t.nodeConfig.milliseconds}</option>
            <option value="s">{t.nodeConfig.seconds}</option>
            <option value="minutes">{t.nodeConfig.minutes}</option>
            <option value="hours">{t.nodeConfig.hours}</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-[var(--t-m)] bg-[var(--t-aa)] border border-[var(--t-bd)] rounded-lg px-3 py-2">
        {t.nodeConfig.maxDelayWarning}
      </p>
    </div>
  );

  // -- Variable ------------------------------------------------------------

  if (type === 'variable') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.sourceVariable}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.name} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="monCompteur"
          value={s('name')}
          onChange={e => setField('name', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.accessVia} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + (s('name') || 'nom') + '}'}</code></p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operation}</label>
        <div className="flex gap-2">
          {(['set', 'delete'] as const).map(op => (
            <button key={op} type="button"
              onClick={() => setField('operation', op)}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition ${
                s('operation', 'set') === op
                  ? 'border-[var(--t-a)] bg-[var(--t-aa)] text-[var(--t-a)]'
                  : 'border-[var(--t-bd)] text-[var(--t-sub)] hover:border-[var(--t-s3)]'
              }`}
            >
              {op === 'set' ? t.nodeConfig.define : t.nodeConfig.deleteOp}
            </button>
          ))}
        </div>
      </div>
      {s('operation', 'set') === 'set' && (
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.value}</label>
          <FieldInput
            placeholder="{args.score}"
            value={s('value')}
            onChange={e => setField('value', e.target.value)}
          />
        </div>
      )}
    </div>
  );

  // -- Math Operation -----------------------------------------------------

  if (type === 'mathOperation') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.operation}</SectionTitle>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.leftValue} <span className="text-red-500">*</span></label>
          <FieldInput placeholder="{variable.score}" value={s('a')} onChange={e => setField('a', e.target.value)} />
        </div>
        <div className="w-24">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operator}</label>
          <select
            value={s('operator', '+')}
            onChange={e => setField('operator', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)] font-mono text-center"
          >
            {['+', '-', '*', '/', '%'].map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.rightValue} <span className="text-red-500">*</span></label>
          <FieldInput placeholder="{variable.bonus}" value={s('b')} onChange={e => setField('b', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeResultIn}</label>
        <FieldInput
          placeholder="resultat"
          value={s('resultVariable')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
        {s('resultVariable') && (
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.availableVia} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('resultVariable') + '}'}</code></p>
        )}
      </div>
      <div className="rounded-xl border border-[var(--t-bd)] bg-[var(--t-s2)] px-4 py-3">
        <p className="text-xs font-semibold text-[var(--t-m)] mb-1">{t.nodeConfig.preview}</p>
        <p className="text-sm font-mono text-[var(--t-tx)]">
          <span className="text-[var(--t-a)]">{s('a') || 'A'}</span>
          {' '}<span className="text-[color-mix(in_srgb,var(--t-tx)_70%,orange)] font-bold">{s('operator', '+')}</span>{' '}
          <span className="text-[var(--t-a)]">{s('b') || 'B'}</span>
          {s('resultVariable') && <span className="text-[var(--t-m)]"> ? <span className="text-[color-mix(in_srgb,var(--t-tx)_60%,green)]">{'{variable.' + s('resultVariable') + '}'}</span></span>}
        </p>
      </div>
    </div>
  );

  // -- Random -------------------------------------------------------------

  if (type === 'random') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.randomTitle}</SectionTitle>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.minLabel}</label>
          <FieldInput type="number" placeholder="0" value={String(n('min', 0))} onChange={e => setField('min', Number(e.target.value))} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.maxLabel}</label>
          <FieldInput type="number" placeholder="100" value={String(n('max', 100))} onChange={e => setField('max', Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeInVariable}</label>
        <FieldInput
          placeholder="nombreAleatoire"
          value={s('resultVariable')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
        {s('resultVariable') && (
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.availableVia} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('resultVariable') + '}'}</code></p>
        )}
      </div>
    </div>
  );

  // -- Counter ------------------------------------------------------------

  if (type === 'counter') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.counterTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.variableLabel} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="monCompteur"
          value={s('variable')}
          onChange={e => setField('variable', e.target.value)}
        />
        {s('variable') && (
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.accessVia} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('variable') + '}'}</code></p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operation}</label>
        <div className="grid grid-cols-3 gap-2">
          {([['increment', `+ ${t.nodeConfig.increment}`], ['decrement', `- ${t.nodeConfig.decrement}`], ['reset', `? ${t.nodeConfig.reset}`]] as const).map(([op, label]) => (
            <button key={op} type="button"
              onClick={() => setField('operation', op)}
              className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition ${
                s('operation', 'increment') === op
                  ? 'border-[var(--t-a)] bg-[var(--t-aa)] text-[var(--t-a)]'
                  : 'border-[var(--t-bd)] text-[var(--t-sub)] hover:border-[var(--t-s3)]'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>
      {s('operation', 'increment') !== 'reset' && (
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.value}</label>
          <FieldInput
            type="number" min="1" placeholder="1"
            value={String(n('amount', 1))}
            onChange={e => setField('amount', Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );

  // -- Switch Case ----------------------------------------------------------

  if (type === 'switchCase') {
    const cases: Array<{ value: string; handle: string }> = config.cases ?? [];
    const handles = ['case1', 'case2', 'case3', 'case4', 'default'];
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.switchCaseTitle}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.valueToTest} <span className="text-red-500">*</span></label>
          <FieldInput
            placeholder="{args.choice}"
            value={s('value')}
            onChange={e => setField('value', e.target.value)}
          />
        </div>
        <SectionTitle>{t.nodeConfig.casesTitle}</SectionTitle>
        <div className="space-y-2">
          {cases.map((c, idx) => (
            <div key={idx} className="flex gap-2 items-center p-2 bg-[var(--t-s2)] rounded-lg border border-[var(--t-bd)]">
              <div className="flex-1">
                <FieldInput
                  placeholder={t.nodeConfig.valuePlaceholder}
                  value={c.value}
                  onChange={e => {
                    const next = [...cases];
                    next[idx] = { ...c, value: e.target.value };
                    setField('cases', next);
                  }}
                />
              </div>
              <span className="text-[var(--t-m)] text-xs shrink-0">?</span>
              <div className="w-28">
                <select
                  value={c.handle}
                  onChange={e => {
                    const next = [...cases];
                    next[idx] = { ...c, handle: e.target.value };
                    setField('cases', next);
                  }}
                  className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
                >
                  {handles.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <button
                onClick={() => setField('cases', cases.filter((_, i) => i !== idx))}
                className="text-red-400 hover:text-red-600 p-1 rounded transition"
              ><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setField('cases', [...cases, { value: '', handle: `case${cases.length + 1}` }])}
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-sm text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition"
          >
            <Plus className="w-4 h-4" /> {t.nodeConfig.addCase}
          </button>
        </div>
        <p className="text-xs text-[var(--t-m)]">{t.nodeConfig.switchDefaultPrefix} <code className="bg-[var(--t-s2)] px-1 rounded">default</code> {t.nodeConfig.switchDefaultSuffix}</p>
      </div>
    );
  }

  // -- For Each -----------------------------------------------------------

  if (type === 'forEach') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.forEach}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.sourceVariable} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="maListe"
          value={s('listVariable')}
          onChange={e => setField('listVariable', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">
          {t.nodeConfig.contentOf} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + (s('listVariable') || 'maListe') + '}'}</code>.
          {t.nodeConfig.acceptsJsonArray} <code className="bg-[var(--t-s2)] px-1 rounded">["a","b"]</code> {t.nodeConfig.orCsvList}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.currentElementVar}</label>
        <FieldInput
          placeholder="item"
          value={s('itemVariable', 'item')}
          onChange={e => setField('itemVariable', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">
          {t.nodeConfig.currentItemValueIn} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + (s('itemVariable') || 'item') + '}'}</code>
        </p>
      </div>
    </div>
  );

  // -- Filter -------------------------------------------------------------

  if (type === 'filter') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.filterList}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.sourceVariable} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="maListe"
          value={s('listVariable')}
          onChange={e => setField('listVariable', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.jsonArrayOrCsvIn} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + (s('listVariable') || 'maListe') + '}'}</code></p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.propertyToTest} <span className="text-[var(--t-m)] font-normal">{t.nodeConfig.emptyTestElement}</span></label>
        <FieldInput
          placeholder="age"
          value={s('field')}
          onChange={e => setField('field', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operator}</label>
        <select
          value={s('operator', '==')}
          onChange={e => setField('operator', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
        >
          {getConditionOperators(t).map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.comparisonValue} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="18"
          value={s('filterValue')}
          onChange={e => setField('filterValue', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeMatchesIn}</label>
        <FieldInput
          placeholder={t.nodeConfig.storeMatchesIn}
          value={s('resultVariable')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
      </div>
    </div>
  );

  // -- String Operation --------------------------------------------------------

  if (type === 'stringOperation') {
    const op = s('operation', 'uppercase');
    const needsSearch = ['replace', 'replaceFirst', 'includes', 'startsWith', 'endsWith', 'indexOf'].includes(op);
    const needsReplacement = ['replace', 'replaceFirst'].includes(op);
    const needsSlice = op === 'slice';
    const needsSeparator = op === 'split';
    const needsCount = ['repeat', 'padStart', 'padEnd'].includes(op);
    const needsPadChar = ['padStart', 'padEnd'].includes(op);
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.sourceText}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.value} <span className="text-red-500">*</span></label>
          <FieldInput
            placeholder="{variable.text}"
            value={s('input')}
            onChange={e => setField('input', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operation}</label>
          <select
            value={op}
            onChange={e => setField('operation', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
          >
            <optgroup label={t.nodeConfig.caseGroup}>
              <option value="uppercase">{t.nodeConfig.uppercase}</option>
              <option value="lowercase">{t.nodeConfig.lowercase}</option>
            </optgroup>
            <optgroup label={t.nodeConfig.spacesGroup}>
              <option value="trim">{t.nodeConfig.trimBoth}</option>
              <option value="trimStart">{t.nodeConfig.trimStart}</option>
              <option value="trimEnd">{t.nodeConfig.trimEnd}</option>
            </optgroup>
            <optgroup label={t.nodeConfig.manipulationGroup}>
              <option value="replace">{t.nodeConfig.replaceAll}</option>
              <option value="replaceFirst">{t.nodeConfig.replaceFirst}</option>
              <option value="split">{t.nodeConfig.splitOp}</option>
              <option value="slice">{t.nodeConfig.sliceOp}</option>
              <option value="reverse">{t.nodeConfig.reverse}</option>
              <option value="repeat">{t.nodeConfig.repeat}</option>
              <option value="padStart">{t.nodeConfig.padStart}</option>
              <option value="padEnd">{t.nodeConfig.padEnd}</option>
            </optgroup>
            <optgroup label={t.nodeConfig.infoGroup}>
              <option value="length">{t.nodeConfig.length}</option>
              <option value="includes">{t.nodeConfig.containsQ}</option>
              <option value="startsWith">{t.nodeConfig.startsWithQ}</option>
              <option value="endsWith">{t.nodeConfig.endsWithQ}</option>
              <option value="indexOf">{t.nodeConfig.indexOf}</option>
            </optgroup>
          </select>
        </div>
        {needsSearch && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{needsReplacement ? t.nodeConfig.search : t.nodeConfig.searchValue} <span className="text-red-500">*</span></label>
            <FieldInput placeholder="oldText" value={s('search')} onChange={e => setField('search', e.target.value)} />
          </div>
        )}
        {needsReplacement && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.replaceWith}</label>
            <FieldInput placeholder="newText" value={s('replacement')} onChange={e => setField('replacement', e.target.value)} />
          </div>
        )}
        {needsSeparator && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.separator}</label>
            <FieldInput placeholder="," value={s('separator', ',')} onChange={e => setField('separator', e.target.value)} />
          </div>
        )}
        {needsSlice && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.startIndex}</label>
              <FieldInput type="number" placeholder="0" value={String(n('start', 0))} onChange={e => setField('start', Number(e.target.value))} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.endExcluded}</label>
              <FieldInput type="number" placeholder="" value={s('end')} onChange={e => setField('end', e.target.value)} />
            </div>
          </div>
        )}
        {needsCount && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{needsPadChar ? t.nodeConfig.targetLength : t.nodeConfig.repeatCount}</label>
            <FieldInput type="number" min="1" placeholder="1" value={String(n('count', 1))} onChange={e => setField('count', Number(e.target.value))} />
          </div>
        )}
        {needsPadChar && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.fillCharacter}</label>
            <FieldInput placeholder=" " value={s('padChar', ' ')} onChange={e => setField('padChar', e.target.value)} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeInVariable}</label>
          <FieldInput
            placeholder="result"
            value={s('resultVariable')}
            onChange={e => setField('resultVariable', e.target.value)}
          />
          {s('resultVariable') && (
            <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.viaPrefix} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('resultVariable') + '}'}</code></p>
          )}
        </div>
      </div>
    );
  }

  // -- Array Operation ----------------------------------------------------------

  if (type === 'arrayOperation') {
    const op = s('operation', 'length');
    const needsValue = ['push', 'unshift', 'includes', 'indexOf'].includes(op);
    const needsSep   = op === 'join';
    const needsSlice = op === 'slice';
    const hasResult  = ['pop', 'shift', 'includes', 'indexOf', 'length', 'join', 'slice'].includes(op);
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.sourceArray}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.arrayVariable} <span className="text-red-500">*</span></label>
          <FieldInput
            placeholder="maListe"
            value={s('listVariable')}
            onChange={e => setField('listVariable', e.target.value)}
          />
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.jsonArrayVarHint}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operation}</label>
          <select
            value={op}
            onChange={e => setField('operation', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
          >
            <optgroup label={t.nodeConfig.addRemoveGroup}>
              <option value="push">{t.nodeConfig.push}</option>
              <option value="pop">{t.nodeConfig.pop}</option>
              <option value="unshift">{t.nodeConfig.unshift}</option>
              <option value="shift">{t.nodeConfig.shift}</option>
              <option value="clear">{t.nodeConfig.clearArray}</option>
            </optgroup>
            <optgroup label={t.nodeConfig.searchGroup}>
              <option value="includes">{t.nodeConfig.containsValue}</option>
              <option value="indexOf">{t.nodeConfig.indexOfValue}</option>
            </optgroup>
            <optgroup label={t.nodeConfig.infoArrayGroup}>
              <option value="length">{t.nodeConfig.length}</option>
              <option value="join">{t.nodeConfig.join}</option>
              <option value="slice">{t.nodeConfig.sliceArray}</option>
            </optgroup>
            <optgroup label={t.nodeConfig.sortGroup}>
              <option value="sort">{t.nodeConfig.sort}</option>
              <option value="reverse">{t.nodeConfig.reverseArray}</option>
            </optgroup>
          </select>
        </div>
        {needsValue && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.value}</label>
            <FieldInput placeholder="{variable.item}" value={s('value')} onChange={e => setField('value', e.target.value)} />
          </div>
        )}
        {needsSep && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.separator}</label>
            <FieldInput placeholder=", " value={s('separator', ', ')} onChange={e => setField('separator', e.target.value)} />
          </div>
        )}
        {needsSlice && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.startIndex}</label>
              <FieldInput type="number" placeholder="0" value={String(n('start', 0))} onChange={e => setField('start', Number(e.target.value))} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.endEmpty}</label>
              <FieldInput type="number" placeholder="" value={s('end')} onChange={e => setField('end', e.target.value)} />
            </div>
          </div>
        )}
        {hasResult && (
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeInVariable}</label>
            <FieldInput
              placeholder="resultat"
              value={s('resultVariable')}
              onChange={e => setField('resultVariable', e.target.value)}
            />
            {s('resultVariable') && (
              <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.viaPrefix} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('resultVariable') + '}'}</code></p>
            )}
          </div>
        )}
      </div>
    );
  }

  // -- JSON Parse ----------------------------------------------------------------

  if (type === 'jsonParse') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.jsonToParse}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.jsonSource} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder={'{variable.jsonBrut} ou [{"id":1}]'}
          value={s('input')}
          onChange={e => setField('input', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeInVariable} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="data"
          value={s('resultVariable', 'data')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">
          {t.nodeConfig.objectAccessibleVia} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + (s('resultVariable') || 'data') + '}'}</code>
        </p>
      </div>
      <Toggle
        checked={b('flattenKeys')}
        onChange={v => setField('flattenKeys', v)}
        label={t.nodeConfig.flattenKeys}
        hint={t.nodeConfig.flattenHint}
      />
      <p className="text-xs text-[var(--t-m)] bg-[var(--t-aa)] border border-[var(--t-bd)] rounded-lg px-3 py-2">
        {t.nodeConfig.parseErrorHintText} <code className="bg-[var(--t-s2)] px-1 rounded">{t.nodeConfig.errorOutputLabel}</code>
      </p>
    </div>
  );

  // -- JSON Stringify ------------------------------------------------------------

  if (type === 'jsonStringify') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.jsonSourceVar}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.variableName} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="data"
          value={s('sourceVariable')}
          onChange={e => setField('sourceVariable', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.jsonSerializeHint}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.indentCompact}</label>
        <FieldInput
          type="number" min="0" max="8" placeholder="0"
          value={String(n('indent', 0))}
          onChange={e => setField('indent', Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeInVariable} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="jsonString"
          value={s('resultVariable')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
        {s('resultVariable') && (
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.viaPrefix} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('resultVariable') + '}'}</code></p>
        )}
      </div>
    </div>
  );

  // -- Type Convert --------------------------------------------------------------

  if (type === 'typeConvert') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.typeConversion}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.sourceValue} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="{variable.score}"
          value={s('input')}
          onChange={e => setField('input', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.targetType}</label>
        <div className="grid grid-cols-2 gap-2">
          {([['string', '?? String'], ['number', '?? Number'], ['integer', '?? Integer'], ['boolean', '? Boolean']] as const).map(([t, label]) => (
            <button key={t} type="button"
              onClick={() => setField('targetType', t)}
              className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition ${
                s('targetType', 'string') === t
                  ? 'border-[var(--t-a)] bg-[var(--t-aa)] text-[var(--t-a)]'
                  : 'border-[var(--t-bd)] text-[var(--t-sub)] hover:border-[var(--t-s3)]'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeInVariable} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="convertedValue"
          value={s('resultVariable')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
        {s('resultVariable') && (
          <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.viaPrefix} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + s('resultVariable') + '}'}</code></p>
        )}
      </div>
      <div className="rounded-xl border border-[var(--t-bd)] bg-[var(--t-s2)] px-4 py-3">
        <p className="text-xs font-semibold text-[var(--t-m)] mb-1">{t.nodeConfig.behaviors}</p>
        <ul className="text-xs text-[var(--t-m)] space-y-0.5">
          <li><span className="font-mono">boolean</span> : {t.nodeConfig.booleanHint}</li>
          <li><span className="font-mono">integer</span> : {t.nodeConfig.integerHint}</li>
          <li><span className="font-mono">number</span> : {t.nodeConfig.numberHint}</li>
        </ul>
      </div>
    </div>
  );

  // -- Get Date ------------------------------------------------------------------

  if (type === 'getDate') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.dateTimeCurrent}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.variablePrefix} <span className="text-red-500">*</span></label>
        <FieldInput
          placeholder="date"
          value={s('resultVariable', 'date')}
          onChange={e => setField('resultVariable', e.target.value)}
        />
        <div className="mt-2 rounded-xl border border-[var(--t-bd)] bg-[var(--t-s2)] px-3 py-2 space-y-0.5">
          <p className="text-xs font-semibold text-[var(--t-m)]">{t.nodeConfig.variablesCreated}</p>
          {[['', t.nodeConfig.dateShortTime], ['.timestamp', t.nodeConfig.timestampMs], ['.iso', 'ISO 8601'], ['.year/.month/.day', t.nodeConfig.componentsLabel], ['.hour/.minute/.second', t.nodeConfig.timeLabel]].map(([suf, desc]) => (
            <p key={suf} className="text-xs text-[var(--t-m)]">
              <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.' + (s('resultVariable') || 'date') + suf + '}'}</code>
              <span className="text-[var(--t-m)]"> — {desc}</span>
            </p>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.timezone}</label>
        <FieldInput
          placeholder="Europe/Paris"
          value={s('timezone', 'UTC')}
          onChange={e => setField('timezone', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.customFormat} <span className="text-[var(--t-m)] font-normal">({t.nodeConfig.optionalLabel})</span></label>
        <FieldInput
          placeholder="DD/MM/YYYY HH:mm"
          value={s('customFormat')}
          onChange={e => setField('customFormat', e.target.value)}
        />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.dateTokensPrefix} <code className="bg-[var(--t-s2)] px-0.5 rounded">YYYY MM DD HH mm ss</code> {t.nodeConfig.dateTokensStoredIn} <code className="bg-[var(--t-s2)] px-0.5 rounded">.formatted</code></p>
      </div>
    </div>
  );

  // -- Loop While ----------------------------------------------------------------

  if (type === 'loopWhile') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.loopCondition}</SectionTitle>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.leftValue} <span className="text-red-500">*</span></label>
          <FieldInput
            placeholder="{variable.counter}"
            value={s('leftValue')}
            onChange={e => setField('leftValue', e.target.value)}
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.operator}</label>
          <select
            value={s('operator', '<')}
            onChange={e => setField('operator', e.target.value)}
            className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)] font-mono"
          >
            {getConditionOperators(t).map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.rightValue} <span className="text-red-500">*</span></label>
          <FieldInput
            placeholder="10"
            value={s('rightValue')}
            onChange={e => setField('rightValue', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.maxIterations}</label>
        <FieldInput
          type="number" min="1" max="500" placeholder="100"
          value={String(n('maxIterations', 100))}
          onChange={e => setField('maxIterations', Number(e.target.value))}
        />
      </div>
      <div className="rounded-xl border border-[var(--t-bd)] bg-[var(--t-aa)] px-4 py-3">
        <p className="text-xs font-semibold text-amber-700 mb-1">{t.nodeConfig.loopUsageTitle}</p>
        <p className="text-xs text-[var(--t-sub)]">{t.nodeConfig.loopConnectOutput} <code className="bg-[var(--t-s2)] px-1 rounded">{t.nodeConfig.loopInstructions}</code> {t.nodeConfig.loopToRepeat} <code className="bg-[var(--t-s2)] px-1 rounded">{t.nodeConfig.loopDoneOutput}</code> {t.nodeConfig.loopDoneContinues}</p>
      </div>
    </div>
  );

  // -- Messaging --------------------------------------------------------------

  if (type === 'sendMessage') {
    const fields: EmbedField[] = config.fields ?? [];
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.destination}</SectionTitle>
        <ChannelPicker config={config} setField={setField} botId={botId} />

        <SectionTitle>{t.nodeConfig.text}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.content}</label>
          <FieldTextarea placeholder="Hello world!" value={s('content')} onChange={e => setField('content', e.target.value)} maxLength={2000} />
          <p className="text-xs text-[var(--t-m)] mt-1 text-right">{s('content').length}/2000</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle checked={b('tts')} onChange={v => setField('tts', v)} label={t.nodeConfig.ttsLabel} hint={t.nodeConfig.ttsHint} />
          <Toggle checked={b('ephemeral')} onChange={v => setField('ephemeral', v)} label={t.nodeConfig.ephemeral} hint={t.nodeConfig.ephemeralHint} />
        </div>

        {/* -- Embed riche --------------------------------------------------- */}
        <div className="rounded-xl border border-[var(--t-bd)] overflow-hidden">
          <button type="button"
            onClick={() => setField('includeEmbed', !b('includeEmbed'))}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--t-s2)] hover:bg-[var(--t-bd)] transition">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[var(--t-sub)]" />
              <span className="text-sm font-semibold text-[var(--t-tx)]">{t.nodeConfig.richEmbed}</span>
            </div>
            <div className="flex items-center gap-2">
              {b('includeEmbed') && <span className="text-[10px] bg-[var(--t-a)]/20 text-[var(--t-a)] px-2 py-0.5 rounded-full font-medium">{t.nodeConfig.enabled}</span>}
              {b('includeEmbed') ? <ChevronDown className="w-4 h-4 text-[var(--t-sub)]" /> : <ChevronRight className="w-4 h-4 text-[var(--t-sub)]" />}
            </div>
          </button>
          {b('includeEmbed') && (
            <div className="p-4 space-y-3 bg-[var(--t-s)] border-t border-[var(--t-bd)]">
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.title}</label>
                <FieldInput placeholder={t.nodeConfig.embedTitlePlaceholder} value={s('title')} onChange={e => setField('title', e.target.value)} maxLength={256} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.description}</label>
                <FieldTextarea placeholder={t.nodeConfig.bodyTextPlaceholder} value={s('description')} onChange={e => setField('description', e.target.value)} maxLength={4096} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.color}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={s('color', '#5865F2')} onChange={e => setField('color', e.target.value)} className="h-9 w-12 rounded border border-[var(--t-bd)] cursor-pointer p-0.5" />
                  <FieldInput placeholder="#5865F2" value={s('color', '#5865F2')} onChange={e => setField('color', e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.author}</label>
                  <FieldInput placeholder={t.nodeConfig.authorNamePlaceholder} value={s('authorName')} onChange={e => setField('authorName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.authorIcon}</label>
                  <FieldInput placeholder="https://..." value={s('authorIconUrl')} onChange={e => setField('authorIconUrl', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.footer}</label>
                <FieldInput placeholder={t.nodeConfig.footerTextPlaceholder} value={s('footerText')} onChange={e => setField('footerText', e.target.value)} maxLength={2048} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.imageUrl}</label>
                  <FieldInput placeholder="https://..." value={s('imageUrl')} onChange={e => setField('imageUrl', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.thumbnailUrl}</label>
                  <FieldInput placeholder="https://..." value={s('thumbnailUrl')} onChange={e => setField('thumbnailUrl', e.target.value)} />
                </div>
              </div>
              <SectionTitle>{t.nodeConfig.fields}</SectionTitle>
              <div className="space-y-2">
                {fields.map((f, idx) => (
                  <div key={f.id} className="border border-[var(--t-bd)] rounded-lg p-3 bg-[var(--t-s2)] space-y-2">
                    <div className="flex gap-2 items-center">
                      <FieldInput placeholder={t.nodeConfig.fieldNamePlaceholder} value={f.name} className="flex-1"
                        onChange={e => { const a = [...fields]; a[idx] = {...f, name: e.target.value}; setField('fields', a); }} />
                      <button onClick={() => setField('fields', fields.filter((_, i) => i !== idx))}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <FieldTextarea placeholder={t.nodeConfig.fieldValuePlaceholder} value={f.value} rows={2}
                      onChange={e => { const a = [...fields]; a[idx] = {...f, value: e.target.value}; setField('fields', a); }} />
                    <label className="flex items-center gap-2 text-xs text-[var(--t-sub)] cursor-pointer select-none">
                      <input type="checkbox" checked={f.inline} className="rounded w-3 h-3"
                        onChange={e => { const a = [...fields]; a[idx] = {...f, inline: e.target.checked}; setField('fields', a); }} />
                      {t.nodeConfig.inlineLabel}
                    </label>
                  </div>
                ))}
                {fields.length < 25 && (
                  <button onClick={() => setField('fields', [...fields, makeEmbedField()])}
                    className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-sm text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition">
                    <Plus className="w-4 h-4" /> {t.nodeConfig.addField}
                  </button>
                )}
              </div>
              <SectionTitle>{t.nodeConfig.preview}</SectionTitle>
              <DiscordEmbedPreview config={config} />
            </div>
          )}
        </div>

        {/* -- Image URL ----------------------------------------------------- */}
        <div className="rounded-xl border border-[var(--t-bd)] overflow-hidden">
          <button type="button"
            onClick={() => setField('includeImage', !b('includeImage'))}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--t-s2)] hover:bg-[var(--t-bd)] transition">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-[var(--t-sub)]" />
              <span className="text-sm font-semibold text-[var(--t-tx)]">{t.nodeConfig.imageUrlLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              {b('includeImage') && <span className="text-[10px] bg-[var(--t-a)]/20 text-[var(--t-a)] px-2 py-0.5 rounded-full font-medium">{t.nodeConfig.enabled}</span>}
              {b('includeImage') ? <ChevronDown className="w-4 h-4 text-[var(--t-sub)]" /> : <ChevronRight className="w-4 h-4 text-[var(--t-sub)]" />}
            </div>
          </button>
          {b('includeImage') && (
            <div className="p-4 space-y-3 bg-[var(--t-s)] border-t border-[var(--t-bd)]">
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.imageUrlLabel} <span className="text-red-500">*</span></label>
                <FieldInput placeholder="https://example.com/image.png" value={s('imageUrl')} onChange={e => setField('imageUrl', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.caption}</label>
                <FieldInput placeholder={t.nodeConfig.captionOptional} value={s('imageCaption')} onChange={e => setField('imageCaption', e.target.value)} />
              </div>
              <Toggle checked={b('imageSpoiler')} onChange={v => setField('imageSpoiler', v)} label={t.nodeConfig.spoiler} hint={t.nodeConfig.spoilerHideImage} />
            </div>
          )}
        </div>

        {/* -- Fichier joint -------------------------------------------------- */}
        <div className="rounded-xl border border-[var(--t-bd)] overflow-hidden">
          <button type="button"
            onClick={() => setField('includeFile', !b('includeFile'))}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--t-s2)] hover:bg-[var(--t-bd)] transition">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--t-sub)]" />
              <span className="text-sm font-semibold text-[var(--t-tx)]">{t.nodeConfig.attachment}</span>
            </div>
            <div className="flex items-center gap-2">
              {b('includeFile') && <span className="text-[10px] bg-[var(--t-a)]/20 text-[var(--t-a)] px-2 py-0.5 rounded-full font-medium">{t.nodeConfig.enabled}</span>}
              {b('includeFile') ? <ChevronDown className="w-4 h-4 text-[var(--t-sub)]" /> : <ChevronRight className="w-4 h-4 text-[var(--t-sub)]" />}
            </div>
          </button>
          {b('includeFile') && (
            <div className="p-4 space-y-3 bg-[var(--t-s)] border-t border-[var(--t-bd)]">
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.fileUrl} <span className="text-red-500">*</span></label>
                <FieldInput placeholder="https://example.com/file.pdf" value={s('fileUrl')} onChange={e => setField('fileUrl', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.fileName}</label>
                <FieldInput placeholder="file.pdf" value={s('fileName')} onChange={e => setField('fileName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.description}</label>
                <FieldInput placeholder={t.nodeConfig.altDescription} value={s('fileDescription')} onChange={e => setField('fileDescription', e.target.value)} maxLength={1024} />
              </div>
              <Toggle checked={b('fileSpoiler')} onChange={v => setField('fileSpoiler', v)} label={t.nodeConfig.spoiler} hint={t.nodeConfig.spoilerHideFile} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'editMessage') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetChannelTitle}</SectionTitle>
      <ChannelPicker config={config} setField={setField} botId={botId} />
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('messageId')} onChange={e => setField('messageId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.newContentTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.contentLabel} <span className="text-red-500">*</span></label>
        <FieldTextarea placeholder={t.nodeConfig.newMessageText} value={s('newContent')} onChange={e => setField('newContent', e.target.value)} maxLength={2000} />
        <p className="text-xs text-[var(--t-m)] mt-1 text-right">{s('newContent').length}/2000</p>
      </div>
    </div>
  );

  if (type === 'deleteMessage') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetChannelTitle}</SectionTitle>
      <ChannelPicker config={config} setField={setField} botId={botId} />
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('messageId')} onChange={e => setField('messageId', e.target.value)} />
      </div>
      <div className="flex gap-2 bg-rose-50 rounded-xl p-4 text-sm text-rose-600 border border-rose-200 mt-4">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
        <p>{t.nodeConfig.irreversibleDeleteMsgWarning}</p>
      </div>
    </div>
  );

  if (type === 'replyToMessage') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.replyContentTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.contentLabel} <span className="text-red-500">*</span></label>
        <FieldTextarea placeholder={t.nodeConfig.yourReply} value={s('content')} onChange={e => setField('content', e.target.value)} maxLength={2000} />
        <p className="text-xs text-[var(--t-m)] mt-1 text-right">{s('content').length}/2000</p>
      </div>
      <SectionTitle>{t.nodeConfig.optionsTitle}</SectionTitle>
      <Toggle checked={b('mentionAuthor', true)} onChange={v => setField('mentionAuthor', v)} label={t.nodeConfig.mentionAuthorLabel} hint={t.nodeConfig.mentionAuthorHint} />
      <Toggle checked={b('tts')} onChange={v => setField('tts', v)} label={t.nodeConfig.ttsLabel} hint={t.nodeConfig.ttsHint} />
    </div>
  );

  // -- Roles -------------------------------------------------------------------

  if (type === 'addRole' || type === 'removeRole') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.target}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.roleIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('roleId')} onChange={e => setField('roleId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.optionalAuditLogReason} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
    </div>
  );

  if (type === 'createRole') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.roleInfoTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.nameLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder={t.nodeConfig.newRolePlaceholder} value={s('name')} onChange={e => setField('name', e.target.value)} maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.colorLabel2}</label>
        <div className="flex gap-2 items-center">
          <input type="color" value={s('color', '#99AAB5')} onChange={e => setField('color', e.target.value)} className="h-9 w-12 rounded border border-[var(--t-bd)] cursor-pointer p-0.5" />
          <FieldInput placeholder="#99AAB5" value={s('color', '#99AAB5')} onChange={e => setField('color', e.target.value)} className="flex-1" />
        </div>
      </div>
      <SectionTitle>{t.nodeConfig.optionsTitle}</SectionTitle>
      <div className="space-y-2">
        <Toggle checked={b('hoist')} onChange={v => setField('hoist', v)} label={t.nodeConfig.hoistLabel} hint={t.nodeConfig.hoistHint} />
        <Toggle checked={b('mentionable')} onChange={v => setField('mentionable', v)} label={t.nodeConfig.mentionableHintToggle} hint={t.nodeConfig.mentionableHintText} />
      </div>
    </div>
  );

  // -- Moderation --------------------------------------------------------------

  if (type === 'kick') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetMemberTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.reasonForKick} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
    </div>
  );

  if (type === 'ban') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetMemberTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.optionsTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.deleteMessageDays}</label>
        <input type="number" min={0} max={7} value={n('deleteMessageDays')}
          onChange={e => setField('deleteMessageDays', Math.min(7, Math.max(0, parseInt(e.target.value) || 0)))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.daysRangeHint}</p>
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.reasonForBan} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
    </div>
  );

  if (type === 'unban') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetUserTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.reasonForUnban} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
    </div>
  );

  if (type === 'timeout') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetMemberTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.durationTitleSection}</SectionTitle>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.duration} <span className="text-red-500">*</span></label>
          <input type="number" min={1} value={n('duration', 10)}
            onChange={e => setField('duration', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.unit}</label>
          <select value={s('durationUnit', 'minutes')} onChange={e => setField('durationUnit', e.target.value)}
            className="px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
            {DURATION_UNITS.map(u => {
              const labels: Record<string, string> = { seconds: t.nodeConfig.seconds, minutes: t.nodeConfig.minutes, hours: t.nodeConfig.hours, days: t.nodeConfig.days };
              return <option key={u.value} value={u.value}>{labels[u.value] ?? u.label}</option>;
            })}
          </select>
        </div>
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.reasonForTimeout} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
    </div>
  );

  if (type === 'setNickname') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetMemberTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.nicknameTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.newNickname}</label>
        <FieldInput placeholder={t.nodeConfig.leaveEmptyToResetPlaceholder} value={s('nickname')} onChange={e => setField('nickname', e.target.value)} maxLength={32} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.blankToRemoveNickname}</p>
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.reasonForNicknameChangePlaceholder} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
    </div>
  );

  // -- Channels ----------------------------------------------------------------

  if (type === 'createChannel') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.channelInfoTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.nameLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="new-channel" value={s('name')}
          onChange={e => setField('name', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))} maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.typeLabel}</label>
        <select value={s('channelType', 'text')} onChange={e => setField('channelType', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
          {CHANNEL_TYPES.map(ct => {
            const labels: Record<string, string> = { text: t.nodeConfig.textChannel, voice: t.nodeConfig.voiceChannel, category: t.nodeConfig.categoryChannel, forum: t.nodeConfig.forumChannel, announcement: t.nodeConfig.announcementChannel };
            return <option key={ct.value} value={ct.value}>{labels[ct.value] ?? ct.label}</option>;
          })}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.topicLabel}</label>
        <FieldInput placeholder={t.nodeConfig.channelTopicPlaceholder} value={s('topic')} onChange={e => setField('topic', e.target.value)} maxLength={1024} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.parentCategoryId}</label>
        <FieldInput placeholder={t.nodeConfig.categoryChannelIdPlaceholder} value={s('parentId')} onChange={e => setField('parentId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.optionsTitle}</SectionTitle>
      <Toggle checked={b('nsfw')} onChange={v => setField('nsfw', v)} label={t.nodeConfig.nsfwLabel} hint={t.nodeConfig.nsfwHint} />
    </div>
  );

  if (type === 'deleteChannel') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetChannelTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.channelIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. 123456789012345678" value={s('channelId')} onChange={e => setField('channelId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.auditLogTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reasonLabel}</label>
        <FieldInput placeholder={t.nodeConfig.reasonForDeletion} value={s('reason')} onChange={e => setField('reason', e.target.value)} maxLength={512} />
      </div>
      <div className="flex gap-2 bg-rose-50 rounded-xl p-4 text-sm text-rose-600 border border-rose-200">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
        <p>{t.nodeConfig.irreversibleDeleteChannelWarning}</p>
      </div>
    </div>
  );

  // -- Voice ------------------------------------------------------------------

  if (type === 'joinVoiceChannel') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.voiceChannelTitle}</SectionTitle>
      <VoiceChannelPicker config={config} setField={setField} />
      <Toggle checked={b('selfMute')} onChange={v => setField('selfMute', v)} label={t.nodeConfig.selfMuteLabel} hint={t.nodeConfig.botJoinsMutedHint} />
      <Toggle checked={b('selfDeaf', true)} onChange={v => setField('selfDeaf', v)} label={t.nodeConfig.selfDeafLabel} hint={t.nodeConfig.botJoinsDeaf} />
    </div>
  );

  if (type === 'leaveVoiceChannel') return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-[var(--t-aa)] rounded-xl p-4 text-sm text-[var(--t-a)] border border-[var(--t-bd)]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--t-a)]" />
        <p>{t.nodeConfig.disconnectBot} {t.nodeConfig.currentlyOnServer}</p>
      </div>
    </div>
  );

  if (type === 'playAudio') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.audioSource}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.typeLabel}</label>
        <select value={s('audioSource', 'url')} onChange={e => setField('audioSource', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
          <option value="url">{t.nodeConfig.urlDirect}</option>
          <option value="youtube">{t.nodeConfig.youtube}</option>
          <option value="variable">{t.nodeConfig.variableBuffer}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">
          {s('audioSource', 'url') === 'variable' ? t.nodeConfig.variableLabel : t.nodeConfig.urlLabel}  <span className="text-red-500">*</span>
        </label>
        <FieldInput
          placeholder={s('audioSource', 'url') === 'variable' ? '{variable.audio}' : s('audioSource', 'url') === 'youtube' ? 'https://youtube.com/watch?v=…' : 'https://…/audio.mp3'}
          value={s('audioUrl')}
          onChange={e => setField('audioUrl', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.volumeLabel}</label>
        <input type="number" min={0} max={200} value={n('volume', 100)} onChange={e => setField('volume', Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
      </div>
      <Toggle checked={b('waitForEnd', true)} onChange={v => setField('waitForEnd', v)} label={t.nodeConfig.waitEnd} hint={t.nodeConfig.waitEndHint} />
    </div>
  );

  if (type === 'stopAudio') return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-[var(--t-aa)] rounded-xl p-4 text-sm text-[var(--t-a)] border border-[var(--t-bd)]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--t-a)]" />
        <p>{t.nodeConfig.stopPlayback} {t.nodeConfig.inBotVoiceChannel}</p>
      </div>
    </div>
  );

  if (type === 'moveToVoice') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.member}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.destinationTitle}</SectionTitle>
      <VoiceChannelPicker config={config} setField={setField} label={t.nodeConfig.destChannel} />
    </div>
  );

  if (type === 'disconnectFromVoice') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.member}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
    </div>
  );

  // -- Bot Management ----------------------------------------------------------

  if (type === 'setBotPresence') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.statutTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.statusLabel}</label>
        <select value={s('status', 'online')} onChange={e => setField('status', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
          <option value="online">{t.nodeConfig.statusOnline}</option>
          <option value="idle">{t.nodeConfig.statusIdle}</option>
          <option value="dnd">{t.nodeConfig.statusDnd}</option>
          <option value="invisible">{t.nodeConfig.statusInvisible}</option>
        </select>
      </div>
      <SectionTitle>{t.nodeConfig.activity}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.typeLabel}</label>
        <select value={s('activityType', 'Playing')} onChange={e => setField('activityType', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
          <option value="Playing">{t.nodeConfig.playingActivity}</option>
          <option value="Streaming">{t.nodeConfig.streamingActivity}</option>
          <option value="Listening">{t.nodeConfig.listeningActivity}</option>
          <option value="Watching">{t.nodeConfig.watchingActivity}</option>
          <option value="Competing">{t.nodeConfig.competingActivity}</option>
          <option value="Custom">{t.nodeConfig.customStatusActivity}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.activityText}</label>
        <FieldInput placeholder="e.g. Discord workflows" value={s('activityText')} onChange={e => setField('activityText', e.target.value)} />
      </div>
      {s('activityType') === 'Streaming' && (
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.streamUrl}</label>
          <FieldInput placeholder="https://twitch.tv/..." value={s('streamUrl')} onChange={e => setField('streamUrl', e.target.value)} />
        </div>
      )}
      <SectionTitle>{t.nodeConfig.rotationOptional}</SectionTitle>
      <p className="text-xs text-[var(--t-m)] bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-lg px-3 py-2 leading-relaxed">
        {t.nodeConfig.activityRotationDesc}
      </p>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.rotationActivities}</label>
        <textarea
          rows={4}
          placeholder={t.nodeConfig.rotationPlaceholder}
          value={s('rotationActivities')}
          onChange={e => setField('rotationActivities', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)] resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.rotationInterval}</label>
        <input type="number" min={5} value={n('rotationInterval', 30)} onChange={e => setField('rotationInterval', Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
      </div>
    </div>
  );

  if (type === 'setBotNickname') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.serverNickname}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.newNickname}</label>
        <FieldInput placeholder={t.nodeConfig.emptyToReset} value={s('nickname')} onChange={e => setField('nickname', e.target.value)} maxLength={32} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.supportsVars} <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable.xxx}'}</code></p>
      </div>
    </div>
  );

  if (type === 'setBotAvatar') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.globalAvatar}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.avatarUrl} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="https://…/avatar.png" value={s('avatarUrl')} onChange={e => setField('avatarUrl', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.avatarRateLimitHint}</p>
      </div>
    </div>
  );

  // -- Interactions ------------------------------------------------------------

  if (type === 'sendDM') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.recipient}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.contentTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageLabel}</label>
        <textarea rows={4} placeholder="Hello {user.username}!" value={s('content')} onChange={e => setField('content', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)] resize-none" />
      </div>
    </div>
  );

  if (type === 'addReaction') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.targetMessage}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{message.id}" value={s('messageId')} onChange={e => setField('messageId', e.target.value)} />
      </div>
      <ChannelPicker config={config} setField={setField} botId={botId} />
      <SectionTitle>{t.nodeConfig.emoji}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.emojiLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="?? or <:name:id>" value={s('emoji')} onChange={e => setField('emoji', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.emojiUnicodeHint}</p>
      </div>
    </div>
  );

  if (type === 'pinMessage' || type === 'unpinMessage') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.messageTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{message.id}" value={s('messageId')} onChange={e => setField('messageId', e.target.value)} />
      </div>
      <ChannelPicker config={config} setField={setField} botId={botId} />
    </div>
  );

  if (type === 'createThread') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.thread}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.name} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="e.g. Support #{user.username}" value={s('threadName')} onChange={e => setField('threadName', e.target.value)} maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.source}</label>
        <select value={s('threadSource', 'channel')} onChange={e => setField('threadSource', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
          <option value="channel">{t.nodeConfig.fromChannel}</option>
          <option value="message">{t.nodeConfig.fromMessage}</option>
        </select>
      </div>
      {s('threadSource', 'channel') === 'message' && (
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageIdLabel} <span className="text-red-500">*</span></label>
          <FieldInput placeholder="{message.id}" value={s('messageId')} onChange={e => setField('messageId', e.target.value)} />
        </div>
      )}
      <ChannelPicker config={config} setField={setField} botId={botId} />
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.autoArchive}</label>
        <select value={String(n('autoArchiveDuration', 1440))} onChange={e => setField('autoArchiveDuration', Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
          <option value="60">{t.nodeConfig.oneHour}</option>
          <option value="1440">{t.nodeConfig.twentyFourHours}</option>
          <option value="4320">{t.nodeConfig.threeDays}</option>
          <option value="10080">{t.nodeConfig.oneWeek}</option>
        </select>
      </div>
      <Toggle checked={b('privateThread')} onChange={v => setField('privateThread', v)} label={t.nodeConfig.privateThread} hint={t.nodeConfig.privateThreadHint} />
    </div>
  );

  if (type === 'archiveThread') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.thread}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.threadIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder={t.nodeConfig.threadToArchive} value={s('threadId')} onChange={e => setField('threadId', e.target.value)} />
      </div>
      <Toggle checked={b('locked')} onChange={v => setField('locked', v)} label={t.nodeConfig.lock} hint={t.nodeConfig.lockHint} />
    </div>
  );

  if (type === 'editChannel') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.channelToEdit}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.channelIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder={t.nodeConfig.channelIdLabel} value={s('channelId')} onChange={e => setField('channelId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.modifications}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.newName}</label>
        <FieldInput placeholder={t.nodeConfig.leaveEmptyNoChange} value={s('newName')} onChange={e => setField('newName', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))} maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.newTopic}</label>
        <FieldInput placeholder={t.nodeConfig.leaveEmptyNoChange} value={s('newTopic')} onChange={e => setField('newTopic', e.target.value)} maxLength={1024} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.slowmode}</label>
        <input type="number" min={0} max={21600} value={n('slowmode', 0)} onChange={e => setField('slowmode', Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
      </div>
    </div>
  );

  if (type === 'createInvite') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.sourceChannel}</SectionTitle>
      <ChannelPicker config={config} setField={setField} botId={botId} />
      <SectionTitle>{t.nodeConfig.optionsTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.durationSeconds}</label>
        <input type="number" min={0} value={n('maxAge', 86400)} onChange={e => setField('maxAge', Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.maxUses}</label>
        <input type="number" min={0} max={100} value={n('maxUses', 0)} onChange={e => setField('maxUses', Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
      </div>
      <Toggle checked={b('unique')} onChange={v => setField('unique', v)} label={t.nodeConfig.unique} hint={t.nodeConfig.uniqueHint} />
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.storeLinkIn}</label>
        <FieldInput placeholder="inviteUrl" value={s('outputVar')} onChange={e => setField('outputVar', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'serverMuteMember' || type === 'serverDeafenMember') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.member}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <Toggle
        checked={b('enable', true)}
        onChange={v => setField('enable', v)}
        label={type === 'serverMuteMember' ? t.nodeConfig.muteLabel : t.nodeConfig.deafenLabel}
        hint={type === 'serverMuteMember' ? t.nodeConfig.disableMuteHint : t.nodeConfig.disableDeafenHint}
      />
    </div>
  );

  if (type === 'fetchUserInfo') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.userToFetch}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-red-500">*</span></label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.output}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.variablePrefix}</label>
        <FieldInput placeholder="fetchedUser" value={s('outputVar', 'fetchedUser')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1 leading-relaxed">
          {t.nodeConfig.fetchUserCreates} <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar','fetchedUser')}.id{'}'}</code>,{' '}
          <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar','fetchedUser')}.username{'}'}</code>,{' '}
          <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar','fetchedUser')}.avatar{'}'}</code>{t.nodeConfig.etcSuffix}
        </p>
      </div>
      <Toggle checked={b('fetchMember', true)} onChange={v => setField('fetchMember', v)} label={t.nodeConfig.includeMemberData} hint={t.nodeConfig.includeMemberDataHint} />
    </div>
  );

  // -------------------------------------------------------- Components -

  // -- Send Buttons ------------------------------------------------------------
  if (type === 'sendButtons') {
    type ButtonDef = { id: string; label: string; customId: string; style: 'Primary'|'Secondary'|'Success'|'Danger'|'Link'; emoji: string; url: string; };
    const buttons: ButtonDef[] = (config.buttons as ButtonDef[]) ?? [];
    const makeBtn = (): ButtonDef => ({ id: `${Date.now()}`, label: '', customId: '', style: 'Primary', emoji: '', url: '' });
    const setBtn = (idx: number, patch: Partial<ButtonDef>) => setField('buttons', buttons.map((b,i) => i===idx ? { ...b, ...patch } : b));
    const styleColors: Record<string, string> = { Primary:'#5865F2', Secondary:'#4f545c', Success:'#3ba55d', Danger:'#ed4245', Link:'#4f545c' };
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.messageTitle}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageContent}</label>
          <FieldInput placeholder={t.nodeConfig.chooseOption} value={s('content')} onChange={e => setField('content', e.target.value)} />
        </div>
        <ChannelPicker config={config} setField={setField} botId={botId} />
        <div className="flex gap-4">
          <Toggle checked={b('ephemeral')} onChange={v => setField('ephemeral', v)} label={t.nodeConfig.ephemeral} hint={t.nodeConfig.ephemeralHint} />
          <Toggle checked={b('replyToInteraction', true)} onChange={v => setField('replyToInteraction', v)} label={t.nodeConfig.reply} hint={t.nodeConfig.replyToInteraction} />
        </div>
        <SectionTitle>{t.nodeConfig.buttons} ({buttons.length}/5)</SectionTitle>
        <div className="space-y-2">
          {buttons.map((btn, i) => (
            <div key={btn.id} className="rounded-lg border border-[var(--t-bd)] bg-[var(--t-s2)] p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ background: styleColors[btn.style] ?? '#888' }} />
                <span className="text-xs font-semibold text-[var(--t-tx)] flex-1">{t.nodeConfig.buttonN} {i+1}</span>
                <button type="button" onClick={() => setField('buttons', buttons.filter((_,j)=>j!==i))} className="text-[var(--t-m)] hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.labelRequired}</label>
                  <FieldInput placeholder={t.nodeConfig.clickHere} value={btn.label} onChange={e => setBtn(i,{label:e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.style}</label>
                  <select value={btn.style} onChange={e => setBtn(i, { style: e.target.value as ButtonDef['style'] })}
                    className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm bg-[var(--t-bg)] text-[var(--t-tx)] outline-none focus:border-[var(--t-a)]/60">
                    <option value="Primary">{t.nodeConfig.primaryStyle}</option>
                    <option value="Secondary">{t.nodeConfig.secondaryStyle}</option>
                    <option value="Success">{t.nodeConfig.successStyle}</option>
                    <option value="Danger">{t.nodeConfig.dangerStyle}</option>
                    <option value="Link">{t.nodeConfig.linkStyle}</option>
                  </select>
                </div>
              </div>
              {btn.style !== 'Link' ? (
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.customIdLabel} <span className="text-[var(--t-m)]">{t.nodeConfig.customIdUniqueHint}</span></label>
                  <FieldInput placeholder="btn_accept" value={btn.customId} onChange={e => setBtn(i,{customId:e.target.value})} />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.urlLabel} *</label>
                  <FieldInput placeholder="https://discord.gg/..." value={btn.url} onChange={e => setBtn(i,{url:e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.emojiLabel} <span className="text-[var(--t-m)]">({t.nodeConfig.optionalLabel})</span></label>
                <FieldInput placeholder="?? or :emoji_name:" value={btn.emoji} onChange={e => setBtn(i,{emoji:e.target.value})} />
              </div>
            </div>
          ))}
        </div>
        {buttons.length < 5 && (
          <button type="button" onClick={() => setField('buttons', [...buttons, makeBtn()])}
            className="flex items-center gap-1.5 text-xs text-[var(--t-a)] hover:text-[var(--t-tx)] transition px-3 py-1.5 rounded-lg border border-[var(--t-a)]/40 hover:bg-[var(--t-a)] w-full justify-center">
            <Plus className="w-3.5 h-3.5" /> {t.nodeConfig.addButton}
          </button>
        )}
      </div>
    );
  }

  // -- String Select Menu -------------------------------------------------------
  if (type === 'sendStringSelectMenu') {
    type OptDef = { id: string; label: string; value: string; description: string; emoji: string; default: boolean; };
    const options: OptDef[] = (config.options as OptDef[]) ?? [];
    const makeOpt = (): OptDef => ({ id: `${Date.now()}`, label: '', value: '', description: '', emoji: '', default: false });
    const setOpt = (idx: number, patch: Partial<OptDef>) => setField('options', options.map((o,i) => i===idx ? { ...o, ...patch } : o));
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.messageTitle}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageContent}</label>
          <FieldInput placeholder={t.nodeConfig.makeYourChoice} value={s('content')} onChange={e => setField('content', e.target.value)} />
        </div>
        <ChannelPicker config={config} setField={setField} botId={botId} />
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.placeholderLabel}</label>
          <FieldInput placeholder={t.nodeConfig.chooseAnOption} value={s('placeholder')} onChange={e => setField('placeholder', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.minChoices}</label>
            <FieldInput type="number" min="0" max="25" value={String(n('minValues',1))} onChange={e => setField('minValues', parseInt(e.target.value)||1)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.maxChoices}</label>
            <FieldInput type="number" min="1" max="25" value={String(n('maxValues',1))} onChange={e => setField('maxValues', parseInt(e.target.value)||1)} />
          </div>
        </div>
        <Toggle checked={b('ephemeral')} onChange={v => setField('ephemeral',v)} label={t.nodeConfig.ephemeral} />
        <SectionTitle>{t.nodeConfig.options} ({options.length}/25)</SectionTitle>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={opt.id} className="rounded-lg border border-[var(--t-bd)] bg-[var(--t-s2)] p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[var(--t-tx)] flex-1">{t.nodeConfig.optionN} {i+1}</span>
                <Toggle checked={opt.default} onChange={v => setOpt(i,{default:v})} label={t.nodeConfig.default_} />
                <button type="button" onClick={() => setField('options', options.filter((_,j)=>j!==i))} className="text-[var(--t-m)] hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.labelRequired}</label>
                  <FieldInput placeholder="Option A" value={opt.label} onChange={e => setOpt(i,{label:e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.valueLabel}</label>
                  <FieldInput placeholder="option_a" value={opt.value} onChange={e => setOpt(i,{value:e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.description}</label>
                  <FieldInput placeholder={t.nodeConfig.shortDescPlaceholder} value={opt.description} onChange={e => setOpt(i,{description:e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.emojiLabel}</label>
                  <FieldInput placeholder="??" value={opt.emoji} onChange={e => setOpt(i,{emoji:e.target.value})} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {options.length < 25 && (
          <button type="button" onClick={() => setField('options', [...options, makeOpt()])}
            className="flex items-center gap-1.5 text-xs text-[var(--t-a)] hover:text-[var(--t-tx)] transition px-3 py-1.5 rounded-lg border border-[var(--t-a)]/40 hover:bg-[var(--t-a)] w-full justify-center">
            <Plus className="w-3.5 h-3.5" /> {t.nodeConfig.addOption}
          </button>
        )}
      </div>
    );
  }

  // -- User / Role / Channel Select Menus --------------------------------------
  if (type === 'sendUserSelectMenu' || type === 'sendRoleSelectMenu' || type === 'sendChannelSelectMenu') {
    const label = type === 'sendUserSelectMenu' ? t.nodeConfig.users : type === 'sendRoleSelectMenu' ? t.nodeConfig.roles : t.nodeConfig.channels;
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.messageTitle}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageContent}</label>
          <FieldInput placeholder={`${t.nodeConfig.selectItems} ${label} :`} value={s('content')} onChange={e => setField('content', e.target.value)} />
        </div>
        <ChannelPicker config={config} setField={setField} botId={botId} />
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.placeholderLabel}</label>
          <FieldInput placeholder={`${t.nodeConfig.chooseItems} ${label}...`} value={s('placeholder')} onChange={e => setField('placeholder', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.minLabel}</label>
            <FieldInput type="number" min="0" max="25" value={String(n('minValues',1))} onChange={e => setField('minValues', parseInt(e.target.value)||1)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.maxLabel}</label>
            <FieldInput type="number" min="1" max="25" value={String(n('maxValues',1))} onChange={e => setField('maxValues', parseInt(e.target.value)||1)} />
          </div>
        </div>
        <Toggle checked={b('ephemeral')} onChange={v => setField('ephemeral',v)} label={t.nodeConfig.ephemeral} />
        <SectionTitle>{t.nodeConfig.output}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.resultVariable}</label>
          <FieldInput placeholder="selectedItems" value={s('outputVar','selectedItems')} onChange={e => setField('outputVar', e.target.value)} />
          <p className="text-xs text-[var(--t-m)] mt-1">{'{' + s('outputVar','selectedItems') + '}'} {t.nodeConfig.selectOutputHint}</p>
        </div>
      </div>
    );
  }

  // -- Send Modal ---------------------------------------------------------------
  if (type === 'sendModal') {
    type FieldDef = { id: string; label: string; customId: string; style: 'short'|'paragraph'; placeholder: string; required: boolean; minLength: number; maxLength: number; };
    const fields: FieldDef[] = (config.fields as FieldDef[]) ?? [];
    const makeField = (): FieldDef => ({ id: `${Date.now()}`, label: '', customId: '', style: 'short', placeholder: '', required: true, minLength: 0, maxLength: 0 });
    const setFld = (idx: number, patch: Partial<FieldDef>) => setField('fields', fields.map((f,i) => i===idx ? { ...f, ...patch } : f));
    return (
      <div className="space-y-4">
        <SectionTitle>{t.nodeConfig.modalTitleSection}</SectionTitle>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.titleRequired}</label>
          <FieldInput placeholder={t.nodeConfig.formPlaceholder} value={s('title')} onChange={e => setField('title', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.customIdLabel} <span className="text-xs text-[var(--t-m)]">{t.nodeConfig.customIdSubmissionHint}</span></label>
          <FieldInput placeholder="contact_form" value={s('customId')} onChange={e => setField('customId', e.target.value)} />
        </div>
        <p className="text-xs text-[var(--t-m)] bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-lg px-3 py-2">
          {t.nodeConfig.modalWarning}
        </p>
        <SectionTitle>{t.nodeConfig.fieldsCount} ({fields.length}/5)</SectionTitle>
        <div className="space-y-2">
          {fields.map((fld, i) => (
            <div key={fld.id} className="rounded-lg border border-[var(--t-bd)] bg-[var(--t-s2)] p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[var(--t-tx)] flex-1">{t.nodeConfig.fieldN} {i+1}</span>
                <button type="button" onClick={() => setField('fields', fields.filter((_,j)=>j!==i))} className="text-[var(--t-m)] hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.labelRequired}</label>
                  <FieldInput placeholder={t.nodeConfig.yourMessage} value={fld.label} onChange={e => setFld(i,{label:e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.customIdLabel}</label>
                  <FieldInput placeholder="message_field" value={fld.customId} onChange={e => setFld(i,{customId:e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.style}</label>
                  <select value={fld.style} onChange={e => setFld(i,{style:e.target.value as FieldDef['style']})}
                    className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm bg-[var(--t-bg)] text-[var(--t-tx)] outline-none focus:border-[var(--t-a)]/60">
                    <option value="short">{t.nodeConfig.shortOneLine}</option>
                    <option value="paragraph">{t.nodeConfig.paragraph}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--t-sub)] mb-1">{t.nodeConfig.placeholderLabel}</label>
                  <FieldInput placeholder={t.nodeConfig.enterPlaceholder} value={fld.placeholder} onChange={e => setFld(i,{placeholder:e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Toggle checked={fld.required} onChange={v => setFld(i,{required:v})} label={t.nodeConfig.required} />
              </div>
            </div>
          ))}
        </div>
        {fields.length < 5 && (
          <button type="button" onClick={() => setField('fields', [...fields, makeField()])}
            className="flex items-center gap-1.5 text-xs text-[var(--t-a)] hover:text-[var(--t-tx)] transition px-3 py-1.5 rounded-lg border border-[var(--t-a)]/40 hover:bg-[var(--t-a)] w-full justify-center">
            <Plus className="w-3.5 h-3.5" /> {t.nodeConfig.addField}
          </button>
        )}
      </div>
    );
  }

  // -- Await Button Click -------------------------------------------------------
  if (type === 'awaitButtonClick') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.filterSectionTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.buttonCustomId} <span className="text-[var(--t-m)] text-xs">({t.nodeConfig.optionalLabel})</span></label>
        <FieldInput placeholder="btn_accept" value={s('filterCustomId')} onChange={e => setField('filterCustomId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-[var(--t-m)] text-xs">{t.nodeConfig.optionalRestrictUser}</span></label>
        <FieldInput placeholder="{user.id}" value={s('filterUserId')} onChange={e => setField('filterUserId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageIdLabel} <span className="text-[var(--t-m)] text-xs">({t.nodeConfig.optionalLabel})</span></label>
        <FieldInput placeholder="{message.id}" value={s('messageId')} onChange={e => setField('messageId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.timeoutTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.duration} {t.nodeConfig.durationMs}</label>
        <FieldInput type="number" min="1000" placeholder="60000" value={String(n('time',60000))} onChange={e => setField('time', parseInt(e.target.value)||60000)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.timeoutHintPrefix} <strong>Timeout</strong> {t.nodeConfig.timeoutHintSuffix}</p>
      </div>
      <SectionTitle>{t.nodeConfig.output}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.resultVariable}</label>
        <FieldInput placeholder="buttonClick" value={s('outputVar','buttonClick')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.storesHint} <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar','buttonClick')}.customId{'}'}</code>, <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}{s('outputVar','buttonClick')}.userId{'}'}</code></p>
      </div>
    </div>
  );

  // -- Await Select Menu --------------------------------------------------------
  if (type === 'awaitSelectMenu') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.filterSectionTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.menuCustomId} <span className="text-[var(--t-m)] text-xs">({t.nodeConfig.optionalLabel})</span></label>
        <FieldInput placeholder="my_select" value={s('filterCustomId')} onChange={e => setField('filterCustomId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userIdLabel} <span className="text-[var(--t-m)] text-xs">({t.nodeConfig.optionalLabel})</span></label>
        <FieldInput placeholder="{user.id}" value={s('filterUserId')} onChange={e => setField('filterUserId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.timeoutTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.duration} {t.nodeConfig.durationMs}</label>
        <FieldInput type="number" min="1000" placeholder="60000" value={String(n('time',60000))} onChange={e => setField('time', parseInt(e.target.value)||60000)} />
      </div>
      <SectionTitle>{t.nodeConfig.output}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.resultVariable}</label>
        <FieldInput placeholder="selectResult" value={s('outputVar','selectResult')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.storesHint} <code className="bg-[var(--t-bg)] px-1 rounded">{'{'}{s('outputVar','selectResult')}.values{'}'}</code> {t.nodeConfig.frArrayAndHint} <code className="bg-[var(--t-bg)] px-1 rounded">{'{'}{s('outputVar','selectResult')}.userId{'}'}</code>.</p>
      </div>
    </div>
  );

  // \u2500\u2500 Interaction Handlers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  if (type === 'buttonInteractionHandler' || type === 'selectMenuInteractionHandler' || type === 'modalSubmitHandler') {
    return <InteractionHandlerPanel type={type} config={config} setField={setField} graphNodes={graphNodes} />;
  }

  // -- HTTP Request ----------------------------------------------------------
  if (type === 'httpRequest') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.request}</SectionTitle>
      <div className="flex gap-2">
        <div className="w-28 shrink-0">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.method}</label>
          <select className="w-full rounded-lg border border-[var(--t-bd)] bg-[var(--t-bg)] text-[var(--t-tx)] px-2 py-1.5 text-sm" value={s('method','GET')} onChange={e => setField('method', e.target.value)}>
            {['GET','POST','PUT','PATCH','DELETE','HEAD'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.urlLabel}</label>
          <FieldInput placeholder="https://api.example.com/data" value={s('url')} onChange={e => setField('url', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.headersJsonLabel}</label>
        <FieldTextarea rows={3} placeholder={'{"Authorization": "Bearer {variable.token}"}'} value={s('headers')} onChange={e => setField('headers', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.bodyLabel}</label>
        <FieldTextarea rows={4} placeholder={'{"key": "value"}'} value={s('body')} onChange={e => setField('body', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.responseVariable}</label>
        <FieldInput placeholder="_httpResponse" value={s('responseVariable','_httpResponse')} onChange={e => setField('responseVariable', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.httpResponsePrefix} <code className="bg-[var(--t-s2)] px-1 rounded">{'{'}variable.__httpStatus__{'}'}</code>.</p>
      </div>
    </div>
  );

  if (type === 'webhook') return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--t-bd)] bg-[var(--t-aa)] p-4">
        <p className="text-xs font-semibold text-sky-700 mb-1">{t.nodeConfig.webhookSourceTitle}</p>
        <p className="text-xs text-sky-600">{t.nodeConfig.webhookTriggerDesc}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.receiveVariable}</label>
        <FieldInput placeholder="_webhookPayload" value={s('outputVar','_webhookPayload')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.postBodyHint}</p>
      </div>
    </div>
  );

  // -- Modération étendue ----------------------------------------------------
  if (type === 'unmute') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.target}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.userId}</label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.reason}</label>
        <FieldInput placeholder={t.nodeConfig.timeoutEndedEarly} value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'bulkDeleteMessages') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.channelTitle}</SectionTitle>
      <ChannelPicker config={config} setField={setField} botId={botId} />
      <SectionTitle>{t.nodeConfig.optionsTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.messageCount}</label>
        <FieldInput type="number" placeholder="10" value={s('count','10')} onChange={e => setField('count', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.discordIgnoresOldMsg}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.deletedCountVar}</label>
        <FieldInput placeholder="_deletedCount" value={s('outputVar','_deletedCount')} onChange={e => setField('outputVar', e.target.value)} />
      </div>
    </div>
  );

  // -- Guild Extended --------------------------------------------------------
  if (type === 'editGuild') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.serverSettings}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.name}</label>
        <FieldInput placeholder="My Server" value={s('name')} onChange={e => setField('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.description}</label>
        <FieldTextarea rows={2} placeholder={t.nodeConfig.serverDescPlaceholder} value={s('description')} onChange={e => setField('description', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.iconUrlBase64}</label>
        <FieldInput placeholder="https://..." value={s('icon')} onChange={e => setField('icon', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.bannerUrl}</label>
        <FieldInput placeholder="https://..." value={s('banner')} onChange={e => setField('banner', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder={t.nodeConfig.autoUpdate} value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'editRole') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.role}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.roleId}</label>
        <FieldInput placeholder="{variable.roleId}" value={s('roleId')} onChange={e => setField('roleId', e.target.value)} />
      </div>
      <SectionTitle>{t.nodeConfig.modifications}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.newName}</label>
        <FieldInput placeholder={t.nodeConfig.verifiedMember} value={s('name')} onChange={e => setField('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.color}</label>
        <FieldInput placeholder="#5865F2" value={s('color')} onChange={e => setField('color', e.target.value)} />
      </div>
      <div className="flex gap-4">
        <Toggle checked={!!config.hoist} onChange={v => setField('hoist', v)} label={t.nodeConfig.displaySeparately} />
        <Toggle checked={!!config.mentionable} onChange={v => setField('mentionable', v)} label={t.nodeConfig.mentionable} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder={t.nodeConfig.autoModification} value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'deleteRole') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.roleToDelete}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.roleId}</label>
        <FieldInput placeholder="{variable.roleId}" value={s('roleId')} onChange={e => setField('roleId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder={t.nodeConfig.autoDeletion} value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'createEmoji') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.emoji}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.name}</label>
        <FieldInput placeholder="mon_emoji" value={s('name')} onChange={e => setField('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.imageUrlLabel}</label>
        <FieldInput placeholder="https://..." value={s('imageUrl')} onChange={e => setField('imageUrl', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.createdIdVar}</label>
        <FieldInput placeholder="_emojiId" value={s('outputVar','_emojiId')} onChange={e => setField('outputVar', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'deleteEmoji' || type === 'editEmoji') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.emoji}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.emojiId}</label>
        <FieldInput placeholder="{variable._emojiId}" value={s('emojiId')} onChange={e => setField('emojiId', e.target.value)} />
      </div>
      {type === 'editEmoji' && <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.newNameLabel}</label>
        <FieldInput placeholder="new_name" value={s('name')} onChange={e => setField('name', e.target.value)} />
      </div>}
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'createSticker') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.stickerTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.name}</label>
        <FieldInput placeholder="mon_sticker" value={s('name')} onChange={e => setField('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.description}</label>
        <FieldInput placeholder={t.nodeConfig.stickerDescription} value={s('description')} onChange={e => setField('description', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.emojiTag}</label>
        <FieldInput placeholder="??" value={s('emoji','??')} onChange={e => setField('emoji', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.fileUrl}</label>
        <FieldInput placeholder="https://..." value={s('fileUrl')} onChange={e => setField('fileUrl', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.createdIdVar}</label>
        <FieldInput placeholder="_stickerId" value={s('outputVar','_stickerId')} onChange={e => setField('outputVar', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'deleteSticker') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.stickerToDelete}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.stickerId}</label>
        <FieldInput placeholder="{variable._stickerId}" value={s('stickerId')} onChange={e => setField('stickerId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'createEvent' || type === 'editEvent') return (
    <div className="space-y-4">
      {type === 'editEvent' && <div>
        <SectionTitle>{t.nodeConfig.eventTitleSection}</SectionTitle>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.eventId}</label>
        <FieldInput placeholder="{variable._eventId}" value={s('eventId')} onChange={e => setField('eventId', e.target.value)} />
      </div>}
      <SectionTitle>{t.nodeConfig.details}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.name}</label>
        <FieldInput placeholder="Game Night ??" value={s('name')} onChange={e => setField('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.description}</label>
        <FieldTextarea rows={2} placeholder={t.nodeConfig.eventDescription} value={s('description')} onChange={e => setField('description', e.target.value)} />
      </div>
      {type === 'createEvent' && <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.locationType}</label>
        <select className="w-full rounded-lg border border-[var(--t-bd)] bg-[var(--t-bg)] text-[var(--t-tx)] px-3 py-1.5 text-sm" value={s('entityType','external')} onChange={e => setField('entityType', e.target.value)}>
          <option value="external">{t.nodeConfig.externalLocation}</option>
          <option value="voice">{t.nodeConfig.voiceChannelType}</option>
          <option value="stage">{t.nodeConfig.stageType}</option>
        </select>
      </div>}
      {type === 'createEvent' && (config.entityType === 'voice' || config.entityType === 'stage') && <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.voiceChannelId}</label>
        <FieldInput placeholder="{channel.id}" value={s('channelId')} onChange={e => setField('channelId', e.target.value)} />
      </div>}
      {type === 'createEvent' && (!config.entityType || config.entityType === 'external') && <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.locationText}</label>
        <FieldInput placeholder="Discord Voice / Online" value={s('location')} onChange={e => setField('location', e.target.value)} />
      </div>}
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.startIso}</label>
        <FieldInput placeholder="2026-03-15T20:00:00.000Z" value={s('startTime')} onChange={e => setField('startTime', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.endIso}</label>
        <FieldInput placeholder="2026-03-15T22:00:00.000Z" value={s('endTime')} onChange={e => setField('endTime', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.coverImage}</label>
        <FieldInput placeholder="https://..." value={s('coverImage')} onChange={e => setField('coverImage', e.target.value)} />
      </div>
      {type === 'createEvent' && <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.createdIdVar}</label>
        <FieldInput placeholder="_eventId" value={s('outputVar','_eventId')} onChange={e => setField('outputVar', e.target.value)} />
      </div>}
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'deleteEvent') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.eventToDelete}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.eventId}</label>
        <FieldInput placeholder="{variable._eventId}" value={s('eventId')} onChange={e => setField('eventId', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'createGuildWebhook') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.webhookTitleSection}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.targetChannel}</label>
        <ChannelPicker config={config} setField={setField} botId={botId} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.webhookName}</label>
        <FieldInput placeholder="Workflow Webhook" value={s('name','Workflow Webhook')} onChange={e => setField('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.avatarOptional}</label>
        <FieldInput placeholder="https://..." value={s('avatar')} onChange={e => setField('avatar', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.webhookUrlVar}</label>
        <FieldInput placeholder="_webhookUrl" value={s('outputVar','_webhookUrl')} onChange={e => setField('outputVar', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.webhookIdVar}</label>
        <FieldInput placeholder="_webhookId" value={s('outputIdVar','_webhookId')} onChange={e => setField('outputIdVar', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'deleteGuildWebhook') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.webhookToDelete}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.webhookId}</label>
        <FieldInput placeholder="{variable._webhookId}" value={s('webhookId')} onChange={e => setField('webhookId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.auditReason}</label>
        <FieldInput placeholder="" value={s('reason')} onChange={e => setField('reason', e.target.value)} />
      </div>
    </div>
  );

  if (type === 'executeWebhook') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.webhookTitleSection}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.webhookUrlRequired}</label>
        <FieldInput placeholder="{variable._webhookUrl}" value={s('webhookUrl')} onChange={e => setField('webhookUrl', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.useCreateWebhookVarHint} <em>Create Webhook</em> : <code className="bg-[var(--t-s2)] px-1 rounded">{'{variable._webhookUrl}'}</code></p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.usernameLabel} <span className="text-[var(--t-m)] text-xs">({t.nodeConfig.optionalLabel})</span></label>
          <FieldInput placeholder="Bot Name" value={s('username')} onChange={e => setField('username', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.avatarUrlLabelSmall} <span className="text-[var(--t-m)] text-xs">({t.nodeConfig.optionalLabel})</span></label>
          <FieldInput placeholder="https://..." value={s('avatarUrl')} onChange={e => setField('avatarUrl', e.target.value)} />
        </div>
      </div>
      <SectionTitle>{t.nodeConfig.contentTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.content}</label>
        <FieldTextarea rows={3} placeholder={t.nodeConfig.messageContentPh} value={s('content')} onChange={e => setField('content', e.target.value)} />
      </div>
      <Toggle checked={b('tts')} onChange={v => setField('tts', v)} label={t.nodeConfig.ttsLabel} hint={t.nodeConfig.ttsHint} />
      <div className="rounded-xl border border-[var(--t-bd)] overflow-hidden">
        <button type="button" onClick={() => setField('includeEmbed', !b('includeEmbed'))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--t-s2)] hover:bg-[var(--t-bd)] transition">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[var(--t-sub)]" />
            <span className="text-sm font-semibold text-[var(--t-tx)]">{t.nodeConfig.richEmbed}</span>
          </div>
          <div className="flex items-center gap-2">
            {b('includeEmbed') && <span className="text-[10px] bg-[var(--t-a)]/20 text-[var(--t-a)] px-2 py-0.5 rounded-full font-medium">{t.nodeConfig.webhookEnabled}</span>}
            {b('includeEmbed') ? <ChevronDown className="w-4 h-4 text-[var(--t-sub)]" /> : <ChevronRight className="w-4 h-4 text-[var(--t-sub)]" />}
          </div>
        </button>
        {b('includeEmbed') && (
          <div className="p-4 space-y-3 bg-[var(--t-s)] border-t border-[var(--t-bd)]">
            <div><label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.title}</label><FieldInput placeholder={t.nodeConfig.embedTitlePlaceholder} value={s('embedTitle')} onChange={e => setField('embedTitle', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.description}</label><FieldTextarea rows={3} placeholder={t.nodeConfig.descriptionEllipsis} value={s('embedDescription')} onChange={e => setField('embedDescription', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.color}</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={s('embedColor','#5865F2')} onChange={e => setField('embedColor', e.target.value)} className="h-9 w-12 rounded border border-[var(--t-bd)] cursor-pointer p-0.5" />
                <FieldInput placeholder="#5865F2" className="flex-1" value={s('embedColor','#5865F2')} onChange={e => setField('embedColor', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.imageUrlLabel}</label><FieldInput placeholder="https://..." value={s('embedImage')} onChange={e => setField('embedImage', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.thumbnailUrl}</label><FieldInput placeholder="https://..." value={s('embedThumbnail')} onChange={e => setField('embedThumbnail', e.target.value)} /></div>
            </div>
            <div><label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.footerLabel}</label><FieldInput placeholder={t.nodeConfig.footerTextPlaceholder} value={s('embedFooter')} onChange={e => setField('embedFooter', e.target.value)} /></div>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-[var(--t-bd)] overflow-hidden">
        <button type="button" onClick={() => setField('includeFile', !b('includeFile'))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--t-s2)] hover:bg-[var(--t-bd)] transition">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--t-sub)]" />
            <span className="text-sm font-semibold text-[var(--t-tx)]">{t.nodeConfig.fileAttachment}</span>
          </div>
          <div className="flex items-center gap-2">
            {b('includeFile') && <span className="text-[10px] bg-[var(--t-a)]/20 text-[var(--t-a)] px-2 py-0.5 rounded-full font-medium">{t.nodeConfig.webhookEnabled}</span>}
            {b('includeFile') ? <ChevronDown className="w-4 h-4 text-[var(--t-sub)]" /> : <ChevronRight className="w-4 h-4 text-[var(--t-sub)]" />}
          </div>
        </button>
        {b('includeFile') && (
          <div className="p-4 space-y-3 bg-[var(--t-s)] border-t border-[var(--t-bd)]">
            <div>
              <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.fileOrAttachmentUrl}</label>
              <FieldInput placeholder="https://... or {variable._canvasFile}" value={s('fileUrl')} onChange={e => setField('fileUrl', e.target.value)} />
              <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.publicUrlOrVarHint}</p>
            </div>
            <div><label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.fileName}</label><FieldInput placeholder="image.png" value={s('fileName','image.png')} onChange={e => setField('fileName', e.target.value)} /></div>
          </div>
        )}
      </div>
      <SectionTitle>{t.nodeConfig.optionsSectionTitle}</SectionTitle>
      <Toggle checked={b('wait', true)} onChange={v => setField('wait', v)} label={t.nodeConfig.waitLabel} hint={t.nodeConfig.waitHint} />
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.outputVarLabel} <span className="text-[var(--t-m)] text-xs">{t.nodeConfig.ifWaitActive}</span></label>
        <FieldInput placeholder="_webhookMessage" value={s('outputVar','_webhookMessage')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.storesColon} <code className="bg-[var(--t-s2)] px-1 rounded">{'{' + s('outputVar','_webhookMessage') + '}.id'}</code>, <code className="bg-[var(--t-s2)] px-1 rounded">{'{' + s('outputVar','_webhookMessage') + '}.content'}</code></p>
      </div>
    </div>
  );

  if (type === 'fetchAuditLog') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.filtersTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.limit}</label>
        <FieldInput type="number" placeholder="10" value={s('limit','10')} onChange={e => setField('limit', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.filterByUser}</label>
        <FieldInput placeholder="{user.id}" value={s('userId')} onChange={e => setField('userId', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.actionType}</label>
        <select className="w-full rounded-lg border border-[var(--t-bd)] bg-[var(--t-bg)] text-[var(--t-tx)] px-3 py-1.5 text-sm" value={s('action')} onChange={e => setField('action', e.target.value)}>
          <option value="">{t.nodeConfig.allActions}</option>
          {['GuildUpdate','ChannelCreate','ChannelUpdate','ChannelDelete','MemberKick','MemberBan','MemberUnban','MemberUpdate','RoleCreate','RoleUpdate','RoleDelete','MessageDelete','MessageBulkDelete','EmojiCreate','EmojiUpdate','EmojiDelete','WebhookCreate','WebhookUpdate','WebhookDelete','ScheduledEventCreate','ScheduledEventUpdate','ScheduledEventDelete'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.output}</label>
        <FieldInput placeholder="_auditLogs" value={s('outputVar','_auditLogs')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.auditLogJsonHint} <code className="bg-[var(--t-s2)] px-1 rounded">action, targetId, executorId, reason</code>.</p>
      </div>
    </div>
  );

  if (type === 'fetchMembers') return (
    <div className="space-y-4">
      <SectionTitle>{t.nodeConfig.filtersTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.searchUsername}</label>
        <FieldInput placeholder="Jean" value={s('query')} onChange={e => setField('query', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.limit}</label>
        <FieldInput type="number" placeholder="100" value={s('limit','100')} onChange={e => setField('limit', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">{t.nodeConfig.output}</label>
        <FieldInput placeholder="_members" value={s('outputVar','_members')} onChange={e => setField('outputVar', e.target.value)} />
        <p className="text-xs text-[var(--t-m)] mt-1">{t.nodeConfig.fetchMembersJsonHint} <code className="bg-[var(--t-s2)] px-1 rounded">id, username, displayName, roles, joinedAt</code>.</p>
      </div>
    </div>
  );

  return null;
}

// --- CoreBot panel ------------------------------------------------------------

function CoreBotPanel({ botInfo }: { botInfo?: { name: string; status: string } | null }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">{botInfo?.name ?? t.nodeConfig.botInstanceFallback}</p>
            {botInfo && (
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${botInfo.status === 'running' ? 'bg-green-400/30 text-green-100' : 'bg-white/20 text-white/80'}`}>
                {botInfo.status === 'running' ? t.nodeConfig.statusRunning : t.nodeConfig.statusStopped}
              </span>
            )}
          </div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed">
          {t.nodeConfig.coreBotDesc}
        </p>
      </div>
      <div className="flex gap-2 bg-[var(--t-s2)] rounded-xl p-4 text-sm text-[var(--t-m)] border border-[var(--t-bd)]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--t-m)]" />
        <p>{t.nodeConfig.noSettingsHint}</p>
      </div>
    </div>
  );
}

// --- CommandHandler panel -----------------------------------------------------

function CommandHandlerPanel({ config, onChange }: { config: CommandHandlerConfig; onChange: (c: CommandHandlerConfig) => void }) {
  const { t } = useTranslation();
  function set<K extends keyof CommandHandlerConfig>(k: K, v: CommandHandlerConfig[K]) {
    onChange({ ...config, [k]: v });
  }

  function updateParam(id: string, patch: Partial<CommandParameter>) {
    set('parameters', config.parameters.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  function toggleDiscordPerm(perm: string) {
    const has = config.discordPermissions.includes(perm);
    set('discordPermissions', has
      ? config.discordPermissions.filter(p => p !== perm)
      : [...config.discordPermissions, perm]);
  }

  return (
    <div>
      <SectionTitle>{t.nodeConfig.commandInfoTitle}</SectionTitle>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">
            {t.nodeConfig.nameRequired} <span className="text-red-500">*</span>
          </label>
          <FieldInput
            placeholder={t.nodeConfig.placeholderPing}
            value={config.commandName}
            onChange={e => set('commandName', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
          />
          <p className="text-xs text-[var(--t-m)] mt-1">
            {t.nodeConfig.slashCommandPrefix} <code className="bg-[var(--t-s2)] px-1 rounded">/{config.commandName || 'name'}</code>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">
            {t.nodeConfig.descriptionRequired} <span className="text-red-500">*</span>
          </label>
          <FieldInput
            placeholder={t.nodeConfig.placeholderPingDesc}
            maxLength={100}
            value={config.description}
            onChange={e => set('description', e.target.value)}
          />
          <p className="text-xs text-[var(--t-m)] mt-1 text-right">{config.description.length}/100</p>
        </div>
      </div>

      <SectionTitle>{t.nodeConfig.parametersTitle}</SectionTitle>
      <div className="space-y-2">
        {config.parameters.map(param => (
          <div key={param.id} className="border border-[var(--t-bd)] rounded-lg p-3 bg-[var(--t-s2)] space-y-2">
            <div className="flex gap-2">
              <FieldInput
                placeholder="name"
                value={param.name}
                className="flex-1"
                onChange={e => updateParam(param.id, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              />
              <select
                value={param.type}
                onChange={e => updateParam(param.id, { type: e.target.value as CommandParameter['type'] })}
                className="px-2 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
              >
                {PARAM_TYPES.map(pt => {
                  const labels: Record<string, string> = { string: t.nodeConfig.stringType, integer: t.nodeConfig.integerType, number: t.nodeConfig.numberType, boolean: t.nodeConfig.booleanType, user: t.nodeConfig.userType, role: t.nodeConfig.roleType, channel: t.nodeConfig.channelType, mentionable: t.nodeConfig.mentionableType, attachment: t.nodeConfig.attachmentType };
                  return <option key={pt.value} value={pt.value}>{labels[pt.value] ?? pt.label}</option>;
                })}
              </select>
              <button
                onClick={() => set('parameters', config.parameters.filter(p => p.id !== param.id))}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <FieldInput
              placeholder={t.nodeConfig.descriptionPlaceholder}
              value={param.description}
              onChange={e => updateParam(param.id, { description: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-[var(--t-sub)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={param.required}
                onChange={e => updateParam(param.id, { required: e.target.checked })}
                className="rounded"
              />
              {t.nodeConfig.requiredCheckbox}
            </label>
          </div>
        ))}
        <button
          onClick={() => set('parameters', [...config.parameters, makeParam()])}
          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-sm text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition"
        >
          <Plus className="w-4 h-4" /> {t.nodeConfig.addParameterBtn}
        </button>
      </div>

      <SectionTitle>{t.nodeConfig.permissionsTitle}</SectionTitle>
      <div className="space-y-3">
        <div className="flex rounded-lg border border-[var(--t-bd)] overflow-hidden">
          {(['discord', 'custom'] as const).map(type => (
            <button
              key={type}
              onClick={() => set('permissionType', type)}
              className={`flex-1 py-2 text-sm font-medium transition ${config.permissionType === type ? 'bg-[var(--t-a)] text-[var(--t-btn-text)]' : 'bg-[var(--t-s2)] text-[var(--t-sub)] hover:bg-[var(--t-s)]'}`}
            >
              {type === 'discord' ? t.nodeConfig.discordPermissionTab : t.nodeConfig.customRoleTab}
            </button>
          ))}
        </div>

        {config.permissionType === 'discord' ? (
          <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
            {DISCORD_PERMISSIONS.map(perm => (
              <label
                key={perm}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition border select-none ${config.discordPermissions.includes(perm) ? 'bg-[var(--t-aa)] border-[var(--t-a)] text-[var(--t-a)] font-medium' : 'border-transparent hover:bg-[var(--t-s)] text-[var(--t-sub)]'}`}
              >
                <input
                  type="checkbox"
                  checked={config.discordPermissions.includes(perm)}
                  onChange={() => toggleDiscordPerm(perm)}
                  className="w-3 h-3 rounded"
                />
                {perm}
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {config.customRoles.map((role, idx) => (
              <div key={idx} className="flex gap-2">
                <FieldInput
                  placeholder={t.nodeConfig.roleNamePlaceholder}
                  value={role}
                  onChange={e => { const r = [...config.customRoles]; r[idx] = e.target.value; set('customRoles', r); }}
                />
                <button
                  onClick={() => set('customRoles', config.customRoles.filter((_, i) => i !== idx))}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => set('customRoles', [...config.customRoles, ''])}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-sm text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition"
            >
              <Plus className="w-4 h-4" /> {t.nodeConfig.addRoleBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- EventHandler panel -------------------------------------------------------

function EventHandlerPanel({ config, onChange }: { config: EventHandlerConfig; onChange: (c: EventHandlerConfig) => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionTitle>{t.nodeConfig.discordEventTitle}</SectionTitle>
      <div>
        <label className="block text-sm font-medium text-[var(--t-tx)] mb-1">
          {t.nodeConfig.eventLabel} <span className="text-red-500">*</span>
        </label>
        <select
          value={config.eventName}
          onChange={e => onChange({ ...config, eventName: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
        >
          {DISCORD_EVENT_GROUPS.map(({ group, events }) => {
            const groupLabels: Record<string, string> = { Core: t.nodeConfig.groupCore, Messages: t.nodeConfig.groupMessages, Guild: t.nodeConfig.groupGuild, Members: t.nodeConfig.groupMembers, Channels: t.nodeConfig.groupChannels, Roles: t.nodeConfig.groupRoles, Voice: t.nodeConfig.groupVoice, Invites: t.nodeConfig.groupInvites };
            return (
            <optgroup key={group} label={groupLabels[group] ?? group}>
              {events.map(evt => <option key={evt} value={evt}>{evt}</option>)}
            </optgroup>
            );
          })}
        </select>
        <p className="text-xs text-[var(--t-m)] mt-1">
          {t.nodeConfig.firesWhenPrefix}{' '}
          <code className="bg-[var(--t-s2)] px-1 rounded">{config.eventName}</code> {t.nodeConfig.firesWhenSuffix}
        </p>
      </div>

      <SectionTitle>{t.nodeConfig.optionsSectionTitle}</SectionTitle>
      <label className="flex items-center justify-between p-3 bg-[var(--t-bg)] rounded-xl cursor-pointer hover:bg-[var(--t-s)] transition border border-[var(--t-bd)] select-none">
        <div>
          <p className="text-sm font-medium text-[var(--t-tx)]">{t.nodeConfig.executeOnceEventLabel}</p>
          <p className="text-xs text-[var(--t-m)] mt-0.5">{t.nodeConfig.executeOnceEventHint}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...config, executeOnce: !config.executeOnce })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${config.executeOnce ? 'bg-[var(--t-a)]' : 'bg-[var(--t-s3)]'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${config.executeOnce ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>
    </div>
  );
}

// --- SQL Query panel ----------------------------------------------------------

type SqlMode = 'select' | 'insert' | 'update' | 'delete' | 'raw';
interface KVPair { id: string; column: string; value: string; }
function makeKV(): KVPair {
  return { id: `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, column: '', value: '' };
}

function InsertRows({
  columns, pairs, onChange,
}: { columns: string[]; pairs: KVPair[]; onChange: (p: KVPair[]) => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {pairs.map((pair, idx) => (
        <div key={pair.id} className="flex gap-2 items-start">
          <div className="flex-1">
            {columns.length > 0 ? (
              <select
                value={pair.column}
                onChange={e => { const n = [...pairs]; n[idx] = { ...pair, column: e.target.value }; onChange(n); }}
                className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
              >
                <option value="">— {t.nodeConfig.columnsLabel} —</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                placeholder={t.nodeConfig.columnPlaceholder}
                value={pair.column}
                onChange={e => { const n = [...pairs]; n[idx] = { ...pair, column: e.target.value }; onChange(n); }}
                className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
              />
            )}
          </div>
          <span className="text-[var(--t-m)] text-xs pt-2.5 shrink-0">=</span>
          <div className="flex-1">
            <input
              placeholder={t.nodeConfig.valueOrVar}
              value={pair.value}
              onChange={e => { const n = [...pairs]; n[idx] = { ...pair, value: e.target.value }; onChange(n); }}
              className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(pairs.filter((_, i) => i !== idx))}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition mt-0.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...pairs, makeKV()])}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-xs text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition"
      >
        <Plus className="w-3.5 h-3.5" /> {t.nodeConfig.addValue}
      </button>
    </div>
  );
}

// --- WHERE / ORDER BY builders ------------------------------------------------

interface WhereCondition { id: string; column: string; operator: string; value: string; }
interface WhereClause { conjunction: 'AND' | 'OR'; conditions: WhereCondition[]; }
interface OrderByClause { id: string; column: string; dir: 'ASC' | 'DESC'; }

const WHERE_OPERATORS = ['=', '!=', '<', '<=', '>', '>=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'] as const;
const NO_VALUE_OPS = ['IS NULL', 'IS NOT NULL'] as const;

function makeWC(): WhereCondition {
  return { id: `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, column: '', operator: '=', value: '' };
}
function makeOB(): OrderByClause {
  return { id: `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, column: '', dir: 'ASC' };
}
function emptyWhereClause(): WhereClause {
  return { conjunction: 'AND', conditions: [] };
}

function WhereBuilder({ columns, clause, onChange }: {
  columns: string[];
  clause: WhereClause;
  onChange: (c: WhereClause) => void;
}) {
  const { t } = useTranslation();
  const { conjunction, conditions } = clause;

  function updateCond(idx: number, patch: Partial<WhereCondition>) {
    onChange({ ...clause, conditions: conditions.map((c, i) => i === idx ? { ...c, ...patch } : c) });
  }

  return (
    <div className="space-y-2">
      {conditions.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--t-m)]">{t.nodeConfig.liaisonLabel}</span>
          {(['AND', 'OR'] as const).map(c => (
            <button key={c} type="button" onClick={() => onChange({ ...clause, conjunction: c })}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                conjunction === c ? 'bg-[var(--t-a)] text-[var(--t-btn-text)]' : 'bg-[var(--t-s2)] text-[var(--t-m)] hover:bg-[var(--t-s)]'
              }`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {conditions.map((cond, idx) => (
        <div key={cond.id} className="flex gap-1.5 items-center">
          {/* Column */}
          <div className="flex-1 min-w-0">
            {columns.length > 0 ? (
              <select value={cond.column} onChange={e => updateCond(idx, { column: e.target.value })}
                className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
                <option value="">{t.nodeConfig.columnPlaceholder}</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input placeholder={t.nodeConfig.columnPlaceholder} value={cond.column}
                onChange={e => updateCond(idx, { column: e.target.value })}
                className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
            )}
          </div>
          {/* Operator */}
          <div className="w-28 shrink-0">
            <select value={cond.operator} onChange={e => updateCond(idx, { operator: e.target.value })}
              className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
              {WHERE_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>
          {/* Value */}
          {!(NO_VALUE_OPS as readonly string[]).includes(cond.operator) ? (
            <div className="flex-1 min-w-0">
              <input placeholder={t.nodeConfig.valueOrVar} value={cond.value}
                onChange={e => updateCond(idx, { value: e.target.value })}
                className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
            </div>
          ) : <div className="flex-1" />}
          {/* Remove */}
          <button type="button" onClick={() => onChange({ ...clause, conditions: conditions.filter((_, i) => i !== idx) })}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button type="button" onClick={() => onChange({ ...clause, conditions: [...conditions, makeWC()] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-xs text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition">
        <Plus className="w-3.5 h-3.5" /> {t.nodeConfig.addCondition}
      </button>

      {conditions.length === 0 && (
        <p className="text-xs text-[var(--t-m)] italic text-center py-1">{t.nodeConfig.noConditionWarning}</p>
      )}
    </div>
  );
}

function OrderByBuilder({ columns, clauses, onChange }: {
  columns: string[];
  clauses: OrderByClause[];
  onChange: (c: OrderByClause[]) => void;
}) {
  const { t } = useTranslation();
  function update(idx: number, patch: Partial<OrderByClause>) {
    onChange(clauses.map((c, i) => i === idx ? { ...c, ...patch } : c));
  }

  return (
    <div className="space-y-2">
      {clauses.map((ob, idx) => (
        <div key={ob.id} className="flex gap-1.5 items-center">
          <div className="flex-1">
            {columns.length > 0 ? (
              <select value={ob.column} onChange={e => update(idx, { column: e.target.value })}
                className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
                <option value="">{t.nodeConfig.columnPlaceholder}</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input placeholder={t.nodeConfig.columnPlaceholder} value={ob.column}
                onChange={e => update(idx, { column: e.target.value })}
                className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]" />
            )}
          </div>
          <div className="w-24 shrink-0">
            <select value={ob.dir} onChange={e => update(idx, { dir: e.target.value as 'ASC' | 'DESC' })}
              className="w-full px-2 py-2 border border-[var(--t-bd)] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]">
              <option value="ASC">{t.nodeConfig.ascLabel}</option>
              <option value="DESC">{t.nodeConfig.descLabel}</option>
            </select>
          </div>
          <button type="button" onClick={() => onChange(clauses.filter((_, i) => i !== idx))}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...clauses, makeOB()])}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[var(--t-bd)] rounded-lg text-xs text-[var(--t-m)] hover:border-[var(--t-a)] hover:text-[var(--t-a)] transition">
        <Plus className="w-3.5 h-3.5" /> {t.nodeConfig.addSort}
      </button>
    </div>
  );
}

function SqlQueryPanel({ botId, config, setField }: {
  botId?: number;
  config: Record<string, any>;
  setField: (k: string, v: unknown) => void;
}) {
  const { t } = useTranslation();
  const [tables, setTables]         = useState<string[]>([]);
  const [columns, setColumns]       = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [loadingCols, setLoadingCols] = useState(false);
  const [dbError, setDbError]       = useState<null | 'no_bot' | 'unavailable'>(null);

  const mode  = (config.mode  ?? 'select') as SqlMode;
  const table = (config.table ?? '') as string;
  const s = (k: string, def = '') => (config[k] ?? def) as string;

  // Fetch table list
  const loadTables = () => {
    if (!botId) { setDbError('no_bot'); return; }
    setLoading(true);
    setDbError(null);
    botAPI.dbListTables(botId)
      .then(ts => setTables(ts.map((t: any) => t.name)))
      .catch(() => setDbError('unavailable'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTables(); }, [botId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch columns when table changes
  useEffect(() => {
    if (!botId || !table) { setColumns([]); return; }
    setLoadingCols(true);
    botAPI.dbTableStructure(botId, table)
      .then((s: any) => setColumns((s.columns ?? []).map((c: any) => c.Field ?? c.name).filter(Boolean)))
      .catch(() => setColumns([]))
      .finally(() => setLoadingCols(false));
  }, [botId, table]); // eslint-disable-line react-hooks/exhaustive-deps

  /* -- Error states --------------------------------------- */
  if (dbError === 'no_bot') return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="bg-[var(--t-s2)] rounded-2xl p-4">
        <Database className="w-10 h-10 text-[var(--t-m)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--t-tx)] mb-1">{t.nodeConfig.noBotAssociatedSql}</p>
        <p className="text-xs text-[var(--t-m)] max-w-xs">
          {t.nodeConfig.noBotAssociatedSqlDesc}
        </p>
      </div>
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--t-a)] text-[var(--t-btn-text)] rounded-lg text-sm font-medium hover:bg-[var(--t-ah)] transition"
      >
        <ExternalLink className="w-4 h-4" /> {t.nodeConfig.goToDashboard}
      </a>
    </div>
  );

  if (dbError === 'unavailable') return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="bg-[var(--t-aa)] rounded-2xl p-4">
        <Database className="w-10 h-10 text-[var(--t-a)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--t-tx)] mb-1">{t.nodeConfig.dbNotFound}</p>
        <p className="text-xs text-[var(--t-m)] max-w-xs">
          {t.nodeConfig.dbNotFoundDesc}
        </p>
      </div>
      <div className="flex gap-2">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--t-a)] text-[var(--t-btn-text)] rounded-lg text-sm font-medium hover:bg-[var(--t-ah)] transition"
        >
          <ExternalLink className="w-4 h-4" /> {t.nodeConfig.createDatabase}
        </a>
        <button
          type="button"
          onClick={loadTables}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--t-bd)] text-[var(--t-sub)] rounded-lg text-sm font-medium hover:bg-[var(--t-s)] transition"
        >
          <RefreshCw className="w-4 h-4" /> {t.nodeConfig.retryBtn}
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-[var(--t-a)] border-t-transparent" />
    </div>
  );

  /* -- Main UI -------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <SectionTitle>{t.nodeConfig.queryType}</SectionTitle>
      <div className="flex bg-[var(--t-s2)] rounded-lg p-1 gap-0.5">
        {(['select', 'insert', 'update', 'delete', 'raw'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setField('mode', m)}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md uppercase tracking-wider transition ${
              mode === m ? 'bg-[var(--t-s)] text-[var(--t-a)] shadow-sm' : 'text-[var(--t-m)] hover:text-[var(--t-tx)]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Table selector */}
      {mode !== 'raw' && (
        <>
          <SectionTitle>{t.nodeConfig.tableTitleSection}</SectionTitle>
          <div className="flex gap-2">
            <select
              value={table}
              onChange={e => { setField('table', e.target.value); setField('selectColumns', []); }}
              className="flex-1 px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-s2)] text-[var(--t-tx)]"
            >
              <option value="">{t.nodeConfig.selectTable}</option>
              {tables.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              type="button"
              onClick={loadTables}
              title={t.nodeConfig.refreshTables}
              className="p-2 border border-[var(--t-bd)] text-[var(--t-m)] hover:text-[var(--t-a)] hover:border-[var(--t-a)] rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {tables.length === 0 && (
            <p className="text-xs text-[var(--t-m)]">
              {t.nodeConfig.noTablesHint}
              <a href="/dashboard" className="text-[var(--t-a)] underline">{t.nodeConfig.createFromDashboardLink}</a>.
            </p>
          )}
        </>
      )}

      {/* SELECT -- columns + conditions */}
      {mode === 'select' && table && (
        <>
          <SectionTitle>{t.nodeConfig.columnsTitle}</SectionTitle>
          {loadingCols ? (
            <p className="text-xs text-[var(--t-m)]">{t.nodeConfig.loadingColumnsText}</p>
          ) : (
            <>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none mb-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={(config.selectColumns ?? []).length === 0}
                  onChange={e => setField('selectColumns', e.target.checked ? [] : columns.slice())}
                />
                <span>{t.nodeConfig.allColumns} <code className="bg-[var(--t-bg)] px-1 rounded ml-0.5">SELECT *</code></span>
              </label>
              {(config.selectColumns ?? []).length > 0 && columns.length > 0 && (
                <div className="grid grid-cols-2 gap-1 bg-[var(--t-s2)] border border-[var(--t-bd)] rounded-xl p-2">
                  {columns.map(col => (
                    <label key={col} className="flex items-center gap-2 text-xs cursor-pointer select-none px-2 py-1 rounded hover:bg-[var(--t-s)] transition">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={(config.selectColumns ?? []).includes(col)}
                        onChange={e => {
                          const curr: string[] = config.selectColumns ?? [];
                          setField('selectColumns', e.target.checked ? [...curr, col] : curr.filter((c: string) => c !== col));
                        }}
                      />
                      <span className="font-mono text-[var(--t-tx)]">{col}</span>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
          <SectionTitle>{t.nodeConfig.conditionsWhereTitle}</SectionTitle>
          <WhereBuilder
            columns={columns}
            clause={config.whereClauses ?? emptyWhereClause()}
            onChange={c => setField('whereClauses', c)}
          />
          <SectionTitle>{t.nodeConfig.orderByTitle}</SectionTitle>
          <OrderByBuilder
            columns={columns}
            clauses={config.orderByClauses ?? []}
            onChange={cls => setField('orderByClauses', cls)}
          />
          <div>
            <label className="block text-xs font-medium text-[var(--t-sub)] mb-1">LIMIT</label>
            <input
              type="number" min="1" placeholder={t.nodeConfig.unlimited}
              value={s('limit')}
              onChange={e => setField('limit', e.target.value)}
              className="w-28 px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
            />
          </div>
        </>
      )}

      {/* INSERT */}
      {mode === 'insert' && table && (
        <>
          <SectionTitle>{t.nodeConfig.dataToInsert} {loadingCols && <span className="text-[var(--t-m)] font-normal">{t.nodeConfig.loadingText}</span>}</SectionTitle>
          <InsertRows
            columns={columns}
            pairs={config.insertData ?? []}
            onChange={pairs => setField('insertData', pairs)}
          />
        </>
      )}

      {/* UPDATE */}
      {mode === 'update' && table && (
        <>
          <SectionTitle>SET {loadingCols && <span className="text-[var(--t-m)] font-normal">{t.nodeConfig.loadingText}</span>}</SectionTitle>
          <InsertRows
            columns={columns}
            pairs={config.updateData ?? []}
            onChange={pairs => setField('updateData', pairs)}
          />
          <SectionTitle>WHERE</SectionTitle>
          <WhereBuilder
            columns={columns}
            clause={config.updateWhereClauses ?? emptyWhereClause()}
            onChange={c => setField('updateWhereClauses', c)}
          />
        </>
      )}

      {/* DELETE */}
      {mode === 'delete' && table && (
        <>
          <SectionTitle>WHERE</SectionTitle>
          <WhereBuilder
            columns={columns}
            clause={config.deleteWhereClauses ?? emptyWhereClause()}
            onChange={c => setField('deleteWhereClauses', c)}
          />
          <div className="flex gap-2 bg-rose-50 rounded-xl p-3 text-xs text-rose-600 border border-rose-200">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <p>{t.nodeConfig.deleteAllWarning}</p>
          </div>
        </>
      )}

      {/* RAW SQL */}
      {mode === 'raw' && (
        <>
          <SectionTitle>{t.nodeConfig.sqlQueryTitle}</SectionTitle>
          <textarea
            rows={6}
            placeholder={"SELECT * FROM users\nWHERE guild_id = '{guild.id}'"}
            value={s('sql')}
            onChange={e => setField('sql', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--t-bd)] rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)] resize-none"
          />
          <p className="text-xs text-[var(--t-m)]">{t.nodeConfig.rawVarsInterpreted} <code className="bg-[var(--t-s2)] px-1 rounded">{'{user.id}'}</code> {t.nodeConfig.rawVarsInterpretedSuffix}</p>
        </>
      )}

      {/* Result variable */}
      <div className="bg-[var(--t-aa)] border border-[var(--t-a)] rounded-xl p-3 space-y-2">
        <label className="block text-xs font-semibold text-[var(--t-a)]">{t.nodeConfig.storeInVariable}</label>
        <input
          placeholder="dbResult"
          value={s('resultVar')}
          onChange={e => setField('resultVar', e.target.value)}
          className="w-full px-3 py-2 border border-[var(--t-a)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--t-a)] bg-[var(--t-bg)] text-[var(--t-tx)]"
        />
        {s('resultVar') && (
          <p className="text-xs text-[var(--t-sub)]">
            {t.nodeConfig.accessVia} <code className="bg-[var(--t-s2)] px-1 rounded font-mono">{'{variable.' + s('resultVar') + '}'}</code>
          </p>
        )}
      </div>
    </div>
  );
}

// --- Main panel ---------------------------------------------------------------

export interface NodeConfigPanelProps {
  node: Node<NodeData>;
  botInfo?: { id?: number; name: string; status: string } | null;
  graphNodes?: Node<NodeData>[];
  graphEdges?: Edge[];
  execData?: { snapshot?: Record<string, any>; nextHandle?: string; error?: string; ts: number };
  allExecData?: Record<string, { snapshot?: Record<string, any>; nextHandle?: string; error?: string; ts: number }>;
  onClose: () => void;
  onSave: (nodeId: string, config: CommandHandlerConfig | EventHandlerConfig | Record<string, any> | null) => void;
}

export default function NodeConfigPanel({ node, botInfo, graphNodes = [], graphEdges = [], execData, allExecData = {}, onClose, onSave }: NodeConfigPanelProps) {
  const { t } = useTranslation();
  const [cmdConfig, setCmdConfig] = useState<CommandHandlerConfig>(() =>
    node.data.type === 'commandHandlerSuite'
      ? sanitizeCmdConfig(node.data.config)
      : defaultCmdConfig()
  );
  const [evtConfig, setEvtConfig] = useState<EventHandlerConfig>(() =>
    node.data.type === 'eventHandlerSuite' && node.data.config
      ? (node.data.config as EventHandlerConfig)
      : defaultEvtConfig()
  );
  const [actionConfig, setActionConfig] = useState<Record<string, any>>(() =>
    (DISCORD_ACTION_TYPES.has(node.data.type) || node.data.type === 'sqlDatabase' || node.data.type === 'codeExec' || node.data.type === 'canvasCard') && node.data.config
      ? (node.data.config as Record<string, any>)
      : {}
  );

  // -- Node-level settings (Settings tab) ------------------------------------
  const initSettings = (cfg: any) => {
    const s = cfg?._settings ?? {};
    return {
      alwaysOutputData:  !!(s.alwaysOutputData),
      executeOnce:       !!(s.executeOnce),
      retryOnFail:       !!(s.retryOnFail),
      onError:           (s.onError as string) || 'stop',
      notes:             (s.notes as string)   || '',
      displayNoteInFlow: !!(s.displayNoteInFlow),
      noteBgColor:       (s.noteBgColor as string) || '#252525',
    };
  };
  const [nodeSettings, setNodeSettings] = useState(() => initSettings(node.data.config));
  const setSetting = <K extends keyof typeof nodeSettings>(key: K, val: typeof nodeSettings[K]) =>
    setNodeSettings(prev => ({ ...prev, [key]: val }));

  // Re-init when switching to a different node
  useEffect(() => {
    if (node.data.type === 'commandHandlerSuite') {
      setCmdConfig(sanitizeCmdConfig(node.data.config));
    } else if (node.data.type === 'eventHandlerSuite') {
      setEvtConfig(node.data.config ? (node.data.config as EventHandlerConfig) : defaultEvtConfig());
    } else if (DISCORD_ACTION_TYPES.has(node.data.type) || node.data.type === 'sqlDatabase' || node.data.type === 'codeExec' || node.data.type === 'canvasCard') {
      setActionConfig((node.data.config as Record<string, any>) ?? {});
    }
    setNodeSettings(initSettings(node.data.config));
  }, [node.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Allow dragging variable tokens directly into any input / textarea inside the modal
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      }
    };
    const onDrop = (e: DragEvent) => {
      const token = e.dataTransfer?.getData('text/plain');
      if (!token || !token.startsWith('{')) return;
      const t = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') return;
      e.preventDefault();
      insertToken(token, t);
    };
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
    };
  }, []);

  const isCoreBot       = node.data.type === 'coreBot';
  const isCmd           = node.data.type === 'commandHandlerSuite';
  const isEvt           = node.data.type === 'eventHandlerSuite';
  const isDiscordAction = DISCORD_ACTION_TYPES.has(node.data.type);
  const isSql           = node.data.type === 'sqlDatabase';
  const isCodeExec      = node.data.type === 'codeExec';
  const isCanvasCard    = node.data.type === 'canvasCard';

  function setField(key: string, value: unknown) {
    setActionConfig(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (isCoreBot) { onClose(); return; }
    const s = { _settings: nodeSettings };
    if (isCmd) { onSave(node.id, { ...cmdConfig, ...s }); return; }
    if (isEvt) { onSave(node.id, { ...evtConfig, ...s }); return; }
    onSave(node.id, { ...actionConfig, ...s });
  }

  const NodeIcon = node.data.icon;
  const LOGIC_TYPES = new Set(['condition', 'delay', 'variable', 'mathOperation', 'random', 'counter', 'switchCase', 'forEach', 'filter']);
  const headerBg =
    isCoreBot                       ? 'bg-blue-700' :
    isCmd                           ? 'bg-indigo-600' :
    isEvt                           ? 'bg-amber-500' :
    isSql                           ? 'bg-[var(--t-a)]' :
    isCodeExec                      ? 'bg-emerald-700' :
    isCanvasCard                    ? 'bg-[var(--t-a)]' :
    LOGIC_TYPES.has(node.data.type) ? 'bg-emerald-600' :
    node.data.category === 'voice'          ? 'bg-sky-600' :
    node.data.category === 'bot'  ? 'bg-pink-600' :
    isDiscordAction                 ? 'bg-blue-600' :
    'bg-[var(--t-s3)]';

  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');

  const renderOutputPanel = () => {
    const def = NODE_TYPES[node.data.type as keyof typeof NODE_TYPES];
    const outputs = def?.outputs ?? [];
    const downstreamByHandle: Record<string, Array<{ nodeId: string; label: string; type: string }>> = {};
    for (const edge of graphEdges) {
      if (edge.source !== node.id) continue;
      const handleId = edge.sourceHandle ?? 'output';
      const target = graphNodes.find(n => n.id === edge.target);
      if (!target) continue;
      if (!downstreamByHandle[handleId]) downstreamByHandle[handleId] = [];
      downstreamByHandle[handleId].push({ nodeId: target.id, label: target.data.label, type: target.data.type });
    }
    const handleDotColor = (handleId: string) => {
      if (!execData) return 'bg-[var(--t-bd)]';
      if (execData.nextHandle === handleId) return execData.error ? 'bg-red-500' : 'bg-emerald-500';
      return 'bg-[var(--t-bd)]';
    };

    const hasOutputJson = execData?.snapshot && Object.keys(execData.snapshot).length > 0;

    if (isCoreBot) return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--t-m)] py-8 px-3 text-center">
        <span className="text-3xl">|?</span>
        <p className="text-xs">{t.nodeConfig.rootNode}</p>
      </div>
    );

    return (
      <div className="space-y-3">
        {/* -- Current node output JSON -- */}
        {hasOutputJson ? (
          <JsonTreeView data={execData!.snapshot!} />
        ) : (
          <div className="rounded-xl p-3 text-center" style={{ border: '1px solid var(--t-bd)', background: 'var(--t-bg)' }}>
            <p className="text-[10px] text-[var(--t-m)] uppercase tracking-widest font-bold mb-1">{t.nodeConfig.outputJsonSection}</p>
            <p className="text-[10px] text-[var(--t-m)] italic leading-snug">
              {execData?.error
                ? <span className="text-red-400">{execData.error}</span>
                : t.nodeConfig.executeToSeeOutput}
            </p>
          </div>
        )}

        {/* -- Output handles + connections -- */}
        {outputs.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.connections}</p>
            {outputs.map(h => {
              const downstream = downstreamByHandle[h.id] ?? [];
              const isTaken = execData?.nextHandle === h.id;
              return (
                <div key={h.id} className={`rounded-xl border p-2.5 space-y-1.5 ${
                  isTaken
                    ? execData?.error ? 'border-red-500/30 bg-red-950/20' : 'border-emerald-500/30 bg-emerald-950/20'
                    : 'border-[var(--t-bd)] bg-[var(--t-s2)]'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`shrink-0 w-2 h-2 rounded-full ${handleDotColor(h.id)}`} />
                    <p className={`text-[11px] font-bold font-mono ${
                      isTaken ? (execData?.error ? 'text-red-400' : 'text-emerald-400') : 'text-[var(--t-tx)]'
                    }`}>{h.label ?? h.id}</p>
                  </div>
                  {h.description && <p className="text-[10px] text-[var(--t-m)] leading-tight">{h.description}</p>}
                  {downstream.map(dn => {
                    const dnExec = allExecData[dn.nodeId];
                    return (
                      <div key={dn.nodeId} className="mt-1.5 border-t border-[var(--t-bd)] pt-1.5 space-y-1">
                        <p className="text-[10px] font-semibold text-[var(--t-sub)] truncate">? {dn.label}</p>
                        {dnExec ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dnExec.error ? 'bg-red-500' : 'bg-emerald-500'}`} />
                              <span className="text-[9px] text-[var(--t-m)]">{new Date(dnExec.ts).toLocaleTimeString()}</span>
                            </div>
                            {dnExec.error && <p className="text-[9px] text-red-400 font-mono break-all bg-red-950/30 rounded px-1 py-0.5">{dnExec.error}</p>}
                            {dnExec.nextHandle && !dnExec.error && <p className="text-[9px] text-emerald-400 font-mono">? {dnExec.nextHandle}</p>}
                          </>
                        ) : (
                          <p className="text-[9px] text-[var(--t-m)] italic">{t.nodeConfig.notExecutedYet}</p>
                        )}
                      </div>
                    );
                  })}
                  {downstream.length === 0 && <p className="text-[9px] text-[var(--t-m)] italic">{t.nodeConfig.notConnected}</p>}
                </div>
              );
            })}
          </div>
        )}
        {outputs.length === 0 && (
          <p className="text-[10px] text-[var(--t-m)] italic text-center">{t.nodeConfig.noOutputDefined}</p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* n8n-style modal */}
      <div
        className="fixed inset-4 bg-[var(--t-s)] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[var(--t-bd)]"
        onClick={e => e.stopPropagation()}
      >
        {/* -- Header -- */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--t-bd)] shrink-0 bg-[var(--t-bg)]">
          <div className="flex items-center gap-3">
            {NodeIcon && (
              <div className={`${headerBg} rounded-lg p-1.5`}>
                <NodeIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-semibold text-[var(--t-tx)] text-sm">{node.data.label}</span>
            <span className="text-xs text-[var(--t-m)] font-mono">{node.data.type}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-xs text-[var(--t-sub)] hover:text-[var(--t-tx)] transition">
              {t.nodeConfig.docsBtn} <ExternalLink className="w-3 h-3" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--t-bd)] transition text-[var(--t-sub)] hover:text-[var(--t-tx)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* -- Body: 3 columns -- */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: INPUT */}
          <div className="w-56 shrink-0 border-r border-[var(--t-bd)] bg-[var(--t-bg)] flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--t-bd)]">
              <span className="text-[10px] font-bold text-[var(--t-m)] uppercase tracking-widest">{t.nodeConfig.inputLabel}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!isCoreBot
                ? <UpstreamVarsPanel nodeId={node.id} nodes={graphNodes} edges={graphEdges} allExecData={allExecData} />
                : <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--t-m)] py-8 px-3 text-center">
                    <span className="text-3xl">?|</span>
                    <p className="text-xs">{t.nodeConfig.rootNode}</p>
                  </div>
              }
            </div>
          </div>

          {/* CENTER */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[var(--t-s)]">
            {/* Tabs + Save */}
            <div className="flex items-center border-b border-[var(--t-bd)] px-5 shrink-0">
              {(['parameters', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-0.5 mr-6 text-sm border-b-2 transition font-medium ${
                    activeTab === tab
                      ? 'text-[var(--t-a)] border-[var(--t-a)]'
                      : 'text-[var(--t-sub)] border-transparent hover:text-[var(--t-tx)]'
                  }`}
                >
                  {tab === 'parameters' ? t.nodeConfig.parametersTab : t.nodeConfig.settingsTab}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                {!isCoreBot ? (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-[var(--t-a)] hover:bg-[var(--t-ah)] text-[var(--t-btn-text)] text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {t.nodeConfig.saveBtn}
                  </button>
                ) : (
                  <button onClick={onClose} className="text-xs text-[var(--t-sub)] hover:text-[var(--t-tx)] transition px-3 py-1.5 rounded-lg hover:bg-[var(--t-bd)]">
                    {t.nodeConfig.closeBtn}
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 n8n-panel">
              {activeTab === 'parameters' ? (
                <>
                  {!isCoreBot && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--t-m)]">{t.nodeConfig.commonVarsLabel}</span>
                      <ContextVarsButton />
                    </div>
                  )}
                  {isCoreBot       && <CoreBotPanel botInfo={botInfo} />}
                  {isCmd           && <CommandHandlerPanel config={cmdConfig} onChange={setCmdConfig} />}
                  {isEvt           && <EventHandlerPanel   config={evtConfig} onChange={setEvtConfig} />}
                  {isDiscordAction && <DiscordActionPanel type={node.data.type} config={actionConfig} setField={setField} botId={botInfo?.id} graphNodes={graphNodes} />}
                  {isSql           && <SqlQueryPanel botId={botInfo?.id} config={actionConfig} setField={setField} />}
                  {isCodeExec      && <CodeNodePanel config={actionConfig} setField={setField} />}
                  {isCanvasCard    && <CanvasCardPanel config={actionConfig} setField={setField} botId={botInfo?.id} />}
                  {!isCoreBot && !isCmd && !isEvt && !isDiscordAction && !isSql && !isCodeExec && !isCanvasCard && (
                    <div className="flex flex-col items-center justify-center py-16 text-[var(--t-m)] gap-3">
                      <Info className="w-10 h-10" />
                      <p className="text-sm">{t.nodeConfig.noConfigAvailable}</p>
                    </div>
                  )}
                  <ExecutionViewer execData={execData} />
                </>
              ) : (
                <div className="space-y-6">

                  {/* -- Node Info --------------------------------------- */}
                  <div className="rounded-xl p-4" style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.nodeInfoTitle}</p>
                    <div className="space-y-2 text-xs">
                      <p><span style={{ color: 'var(--t-m)' }}>{t.nodeConfig.typeLabel}</span><span className="ml-2 font-mono" style={{ color: 'var(--t-tx)' }}>{node.data.type}</span></p>
                      <p><span style={{ color: 'var(--t-m)' }}>{t.nodeConfig.categoryLabel}</span><span className="ml-2 capitalize" style={{ color: 'var(--t-tx)' }}>{node.data.category}</span></p>
                      <p><span style={{ color: 'var(--t-m)' }}>{t.nodeConfig.idLabel}</span><span className="ml-2 font-mono" style={{ color: 'var(--t-tx)' }}>{node.id}</span></p>
                    </div>
                  </div>

                  {/* -- Execution settings ------------------------------ */}
                  {!isCoreBot && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.executionTitle}</p>
                      <Toggle
                        checked={nodeSettings.alwaysOutputData}
                        onChange={v => setSetting('alwaysOutputData', v)}
                        label={t.nodeConfig.alwaysOutputDataLabel}
                        hint={t.nodeConfig.alwaysOutputHint}
                      />
                      <Toggle
                        checked={nodeSettings.executeOnce}
                        onChange={v => setSetting('executeOnce', v)}
                        label={t.nodeConfig.executeOnceLabel}
                        hint={t.nodeConfig.executeOnceHint}
                      />
                      <Toggle
                        checked={nodeSettings.retryOnFail}
                        onChange={v => setSetting('retryOnFail', v)}
                        label={t.nodeConfig.retryOnFailLabel}
                        hint={t.nodeConfig.retryOnFailHint}
                      />
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--t-sub)' }}>{t.nodeConfig.onErrorLabel}</label>
                        <select
                          value={nodeSettings.onError}
                          onChange={e => setSetting('onError', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none transition"
                          style={{ background: 'var(--t-bg)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--t-a)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--t-bd)'; }}
                        >
                          <option value="stop">{t.nodeConfig.stopWorkflow}</option>
                          <option value="continue">{t.nodeConfig.continueOption}</option>
                          <option value="continueErrorOutput">{t.nodeConfig.continueErrorOutput}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* -- Notes -------------------------------------------- */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.notesTitle}</p>
                    <DarkMarkdownTextarea
                      value={nodeSettings.notes}
                      onChange={v => setSetting('notes', v)}
                      placeholder={t.nodeConfig.notesPlaceholder}
                      rows={5}
                    />
                  </div>

                  {/* -- Display Note in Flow --------------------------- */}
                  <div className="space-y-3">
                    <Toggle
                      checked={nodeSettings.displayNoteInFlow}
                      onChange={v => setSetting('displayNoteInFlow', v)}
                      label={t.nodeConfig.displayNoteInFlowLabel}
                      hint={t.nodeConfig.displayNoteHint}
                    />
                    {nodeSettings.displayNoteInFlow && (
                      <div className="rounded-xl p-3 space-y-3" style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)' }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.bgColor}</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={nodeSettings.noteBgColor}
                            onChange={e => setSetting('noteBgColor', e.target.value)}
                            className="w-9 h-8 rounded cursor-pointer p-0 border-0 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={nodeSettings.noteBgColor}
                            onChange={e => setSetting('noteBgColor', e.target.value)}
                            className="flex-1 px-2 py-1 rounded-lg text-xs font-mono outline-none"
                            style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                          />
                          <div className="w-7 h-7 rounded-lg shrink-0" style={{ background: nodeSettings.noteBgColor, border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                        {nodeSettings.notes ? (
                          <>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.canvasPreview}</p>
                            <div
                              className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
                              style={{ background: nodeSettings.noteBgColor, border: '1px solid rgba(255,255,255,0.08)', color: 'var(--t-tx)' }}
                            >
                              {renderDiscordMd(nodeSettings.notes)}
                            </div>
                          </>
                        ) : (
                          <p className="text-[11px] italic" style={{ color: 'var(--t-m)' }}>{t.nodeConfig.addNotesHint}</p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Bottom hint */}
            <div className="px-6 py-2.5 border-t border-[var(--t-bd)] text-xs text-[var(--t-bd)] flex items-center gap-1.5 shrink-0">
              <span>??</span>
              <span>{t.nodeConfig.feedbackHint}</span>
            </div>
          </div>

          {/* RIGHT: OUTPUT */}
          <div className="w-56 shrink-0 border-l border-[var(--t-bd)] bg-[var(--t-bg)] flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--t-bd)]">
              <span className="text-[10px] font-bold text-[var(--t-m)] uppercase tracking-widest">{t.nodeConfig.outputLabelRight}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {renderOutputPanel()}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
