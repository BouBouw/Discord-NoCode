import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X, ArrowRight } from 'lucide-react';
import { NODE_TYPES, SIDEBAR_HIERARCHY, type NodeType, type CategoryDef } from '../constants/nodeTypes';
import { useTranslation } from '../hooks/useTranslation';

const CAT_DESC_KEYS: Record<string, string> = {
  handlers: 'catHandlersDesc', bot: 'catBotDesc', actions: 'catActionsDesc',
  users: 'catUsersDesc', interactions: 'catInteractionsDesc', guild: 'catGuildDesc',
  voice: 'catVoiceDesc', mods: 'catModsDesc', canvas: 'catCanvasDesc',
  database: 'catDatabaseDesc', logic: 'catLogicDesc', core: 'catCoreDesc',
};

const CAT_LABEL_KEYS: Record<string, string> = {
  mods: 'catModsLabel',
};

const NODE_DESC_KEYS: Record<string, string> = {
  coreBot: 'nodeDescCoreBot', condition: 'nodeDescCondition', delay: 'nodeDescDelay',
  variable: 'nodeDescVariable', forEach: 'nodeDescForEach', switchCase: 'nodeDescSwitchCase',
  random: 'nodeDescRandom', counter: 'nodeDescCounter', filter: 'nodeDescFilter',
  mathOperation: 'nodeDescMathOperation', stringOperation: 'nodeDescStringOperation',
  arrayOperation: 'nodeDescArrayOperation', jsonParse: 'nodeDescJsonParse',
  jsonStringify: 'nodeDescJsonStringify', typeConvert: 'nodeDescTypeConvert',
  getDate: 'nodeDescGetDate', loopWhile: 'nodeDescLoopWhile', httpRequest: 'nodeDescHttpRequest',
  webhook: 'nodeDescWebhook', sendMessage: 'nodeDescSendMessage', editMessage: 'nodeDescEditMessage',
  deleteMessage: 'nodeDescDeleteMessage', replyToMessage: 'nodeDescReplyToMessage',
  addRole: 'nodeDescAddRole', removeRole: 'nodeDescRemoveRole', createRole: 'nodeDescCreateRole',
  kick: 'nodeDescKick', ban: 'nodeDescBan', unban: 'nodeDescUnban',
  timeout: 'nodeDescTimeout', unmute: 'nodeDescUnmute', bulkDeleteMessages: 'nodeDescBulkDeleteMessages',
  setNickname: 'nodeDescSetNickname', createChannel: 'nodeDescCreateChannel',
  deleteChannel: 'nodeDescDeleteChannel', commandHandlerSuite: 'nodeDescCommandHandlerSuite',
  eventHandlerSuite: 'nodeDescEventHandlerSuite', sqlDatabase: 'nodeDescSqlDatabase',
  codeExec: 'nodeDescCodeExec', canvasCard: 'nodeDescCanvasCard',
  joinVoiceChannel: 'nodeDescJoinVoiceChannel', leaveVoiceChannel: 'nodeDescLeaveVoiceChannel',
  playAudio: 'nodeDescPlayAudio', stopAudio: 'nodeDescStopAudio',
  moveToVoice: 'nodeDescMoveToVoice', disconnectFromVoice: 'nodeDescDisconnectFromVoice',
  setBotPresence: 'nodeDescSetBotPresence', setBotNickname: 'nodeDescSetBotNickname',
  setBotAvatar: 'nodeDescSetBotAvatar', sendDM: 'nodeDescSendDM',
  addReaction: 'nodeDescAddReaction', pinMessage: 'nodeDescPinMessage',
  unpinMessage: 'nodeDescUnpinMessage', createThread: 'nodeDescCreateThread',
  archiveThread: 'nodeDescArchiveThread', editChannel: 'nodeDescEditChannel',
  createInvite: 'nodeDescCreateInvite', editGuild: 'nodeDescEditGuild',
  editRole: 'nodeDescEditRole', deleteRole: 'nodeDescDeleteRole',
  createEmoji: 'nodeDescCreateEmoji', deleteEmoji: 'nodeDescDeleteEmoji',
  editEmoji: 'nodeDescEditEmoji', createSticker: 'nodeDescCreateSticker',
  deleteSticker: 'nodeDescDeleteSticker', createEvent: 'nodeDescCreateEvent',
  editEvent: 'nodeDescEditEvent', deleteEvent: 'nodeDescDeleteEvent',
  createGuildWebhook: 'nodeDescCreateGuildWebhook', deleteGuildWebhook: 'nodeDescDeleteGuildWebhook',
  executeWebhook: 'nodeDescExecuteWebhook', fetchAuditLog: 'nodeDescFetchAuditLog',
  fetchMembers: 'nodeDescFetchMembers', serverMuteMember: 'nodeDescServerMuteMember',
  serverDeafenMember: 'nodeDescServerDeafenMember', fetchUserInfo: 'nodeDescFetchUserInfo',
  sendButtons: 'nodeDescSendButtons', sendStringSelectMenu: 'nodeDescSendStringSelectMenu',
  sendUserSelectMenu: 'nodeDescSendUserSelectMenu', sendRoleSelectMenu: 'nodeDescSendRoleSelectMenu',
  sendChannelSelectMenu: 'nodeDescSendChannelSelectMenu', sendModal: 'nodeDescSendModal',
  awaitButtonClick: 'nodeDescAwaitButtonClick', awaitSelectMenu: 'nodeDescAwaitSelectMenu',
  buttonInteractionHandler: 'nodeDescButtonInteractionHandler',
  selectMenuInteractionHandler: 'nodeDescSelectMenuInteractionHandler',
  modalSubmitHandler: 'nodeDescModalSubmitHandler',
};

