'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface BadgeStats {
  badge_code: string;
  awarded_count: number;
}

interface BadgeDetail {
  id: string;
  user_id: string;
  user_name: string | null;
  badge_code: string;
  earned_at: string;
}

export default function BadgesPage() {
  const [stats, setStats] = useState<BadgeStats[]>([]);
  const [details, setDetails] = useState<BadgeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = usePageHeader({ searchPlaceholder: 'Search badge code...', addNewLabel: null });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const perPage = 10;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<BadgeStats[]>('/admin/badges');
      setStats(data);
      if (data.length > 0 && !selectedCode) setSelectedCode(data[0].badge_code);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedCode) return;
    apiFetch<BadgeDetail[]>(`/admin/badges/detail?badge_code=${encodeURIComponent(selectedCode)}&limit=200`)
      .then(setDetails)
      .catch(() => setDetails([]));
  }, [selectedCode]);

  const filtered = stats.filter((s) =>
    !searchQuery || s.badge_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] font-semibold text-[#141b2b] md:text-[30px] md:font-bold">Badges</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Achievement badges awarded to users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff]">
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span className="text-[14px] font-semibold">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badge list */}
          <div className="lg:col-span-1 bg-white border border-[#c4c5d5] rounded-xl shadow-sm">
            <div className="p-4 border-b border-[#c4c5d5]">
              <h2 className="text-[16px] font-semibold text-[#141b2b]">Badge Codes</h2>
              <p className="text-[13px] text-[#757684] mt-1">{filtered.length} badge types</p>
            </div>
            <div className="divide-y divide-[#c4c5d5]/50 max-h-[600px] overflow-y-auto">
              {paginated.length === 0 ? (
                <p className="p-6 text-center text-[#757684]">No badges found</p>
              ) : paginated.map((s) => (
                <button
                  key={s.badge_code}
                  onClick={() => { setSelectedCode(s.badge_code); setPage(1); }}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-[#f8f9ff] transition-colors',
                    selectedCode === s.badge_code && 'bg-[#e1e8fd]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#141b2b]">{s.badge_code}</span>
                    <span className="text-[13px] font-mono text-[#757684]">{s.awarded_count}</span>
                  </div>
                </button>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-[#c4c5d5]">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded border text-[#444653] disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="text-[12px] text-[#757684]">{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1 rounded border text-[#444653] disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 bg-white border border-[#c4c5d5] rounded-xl shadow-sm">
            <div className="p-4 border-b border-[#c4c5d5] flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#141b2b]">
                {selectedCode ? `"${selectedCode}" Awards` : 'Select a badge'}
              </h2>
            </div>
            {!selectedCode ? (
              <div className="p-12 text-center text-[#757684]">
                <span className="material-symbols-outlined text-[48px] block mb-2">military_tech</span>
                <p>Select a badge code to see details</p>
              </div>
            ) : details.length === 0 ? (
              <div className="p-12 text-center text-[#757684]">
                <p>No awards yet for this badge</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                      <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">User</th>
                      <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Earned At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c5d5]/50">
                    {details.map((d) => (
                      <tr key={d.id} className="hover:bg-[#f8f9ff]">
                        <td className="py-3 px-4 text-[14px] text-[#141b2b]">{d.user_name || d.user_id}</td>
                        <td className="py-3 px-4 text-[14px] text-[#444653]">{new Date(d.earned_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-[14px]">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-4 p-1"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}
    </div>
  );
}
