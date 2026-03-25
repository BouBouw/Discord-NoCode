import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, Users, Copy, CheckCircle, ExternalLink,
  ArrowDownToLine, AlertCircle, Loader2, CreditCard, Globe, Mail, User,
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import {
  partnerAPI,
  type PartnerStats,
  type ConnectStatus,
} from '../../services/api';

const fmt = (cents: number) => (cents / 100).toFixed(2) + '€';

export default function PartnerPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([partnerAPI.stats(), partnerAPI.connectStatus()]);
        setStats(s);
        setConnect(c);
      } catch {
        setError(t.partner.loadError);
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const copyLink = async () => {
    if (!stats) return;
    const url = `${window.location.origin}/register?ref=${stats.wallet.referralCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOnboard = async () => {
    try {
      const { url } = await partnerAPI.connectOnboard();
      window.location.href = url;
    } catch {
      setError(t.partner.connectError);
    }
  };

  const handleWithdraw = async () => {
    if (!stats || !connect) return;
    if (!connect.onboarded || !connect.payoutsEnabled) {
      setWithdrawMsg(t.partner.connectFirst);
      return;
    }
    if (stats.wallet.balance < 1000) {
      setWithdrawMsg(t.partner.minWithdraw);
      return;
    }
    setWithdrawing(true);
    setWithdrawMsg('');
    try {
      const res = await partnerAPI.withdraw();
      setWithdrawMsg(t.partner.withdrawSuccess.replace('{amount}', (res.amount / 100).toFixed(2)));
      setStats(prev => prev ? { ...prev, wallet: { ...prev.wallet, balance: 0, totalWithdrawn: prev.wallet.totalWithdrawn + res.amount } } : prev);
    } catch {
      setWithdrawMsg(t.partner.withdrawError);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--t-a)' }} />
    </div>
  );

  if (error && !stats) return (
    <div className="flex items-center justify-center h-64 gap-2" style={{ color: 'var(--t-e)' }}>
      <AlertCircle className="w-5 h-5" /> {error}
    </div>
  );

  if (!stats) return null;

  const w = stats.wallet;
  const canWithdraw = w.balance >= 1000 && connect?.onboarded && connect?.payoutsEnabled;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--t-tx)' }}>{t.partner.title}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t-sub)' }}>{t.partner.subtitle}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Wallet, label: t.partner.balance, value: fmt(w.balance) },
          { icon: TrendingUp, label: t.partner.totalEarned, value: fmt(w.totalEarned) },
          { icon: Users, label: t.partner.referralsCount, value: String(stats.referrals.length) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl p-4 border" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--t-sub)' }}>{label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--t-tx)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="rounded-xl p-5 border" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--t-tx)' }}>{t.partner.referralLink}</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--t-sub)' }}>{t.partner.referralDesc}</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={`${window.location.origin}/register?ref=${w.referralCode}`}
            className="flex-1 rounded-lg px-3 py-2 text-sm border"
            style={{ background: 'var(--t-bg)', borderColor: 'var(--t-bd)', color: 'var(--t-tx)' }}
          />
          <button onClick={copyLink} className="dnc-btn dnc-btn-ghost rounded-lg px-3 py-2">
            {copied ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--t-a)' }} /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stripe Connect + Withdraw row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stripe Connect */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--t-tx)' }}>{t.partner.stripeConnect}</h2>
          <p className="text-xs mb-3" style={{ color: 'var(--t-sub)' }}>{t.partner.stripeConnectDesc}</p>
          {connect?.onboarded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--t-a)' }}>
                <CheckCircle className="w-4 h-4" />
                {t.partner.connected}
                {connect.payoutsEnabled && <span className="ml-2">· {t.partner.payoutsEnabled}</span>}
              </div>
              <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--t-bg)', border: '1px solid var(--t-bd)' }}>
                {connect.displayName && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-sub)' }} />
                    <span style={{ color: 'var(--t-tx)' }}>{connect.displayName}</span>
                  </div>
                )}
                {connect.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-sub)' }} />
                    <span style={{ color: 'var(--t-tx)' }}>{connect.email}</span>
                  </div>
                )}
                {connect.country && (
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-sub)' }} />
                    <span style={{ color: 'var(--t-tx)' }}>{connect.country}</span>
                  </div>
                )}
                {connect.accountId && (
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-sub)' }} />
                    <span className="font-mono" style={{ color: 'var(--t-sub)', fontSize: '0.7rem' }}>{connect.accountId}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={handleOnboard} className="dnc-btn dnc-btn-primary rounded-lg text-sm">
              <ExternalLink className="w-4 h-4" /> {t.partner.connectStripe}
            </button>
          )}
        </div>

        {/* Withdraw */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--t-tx)' }}>{t.partner.withdraw}</h2>
          <p className="text-xs mb-3" style={{ color: 'var(--t-sub)' }}>{t.partner.withdrawDesc}</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--t-sub)' }}>{t.partner.availableBalance}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--t-tx)' }}>{fmt(w.balance)}</span>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw || withdrawing}
            className="dnc-btn dnc-btn-primary rounded-lg text-sm w-full disabled:opacity-50"
          >
            {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
            {t.partner.withdrawBtn}
          </button>
          {withdrawMsg && (
            <p className="text-xs mt-2" style={{ color: withdrawMsg.includes('€') ? 'var(--t-a)' : 'var(--t-e)' }}>{withdrawMsg}</p>
          )}
        </div>
      </div>

      {/* Referrals table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--t-bd)' }}>
        <div className="px-5 py-3 border-b" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.partner.referrals}</h2>
        </div>
        {stats.referrals.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: 'var(--t-sub)' }}>{t.partner.noReferrals}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--t-bd)' }}>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.email}</th>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.date}</th>
              </tr>
            </thead>
            <tbody>
              {stats.referrals.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--t-bd)' }}>
                  <td className="px-5 py-2" style={{ color: 'var(--t-tx)' }}>{r.referredEmail}</td>
                  <td className="px-5 py-2" style={{ color: 'var(--t-sub)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Earnings table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--t-bd)' }}>
        <div className="px-5 py-3 border-b" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.partner.earnings}</h2>
        </div>
        {stats.earnings.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: 'var(--t-sub)' }}>{t.partner.noEarnings}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--t-bd)' }}>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.amount}</th>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.description}</th>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.date}</th>
              </tr>
            </thead>
            <tbody>
              {stats.earnings.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--t-bd)' }}>
                  <td className="px-5 py-2 font-medium" style={{ color: 'var(--t-a)' }}>{fmt(e.amount)}</td>
                  <td className="px-5 py-2" style={{ color: 'var(--t-tx)' }}>{e.description}</td>
                  <td className="px-5 py-2" style={{ color: 'var(--t-sub)' }}>{new Date(e.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Withdrawals table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--t-bd)' }}>
        <div className="px-5 py-3 border-b" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.partner.withdrawals}</h2>
        </div>
        {stats.withdrawals.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: 'var(--t-sub)' }}>{t.partner.noReferrals}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--t-bd)' }}>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.amount}</th>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>Status</th>
                <th className="px-5 py-2 text-left font-medium" style={{ color: 'var(--t-sub)' }}>{t.partner.date}</th>
              </tr>
            </thead>
            <tbody>
              {stats.withdrawals.map((wd, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--t-bd)' }}>
                  <td className="px-5 py-2 font-medium" style={{ color: 'var(--t-tx)' }}>{fmt(wd.amount)}</td>
                  <td className="px-5 py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                      background: wd.status === 'completed' ? 'rgba(34,197,94,0.15)' : wd.status === 'pending' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                      color: wd.status === 'completed' ? '#22c55e' : wd.status === 'pending' ? '#eab308' : '#ef4444',
                    }}>
                      {wd.status === 'completed' ? t.partner.statusCompleted : wd.status === 'pending' ? t.partner.statusPending : t.partner.statusFailed}
                    </span>
                  </td>
                  <td className="px-5 py-2" style={{ color: 'var(--t-sub)' }}>{new Date(wd.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