interface NodeSidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
  onAddNode?: (nodeType: NodeType) => void;
  'data-onboarding'?: string;
}

export default function NodeSidebar({ onDragStart, onAddNode, 'data-onboarding': dataOnboarding }: NodeSidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed]        = useState(false);
  const [view, setView]                  = useState<'categories' | 'nodes'>('categories');
  const [selectedCategory, setSelected] = useState<CategoryDef | null>(null);
  const [search, setSearch]              = useState('');

  const allNodes = useMemo(() =>
    SIDEBAR_HIERARCHY.flatMap(cat =>
      cat.types.map(type => ({ type, cat, config: NODE_TYPES[type] }))
    ).filter(n => n.config),
  []);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allNodes.filter(n =>
      n.config.label.toLowerCase().includes(q) ||
      (n.config.description ?? '').toLowerCase().includes(q) ||
      n.cat.label.toLowerCase().includes(q)
    );
  }, [search, allNodes]);

  const categoryNodes = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory.types
      .map(type => ({ type, config: NODE_TYPES[type] }))
      .filter(n => n.config);
  }, [selectedCategory]);

  function openCategory(cat: CategoryDef) {
    setSelected(cat);
    setView('nodes');
    setSearch('');
  }

  function goBack() {
    setView('categories');
    setSelected(null);
    setSearch('');
  }



  const isSearching = search.trim().length > 0;
  const nodeListToShow: Array<{ type: string; config: (typeof NODE_TYPES)[NodeType] }> | null =
    view === 'nodes'   ? categoryNodes :
    isSearching        ? searchResults.map(r => ({ type: r.type, config: r.config })) :
    null;

  return (
    <div data-onboarding={dataOnboarding} className="relative shrink-0 h-full" style={{ borderLeft: '1px solid var(--t-bd)' }}>

      {/* Collapse / expand — centred on left border */}
      <button
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? t.workflow.openNodes : t.workflow.collapse}
        className="absolute top-1/2 z-50 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
        style={{
          left: -11,
          transform: 'translateY(-50%)',
          backgroundColor: 'var(--t-s)',
          border: '1px solid var(--t-bd)',
          color: 'var(--t-m)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-a)'; e.currentTarget.style.color = 'var(--t-a)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-bd)'; e.currentTarget.style.color = 'var(--t-m)'; }}
      >
        {collapsed
          ? <ChevronLeft  className="w-2.5 h-2.5" strokeWidth={2.5} />
          : <ChevronRight className="w-2.5 h-2.5" strokeWidth={2.5} />}
      </button>

      <aside
        style={{
          background: 'var(--t-s)',
          width: collapsed ? 0 : 288,
          transition: 'width 150ms ease',
          overflow: 'hidden',
        }}
        className="flex flex-col h-full shrink-0"
      >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0 flex items-center" style={{ borderBottom: '1px solid var(--t-bd)', minWidth: 288 }}>
        {view === 'nodes' ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-semibold transition"
            style={{ color: 'var(--t-sub)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-sub)'; }}
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            {selectedCategory?.label}
          </button>
        ) : (
          <h2 className="text-base font-bold" style={{ color: 'var(--t-tx)' }}>{t.workflow.addNode}</h2>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--t-m)' }} />
          <input
            type="text"
            placeholder={t.workflow.searchNodesPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm rounded-lg pl-8 pr-8 py-2 outline-none transition mt-2"
            style={{ background: 'var(--t-bg)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--t-a)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--t-aa)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--t-bd)'; e.currentTarget.style.boxShadow = ''; }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition"
              style={{ color: 'var(--t-m)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {nodeListToShow ? (
          /* ── Node list (search results or category drill-down) ── */
          <div className="px-3 space-y-0.5 pb-4">
            {view === 'nodes' && selectedCategory && (
              <p className="text-[10px] font-bold text-[var(--t-m)] uppercase tracking-widest px-2 pt-1 pb-2">
                {categoryNodes.length} {t.workflow.nodeCount}
              </p>
            )}
            {isSearching && nodeListToShow.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-[var(--t-m)]">
                <Search className="w-6 h-6" />
                <p className="text-xs">{t.workflow.noResults} «\u00a0{search}\u00a0»</p>
              </div>
            )}
            {nodeListToShow.map(({ type, config }) => {
              const Icon = config.icon;
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={e => onDragStart(e, type as NodeType)}
                  onClick={() => onAddNode?.(type as NodeType)}
                  title={t.workflow.dragOrClick}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--t-bd)] active:scale-[0.98] transition group select-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--t-bd)] group-hover:bg-[var(--t-s2)] flex items-center justify-center shrink-0 transition">
                    <Icon className="w-4 h-4 text-[var(--t-sub)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--t-tx)] leading-tight truncate">{config.label}</p>
                    {config.description && (
                      <p className="text-xs text-[var(--t-sub)] leading-tight mt-0.5 line-clamp-1">{(NODE_DESC_KEYS[type] && (t.workflow as any)[NODE_DESC_KEYS[type]]) || config.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--t-bd)] opacity-0 group-hover:opacity-100 transition shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Category list ── */
          <div className="pb-2">
            {SIDEBAR_HIERARCHY.filter(c => c.id !== 'core').map(cat => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => openCategory(cat)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--t-bd)] transition group text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${cat.iconCircle} flex items-center justify-center shrink-0`}>
                    <CatIcon className={`w-4 h-4 ${cat.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--t-tx)] leading-tight">{(CAT_LABEL_KEYS[cat.id] && (t.workflow as any)[CAT_LABEL_KEYS[cat.id]]) || cat.label}</p>
                    <p className="text-xs text-[var(--t-sub)] leading-snug mt-0.5 line-clamp-2">{(t.workflow as any)[CAT_DESC_KEYS[cat.id]] || cat.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--t-bd)] group-hover:text-[var(--t-sub)] shrink-0 transition" />
                </button>
              );
            })}

            {/* Separator before Core */}
            <div className="mx-4 my-1 border-t border-[var(--t-bd)]" />

            {(() => {
              const coreCat = SIDEBAR_HIERARCHY.find(c => c.id === 'core')!;
              const CoreIcon = coreCat.icon;
              return (
                <button
                  onClick={() => openCategory(coreCat)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--t-bd)] transition group text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${coreCat.iconCircle} flex items-center justify-center shrink-0`}>
                    <CoreIcon className={`w-4 h-4 ${coreCat.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--t-tx)] leading-tight">{(CAT_LABEL_KEYS[coreCat.id] && (t.workflow as any)[CAT_LABEL_KEYS[coreCat.id]]) || coreCat.label}</p>
                    <p className="text-xs text-[var(--t-sub)] leading-snug mt-0.5">{(t.workflow as any)[CAT_DESC_KEYS[coreCat.id]] || coreCat.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--t-bd)] group-hover:text-[var(--t-sub)] shrink-0 transition" />
                </button>
              );
            })()}
          </div>
        )}
      </div>
    </aside>
    </div>
  );
}

