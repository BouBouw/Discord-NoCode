import { useState, useEffect } from 'react';
import { X, Bot as BotIcon, Zap, Settings } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import type { Bot, BotCreateData, BotUpdateData } from '../services/api';
import { loadUserSettings } from '../hooks/useUserSettings';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGE_LABELS: Record<string, string> = {
  fr: '🇫🇷 Français', en: '🇬🇧 English', es: '🇪🇸 Español', de: '🇩🇪 Deutsch', pt: '🇧🇷 Português',
};
const THEME_LABELS: Record<string, string> = {
  dark: '🌑 Sombre', orange: '🟠 Orange', blurple: '💙 Blurple', green: '🟢 Vert', light: '☀️ Clair',
};

interface BotModalProps {
  bot: Bot | null;
  workflows: never[];
  onClose: () => void;
  onSave: (data: BotCreateData | BotUpdateData, id?: number) => Promise<void>;
}

export default function BotModal({ bot, onClose, onSave }: BotModalProps) {
  const [name, setName] = useState('');
  const [discordToken, setDiscordToken] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const defaults = loadUserSettings();
  const { t } = useTranslation();

  const isEditing = !!bot;

  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setDiscordToken('');
    } else {
      setName('');
      setDiscordToken('');
    }
  }, [bot]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast('warning', t.botModal.nameRequired);
      return;
    }

    if (!isEditing && !discordToken.trim()) {
      toast('warning', t.botModal.tokenRequired);
      return;
    }

    let data: BotCreateData | BotUpdateData;

    if (isEditing) {
      data = { name: name.trim() } as BotUpdateData;
      if (discordToken.trim()) {
        (data as BotUpdateData).discordToken = discordToken.trim();
      }
    } else {
      data = { name: name.trim(), discordToken: discordToken.trim() };
    }

    setLoading(true);
    try {
      await onSave(data, bot?.id);
      onClose();
    } catch (error) {
      console.error('Failed to save bot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save bot';
      toast('error', `${t.botModal.saveFailed} ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md mx-4"
        style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--t-bd)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--t-aa)' }}
            >
              <BotIcon className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
            </div>
            <h2 className="font-semibold" style={{ color: 'var(--t-tx)' }}>
              {isEditing ? t.botModal.editInstance : t.botModal.newInstance}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="dnc-btn-icon w-7 h-7"
            style={{ color: 'var(--t-m)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--t-sub)' }}>
              {t.botModal.instanceName} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
              placeholder={t.botModal.namePlaceholder}
              required
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
            />
          </div>

          {/* Discord Token */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--t-sub)' }}>
              {t.botModal.discordToken}{' '}
              {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="password"
              value={discordToken}
              onChange={e => setDiscordToken(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
              style={{ backgroundColor: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
              placeholder={isEditing ? t.botModal.tokenUpdateHint : 'MTAw...'}
              required={!isEditing ? true : undefined}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--t-m)' }}>
              {isEditing
                ? t.botModal.tokenUpdateHelp
                : (<>{t.botModal.tokenHelp.split('Discord Developer Portal')[0]}
                    <a
                      href="https://discord.com/developers/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--t-a)' }}
                    >
                      Discord Developer Portal
                    </a>
                  </>)
              }
            </p>
          </div>

          {/* Defaults applied banner (creation only) */}
          {!isEditing && (
            <div
              className="flex items-center justify-between rounded-xl px-3.5 py-3"
              style={{ backgroundColor: 'var(--t-aa)', border: '1px solid var(--t-aa)' }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-a)' }} />
                <span className="text-xs" style={{ color: 'var(--t-sub)' }}>
                  {t.botModal.settingsApplied}{' '}
                  <strong style={{ color: 'var(--t-tx)' }}>{LANGUAGE_LABELS[defaults.defaultLanguage]}</strong>
                  {' · '}
                  <strong style={{ color: 'var(--t-tx)' }}>{THEME_LABELS[defaults.defaultBotTheme]}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/dashboard/settings'); }}
                className="dnc-btn-icon ml-2 shrink-0 w-6 h-6"
                style={{ color: 'var(--t-m)' }}
                title={t.settings.editProfile}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="dnc-btn dnc-btn-ghost"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="dnc-btn dnc-btn-primary"
            >
              {loading && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              {loading ? t.botModal.saving : isEditing ? t.botModal.update : t.botModal.createInstance}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
