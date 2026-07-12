'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface ReferralStats {
  total_referred_users: number;
  total_bonus_paid: number;
  top_referrers: { display_name: string | null; email: string | null; referred_count: number }[];
}

interface ReferralUser {
  user_id: string;
  display_name: string | null;
  email: string | null;
  referral_code: string | null;
  referred_by_name: string | null;
  referred_users_count: number;
  referral_bonus_earned: number;
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = usePageHeader({ searchPlaceholder: 'Search users...', addNewLabel: null });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        apiFetch<ReferralStats>('/admin/referral/stats'),
        apiFetch<ReferralUser[]>('/admin/referral/users?limit=200'),
      ]);
      setStats(s);
      setUsers(u);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    !searchQuery ||
    (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.referral_code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#141b2b] md:text-[30px] md:font-bold">Referral</h1>
          <p className="text-[16px] text-[#444653] mt-1">Referral program overview and user details</p>
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
        <>
          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Referrals', value: stats.total_referred_users, icon: 'group_add', color: '#00288e', bg: '#e1e8fd' },
                { label: 'Bonus Paid', value: `${stats.total_bonus_paid.toLocaleString()} pts`, icon: 'redeem', color: '#0f5132', bg: '#d1e7dd' },
                { label: 'Top Referrer', value: stats.top_referrers[0]?.display_name || '—', icon: 'emoji_events', color: '#684000', bg: '#ffddb8' },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[#c4c5d5] rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-[24px] font-bold text-[#141b2b]">{s.value}</p>
                    <p className="text-[14px] text-[#444653]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top referrers */}
          {stats && stats.top_referrers.length > 0 && (
            <div className="bg-white border border-[#c4c5d5] rounded-xl p-4 mb-6">
              <h2 className="text-[16px] font-semibold text-[#141b2b] mb-3">Top Referrers</h2>
              <div className="space-y-2">
                {stats.top_referrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-[#f8f9ff] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#00288e] text-white text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-[14px] font-semibold text-[#141b2b]">{r.display_name || r.email || 'Unknown'}</span>
                    </div>
                    <span className="text-[14px] font-mono font-semibold text-[#00288e]">{r.referred_count} referrals</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User table */}
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#c4c5d5]">
              <h2 className="text-[16px] font-semibold text-[#141b2b]">All Users with Referral Info</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                    <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">User</th>
                    <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Referral Code</th>
                    <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Referred By</th>
                    <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Referred Users</th>
                    <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Bonus Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c5d5]/50">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center text-[#757684]">No users found</td></tr>
                  ) : paginated.map((u) => (
                    <tr key={u.user_id} className="hover:bg-[#f8f9ff]">
                      <td className="py-3 px-4">
                        <span className="text-[14px] font-semibold text-[#141b2b]">{u.display_name || '—'}</span>
                        <span className="block text-[12px] text-[#757684]">{u.email || ''}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[13px] text-[#00288e] bg-[#e1e8fd] px-2 py-1 rounded">{u.referral_code || '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-[14px] text-[#444653]">{u.referred_by_name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[14px] font-semibold text-[#141b2b]">{u.referred_users_count}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[14px] font-mono font-semibold text-[#0f5132]">{u.referral_bonus_earned} pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="border-t border-[#c4c5d5] px-4 py-3 flex items-center justify-between">
                <span className="text-[13px] text-[#757684]">{filtered.length} users</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded border text-[#444653] disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <span className="text-[13px] text-[#757684] self-center">{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1 rounded border text-[#444653] disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <p className="text-[14px]">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-4 p-1"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}
    </div>
  );
}
