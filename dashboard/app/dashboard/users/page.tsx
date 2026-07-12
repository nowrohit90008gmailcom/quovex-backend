'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, formatMinutes } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface User {
  id: string; display_name: string | null; email: string | null;
  country: string | null; exam_tags: string[] | null;
  points_total: number; verified_minutes_total: number;
  streak_count: number; is_banned: boolean; admin_role: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery: searchUser } = usePageHeader({
    searchPlaceholder: 'Search by name, email, or ID...',
    addNewLabel: null,
  });
  const [filterBanned, setFilterBanned] = useState<string>('all');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchUser) params.set('search', searchUser);
      if (filterBanned !== 'all') params.set('is_banned', filterBanned);
      const data = await apiFetch<User[]>(`/admin/users?${params}`);
      setUsers(data);
      setTotal(data.length);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setUsers([]);
    } finally { setLoading(false); }
    }, [searchUser, filterBanned]);

  useEffect(() => { load(); }, [load]);

  const handleBanToggle = async (user: User) => {
    const action = user.is_banned ? 'Unban' : 'Ban';
    const reason = user.is_banned ? undefined : prompt('Ban reason (required):');
    if (!user.is_banned && (!reason || reason.length < 3)) return;
    try {
      await apiFetch(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_banned: !user.is_banned, ban_reason: reason }),
      });
      showToast(`${action}ned ${user.display_name}`);
      load();
    } catch (e: any) { showToast(e.message, false); }
  };

  const paginated = users.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(users.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">User Management</h1>
        <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Manage and monitor all student accounts, activities, and access levels.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <select value={filterBanned} onChange={e => setFilterBanned(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto">
            <option value="all">All Statuses</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={load} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors w-full sm:w-auto active:scale-95">
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-[14px] leading-[20px] font-semibold hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">User</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Country / Exam</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Study Time</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Points</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Streak</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5d5]/50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined text-[48px] block mb-2">person_off</span>
                      <p>{searchUser ? `No users matching "${searchUser}"` : 'No users found — run python seed.py to populate'}</p>
                </td></tr>
              ) : paginated.map(u => (
                <tr key={u.id} className={cn('hover:bg-white transition-colors group', u.is_banned && 'bg-[#ffdad6]/10')}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#00288e] text-sm font-bold border border-[#c4c5d5]/30 shrink-0">
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/users/${u.id}`} className="text-[14px] leading-[20px] font-semibold text-[#141b2b] hover:text-[#00288e]">{u.display_name || '—'}</Link>
                          {u.admin_role && (
                            <span className="px-2 py-0.5 rounded-full bg-[#dde1ff] text-[#001453] text-[10px] font-bold uppercase tracking-wide">{u.admin_role}</span>
                          )}
                        </div>
                        <div className="text-[14px] leading-[20px] text-[#757684]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      {u.country && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#e1e8fd] text-[#444653] w-fit">{u.country}</span>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(u.exam_tags || []).slice(0, 2).map(t => (
                          <span key={t} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#ffddb8] text-[#684000] w-fit">{t}</span>
                        ))}
                        {(u.exam_tags || []).length > 2 && (
                          <span className="text-xs text-[#757684]">+{u.exam_tags!.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-sm text-[#444653]">{formatMinutes(u.verified_minutes_total)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{u.points_total.toLocaleString()}</span>
                      {u.streak_count > 0 && (
                        <>
                          <span className="material-symbols-outlined text-[#fea619] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                          <span className="text-xs font-bold text-[#fea619]">{u.streak_count}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                      u.is_banned ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#d1e7dd] text-[#0f5132]')}>
                      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', u.is_banned ? 'bg-[#ba1a1a]' : 'bg-[#0f5132]')} />
                      {u.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/users/${u.id}`} className="p-1.5 text-[#757684] hover:text-[#00288e] rounded hover:bg-[#e9edff] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <button onClick={() => handleBanToggle(u)} title={u.is_banned ? 'Unban' : 'Ban'}
                        className={cn('p-1.5 rounded transition-colors',
                          u.is_banned ? 'text-[#757684] hover:text-[#00288e] hover:bg-[#dde1ff]' : 'text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6]')}>
                        <span className="material-symbols-outlined text-[20px]">{u.is_banned ? 'lock_open' : 'block'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {total > 0 && (
          <div className="bg-white border-t border-[#c4c5d5] px-6 py-4 flex items-center justify-between">
            <span className="text-[14px] leading-[20px] text-[#757684]">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} entries</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded border border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff] disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-8 h-8 rounded text-[12px] leading-[16px] tracking-[0.05em] font-medium transition-colors',
                    p === page ? 'bg-[#1e40af] text-white' : 'hover:bg-[#e9edff] text-[#141b2b]')}>{p}</button>
              ))}
              {totalPages > 5 && <span className="text-[#757684]">...</span>}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded border border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff] disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

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