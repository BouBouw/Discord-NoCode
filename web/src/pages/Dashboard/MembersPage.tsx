import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Crown, Shield, Edit3, Eye, Trash2,
  Loader2, Check, X, ArrowLeft,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_HIERARCHY = ['viewer', 'editor', 'admin', 'owner'] as const;

// ROLE_LABELS moved inside component to access translations

const ROLE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  owner:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200' },
  admin:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  editor: { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200'   },
  viewer: { bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200'  },
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner:  Crown,
  admin:  Shield,
  editor: Edit3,
  viewer: Eye,
};

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Member {
  id: number;
  email: string;
  role: string;
  status: 'pending' | 'accepted';
  created_at: string;
  user_id: number | null;
}

interface MembersData {
  owner: { email: string; userId: number; role: 'owner' };
  members: Member[];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const { t } = useTranslation();
  const ROLE_LABELS: Record<string, string> = {
    owner: t.members.owner, admin: t.members.admin, editor: t.members.editor, viewer: t.members.viewer,
  };
  const Icon = ROLE_ICONS[role] ?? Eye;
  const s = ROLE_BADGE[role] ?? ROLE_BADGE.viewer;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <Icon className="w-3 h-3" />
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<string, string> = {
    accepted: t.status.online, pending: t.status.pending,
  };
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Avatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  const hue = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: `hsl(${hue}, 55%, 48%)` }}
    >
      {initials}
    </div>
  );
}

