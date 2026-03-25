import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Settings, HelpCircle, ChevronLeft, ChevronRight, ExternalLink, ArrowLeft,
  Users, Bell, Sliders, LayoutTemplate,
} from 'lucide-react';
import { useUserPrefs } from '../contexts/UserPrefsContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  TEMPLATES, CATEGORY_META, TEMPLATE_CATEGORIES,
  type WorkflowTemplate, type TemplateNode, type TemplateEdge, type TemplateCategory,
} from '../constants/templates';

// ─── Shared styles ────────────────────────────────────────────────────────────

const RAIL_BG    = 'var(--t-s)';
const PANEL_BG   = 'var(--t-s)';
const BORDER     = 'var(--t-bd)';
const ORANGE     = 'var(--t-a)';
const TEXT_DIM   = 'var(--t-m)';
const TEXT_MUTED = 'var(--t-sub)';
const TEXT_MAIN  = 'var(--t-tx)';

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingSection({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-0.5 pt-1 pb-1.5">
      <Icon className="w-3 h-3 shrink-0" style={{ color: TEXT_DIM }} />
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>{label}</p>
    </div>
  );
}

function MiniToggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition text-left"
      style={{ background: 'var(--t-s2)', border: `1px solid ${BORDER}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--t-s2)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium" style={{ color: TEXT_MAIN }}>{label}</p>
        {hint && <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--t-m)' }}>{hint}</p>}
      </div>
      <div
        className="relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ml-2"
        style={{ background: checked ? 'var(--t-a)' : 'var(--t-bd)' }}
      >
        <span
          className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(14px)' : 'translateX(2px)' }}
        />
      </div>
    </button>
  );
}



function SettingsPanel({ settings, onSettingsChange, description, onDescriptionChange }: {
  settings: { snapToGrid: boolean; showMinimap: boolean; autoSave: boolean };
  onSettingsChange: (key: 'snapToGrid' | 'showMinimap' | 'autoSave', value: boolean) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
}) {
  const { prefs, setPrefs } = useUserPrefs();
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

      {/* ─ Description ─ */}
      {onDescriptionChange && (
        <div>
          <SettingSection icon={Settings} label={t.workflow.workflowTitle} />
          <textarea
            value={description ?? ''}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder={t.workflow.descriptionPlaceholder}
            rows={3}
            className="w-full px-2.5 py-2 rounded-lg text-[11px] outline-none resize-none"
            style={{ background: 'var(--t-bg)', border: `1px solid ${BORDER}`, color: TEXT_MAIN }}
          />
        </div>
      )}

      {onDescriptionChange && <div style={{ borderTop: `1px solid ${BORDER}` }} />}

      {/* ─ Canvas ─ */}
      <div>
        <SettingSection icon={Settings} label={t.workflow.canvas} />
        <div className="space-y-1">
          <MiniToggle label={t.workflow.snapToGrid}  hint={t.workflow.snapToGridHint}         checked={settings.snapToGrid}  onChange={v => onSettingsChange('snapToGrid',  v)} />
          <MiniToggle label={t.workflow.minimap}       hint={t.workflow.minimapHint}  checked={settings.showMinimap} onChange={v => onSettingsChange('showMinimap', v)} />
          <MiniToggle label={t.workflow.autoSave}     hint={t.workflow.autoSaveHint}  checked={settings.autoSave}    onChange={v => onSettingsChange('autoSave',    v)} />
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}` }} />

      {/* ─ Notifications ─ */}
      <div>
        <SettingSection icon={Bell} label={t.workflow.notifications} />
        <div className="space-y-1">
          <MiniToggle label={t.workflow.saveNotif}   checked={prefs.notifySave}    onChange={v => setPrefs({ notifySave:    v })} />
          <MiniToggle label={t.workflow.errors}      checked={prefs.notifyErrors}  onChange={v => setPrefs({ notifyErrors:  v })} />
          <MiniToggle label={t.workflow.browserNotif}   hint={t.workflow.browserNotifHint}    checked={prefs.notifyBrowser} onChange={v => { if (v) Notification.requestPermission(); setPrefs({ notifyBrowser: v }); }} />
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}` }} />

      {/* ─ Préférences ─ */}
      <div>
        <SettingSection icon={Sliders} label={t.workflow.preferences} />
        <div className="space-y-1">
          <MiniToggle label={t.workflow.confirmDelete} hint={t.workflow.confirmDeleteHint} checked={prefs.confirmDelete} onChange={v => setPrefs({ confirmDelete: v })} />
          <MiniToggle label={t.workflow.tooltips}      hint={t.workflow.tooltipsHint}           checked={prefs.showTooltips}  onChange={v => setPrefs({ showTooltips:  v })} />
          <MiniToggle label={t.workflow.compactNodes}  hint={t.workflow.compactNodesHint}  checked={prefs.compactNodes}  onChange={v => setPrefs({ compactNodes:  v })} />
        </div>
      </div>

    </div>
  );
}

// ─── Help panel ───────────────────────────────────────────────────────────────

function HelpPanel() {
  const { t } = useTranslation();
  const helpSections = [
    { title: t.workflow.gettingStarted, items: [t.workflow.canvasBasics, t.workflow.addHandler, t.workflow.connectNodes] },
    { title: t.workflow.handlers,       items: [t.workflow.commandHandler, t.workflow.eventHandler, t.workflow.permissionsRoles] },
    { title: t.workflow.discordActions, items: [t.workflow.messagesEmbeds, t.workflow.roleManagement, t.workflow.moderation] },
    { title: t.workflow.database,       items: [t.workflow.sqlQuery, t.workflow.createTableHelp, t.workflow.selectInsert] },
  ];
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {helpSections.map(section => (
        <div key={section.title}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1" style={{ color: TEXT_DIM }}>
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map(item => (
              <button
                key={item}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition group text-left"
                style={{ color: TEXT_MUTED }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)';
                  (e.currentTarget as HTMLElement).style.color = ORANGE;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '';
                  (e.currentTarget as HTMLElement).style.color = TEXT_MUTED;
                }}
              >
                <span>{item}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Templates panel ────────────────────────────────────────────────────────

/** Derive the i18n key prefix from a template id, e.g. 'mod-ban' → 'tplModBan' */
function tplKey(id: string): string {
  return 'tpl' + id.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

function TemplateCard({ tpl, tName, tDesc, catLabel, onApply }: {
  tpl: WorkflowTemplate; tName: string; tDesc: string; catLabel: string; onApply: () => void;
}) {
  const { t } = useTranslation();
  const meta = CATEGORY_META[tpl.category];
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition"
      style={{ background: hov ? 'var(--t-s2)' : 'var(--t-s)', border: `1px solid ${hov ? 'var(--t-bd)' : BORDER}` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start gap-2 mb-1.5">
          <span className="text-base leading-none shrink-0 mt-0.5">{tpl.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold leading-tight" style={{ color: 'var(--t-tx)' }}>{tName}</p>
            <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--t-sub)' }}>{tDesc}</p>
          </div>
        </div>
        {/* node preview badges */}
        <div className="flex flex-wrap gap-1 mb-2 mt-2">
          {tpl.preview.slice(0, 4).map((t, i) => (
            <span
              key={i}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--t-s2)', color: 'var(--t-sub)', border: '1px solid var(--t-bd)' }}
            >{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
          >{catLabel}</span>
          <button
            onClick={onApply}
            className="text-[10px] font-semibold px-3 py-1 rounded-lg transition"
            style={{ background: 'var(--t-a)', color: 'var(--t-btn-text)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >{t.workflow.insert}</button>
        </div>
      </div>
    </div>
  );
}

function TemplatesPanel({ onApply }: { onApply: (nodes: TemplateNode[], edges: TemplateEdge[]) => void }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<TemplateCategory | 'tous'>('tous');

  const wf = t.workflow as unknown as Record<string, string>;

  const catLabels: Record<TemplateCategory, string> = {
    'modération': t.workflow.tplCatModeration,
    'utilisateur': t.workflow.tplCatUser,
    'serveur': t.workflow.tplCatServer,
    'utilitaire': t.workflow.tplCatUtility,
  };

  const getName = (id: string, fallback: string) => wf[tplKey(id) + 'Name'] ?? fallback;
  const getDesc = (id: string, fallback: string) => wf[tplKey(id) + 'Desc'] ?? fallback;

  const filtered = TEMPLATES.filter(tp =>
    (cat === 'tous' || tp.category === cat) &&
    (getName(tp.id, tp.name).toLowerCase().includes(search.toLowerCase()) ||
     getDesc(tp.id, tp.desc).toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* search */}
      <div className="px-3 pt-2 pb-2 shrink-0">
        <input
          type="text"
          placeholder={t.workflow.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg text-[11px] outline-none"
          style={{ background: 'var(--t-bg)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
        />
      </div>
      {/* category chips */}
      <div className="px-3 pb-2 shrink-0 flex flex-wrap gap-1">
        <button
          onClick={() => setCat('tous')}
          className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full transition"
          style={cat === 'tous'
            ? { background: 'var(--t-a)', color: 'var(--t-btn-text)' }
            : { background: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-sub)' }}
        >{t.workflow.all}</button>
        {TEMPLATE_CATEGORIES.map(c => {
          const m = CATEGORY_META[c];
          const active = cat === c;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full transition"
              style={active
                ? { background: m.color, color: 'var(--t-bg)' }
                : { background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
            >{catLabels[c]}</button>
          );
        })}
      </div>
      {/* cards list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-center py-6" style={{ color: 'var(--t-m)' }}>{t.workflow.noTemplateFound}</p>
        ) : (
          filtered.map(tpl => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              tName={getName(tpl.id, tpl.name)}
              tDesc={getDesc(tpl.id, tpl.desc)}
              catLabel={catLabels[tpl.category]}
              onApply={() => onApply(tpl.nodes, tpl.edges)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Shared nav row ─────────────────────────────────────────────────────────────

function NavRow({ id, Icon, label, hint, onClick }: {
  id: string;
  Icon: React.ElementType;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      key={id}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left group"
      style={{ color: TEXT_MUTED }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = TEXT_MAIN; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = TEXT_MUTED; }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-tight" style={{ color: TEXT_MAIN }}>{label}</p>
        <p className="text-[11px] leading-tight mt-0.5 truncate">{hint}</p>
      </div>
      <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition" style={{ color: TEXT_DIM }} />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = 'settings' | 'templates' | 'help';

// Nav items split: top (main) vs bottom (utility)
const NAV_TOP: Array<{ id: TabId | 'database' | 'members'; icon: React.ElementType; labelKey: string; hintKey: string }> = [
  { id: 'database', icon: Database, labelKey: 'databases', hintKey: 'databasesDesc' },
  { id: 'members',  icon: Users,    labelKey: 'members',   hintKey: 'membersDesc' },
];
const NAV_BOTTOM: Array<{ id: TabId; icon: React.ElementType; labelKey: string; hintKey: string }> = [
  { id: 'settings',  icon: Settings,        labelKey: 'settings',  hintKey: 'settingsDesc'  },
  { id: 'templates', icon: LayoutTemplate,  labelKey: 'templates', hintKey: 'templatesDesc' },
  { id: 'help',      icon: HelpCircle,      labelKey: 'help',      hintKey: 'helpDesc'      },
];

export default function WorkflowLeftSidebar({
  settings,
  onSettingsChange,
  workflowId,
  onApplyTemplate,
  description,
  onDescriptionChange,
}: {
  settings: { snapToGrid: boolean; showMinimap: boolean; autoSave: boolean };
  onSettingsChange: (key: 'snapToGrid' | 'showMinimap' | 'autoSave', value: boolean) => void;
  workflowId?: string;
  onApplyTemplate: (nodes: TemplateNode[], edges: TemplateEdge[]) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // collapsed → 44 px icon strip
  // expanded + no tab → 220 px nav list
  // expanded + tab → 220 px panel content
  const W = collapsed ? 44 : (activeTab === 'templates' ? 280 : 220);

  function handleNavClick(id: TabId | 'database' | 'members') {
    if (id === 'database') { navigate('/dashboard/databases'); return; }
    if (id === 'members')  { navigate(`/dashboard/members?instanceId=${workflowId ?? ''}`); return; }
    setActiveTab(prev => (prev === id ? null : id));
  }

  function handleCollapse() {
    setCollapsed(c => {
      if (!c) setActiveTab(null); // clear panel when collapsing
      return !c;
    });
  }

  return (
    <div className="relative shrink-0 h-full" style={{ borderRight: `1px solid ${BORDER}` }}>

      {/* Collapse / expand — centred on right border */}
      <button
        onClick={handleCollapse}
        title={collapsed ? t.workflow.expand : t.workflow.collapse}
        className="absolute top-1/2 z-50 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
        style={{
          right: -11,
          transform: 'translateY(-50%)',
          backgroundColor: PANEL_BG,
          border: `1px solid ${BORDER}`,
          color: TEXT_DIM,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_DIM; }}
      >
        {collapsed
          ? <ChevronRight className="w-2.5 h-2.5" strokeWidth={2.5} />
          : <ChevronLeft  className="w-2.5 h-2.5" strokeWidth={2.5} />}
      </button>

      <aside
        className="flex flex-col overflow-hidden shrink-0 h-full transition-all duration-150"
        style={{ width: W, background: collapsed ? RAIL_BG : PANEL_BG }}
      >
      {collapsed ? (
        /* ── Collapsed: icon-only strip ── */
        <div className="flex flex-col items-center h-full py-2">
          {/* Top icons: main nav */}
          <div className="flex-1 flex flex-col items-center gap-1 pt-1">
            {NAV_TOP.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                title={(t.workflow as any)[labelKey]}
                onClick={() => {
                  if (id === 'database') { navigate('/dashboard/databases'); return; }
                  if (id === 'members')  { navigate(`/dashboard/members?instanceId=${workflowId ?? ''}`); return; }
                  setCollapsed(false); setActiveTab(id as TabId);
                }}
                className="p-2 rounded-lg transition"
                style={{ color: TEXT_DIM }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = TEXT_MAIN; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = TEXT_DIM; }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          {/* Bottom icons: settings + help + expand */}
          <div className="flex flex-col items-center gap-1 pb-1">
            <div className="w-5 mb-0.5" style={{ borderTop: `1px solid ${BORDER}` }} />
            {NAV_BOTTOM.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                title={(t.workflow as any)[labelKey]}
                onClick={() => { setCollapsed(false); setActiveTab(id); }}
                className="p-2 rounded-lg transition"
                style={{ color: TEXT_DIM }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = TEXT_MAIN; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = TEXT_DIM; }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      ) : activeTab ? (
        /* ── Panel content view ── */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header with back button */}
          <div className="px-3 py-2.5 shrink-0 flex items-center gap-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <button
              onClick={() => setActiveTab(null)}
              className="p-1 -ml-1 rounded transition shrink-0"
              style={{ color: TEXT_MUTED }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT_MAIN; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = TEXT_MUTED; }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            {activeTab === 'settings'  && <Settings        className="w-3.5 h-3.5 shrink-0" style={{ color: ORANGE }} />}
            {activeTab === 'templates' && <LayoutTemplate   className="w-3.5 h-3.5 shrink-0" style={{ color: ORANGE }} />}
            {activeTab === 'help'      && <HelpCircle       className="w-3.5 h-3.5 shrink-0" style={{ color: ORANGE }} />}
            <span className="text-xs font-bold truncate" style={{ color: TEXT_MAIN }}>
              {activeTab === 'settings' ? t.workflow.settings : activeTab === 'templates' ? t.workflow.templates : t.workflow.help}
            </span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'settings'  && <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} description={description} onDescriptionChange={onDescriptionChange} />}
            {activeTab === 'templates' && <TemplatesPanel onApply={onApplyTemplate} />}
            {activeTab === 'help'      && <HelpPanel />}
          </div>
        </div>
      ) : (
        /* ── Expanded nav list view ── */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 shrink-0 flex items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
              {t.workflow.workflowTitle}
            </p>
          </div>

          {/* Nav list — top items */}
          <nav className="flex-1 overflow-y-auto px-2 pt-1 space-y-0.5">
            {NAV_TOP.map(({ id, icon: Icon, labelKey, hintKey }) => (
              <NavRow key={id} id={id} Icon={Icon} label={(t.workflow as any)[labelKey]} hint={(t.workflow as any)[hintKey]} onClick={() => handleNavClick(id)} />
            ))}
          </nav>

          {/* Bottom items pinned */}
          <div className="px-2 pb-2 shrink-0">
            <div className="mb-1.5" style={{ borderTop: `1px solid ${BORDER}` }} />
            {NAV_BOTTOM.map(({ id, icon: Icon, labelKey, hintKey }) => (
              <NavRow key={id} id={id} Icon={Icon} label={(t.workflow as any)[labelKey]} hint={(t.workflow as any)[hintKey]} onClick={() => handleNavClick(id)} />
            ))}
          </div>
        </div>
      )}
      </aside>
    </div>
  );
}
