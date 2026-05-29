'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ApiResponse, AISettings } from '@/types/index';
import { 
  Settings, 
  Key, 
  Trash2, 
  AlertOctagon, 
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingKey, setIsClearingKey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiRequest<ApiResponse<AISettings>>({
        method: 'GET',
        path: '/api/settings',
      });
      if (data.success) {
        setHasApiKey(data.data.hasApiKey);
        setModel(data.data.geminiModel || 'gemini-1.5-flash');
      }
    } catch {
      toast.error('Failed to load cryptographic AI settings.');
    }
  }

  async function handleSaveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!apiKey && hasApiKey === false) {
      toast.error('Please input a valid API Key.');
      return;
    }

    setIsSaving(true);
    try {
      const data = await apiRequest<ApiResponse<AISettings>>({
        method: 'PUT',
        path: '/api/settings',
        body: {
          geminiApiKey: apiKey || undefined, // only update if filled
          geminiModel: model,
        },
      });

      if (data.success) {
        toast.success('AI cryptographic settings saved successfully!');
        setApiKey('');
        loadSettings();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const password = prompt(
      `WARNING: This action is extremely dangerous. It will permanently delete your user profile, all invoices, clients, expenses, and settings.\n\nEnter your password to confirm chamber vaporization:`
    );

    if (!password) {
      toast.error('Password is required. Account deletion cancelled.');
      return;
    }

    setIsDeleting(true);
    try {
      const data = await apiRequest<ApiResponse<null>>({
        method: 'DELETE',
        path: '/api/auth/account',
        body: { password },
      });

      if (data.success) {
        toast.success('Your accounting vault chamber has been permanently vaporized.');
        // Trigger silent refresh logout / wipe state
        window.location.href = '/register';
      } else {
        toast.error(data.error?.message || 'Vaporization failed.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Vaporization failed.');
      setIsDeleting(false);
    }
  }


  async function handleClearApiKey() {
    if (!confirm('Are you sure you want to clear your API key and model? You will need to reconfigure them to use AI features.')) return;

    setIsClearingKey(true);
    try {
      const data = await apiRequest<ApiResponse<null>>({
        method: 'DELETE',
        path: '/api/settings/api-key',
      });

      if (data.success) {
        toast.success('API credentials cleared successfully. Your keys have been purged from the vault.');
        setApiKey('');
        setModel('gemini-1.5-flash');
        loadSettings();
      }
    } catch {
      toast.error('Failed to clear API credentials.');
    } finally {
      setIsClearingKey(false);
    }
  }

  return (
    <div className="space-y-8 fade-in max-w-2xl">
      {/* Title Header Area */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Vault Settings
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Manage secure cryptographic AI keys, models, and account lifecycles
        </p>
      </div>

      {/* AI Settings Glass Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl backdrop-blur-md space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-default)]">
          <Sparkles size={16} className="text-emerald-500" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Gemini Integration</h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
              <span>Gemini API Key</span>
              {hasApiKey !== null && (
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                  hasApiKey ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' : 'bg-rose-950/20 text-rose-400 border border-rose-900/20'
                }`}>
                  {hasApiKey ? '🔑 Secure Tag Configured' : '⚠️ Missing Key'}
                </span>
              )}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? '••••••••••••••••••••••••••••••••' : 'Input your Google Gemini API Key'}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-10 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-relaxed">
              Your API Key is encrypted symmetrically using <span className="text-emerald-500 font-semibold">AES-256-GCM</span> on the backend before being written to Postgres. It is decrypted on-the-fly and never exposed in any API output.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Gemini LLM Model Choice
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
              placeholder="e.g. gemini-2.5-flash"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold self-start"
              id="btn-save-settings"
            >
              {isSaving ? 'Encrypting settings...' : 'Encrypt & Save Settings'}
            </button>

            {hasApiKey && (
              <button
                type="button"
                onClick={handleClearApiKey}
                disabled={isClearingKey}
                className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all duration-200"
                id="btn-clear-api-key"
              >
                <Lock size={12} />
                {isClearingKey ? 'Clearing...' : 'Clear API Credentials'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Dangerous Account Deletion Section */}
      <div className="bg-[var(--bg-card)] border border-rose-500/20 p-6 rounded-2xl backdrop-blur-md space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-rose-500/10">
          <AlertOctagon size={16} className="text-rose-500" />
          <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Dangerous Ledger Operations</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Deleting this chamber is irreversible. All clients, billing logs, and categorizations will be permanently deleted from the Neon database.
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-950/15 border border-rose-900/20 text-rose-400 hover:bg-rose-900/20 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all duration-200"
            id="btn-delete-chamber"
          >
            <Trash2 size={12} />
            {isDeleting ? 'Vaporizing vault...' : 'Delete Ledger Chamber'}
          </button>
        </div>
      </div>
    </div>
  );
}
