'use client';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FlaggedSession {
  id: string;
  user_name: string | null;
  mode: string;
  verified_minutes: number;
  flag_reason: string | null;
  anti_cheat_score: number;
}

export default function AntiCheatPage() {
  const [sessions, setSessions] = useState<FlaggedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<FlaggedSession[]>('/admin/anti-cheat');
      setSessions(data);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiFetch(`/admin/anti-cheat/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      showToast(action === 'approve' ? 'Session approved' : 'Session rejected');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 80) return 'bg-[#ba1a1a]';
    if (score > 60) return 'bg-[#ac3509]';
    return 'bg-[#856404]';
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Anti-Cheat Review</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">{sessions.length} flagged session{sessions.length !== 1 ? 's' : ''} pending review</p>
        </div>
        <button onClick={load} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors active:scale-95">
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span className="text-[14px] leading-[20px] font-semibold">Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fff3cd] border-b border-[#c4c5d5]">
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#856404] whitespace-nowrap">User</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#856404] whitespace-nowrap">Mode</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#856404] whitespace-nowrap">Duration</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#856404] whitespace-nowrap">Flag Reason</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#856404] whitespace-nowrap">Risk Score</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#856404] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5d5]/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#757684]">
                    <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#757684]">
                    <span className="material-symbols-outlined text-[48px] block mb-2 text-[#0f5132]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <p className="text-[16px] leading-[24px] font-semibold text-[#141b2b]">No flagged sessions</p>
                    <p className="text-[14px] leading-[20px] mt-1">All study sessions appear legitimate</p>
                  </td>
                </tr>
              ) : sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{s.user_name || '—'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                      s.mode === 'offline'
                        ? 'bg-[#e9edff] text-[#00288e]'
                        : 'bg-[#d1e7dd] text-[#0f5132]'
                    )}>
                      {s.mode}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[14px] leading-[20px] font-mono text-[#444653]">{s.verified_minutes}m</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#ba1a1a] text-sm">warning</span>
                      <span className="text-[14px] leading-[20px] text-[#93000a]">{s.flag_reason}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <div className="flex-1 bg-[#c4c5d5]/50 rounded-full h-2">
                        <div
                          className={cn('h-2 rounded-full transition-all', getRiskColor(s.anti_cheat_score))}
                          style={{ width: `${Math.min(s.anti_cheat_score, 100)}%` }}
                        />
                      </div>
                      <span className="text-[12px] leading-[16px] font-mono font-semibold text-[#444653] w-9 text-right">{Math.round(s.anti_cheat_score)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(s.id, 'approve')}
                        className="px-3 py-1.5 rounded-lg text-[12px] leading-[16px] tracking-[0.05em] font-semibold bg-[#d1e7dd] text-[#0f5132] hover:bg-[#a3cfb7] transition-colors active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(s.id, 'reject')}
                        className="px-3 py-1.5 rounded-lg text-[12px] leading-[16px] tracking-[0.05em] font-semibold bg-[#ffdad6] text-[#93000a] hover:bg-[#f4b5ab] transition-colors active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="text-[14px] leading-[20px] font-semibold">{toast.ok ? 'Success' : 'Error'}</p>
            <p className="text-[14px] leading-[20px] opacity-80">{toast.msg}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 transition-colors p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
