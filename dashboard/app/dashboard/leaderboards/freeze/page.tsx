'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FreezeEntry {
  rank: number; user_id: string; display_name: string;
  score: number; country: string | null; is_flagged: boolean;
}

interface TrackData {
  track: 'study' | 'quiz' | 'overall'; entries: FreezeEntry[];
}

interface FreezeStatus {
  month: string; last_frozen_at: string | null; tracks: TrackData[];
}

const TRACK_CFG: Record<string, { label: string; icon: string }> = {
  study: { label: 'Study', icon: 'schedule' },
  quiz: { label: 'Quiz', icon: 'quiz' },
  overall: { label: 'Overall', icon: 'emoji_events' },
};

const MEDAL_BORDER: Record<number, string> = {
  1: 'border-[#ffd700]/40 bg-gradient-to-r from-[#fff9e6] to-white',
  2: 'border-[#c0c0c0]/40 bg-gradient-to-r from-[#f0f0f0] to-white',
  3: 'border-[#cd7f32]/40 bg-gradient-to-r from-[#fef0e7] to-white',
};

const MEDAL_CIRCLE: Record<number, string> = {
  1: 'bg-[#ffd700] text-[#141b2b]',
  2: 'bg-[#c0c0c0] text-[#141b2b]',
  3: 'bg-[#cd7f32] text-white',
};

export default function FreezeLeaderboardPage() {
  const [status, setStatus] = useState<FreezeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [freezing, setFreezing] = useState(false);
  const [excludeFlagged, setExcludeFlagged] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStatus = useCallback(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (excludeFlagged) params.set('exclude_flagged', 'true');
        const data = await apiFetch<FreezeStatus>(`/admin/leaderboards/freeze-status?${params}`);
        if (!cancelled) setStatus(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Backend offline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [excludeFlagged]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleFreeze = async () => {
    if (!window.confirm('Are you sure? This will finalize the monthly leaderboard and generate rewards.')) return;
    setFreezing(true);
    try {
      await apiFetch('/admin/leaderboards/freeze', { method: 'POST' });
      showToast('Leaderboard frozen — rewards are being generated');
      loadStatus();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error', false);
    } finally {
      setFreezing(false);
    }
  };

  const { searchQuery: searchUser } = usePageHeader({
    searchPlaceholder: undefined,
    addNewLabel: 'Freeze & Generate Rewards',
    onAddNew: handleFreeze,
  });

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Freeze Leaderboard — Month End</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">{currentMonth}</p>
        </div>
        {status?.last_frozen_at && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f3ff] border border-[#c4c5d5] rounded-lg text-[13px] text-[#444653]">
            <span className="material-symbols-outlined text-[16px]">event</span>
            Last frozen: {formatDate(status.last_frozen_at)}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-[#fea619]/30 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-[#fea619] text-[22px] shrink-0">warning</span>
        <div>
          <p className="text-[14px] leading-[20px] font-semibold text-[#684000]">Warning</p>
          <p className="text-[14px] leading-[20px] text-[#684000]/80 mt-0.5">
            This will finalize the monthly leaderboard and generate rewards. This action cannot be undone without manual database intervention.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <button onClick={() => setExcludeFlagged(v => !v)}
          className={cn('px-4 py-2 rounded-lg text-[14px] leading-[20px] font-semibold transition-colors border active:scale-95',
            excludeFlagged
              ? 'bg-[#f1f3ff] border-[#00288e] text-[#00288e]'
              : 'border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff]')}>
          <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1.5">flag</span>
          Exclude Flagged Users
        </button>
        <button onClick={loadStatus}
          className="flex items-center gap-2 px-4 py-2 border border-[#c4c5d5] rounded-lg text-[14px] leading-[20px] text-[#444653] hover:bg-[#e9edff] transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl px-4 py-3 flex items-center gap-2 text-[#93000a] text-[14px] leading-[20px] font-medium">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}

      {/* Track Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[#00288e] text-[40px]">progress_activity</span>
        </div>
      ) : status ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {status.tracks.map(track => {
            const cfg = TRACK_CFG[track.track];
            const top3 = track.entries.slice(0, 3);
            return (
              <div key={track.track} className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Header */}
                <div className="bg-[#f1f3ff] px-5 py-4 border-b border-[#c4c5d5]">
                  <h2 className="text-[14px] leading-[20px] font-semibold text-[#00288e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
                    {cfg.label}
                  </h2>
                </div>
                {/* Body */}
                <div className="p-4">
                  {top3.length === 0 ? (
                    <div className="py-8 text-center text-[#757684] text-[14px]">
                      <span className="material-symbols-outlined text-[36px] block mb-2">leaderboard</span>
                      No entries
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {top3.map(entry => (
                        <div key={entry.user_id}
                          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl border',
                            MEDAL_BORDER[entry.rank] || 'hover:bg-[#f9f9ff] border-transparent')}>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            MEDAL_CIRCLE[entry.rank] || 'bg-[#f1f3ff] text-[#00288e]')}>
                            {(entry.display_name || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] leading-[20px] font-semibold text-[#141b2b] truncate">{entry.display_name}</p>
                            <p className="text-[13px] leading-[16px] text-[#757684]">{entry.country || '—'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[14px] leading-[20px] font-bold text-[#141b2b]">
                              {track.track === 'study'
                                ? `${Math.floor(entry.score / 60)}h ${entry.score % 60}m`
                                : entry.score.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Footer */}
                {track.entries.length > 3 && (
                  <div className="px-4 py-2.5 border-t border-[#c4c5d5] text-[13px] text-[#757684] text-center">
                    +{track.entries.length - 3} more entries
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="text-[14px] leading-[20px] font-semibold">{toast.ok ? 'Success' : 'Error'}</p>
            <p className="text-[14px] leading-[20px] opacity-80 text-xs">{toast.msg}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 transition-colors p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
