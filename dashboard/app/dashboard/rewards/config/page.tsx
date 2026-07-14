'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/utils';
import { usePageHeader } from '@/components/layout/HeaderContext';

type Track = 'study' | 'quiz' | 'overall';
type PositionLabel = 'rank_1' | 'rank_2' | 'rank_3' | 'top_100' | 'top_1000';
type RewardType = 'giftcard' | 'badge' | 'physical_item';

interface RewardConfig {
  id?: string;
  period_month: string;
  track: string;
  position_label: string;
  reward_name: string;
  reward_type: string;
  amount_usd: number | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
}

const TRACKS: Track[] = ['study', 'quiz', 'overall'];
const TRACK_LABELS: Record<Track, string> = { study: 'Study (minutes)', quiz: 'Quiz (score)', overall: 'Overall' };
const POSITIONS: PositionLabel[] = ['rank_1', 'rank_2', 'rank_3', 'top_100', 'top_1000'];
const POSITION_LABELS: Record<PositionLabel, string> = {
  rank_1: 'Rank 1', rank_2: 'Rank 2', rank_3: 'Rank 3',
  top_100: 'Top 100 (ranks 4-100)', top_1000: 'Top 1000 (ranks 101-1000)',
};
const POSITION_DEFAULTS: Record<PositionLabel, { name: string; type: RewardType; amount: number | null }> = {
  rank_1:   { name: 'Gift Card $100',  type: 'giftcard',      amount: 100 },
  rank_2:   { name: 'Gift Card $75',   type: 'giftcard',      amount: 75 },
  rank_3:   { name: 'Gift Card $50',   type: 'giftcard',      amount: 50 },
  top_100:  { name: 'Top 100 Badge',   type: 'badge',         amount: null },
  top_1000: { name: 'Top 1000 Badge',  type: 'badge',         amount: null },
};

function nowMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function RewardConfigPage() {
  const [month, setMonth] = useState(nowMonth());
  const [activeTrack, setActiveTrack] = useState<Track>('study');
  const [configs, setConfigs] = useState<Record<string, Record<string, RewardConfig>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  usePageHeader({ searchPlaceholder: undefined });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month });
      const data = await apiFetch<RewardConfig[]>(`/admin/rewards/config?${params}`);
      const byTrack: Record<string, Record<string, RewardConfig>> = {};
      for (const c of data) {
        if (!byTrack[c.track]) byTrack[c.track] = {};
        byTrack[c.track][c.position_label] = c;
      }
      setConfigs(byTrack);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const getValue = (pos: PositionLabel, field: string): any => {
    const c = configs[activeTrack]?.[pos];
    if (c && (c as any)[field] !== undefined && (c as any)[field] !== null) return (c as any)[field];
    const def = POSITION_DEFAULTS[pos];
    if (field === 'reward_name') return def.name;
    if (field === 'reward_type') return def.type;
    if (field === 'amount_usd') return def.amount;
    if (field === 'image_url') return null;
    if (field === 'description') return null;
    return null;
  };

  const updateValue = (pos: PositionLabel, field: string, value: any) => {
    setConfigs(prev => {
      const next = { ...prev };
      if (!next[activeTrack]) next[activeTrack] = {};
      next[activeTrack] = { ...next[activeTrack] };
      next[activeTrack][pos] = { ...(next[activeTrack][pos] || {} as any), [field]: value };
      return next;
    });
  };

  const handleSaveTrack = async () => {
    setSaving(true);
    try {
      const trackConfigs = configs[activeTrack] || {};
      for (const pos of POSITIONS) {
        const cfg = trackConfigs[pos];
        if (!cfg) continue;
        const body = {
          period_month: month,
          track: activeTrack,
          position_label: pos,
          reward_name: cfg.reward_name || POSITION_DEFAULTS[pos].name,
          reward_type: cfg.reward_type || POSITION_DEFAULTS[pos].type,
          amount_usd: cfg.amount_usd ?? POSITION_DEFAULTS[pos].amount,
          description: cfg.description || null,
          is_active: true,
        };
        await apiFetch('/admin/rewards/config', {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      }
      await loadConfigs();
      showToast(`Saved ${activeTrack} config`);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (pos: PositionLabel, file: File) => {
    const cfg = configs[activeTrack]?.[pos];
    if (!cfg?.id) {
      showToast('Save the config first before uploading an image', false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/admin/rewards/config/${cfg.id}/upload-image`,
        { method: 'POST', credentials: 'include', body: formData },
      );
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      updateValue(pos, 'image_url', data.image_url);
      showToast('Image uploaded');
    } catch (e: any) {
      showToast(e.message, false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toast.ok ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#ffdad6] text-[#93000a]'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Reward Configuration</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[#6B7280]">Month:</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
          />
        </div>
      </div>

      {/* Track tabs */}
      <div className="flex gap-2 mb-6">
        {TRACKS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTrack(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTrack === t
                ? 'bg-[#1e40af] text-white shadow-md'
                : 'bg-white text-[#6B7280] border border-[#d1d5db] hover:bg-[#f3f4f6]'
            }`}
          >
            {TRACK_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af]" />
        </div>
      ) : (
        <div className="grid gap-4">
          {POSITIONS.map(pos => (
            <div key={pos} className="bg-white border border-[#d1d5db] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#111827]">{POSITION_LABELS[pos]}</h3>
                <div className="flex items-center gap-2">
                  {getValue(pos, 'image_url') && (
                    <img
                      src={getValue(pos, 'image_url')}
                      alt="Reward"
                      className="w-10 h-10 rounded-lg object-cover border border-[#d1d5db]"
                    />
                  )}
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#f3f4f6] text-xs font-semibold text-[#6B7280] hover:bg-[#e5e7eb] transition-colors">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImage(pos, f);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Reward Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">Reward Name</label>
                  <input
                    type="text"
                    value={getValue(pos, 'reward_name') || ''}
                    onChange={e => updateValue(pos, 'reward_name', e.target.value)}
                    placeholder={POSITION_DEFAULTS[pos].name}
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">Type</label>
                  <select
                    value={getValue(pos, 'reward_type') || ''}
                    onChange={e => updateValue(pos, 'reward_type', e.target.value)}
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] bg-white"
                  >
                    <option value="giftcard">Giftcard</option>
                    <option value="physical_item">Physical Item</option>
                    <option value="badge">Badge</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">Amount (USD)</label>
                  <input
                    type="number"
                    value={getValue(pos, 'amount_usd') ?? ''}
                    onChange={e => updateValue(pos, 'amount_usd', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0"
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">Description</label>
                  <input
                    type="text"
                    value={getValue(pos, 'description') || ''}
                    onChange={e => updateValue(pos, 'description', e.target.value)}
                    placeholder="Optional description"
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveTrack}
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
            saving ? 'bg-[#9CA3AF]' : 'bg-[#1e40af] hover:bg-[#1e3a8a] active:scale-95'
          }`}
        >
          {saving ? 'Saving...' : `Save ${TRACK_LABELS[activeTrack]} Config`}
        </button>
      </div>
    </div>
  );
}
