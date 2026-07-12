'use client';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number; user_id: string; display_name: string;
  avatar_url: string | null; country: string | null;
  streak_count: number; score: number;
}

const MEDAL_COLOR: Record<number, string> = {
  1: 'text-[#ffd700]', 2: 'text-[#c0c0c0]', 3: 'text-[#cd7f32]',
};

const TRACKS = [
  { value: 'study', label: 'Study', icon: 'schedule' },
  { value: 'quiz', label: 'Quiz', icon: 'quiz' },
  { value: 'overall', label: 'Overall', icon: 'emoji_events' },
] as const;

const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all_time', label: 'All Time' },
] as const;

export default function LeaderboardsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [track, setTrack] = useState('study');
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    let cancelled = false;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setError('');
    apiFetch<{ entries: LeaderboardEntry[] }>(`/admin/leaderboards?track=${track}&period=${period}`)
      .then(data => { if (!cancelled) setEntries(data.entries || []); })
      .catch(e => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Backend offline'); setEntries([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [track, period]);

  return (
    <div className="p-6 max-w-[960px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Leaderboards</h1>
        <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Live global rankings across tracks and periods.</p>
      </div>

      {/* Track & Period Filters */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          {TRACKS.map(t => (
            <button key={t.value} onClick={() => setTrack(t.value)}
              className={cn('px-4 py-2.5 rounded-lg text-[14px] leading-[20px] font-semibold transition-colors flex items-center gap-1.5 active:scale-95',
                track === t.value
                  ? 'bg-[#00288e] text-white shadow-sm'
                  : 'bg-white border border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff]')}>
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={cn('px-3 py-1.5 rounded-lg text-[14px] leading-[20px] font-medium transition-colors active:scale-95',
                period === p.value
                  ? 'bg-[#f1f3ff] border border-[#00288e] text-[#00288e]'
                  : 'border border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff]')}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl px-4 py-3 flex items-center gap-2 text-[#93000a] text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#757684]">
            <span className="material-symbols-outlined animate-spin text-[36px]">progress_activity</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-[#757684]">
            <span className="material-symbols-outlined text-[48px] block mb-2">leaderboard</span>
            <p className="text-[16px] leading-[24px]">No rankings yet</p>
          </div>
        ) : entries.map(e => (
          <div key={e.user_id} className={cn('flex items-center gap-4 px-5 py-4 border-b border-[#c4c5d5]/50 last:border-0 transition-colors',
            e.rank <= 3 ? 'bg-gradient-to-r from-[#f1f3ff] to-white' : 'hover:bg-[#f9f9ff]')}>
            {/* Rank */}
            <div className="w-10 text-center shrink-0">
              {e.rank <= 3 ? (
                <span className={cn('material-symbols-outlined text-[28px]', MEDAL_COLOR[e.rank])} style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
              ) : (
                <span className="font-mono text-[15px] font-bold text-[#444653]">#{e.rank}</span>
              )}
            </div>
            {/* Avatar */}
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2',
              e.rank === 1 ? 'bg-[#ffd700] text-[#141b2b] border-[#ffd700]/50' : e.rank === 2 ? 'bg-[#c0c0c0] text-[#141b2b] border-[#c0c0c0]/50' : e.rank === 3 ? 'bg-[#cd7f32] text-white border-[#cd7f32]/50' : 'bg-[#f1f3ff] text-[#00288e] border-[#c4c5d5]/30')}>
              {(e.display_name || '?')[0].toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] leading-[20px] font-semibold text-[#141b2b] truncate">{e.display_name}</p>
              <p className="text-[14px] leading-[20px] text-[#757684] flex items-center gap-1">
                {e.country && <span>{e.country}</span>}
                {e.streak_count > 0 && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="material-symbols-outlined text-[#fea619] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <span className="text-[#fea619] text-[13px] font-semibold">{e.streak_count}</span>
                  </span>
                )}
              </p>
            </div>
            {/* Score */}
            <div className="text-right shrink-0">
              <p className="text-[16px] leading-[24px] font-bold text-[#141b2b]">
                {track === 'study' ? `${Math.floor(e.score / 60)}h ${e.score % 60}m` : e.score.toLocaleString()}
              </p>
              <p className="text-[12px] leading-[16px] text-[#757684]">{track === 'study' ? 'verified' : 'points'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
