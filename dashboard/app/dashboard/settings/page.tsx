'use client';
import { useState, useEffect } from 'react';
import { cn, apiFetch } from '@/lib/utils';

const SETTINGS_SECTIONS = [
  {
    title: 'Reward Budget',
    icon: 'payments',
    fields: [
      { key: 'budget_cap_percent', label: 'Budget Cap (% of monthly ad revenue)', type: 'number', value: '35', hint: 'Max % of monthly ad revenue allocated to cash rewards' },
      { key: 'reward_rank_1_usd', label: 'Rank 1 Gift Card Value (USD)', type: 'number', value: '100' },
      { key: 'reward_rank_2_usd', label: 'Rank 2 Gift Card Value (USD)', type: 'number', value: '75' },
      { key: 'reward_rank_3_usd', label: 'Rank 3 Gift Card Value (USD)', type: 'number', value: '50' },
      { key: 'auto_freeze_day', label: 'Auto-freeze Day of Month', type: 'number', value: '28', hint: 'Day of month when leaderboard freezes for reward calculation' },
    ],
  },
  {
    title: 'Points & Study Rules',
    icon: 'timer',
    fields: [
      { key: 'base_points_per_hour', label: 'Base Points per Verified Hour', type: 'number', value: '100' },
      { key: 'diminishing_after_hours', label: 'Diminishing Returns After (hours)', type: 'number', value: '6' },
      { key: 'max_daily_hours_flag', label: 'Anti-Cheat: Max Daily Hours Before Flag', type: 'number', value: '12' },
      { key: 'max_daily_ad_doubles', label: 'Max Ad Doublings per Day', type: 'number', value: '2' },
      { key: 'max_streak_freezes_per_month', label: 'Max Streak Freezes per Month', type: 'number', value: '3', hint: 'How many times a user can freeze their streak each month' },
      { key: 'badge_xp_boost_duration_hours', label: 'Badge XP Boost Duration (hours)', type: 'number', value: '48', hint: 'Hours an XP boost badge remains active after earned' },
      { key: 'session_extension_minutes', label: 'Session Extension Grace (minutes)', type: 'number', value: '5', hint: 'Extra minutes allowed before a study session auto-ends' },
    ],
  },
  {
    title: 'Social Unlock',
    icon: 'lock_open',
    fields: [
      { key: 'social_unlock_per_hour', label: 'Social Minutes Earned per Study Hour', type: 'number', value: '15' },
      { key: 'social_ad_bonus_minutes', label: 'Ad Bonus Minutes', type: 'number', value: '5' },
      { key: 'social_ad_cooldown_hours', label: 'Ad Cooldown (hours)', type: 'number', value: '2' },
    ],
  },
  {
    title: 'Quiz',
    icon: 'quiz',
    fields: [
      { key: 'quiz_set_size', label: 'Questions per Quiz Set', type: 'number', value: '10' },
      { key: 'quiz_time_limit_secs', label: 'Time Limit per Question (seconds)', type: 'number', value: '25' },
      { key: 'max_quiz_attempts_per_day', label: 'Max Quiz Attempts per Subject per Day', type: 'number', value: '5' },
      { key: 'quiz_base_points_per_correct', label: 'Base Points per Correct Answer', type: 'number', value: '10' },
    ],
  },
  {
    title: 'AI Question Generation',
    icon: 'smart_toy',
    fields: [
      { key: 'cerebras_model', label: 'Cerebras Model', type: 'text', value: 'llama3.1-8b-instruct' },
      { key: 'questions_per_batch', label: 'Questions Generated per Batch', type: 'number', value: '20' },
      { key: 'auto_approve_threshold', label: 'Auto-approve Quality Score Threshold', type: 'number', value: '0', hint: '0 = all questions go to manual review (recommended)' },
    ],
  },
  {
    title: 'App Version',
    icon: 'system_update',
    fields: [
      { key: 'app_latest_version', label: 'Latest Version', type: 'text', value: '1.0.0', hint: 'Newest version available' },
      { key: 'app_min_version', label: 'Minimum Version', type: 'text', value: '1.0.0', hint: 'Users below this version are forced to update' },
      { key: 'app_update_url', label: 'APK Download URL', type: 'text', value: 'https://api.quovex.online/downloads/app-release.apk' },
      { key: 'app_force_update', label: 'Force Update', type: 'text', value: 'false', hint: 'Set to "true" to force all users to update' },
      { key: 'app_release_notes', label: 'Release Notes', type: 'text', value: '', hint: 'What\'s new in this version (shown in update dialog)' },
    ],
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [flushLoading, setFlushLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Record<string, string>>('/admin/settings');
      SETTINGS_SECTIONS.forEach(s => s.fields.forEach(f => {
        if (!(f.key in data)) data[f.key] = f.value;
      }));
      setValues(data);
    } catch {
      const init: Record<string, string> = {};
      SETTINGS_SECTIONS.forEach(s => s.fields.forEach(f => { init[f.key] = f.value; }));
      setValues(init);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaveError('');
    setSaved(false);
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const handleFreeze = async () => {
    setFreezeLoading(true);
    try {
      await apiFetch('/admin/tasks/freeze-leaderboard', { method: 'POST' });
      alert('Leaderboard freeze job queued successfully.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to trigger freeze');
    }
    setFreezeLoading(false);
  };

  const handleFlushCache = async () => {
    setFlushLoading(true);
    try {
      await apiFetch('/admin/cache/flush', { method: 'POST' });
      alert('Leaderboard cache flushed.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to flush cache');
    }
    setFlushLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-[#00288e] text-3xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Settings</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Tune app behaviour, rewards budget, and AI generation</p>
        </div>
        <button onClick={handleSave}
          className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] leading-[20px] font-semibold transition-all active:scale-95',
            saved ? 'bg-[#d1e7dd] text-[#0f5132]' : 'bg-[#00288e] text-white hover:bg-[#1e40af]')}>
          <span className="material-symbols-outlined text-sm">{saved ? 'check_circle' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-[#ffdad6] border border-[#f5c2c7] rounded-lg text-sm text-[#93000a]">
          {saveError}
        </div>
      )}

      <div className="space-y-4">
        {SETTINGS_SECTIONS.map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-[#c4c5d5] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#c4c5d5] bg-[#f1f3ff]">
              <span className="material-symbols-outlined text-[20px] text-[#00288e]" style={{ fontVariationSettings: "'FILL' 1" }}>{section.icon}</span>
              <h2 className="font-semibold text-[#141b2b] text-sm">{section.title}</h2>
            </div>
            <div className="p-5 space-y-4">
              {section.fields.map(field => (
                <div key={field.key} className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#141b2b]">{field.label}</label>
                    {field.hint && <p className="text-xs text-[#757684] mt-0.5">{field.hint}</p>}
                  </div>
                  <input
                    type={field.type}
                    value={values[field.key] ?? field.value}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    className="w-36 px-3 py-1.5 border border-[#c4c5d5] rounded-lg text-sm text-right text-[#141b2b] bg-[#f9f9ff] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-[#c4c5d5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
        <h2 className="font-semibold text-[#141b2b] mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#fea619]/40 bg-[#fffbe6]">
            <div>
              <p className="text-[14px] leading-[20px] font-semibold text-[#684000]">Manually Trigger Leaderboard Freeze</p>
              <p className="text-[12px] leading-[16px] text-[#684000] mt-0.5">Runs the monthly freeze job immediately. Use only for testing.</p>
            </div>
            <button onClick={handleFreeze} disabled={freezeLoading}
              className="px-3 py-1.5 border-2 border-[#fea619] text-[#684000] text-[12px] leading-[16px] font-semibold rounded-lg hover:bg-[#fea619] hover:text-white transition-colors disabled:opacity-50 active:scale-95">
              {freezeLoading ? 'Triggering...' : 'Trigger Now'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#ba1a1a]/40 bg-[#ffdad6]/20">
            <div>
              <p className="text-[14px] leading-[20px] font-semibold text-[#93000a]">Flush Leaderboard Cache</p>
              <p className="text-[12px] leading-[16px] text-[#93000a] mt-0.5">Clears all Redis leaderboard caches. Rankings will recompute on next request.</p>
            </div>
            <button onClick={handleFlushCache} disabled={flushLoading}
              className="px-3 py-1.5 border-2 border-[#ba1a1a] text-[#93000a] text-[12px] leading-[16px] font-semibold rounded-lg hover:bg-[#ba1a1a] hover:text-white transition-colors disabled:opacity-50 active:scale-95">
              {flushLoading ? 'Flushing...' : 'Flush Cache'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
