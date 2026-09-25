'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Settings, Shield } from 'lucide-react';

interface GlobalSettings {
  [key: string]: any;
  google_analytics_id: string;
  termly_uuid: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({ google_analytics_id: '', termly_uuid: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest<{ data: GlobalSettings }>({ method: 'GET', path: '/api/admin/settings' });
        setSettings(res.data || { google_analytics_id: '', termly_uuid: '' });
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest({ method: 'PUT', path: '/api/admin/settings', body: settings });
      toast.success('Global settings updated successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-4 border-[#6c5ce7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = "w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg p-2.5 text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-1.5";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-[var(--border-default)] pb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-[var(--accent-primary)]" />
            Global Platform Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">Manage infrastructure, legal, and analytics integrations.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-blue-500" /> Legal & Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Google Analytics ID (GA4)</label>
                <input 
                  type="text"
                  value={settings.google_analytics_id || ''}
                  onChange={(e) => setSettings({...settings, google_analytics_id: e.target.value})}
                  placeholder="G-XXXXXXXXXX" 
                  className={inputClass} 
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">Your GA4 Measurement ID.</p>
              </div>
              <div>
                <label className={labelClass}>Termly UUID</label>
                <input 
                  type="text"
                  value={settings.termly_uuid || ''}
                  onChange={(e) => setSettings({...settings, termly_uuid: e.target.value})}
                  placeholder="UUID..." 
                  className={inputClass} 
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">Cookie consent banner UUID.</p>
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-[var(--text-primary)] rounded-lg font-semibold shadow-lg shadow-sm transition-all"
          >
            {saving ? 'Saving...' : 'Save Global Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