function HierarchyDots({ role }: { role: string }) {
  const level = ROLE_HIERARCHY.indexOf(role as any);
  return (
    <div className="flex items-center gap-0.5">
      {ROLE_HIERARCHY.map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= level ? 'opacity-100' : 'opacity-20'}`}
          style={{
            background: i <= level
              ? ['#6b7280', '#3b82f6', '#a855f7', '#f97316'][i]
              : '#cbd5e1',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function MembersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const instanceId = searchParams.get('instanceId');

  const ROLE_LABELS: Record<string, string> = {
    owner: t.members.owner, admin: t.members.admin, editor: t.members.editor, viewer: t.members.viewer,
  };

  const [workflowName, setWorkflowName] = useState<string | null>(null);
  const [data, setData] = useState<MembersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Inline role edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!instanceId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [wf, members] = await Promise.all([
        apiRequest(`/workflows/${instanceId}`),
        apiRequest(`/workflows/${instanceId}/members`),
      ]);
      setWorkflowName(wf?.name ?? wf?.title ?? `Workflow #${instanceId}`);
      setData(members);
    } catch (e: any) {
      setError(e?.message ?? t.common.error);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !instanceId) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      await apiRequest(`/workflows/${instanceId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 2500);
      load();
    } catch (e: any) {
      setInviteError(e?.message ?? t.common.error);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: number) => {
    if (!instanceId) return;
    setSaving(true);
    try {
      await apiRequest(`/workflows/${instanceId}/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: editRole }),
      });
      setEditingId(null);
      load();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleRemove = async (memberId: number, _email: string) => {
    if (!instanceId || !confirm(`${t.members.removeConfirm}`)) return;
    try {
      await apiRequest(`/workflows/${instanceId}/members/${memberId}`, { method: 'DELETE' });
      load();
    } catch { /* ignore */ }
  };

  const total = data ? 1 + data.members.length : 0;
  const pending = data?.members.filter(m => m.status === 'pending').length ?? 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }}>
      {/* Header */}
      <header
        className="h-14 flex items-center gap-3 px-6 sticky top-0 z-10"
        style={{ backgroundColor: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}
      >
        <button
          onClick={() => instanceId ? navigate(`/workflow/${instanceId}`) : navigate('/dashboard')}
          className="dnc-btn-icon w-7 h-7 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--t-aa)' }}
        >
          <Users className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-none" style={{ color: 'var(--t-tx)' }}>{t.members.title}</h1>
          {workflowName && <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>{workflowName}</p>}
        </div>
        <div className="flex-1" />
        {data && (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--t-s2)', color: 'var(--t-sub)' }}
            >
              <Users className="w-3 h-3" />
              {total} {total > 1 ? t.members.members_ : t.members.member}
            </span>
            {pending > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {pending} {t.status.pending}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Body */}
      <main className="max-w-8xl mx-auto px-6 py-8">
        {!instanceId && (
          <div className="text-center py-20">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--t-bd)' }} />
            <p className="font-medium" style={{ color: 'var(--t-sub)' }}>{t.members.noWorkflowSelected}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="dnc-btn dnc-btn-soft dnc-btn-xs mt-4"
            >
              {t.members.backToDashboard}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--t-a)' }} />
          </div>
        )}

        {error && (
          <div className="rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            {/* ── Invite card ── */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                <UserPlus className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.members.inviteCollaborator}</h2>
              </div>
              <form onSubmit={handleInvite} className="px-6 py-5">
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg focus:outline-none"
                    style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as any)}
                    className="text-sm px-3 py-2 rounded-lg focus:outline-none"
                    style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
                  >
                    <option value="viewer">{t.members.viewer}</option>
                    <option value="editor">{t.members.editor}</option>
                    <option value="admin">{t.members.admin}</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviting || !inviteEmail.trim()}
                    className="dnc-btn dnc-btn-primary"
                  >
                    {inviting
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : inviteSuccess
                        ? <Check className="w-4 h-4" />
                        : <UserPlus className="w-4 h-4" />}
                    {inviteSuccess ? t.members.sent : t.members.invite}
                  </button>
                </div>
                {inviteError && (
                  <p className="mt-2 text-xs text-red-600">{inviteError}</p>
                )}
                {/* Role descriptions */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {(['viewer', 'editor', 'admin'] as const).map(r => {
                    const s = ROLE_BADGE[r];
                    const Icon = ROLE_ICONS[r];
                    const ROLE_LABELS: Record<string, string> = {
                      owner: t.members.owner, admin: t.members.admin, editor: t.members.editor, viewer: t.members.viewer,
                    };
                    const desc: Record<string, string> = {
                      viewer: t.members.readOnly,
                      editor: t.members.canEditWorkflow,
                      admin:  t.members.fullManagement,
                    };
                    return (
                      <div key={r} className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                        <Icon className="w-3 h-3" />
                        <strong>{ROLE_LABELS[r]}</strong>
                        <span className="opacity-70">— {desc[r]}</span>
                      </div>
                    );
                  })}
                </div>
              </form>
            </div>

            {/* ── Members list ── */}
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
              <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                <Users className="w-4 h-4" style={{ color: 'var(--t-sub)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.members.collaborators}</h2>
                <span className="ml-auto text-xs" style={{ color: 'var(--t-sub)' }}>{total} {total > 1 ? t.members.members_ : t.members.member}</span>
              </div>

              {/* Hierarchy legend */}
                <div className="px-6 py-2.5 flex items-center gap-3 flex-wrap" style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)' }}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--t-sub)' }}>{t.members.hierarchy}</span>
                <div className="flex items-center gap-2">
                  {ROLE_HIERARCHY.map((r, i) => {
                    const s = ROLE_BADGE[r];
                    const Icon = ROLE_ICONS[r];
                    return (
                      <div key={r} className="flex items-center gap-1">
                        {i > 0 && <span className="text-xs" style={{ color: 'var(--t-bd)' }}>{'<'}</span>}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                          <Icon className="w-2.5 h-2.5" />
                          {ROLE_LABELS[r]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

                <ul className="divide-y" style={{ borderColor: 'var(--t-bd)' }}>
                {/* Owner row */}
                <li className="px-6 py-4 flex items-center gap-4">
                  <Avatar email={data.owner.email} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--t-tx)' }}>{data.owner.email}</p>
                    <HierarchyDots role="owner" />
                  </div>
                  <RoleBadge role="owner" />
                  <StatusBadge status="accepted" />
                  {/* Owner cannot be removed */}
                  <div className="w-16" />
                </li>

                {/* Members */}
                {data.members.map(m => (
                  <li key={m.id} className="px-6 py-4">
                    {editingId === m.id ? (
                      /* ── Inline edit row ── */
                      <div className="flex items-center gap-4">
                        <Avatar email={m.email} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--t-sub)' }}>{m.email}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-sub)' }}>{t.members.chooseNewRole}</p>
                        </div>
                        <select
                          value={editRole}
                          onChange={e => setEditRole(e.target.value as any)}
                          className="text-sm px-2.5 py-1.5 rounded-lg focus:outline-none"
                          style={{ border: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
                        >
                          <option value="viewer">{t.members.viewer}</option>
                          <option value="editor">{t.members.editor}</option>
                          <option value="admin">{t.members.admin}</option>
                        </select>
                        <button
                          onClick={() => handleUpdateRole(m.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50"
                          style={{ background: 'var(--t-a)' }}
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          OK
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="dnc-btn dnc-btn-ghost dnc-btn-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      /* ── Normal row ── */
                      <div className="flex items-center gap-4">
                        <Avatar email={m.email} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--t-tx)' }}>{m.email}</p>
                          <HierarchyDots role={m.role} />
                        </div>
                        <RoleBadge role={m.role} />
                        <StatusBadge status={m.status} />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingId(m.id); setEditRole(m.role as any); }}
                            title={t.members.changeRole}
                          className="dnc-btn-icon w-7 h-7"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(m.id, m.email)}
                            title={t.members.removeFromWorkflow}
                          className="dnc-btn-icon dnc-btn-icon-danger w-7 h-7"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}

                {data.members.length === 0 && (
                  <li className="px-6 py-8 text-center text-sm" style={{ color: 'var(--t-m)' }}>
                    <UserPlus className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--t-bd)' }} />
                    {t.members.noCollaborators}
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
