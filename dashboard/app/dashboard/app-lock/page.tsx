'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface AppLockUser {
  user_id: string;
  display_name: string | null;
  email: string | null;
  app_lock_enabled: boolean;
  app_lock_credits: number;
  locked_packages_count: number;
}

export default function AppLockPage() {
  const [users, setUsers] = useState<AppLockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = usePageHeader({ searchPlaceholder: 'Search users...', addNewLabel: null });
  const [enabledOnly, setEnabledOnly] = useState(true);
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
      const data = await apiFetch<AppLockUser[]>(`/admin/app-lock/users?enabled_only=${enabledOnly}&limit=200`);
      setUsers(data);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [enabledOnly]);

  useEffect(() => { load(); }, [load]);

  const handleResetCredits = async (userId: string) => {
    try {
      await apiFetch(`/admin/app-lock/${userId}/reset-credits`, { method: 'POST' });
      showToast('Credits reset successfully');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    }
  };

  const handleForceUnlock = async (userId: string) => {
    if (!confirm('Disable app lock for this user?')) return;
    try {
      await apiFetch(`/admin/app-lock/${userId}/force-unlock`, { method: 'POST' });
      showToast('App lock disabled');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    }
  };

  const filtered = users.filter((u) =>
    !searchQuery ||
    (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#141b2b] md:text-[30px] md:font-bold">App Lock</h1>
          <p className="text-[16px] text-[#444653] mt-1">Manage user app lock settings</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[14px] text-[#444653] cursor-pointer">
            <input type="checkbox" checked={enabledOnly} onChange={(e) => { setEnabledOnly(e.target.checked); setPage(1); }}
              className="w-4 h-4 rounded border-[#c4c5d5] text-[#00288e]" />
            Enabled only
          </label>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff]">
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-[14px] font-semibold">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">User</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Status</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Credits</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Locked Apps</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Actions</th>
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
                      {u.app_lock_enabled ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#d1e7dd] text-[#0f5132]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0f5132] mr-1.5" />Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5e7eb] text-[#6b7280]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6b7280] mr-1.5" />Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[14px] font-mono font-semibold text-[#141b2b]">{u.app_lock_credits}</span>
                    </td>
                    <td className="py-3 px-4 text-[14px] text-[#444653]">{u.locked_packages_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleResetCredits(u.user_id)}
                          className="px-3 py-1.5 text-[12px] font-semibold bg-[#e1e8fd] text-[#00288e] rounded-lg hover:bg-[#c9d4fb]">
                          Reset Credits
                        </button>
                        <button onClick={() => handleForceUnlock(u.user_id)}
                          className="px-3 py-1.5 text-[12px] font-semibold bg-[#ffdad6] text-[#93000a] rounded-lg hover:bg-[#ffc7c1]">
                          Force Unlock
                        </button>
                      </div>
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
