import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Database, Table2, Plus, Trash2, Play, ChevronLeft,
  ChevronRight, Pencil, Check, X, AlertTriangle, Loader2, Copy, CheckCircle2,
  Terminal, Columns3, Rows3,
} from 'lucide-react';
import {
  botAPI,
  type DbTable, type DbColumn, type DbColumnDef, type DbRowsResult, type DbQueryResult,
} from '../../services/api';
import { useUserSettings, getBotThemeConfig } from '../../hooks/useUserSettings';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'data' | 'structure' | 'sql';

interface Toast { type: 'ok' | 'err'; text: string }

const MYSQL_TYPES = [
  'INT', 'BIGINT', 'TINYINT', 'SMALLINT',
  'VARCHAR(255)', 'VARCHAR(100)', 'VARCHAR(50)',
  'TEXT', 'LONGTEXT', 'MEDIUMTEXT',
  'DECIMAL(10,2)', 'FLOAT', 'DOUBLE',
  'BOOLEAN',
  'DATE', 'DATETIME', 'TIMESTAMP',
  'JSON',
  'BLOB', 'LONGBLOB',
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
        toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {toast.text}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--t-bd)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--t-tx)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="dnc-btn-icon w-7 h-7"
            style={{ color: 'var(--t-m)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title, description, confirmLabel, danger = false,
  onConfirm, onCancel, loading,
}: {
  title: string; description: string; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm mb-6" style={{ color: 'var(--t-sub)' }}>{description}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="dnc-btn dnc-btn-ghost"
        >
          {t.common.cancel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`dnc-btn ${danger ? 'dnc-btn-danger-solid' : 'dnc-btn-primary'}`}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Create Table Modal ───────────────────────────────────────────────────────

interface NewColDef { name: string; type: string; primaryKey: boolean; autoIncrement: boolean; notNull: boolean; defaultValue: string }
const blankCol = (): NewColDef => ({ name: '', type: 'INT', primaryKey: false, autoIncrement: false, notNull: false, defaultValue: '' });

function CreateTableModal({ botId, onCreated, onClose }: {
  botId: number; onCreated: () => void; onClose: () => void;
}) {
  const { t } = useTranslation();
  const [tableName, setTableName] = useState('');
  const [cols, setCols] = useState<NewColDef[]>([{ ...blankCol(), name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, notNull: true }]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const addCol = () => setCols(c => [...c, blankCol()]);
  const removeCol = (i: number) => setCols(c => c.filter((_, idx) => idx !== i));
  const updateCol = (i: number, patch: Partial<NewColDef>) =>
    setCols(c => c.map((col, idx) => idx === i ? { ...col, ...patch } : col));
  const setPk = (i: number) =>
    setCols(c => c.map((col, idx) => ({ ...col, primaryKey: idx === i })));

  async function submit() {
    if (!tableName.trim()) return setErr(t.dbViewer.tableNameRequired);
    if (cols.some(c => !c.name.trim())) return setErr(t.dbViewer.columnNamesRequired);
    setLoading(true); setErr('');
    try {
      const columns: DbColumnDef[] = cols.map(c => ({
        name: c.name.trim(),
        type: c.type,
        primaryKey: c.primaryKey,
        autoIncrement: c.autoIncrement,
        notNull: c.notNull,
        defaultValue: c.defaultValue || undefined,
      }));
      await botAPI.dbCreateTable(botId, { name: tableName.trim(), columns });
      onCreated();
    } catch (e: any) {
      setErr(e.message ?? t.dbViewer.createError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={t.dbViewer.newTable} onClose={onClose}>
      <div className="space-y-4">
        {/* Table name */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--t-sub)' }}>{t.dbViewer.tableName}</label>
          <input
            value={tableName}
            onChange={e => setTableName(e.target.value)}
            placeholder={t.dbViewer.tableNamePlaceholder}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
            style={{ backgroundColor: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
          />
        </div>

        {/* Columns */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium" style={{ color: 'var(--t-sub)' }}>{t.dbViewer.columns}</label>
            <button onClick={addCol} className="flex items-center gap-1 text-xs transition" style={{ color: 'var(--t-a)' }}>
              <Plus className="w-3 h-3" /> {t.common.add}
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cols.map((col, i) => (
              <div key={i} className="rounded-lg p-2.5 space-y-2" style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)' }}>
                <div className="flex gap-2">
                  <input
                    value={col.name}
                    onChange={e => updateCol(i, { name: e.target.value })}
                    placeholder="Nom"
                    className="flex-1 rounded px-2 py-1.5 text-xs font-mono focus:outline-none"
                    style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-bg)', color: 'var(--t-tx)' }}
                  />
                  <select
                    value={col.type}
                    onChange={e => updateCol(i, { type: e.target.value })}
                    className="flex-1 rounded px-2 py-1.5 text-xs focus:outline-none"
                    style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-bg)', color: 'var(--t-tx)' }}
                  >
                    {MYSQL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {cols.length > 1 && (
                    <button onClick={() => removeCol(i)} className="dnc-btn-icon dnc-btn-icon-danger p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-3 text-xs" style={{ color: 'var(--t-sub)' }}>
                  <label className="flex items-center gap-1 select-none cursor-pointer">
                    <input type="radio" checked={col.primaryKey} onChange={() => setPk(i)} className="w-3 h-3" />
                    PK
                  </label>
                  <label className="flex items-center gap-1 select-none cursor-pointer">
                    <input type="checkbox" checked={col.autoIncrement} onChange={e => updateCol(i, { autoIncrement: e.target.checked })} className="w-3 h-3" />
                    AUTO_INCREMENT
                  </label>
                  <label className="flex items-center gap-1 select-none cursor-pointer">
                    <input type="checkbox" checked={col.notNull} onChange={e => updateCol(i, { notNull: e.target.checked })} className="w-3 h-3" />
                    NOT NULL
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {err && <p className="text-xs rounded px-2 py-1" style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>{err}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="dnc-btn dnc-btn-ghost"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="dnc-btn dnc-btn-primary"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {t.common.create}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Column Form ──────────────────────────────────────────────────────────

function AddColumnForm({ botId, table, onAdded, onCancel }: {
  botId: number; table: string; onAdded: () => void; onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState('VARCHAR(255)');
  const [notNull, setNotNull] = useState(false);
  const [def, setDef] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    if (!name.trim()) return setErr(t.dbViewer.nameRequired);
    setLoading(true); setErr('');
    try {
      await botAPI.dbAddColumn(botId, table, { name: name.trim(), type, notNull, defaultValue: def || undefined });
      onAdded();
    } catch (e: any) {
      setErr(e.message ?? t.common.error);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl p-4 space-y-3 mt-3" style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t-a)' }}>{t.dbViewer.newColumn}</p>
      <div className="flex gap-2 flex-wrap">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom"
          className="rounded px-2 py-1.5 text-xs font-mono focus:outline-none w-36"
          style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="rounded px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
        >
          {MYSQL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          value={def}
          onChange={e => setDef(e.target.value)}
          placeholder={t.dbViewer.defaultOpt}
          className="rounded px-2 py-1.5 text-xs focus:outline-none w-32"
          style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
        />
        <label className="flex items-center gap-1 text-xs select-none cursor-pointer" style={{ color: 'var(--t-sub)' }}>
          <input type="checkbox" checked={notNull} onChange={e => setNotNull(e.target.checked)} className="w-3 h-3" />
          NOT NULL
        </label>
      </div>
      {err && <p className="text-xs" style={{ color: '#ef4444' }}>{err}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="dnc-btn dnc-btn-primary dnc-btn-xs"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />} {t.common.add}
        </button>
        <button
          onClick={onCancel}
          className="dnc-btn dnc-btn-ghost dnc-btn-xs"
        >
          {t.common.cancel}
        </button>
      </div>
    </div>
  );
}

// ─── Row Form (Insert / Edit) ─────────────────────────────────────────────────

function RowForm({ cols, initial, onSubmit, onCancel, loading }: {
  cols: DbColumn[];
  initial?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const editableCols = initial
    ? cols  // editing: show all cols
    : cols.filter(c => !(c.Extra?.includes('auto_increment') && c.Key === 'PRI'));

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    editableCols.forEach(c => { init[c.Field] = initial ? String(initial[c.Field] ?? '') : ''; });
    return init;
  });

  function handleSubmit() {
    const data: Record<string, unknown> = {};
    editableCols.forEach(c => { if (values[c.Field] !== '') data[c.Field] = values[c.Field]; });
    onSubmit(data);
  }

  return (
    <div className="space-y-3">
      {editableCols.map(col => (
        <div key={col.Field}>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--t-sub)' }}>
            {col.Field}
            <span className="ml-1 font-normal" style={{ color: 'var(--t-m)' }}>{col.Type}</span>
            {col.Null === 'NO' && <span className="ml-1 text-xs" style={{ color: '#ef4444' }}>*</span>}
          </label>
          <input
            value={values[col.Field] ?? ''}
            onChange={e => setValues(v => ({ ...v, [col.Field]: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
          />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="dnc-btn dnc-btn-ghost"
        >
          {t.common.cancel}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="dnc-btn dnc-btn-primary"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {initial ? t.common.save : t.dbViewer.insertRow}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DbViewerPage() {
  const { botId: botIdStr } = useParams<{ botId: string }>();
  const botId = Number(botIdStr);
  const navigate = useNavigate();

  const { settings } = useUserSettings();
  const { t } = useTranslation();
  const th = getBotThemeConfig(settings.defaultBotTheme ?? 'dark');
  const thV = {
    '--t-bg': th.bg, '--t-s': th.surface, '--t-s2': th.surface2,
    '--t-bd': th.border, '--t-a': th.accent, '--t-ah': th.accentHover,
    '--t-aa': th.accentAlpha, '--t-tx': th.text, '--t-sub': th.subtext, '--t-m': th.muted,
  } as React.CSSProperties;

  // ── State ──────────────────────────────────────────────────────────────────
  const [botName, setBotName] = useState('');
  const [tables, setTables] = useState<DbTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('data');

  // Data tab
  const [rowsResult, setRowsResult] = useState<DbRowsResult | null>(null);
  const [page, setPage] = useState(1);

  // Structure tab
  const [structure, setStructure] = useState<DbColumn[]>([]);
  const [showAddCol, setShowAddCol] = useState(false);

  // SQL tab
  const [sql, setSql] = useState('SELECT * FROM ');
  const [sqlResult, setSqlResult] = useState<DbQueryResult | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

  // Modals
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'dropTable' | 'dropColumn' | 'deleteRow' | 'purge';
    label: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Loading / feedback
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [dbUnavailable, setDbUnavailable] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showToast(type: 'ok' | 'err', text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Load tables ────────────────────────────────────────────────────────────
  const loadTables = useCallback(async () => {
    setLoading(true); setDbUnavailable(false);
    try {
      const [botData, tablesData] = await Promise.all([
        botAPI.get(botId),
        botAPI.dbListTables(botId),
      ]);
      setBotName(botData.name);
      setTables(tablesData);
    } catch (e: any) {
      if (e.message?.includes('DB_UNAVAILABLE') || e.status === 503) {
        setDbUnavailable(true);
      } else {
        showToast('err', e.message ?? t.common.error);
      }
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => { loadTables(); }, [loadTables]);

  // ── Load rows ──────────────────────────────────────────────────────────────
  const loadRows = useCallback(async (table: string, p = 1) => {
    try {
      const data = await botAPI.dbGetRows(botId, table, p, 25);
      setRowsResult(data);
      setPage(p);
    } catch (e: any) {
      showToast('err', e.message ?? t.common.error);
    }
  }, [botId]);

  // ── Load structure ─────────────────────────────────────────────────────────
  const loadStructure = useCallback(async (table: string) => {
    try {
      const data = await botAPI.dbTableStructure(botId, table);
      setStructure(data.columns);
    } catch (e: any) {
      showToast('err', e.message ?? t.common.error);
    }
  }, [botId]);

  // ── Select table ───────────────────────────────────────────────────────────
  async function selectTable(name: string) {
    setSelectedTable(name);
    setActiveTab('data');
    setRowsResult(null);
    setStructure([]);
    setShowAddCol(false);
    setSqlResult(null);
    await Promise.all([loadRows(name, 1), loadStructure(name)]);
  }

  // ── Tab switch ─────────────────────────────────────────────────────────────
  async function switchTab(tab: Tab) {
    setActiveTab(tab);
    if (!selectedTable) return;
    if (tab === 'data' && !rowsResult) await loadRows(selectedTable, page);
    if (tab === 'structure' && structure.length === 0) await loadStructure(selectedTable);
  }

  // ── SQL runner ─────────────────────────────────────────────────────────────
  async function runSql() {
    if (!sql.trim()) return;
    setSqlLoading(true); setSqlResult(null);
    try {
      const result = await botAPI.dbQuery(botId, sql);
      setSqlResult(result);
    } catch (e: any) {
      showToast('err', e.message ?? t.common.error);
    } finally {
      setSqlLoading(false);
    }
  }

  // ── Row actions ────────────────────────────────────────────────────────────
  async function handleInsertRow(data: Record<string, unknown>) {
    if (!selectedTable) return;
    setActionLoading(true);
    try {
      await botAPI.dbInsertRow(botId, selectedTable, data);
      setAddRowOpen(false);
      showToast('ok', t.dbViewer.rowInserted);
      await loadRows(selectedTable, page);
      await loadTables();
    } catch (e: any) {
      showToast('err', e.message ?? t.common.error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateRow(data: Record<string, unknown>) {
    if (!selectedTable || !editRow) return;
    const pkCol = structure.find(c => c.Key === 'PRI');
    if (!pkCol) return showToast('err', t.dbViewer.noPrimaryKey);
    setActionLoading(true);
    try {
      await botAPI.dbUpdateRow(botId, selectedTable, { [pkCol.Field]: editRow[pkCol.Field] }, data);
      setEditRow(null);
      showToast('ok', t.dbViewer.rowUpdated);
      await loadRows(selectedTable, page);
    } catch (e: any) {
      showToast('err', e.message ?? t.common.error);
    } finally {
      setActionLoading(false);
    }
  }

  function openDeleteRow(row: Record<string, unknown>) {
    const pkCol = structure.find(c => c.Key === 'PRI');
    if (!pkCol) return showToast('err', t.dbViewer.noPrimaryKey);
    setConfirmAction({
      type: 'deleteRow',
      label: `${t.dbViewer.deleteRowWhere} ${pkCol.Field} = ${row[pkCol.Field]}?`,
      onConfirm: async () => {
        await botAPI.dbDeleteRow(botId, selectedTable!, { [pkCol.Field]: row[pkCol.Field] });
        await loadRows(selectedTable!, page);
        await loadTables();
      },
    });
  }

  function openDropColumn(col: DbColumn) {
    setConfirmAction({
      type: 'dropColumn',
      label: `${t.dbViewer.dropColumnConfirm} "${col.Field}" (${selectedTable})?`,
      onConfirm: async () => {
        await botAPI.dbDropColumn(botId, selectedTable!, col.Field);
        await loadStructure(selectedTable!);
      },
    });
  }

  function openDropTable(table: string) {
    setConfirmAction({
      type: 'dropTable',
      label: `${t.dbViewer.dropTableConfirm} "${table}"?`,
      onConfirm: async () => {
        await botAPI.dbDropTable(botId, table);
        setSelectedTable(null);
        setStructure([]);
        setRowsResult(null);
        await loadTables();
      },
    });
  }

  async function runConfirm() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await confirmAction.onConfirm();
      showToast('ok', t.dbViewer.operationSuccess);
    } catch (e: any) {
      showToast('err', e.message ?? t.common.error);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ ...thV, backgroundColor: 'var(--t-bg)' }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: th.border, borderTopColor: th.accent }} />
      </div>
    );
  }

  if (dbUnavailable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ ...thV, backgroundColor: 'var(--t-bg)' }}>
        <Database className="w-16 h-16" style={{ color: th.muted }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--t-tx)' }}>{t.dbViewer.dbUnavailable}</h2>
        <div className="max-w-md text-sm text-center space-y-2" style={{ color: 'var(--t-sub)' }}>
          <p>{t.dbViewer.dbUnavailableDesc}</p>
          <ul className="text-left space-y-1 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
            <li className="flex items-start gap-2">
              <span className="mt-0.5" style={{ color: 'var(--t-m)' }}>①</span>
              <span>{t.dbViewer.dbUnavailableCause1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5" style={{ color: 'var(--t-m)' }}>②</span>
              <span>{t.dbViewer.dbUnavailableCause2}</span>
            </li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="dnc-btn dnc-btn-primary"
          >
            {t.dashboard.title}
          </button>
          <button
            onClick={loadTables}
            className="dnc-btn dnc-btn-ghost"
          >
            <RefreshCw className="w-4 h-4" /> {t.common.retry}
          </button>
        </div>
      </div>
    );
  }

  const totalPages = rowsResult ? rowsResult.pages : 0;

  return (
    <div className="flex flex-col h-full min-h-screen" style={{ ...thV, backgroundColor: 'var(--t-bg)' }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center gap-4 px-6 sticky top-0 z-10" style={{ backgroundColor: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}>
        <button
          onClick={() => navigate('/dashboard/databases')}
          className="dnc-btn-icon flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--t-m)' }}
        >
          <ArrowLeft className="w-4 h-4" /> {t.databases.title}
        </button>
        <span style={{ color: 'var(--t-bd)' }}>|</span>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
          <span className="font-semibold" style={{ color: 'var(--t-tx)' }}>{botName || `Bot ${botId}`}</span>
          <span className="text-xs font-mono rounded px-1.5 py-0.5" style={{ backgroundColor: 'var(--t-s2)', color: 'var(--t-sub)' }}>bot_{botId}</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={loadTables}
          className="dnc-btn dnc-btn-ghost dnc-btn-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {t.common.refresh}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: table list ────────────────────────────────────────────── */}
        <aside className="w-56 flex flex-col shrink-0" style={{ backgroundColor: 'var(--t-s)', borderRight: '1px solid var(--t-bd)' }}>
          <div className="px-3 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--t-bd)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t-m)' }}>
              {t.dbViewer.tables} ({tables.length})
            </span>
            <button
              onClick={() => setShowCreateTable(true)}
              className="dnc-btn-icon p-1"
              style={{ color: 'var(--t-m)' }}
              title={t.dbViewer.newTable}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-1">
            {tables.length === 0 ? (
              <div className="p-4 text-center">
                <Table2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--t-m)' }} />
                <p className="text-xs" style={{ color: 'var(--t-m)' }}>{t.dbViewer.noTables}</p>
                <button
                  onClick={() => setShowCreateTable(true)}
                  className="mt-2 text-xs transition"
                  style={{ color: 'var(--t-a)' }}
                >
                  {t.dbViewer.createTable}
                </button>
              </div>
            ) : (
              tables.map(t => (
                <button
                  key={t.name}
                  onClick={() => selectTable(t.name)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition"
                  style={selectedTable === t.name
                    ? { backgroundColor: 'var(--t-s2)', color: 'var(--t-a)', borderRight: '2px solid var(--t-a)' }
                    : { color: 'var(--t-sub)', borderRight: '2px solid transparent' }}

                >
                  <Table2 className="w-3.5 h-3.5 shrink-0" style={{ color: selectedTable === t.name ? 'var(--t-a)' : 'var(--t-m)' }} />
                  <span className="text-sm font-medium truncate flex-1">{t.name}</span>
                  <span className="text-xs shrink-0" style={{ color: 'var(--t-m)' }}>{t.rows ?? 0}</span>
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedTable ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <Table2 className="w-16 h-16" style={{ color: 'var(--t-bd)' }} />
              <p style={{ color: 'var(--t-m)' }}>{t.dbViewer.selectTable}</p>
              <button
                onClick={() => setShowCreateTable(true)}
                className="dnc-btn dnc-btn-primary"
              >
                <Plus className="w-4 h-4" /> {t.dbViewer.newTable}
              </button>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="px-4 flex items-center gap-1" style={{ backgroundColor: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}>
                {([
                  { id: 'data',      label: t.dbViewer.data,       Icon: Rows3 },
                  { id: 'structure', label: t.dbViewer.structure,   Icon: Columns3 },
                  { id: 'sql',       label: t.dbViewer.sql,         Icon: Terminal },
                ] as const).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => switchTab(id)}
                    className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition"
                    style={activeTab === id
                      ? { borderColor: 'var(--t-a)', color: 'var(--t-a)' }
                      : { borderColor: 'transparent', color: 'var(--t-m)' }}

                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
                <div className="flex-1" />
                <span className="text-sm font-mono font-semibold pr-2" style={{ color: 'var(--t-sub)' }}>{selectedTable}</span>
              </div>

              {/* ── DATA TAB ─────────────────────────────────────────────── */}
              {activeTab === 'data' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* toolbar */}
                  <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}>
                    <button
                      onClick={() => setAddRowOpen(true)}
                      className="dnc-btn dnc-btn-primary dnc-btn-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t.dbViewer.addRow}
                    </button>
                    <div className="flex-1" />
                    {rowsResult && (
                      <span className="text-xs" style={{ color: 'var(--t-m)' }}>
                        {rowsResult.total} ligne{rowsResult.total !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* table */}
                  <div className="flex-1 overflow-auto">
                    {!rowsResult ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--t-a)' }} />
                      </div>
                    ) : rowsResult.rows.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Rows3 className="w-10 h-10" style={{ color: 'var(--t-m)' }} />
                        <p className="text-sm" style={{ color: 'var(--t-m)' }}>{t.dbViewer.noData}</p>
                        <button
                          onClick={() => setAddRowOpen(true)}
                          className="text-xs transition"
                          style={{ color: 'var(--t-a)' }}
                        >
                          {t.dbViewer.insertRow}
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)' }}>
                            {structure.map(col => (
                              <th key={col.Field} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--t-m)' }}>
                                {col.Field}
                                {col.Key === 'PRI' && <span className="ml-1 text-amber-500" title="Clé primaire">🔑</span>}
                              </th>
                            ))}
                            <th className="px-4 py-2.5 text-right w-20" />
                          </tr>
                        </thead>
                        <tbody>
                          {rowsResult.rows.map((row, i) => (
                            <tr key={i} className="group transition" style={{ borderBottom: '1px solid var(--t-bd)' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--t-s2)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              {structure.map(col => (
                                <td key={col.Field} className="px-4 py-2.5 font-mono text-xs max-w-xs truncate" style={{ color: 'var(--t-sub)' }}>
                                  {row[col.Field] === null || row[col.Field] === undefined
                                    ? <span className="italic" style={{ color: 'var(--t-m)' }}>NULL</span>
                                    : String(row[col.Field])
                                  }
                                </td>
                              ))}
                              <td className="px-2 py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => setEditRow(row)}
                                    className="dnc-btn-icon p-1.5"
                                    style={{ color: 'var(--t-m)' }}
                                    title={t.common.edit}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteRow(row)}
                                    className="dnc-btn-icon dnc-btn-icon-danger p-1.5"
                                    title={t.common.delete}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* pagination */}
                  {rowsResult && totalPages > 1 && (
                    <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--t-s)', borderTop: '1px solid var(--t-bd)' }}>
                      <button
                        disabled={page <= 1}
                        onClick={() => { loadRows(selectedTable!, page - 1); }}
                        className="dnc-btn-icon p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: 'var(--t-m)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs" style={{ color: 'var(--t-m)' }}>
                        {t.dbViewer.page} {page} / {totalPages} — {rowsResult.total} {t.instance.lines}
                      </span>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => { loadRows(selectedTable!, page + 1); }}
                        className="dnc-btn-icon p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: 'var(--t-m)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'structure' && (
                <div className="flex-1 overflow-auto p-4">
                  <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)' }}>
                          {[t.dbViewer.column, 'Type', 'Null', t.dbViewer.key, t.dbViewer.default_, t.dbViewer.extra, ''].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--t-m)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {structure.map(col => (
                          <tr key={col.Field} className="group transition" style={{ borderBottom: '1px solid var(--t-bd)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--t-s2)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td className="px-4 py-2.5 font-mono text-xs font-medium" style={{ color: 'var(--t-tx)' }}>{col.Field}</td>
                            <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--t-sub)' }}>{col.Type}</td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--t-m)' }}>{col.Null}</td>
                            <td className="px-4 py-2.5 text-xs">
                              {col.Key === 'PRI' ? (
                                <span className="text-amber-500 font-semibold">PRI 🔑</span>
                              ) : col.Key === 'UNI' ? (
                                <span style={{ color: 'var(--t-a)' }}>UNI</span>
                              ) : col.Key === 'MUL' ? (
                                <span style={{ color: 'var(--t-m)' }}>MUL</span>
                              ) : (
                                <span style={{ color: 'var(--t-m)' }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--t-m)' }}>
                              {col.Default ?? <span className="italic">NULL</span>}
                            </td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--t-m)' }}>{col.Extra || '—'}</td>
                            <td className="px-2 py-2.5">
                              <button
                                onClick={() => openDropColumn(col)}
                                disabled={col.Key === 'PRI'}
                                className="opacity-0 group-hover:opacity-100 dnc-btn-icon dnc-btn-icon-danger p-1.5 disabled:!opacity-0"
                                title={t.dbViewer.deleteColumn}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Add column form / button */}
                    <div className="px-4 pb-4 pt-1">
                      {showAddCol ? (
                        <AddColumnForm
                          botId={botId}
                          table={selectedTable!}
                          onAdded={async () => {
                            setShowAddCol(false);
                            showToast('ok', t.dbViewer.columnAdded);
                            await loadStructure(selectedTable!);
                          }}
                          onCancel={() => setShowAddCol(false)}
                        />
                      ) : (
                        <button
                          onClick={() => setShowAddCol(true)}
                          className="dnc-btn dnc-btn-soft dnc-btn-xs mt-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> {t.dbViewer.addColumn}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Drop table */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => openDropTable(selectedTable!)}
                      className="dnc-btn dnc-btn-danger"
                    >
                      <Trash2 className="w-4 h-4" /> {t.dbViewer.dropTable}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'sql' && (
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--t-bd)' }}>
                    {/* Editor titlebar */}
                    <div
                      className="flex items-center justify-between px-4 py-2 text-xs"
                      style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)', color: 'var(--t-m)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--t-a)' }} />
                        <span className="font-mono" style={{ color: 'var(--t-sub)' }}>{t.dbViewer.sqlRunner}</span>
                        <span style={{ color: 'var(--t-bd)' }}>—</span>
                        <span className="font-mono font-semibold" style={{ color: 'var(--t-a)' }}>{selectedTable}</span>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(sql); showToast('ok', t.common.copied); }}
                        className="dnc-btn-icon flex items-center gap-1"
                        style={{ color: 'var(--t-m)' }}
                      >
                        <Copy className="w-3 h-3" /> {t.common.copy}
                      </button>
                    </div>
                    {/* Editor area — always dark for terminal readability */}
                    <textarea
                      value={sql}
                      onChange={e => setSql(e.target.value)}
                      onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runSql(); } }}
                      spellCheck={false}
                      rows={6}
                      className="w-full px-4 py-3 font-mono text-sm focus:outline-none resize-y"
                      style={{ backgroundColor: 'var(--t-bg)', color: 'var(--t-a)', caretColor: 'var(--t-tx)' }}
                      placeholder="SELECT * FROM table_name WHERE 1=1;"
                    />
                    {/* Footer */}
                    <div
                      className="px-4 py-2 flex items-center gap-3"
                      style={{ backgroundColor: 'var(--t-s2)', borderTop: '1px solid var(--t-bd)' }}
                    >
                      <button
                        onClick={runSql}
                        disabled={sqlLoading || !sql.trim()}
                        className="dnc-btn dnc-btn-primary dnc-btn-sm"
                      >
                        {sqlLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        {t.dbViewer.execute}
                      </button>
                      <span className="text-xs" style={{ color: 'var(--t-m)' }}>{t.dbViewer.ctrlEnter}</span>
                    </div>
                  </div>

                  {/* SQL Results */}
                  {sqlResult && (
                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
                      <div className="px-4 py-2 flex items-center gap-3 text-xs" style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)', color: 'var(--t-m)' }}>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        {sqlResult.type === 'SELECT' ? (
                          <span>{sqlResult.rows?.length ?? 0} {t.dbViewer.rowsAffected} — {sqlResult.duration}ms</span>
                        ) : (
                          <span>{sqlResult.affectedRows} {t.dbViewer.linesAffected} — {sqlResult.duration}ms</span>
                        )}
                      </div>

                      {sqlResult.type === 'SELECT' && sqlResult.rows && sqlResult.rows.length > 0 && (
                        <div className="overflow-auto max-h-96">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)' }}>
                                {(sqlResult.fields ?? Object.keys(sqlResult.rows[0])).map(f => (
                                  <th key={f} className="text-left px-3 py-2 font-semibold whitespace-nowrap uppercase tracking-wider" style={{ color: 'var(--t-m)' }}>
                                    {f}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sqlResult.rows.map((row, i) => (
                                <tr key={i} className="transition" style={{ borderBottom: '1px solid var(--t-bd)' }}
                                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--t-s2)')}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  {(sqlResult.fields ?? Object.keys(row)).map(f => (
                                    <td key={f} className="px-3 py-2 font-mono" style={{ color: 'var(--t-sub)' }}>
                                      {row[f] === null || row[f] === undefined
                                        ? <span className="italic" style={{ color: 'var(--t-m)' }}>NULL</span>
                                        : String(row[f])
                                      }
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {sqlResult.type === 'SELECT' && sqlResult.rows?.length === 0 && (
                        <p className="px-4 py-4 text-xs italic" style={{ color: 'var(--t-m)' }}>{t.dbViewer.noResults}</p>
                      )}

                      {sqlResult.type === 'MODIFY' && (
                        <div className="px-4 py-4 text-xs font-mono space-y-0.5" style={{ color: 'var(--t-sub)' }}>
                          <p>{t.dbViewer.linesAffected}: <strong style={{ color: 'var(--t-tx)' }}>{sqlResult.affectedRows}</strong></p>
                          {(sqlResult.insertId ?? 0) > 0 && <p>{t.dbViewer.insertId}: <strong style={{ color: 'var(--t-tx)' }}>{sqlResult.insertId}</strong></p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showCreateTable && (
        <CreateTableModal
          botId={botId}
          onCreated={async () => {
            setShowCreateTable(false);
            showToast('ok', t.dbViewer.tableCreated);
            await loadTables();
          }}
          onClose={() => setShowCreateTable(false)}
        />
      )}

      {addRowOpen && selectedTable && structure.length > 0 && (
        <Modal title={`${t.dbViewer.insertInto} "${selectedTable}"`} onClose={() => setAddRowOpen(false)}>
          <RowForm
            cols={structure}
            onSubmit={handleInsertRow}
            onCancel={() => setAddRowOpen(false)}
            loading={actionLoading}
          />
        </Modal>
      )}

      {editRow && selectedTable && structure.length > 0 && (
        <Modal title={`${t.dbViewer.editRowIn} "${selectedTable}"`} onClose={() => setEditRow(null)}>
          <RowForm
            cols={structure}
            initial={editRow}
            onSubmit={handleUpdateRow}
            onCancel={() => setEditRow(null)}
            loading={actionLoading}
          />
        </Modal>
      )}

      {confirmAction && (
        <ConfirmModal
          title={t.dbViewer.confirmAction}
          description={confirmAction.label}
          confirmLabel={t.common.confirm}
          danger
          loading={actionLoading}
          onConfirm={runConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
