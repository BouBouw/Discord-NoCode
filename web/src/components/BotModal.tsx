import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Bot, BotCreateData, BotUpdateData } from '../services/api';

interface Workflow {
  id: number;
  name: string;
}

interface BotModalProps {
  bot: Bot | null;
  workflows: Workflow[];
  onClose: () => void;
  onSave: (data: BotCreateData | BotUpdateData, id?: number) => Promise<void>;
}

export default function BotModal({ bot, workflows, onClose, onSave }: BotModalProps) {
  const [name, setName] = useState('');
  const [discordToken, setDiscordToken] = useState('');
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!bot;

  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setDiscordToken(''); // Don't show token for security
      setWorkflowId(bot.workflow_id);
    } else {
      setName('');
      setDiscordToken('');
      setWorkflowId(null);
    }
  }, [bot]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Bot name is required');
      return;
    }

    if (!isEditing && !discordToken.trim()) {
      alert('Discord token is required for new bots');
      return;
    }

    const data: BotCreateData | BotUpdateData = {
      name: name.trim(),
      ...(workflowId !== null && { workflow_id: workflowId }),
    };

    if (!isEditing) {
      (data as BotCreateData).discord_token = discordToken.trim();
    }

    setLoading(true);
    try {
      await onSave(data, bot?.id);
      onClose();
    } catch (error) {
      console.error('Failed to save bot:', error);
      alert('Failed to save bot');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Bot' : 'Create New Bot'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bot Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Bot"
              required
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discord Token <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={discordToken}
                onChange={(e) => setDiscordToken(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MTAw..."
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                Get your token from{' '}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Discord Developer Portal
                </a>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Workflow (Optional)
            </label>
            <select
              value={workflowId || ''}
              onChange={(e) => setWorkflowId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No workflow</option>
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Bot' : 'Create Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
