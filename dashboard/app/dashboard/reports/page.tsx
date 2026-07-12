'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface AdminReport {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  report_type: string;
  period_start: string;
  period_end: string;
  summary: string;
  generated_at: string;
  read_at: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = usePageHeader({ searchPlaceholder: 'Search by name/email...', addNewLabel: null });
  const [typeFilter, setTypeFilter] = useState('');
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
      const params = new URLSearchParams({ limit: '200' });
      if (typeFilter) params.set('report_type', typeFilter);
      const data = await apiFetch<AdminReport[]>(`/admin/reports?${params}`);
      setReports(data);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRegenerate = async (id: string) => {
    try {
      const res = await apiFetch<{ status: string; message: string }>(`/admin/reports/${id}/regenerate`, { method: 'POST' });
      showToast(res.message);
      load();
    } catch (e: any) { showToast(e.message, false); }
  };

  const filtered = reports.filter((r) =>
    !searchQuery ||
    (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.user_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#141b2b] md:text-[30px] md:font-bold">AI Reports</h1>
          <p className="text-[16px] text-[#444653] mt-1">AI-generated daily and weekly study reports</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff]">
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span className="text-[14px] font-semibold">Refresh</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl p-4 mb-6 flex gap-4 items-center">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653]">
          <option value="">All Types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <span className="text-[14px] text-[#757684]">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</span>
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
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Type</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Period</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Summary</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Generated</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c5d5]/50">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-[#757684]">No reports found</td></tr>
                ) : paginated.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8f9ff]">
                    <td className="py-3 px-4">
                      <span className="text-[14px] font-semibold text-[#141b2b]">{r.user_name || '—'}</span>
                      <span className="block text-[12px] text-[#757684]">{r.user_email || ''}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold',
                        r.report_type === 'daily' ? 'bg-[#e1e8fd] text-[#00288e]' : 'bg-[#ffddb8] text-[#684000]')}>
                        {r.report_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[13px] text-[#444653]">
                        {new Date(r.period_start).toLocaleDateString()} — {new Date(r.period_end).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-[#444653] max-w-[250px] truncate">{r.summary}</td>
                    <td className="py-3 px-4 text-[13px] text-[#444653]">{new Date(r.generated_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleRegenerate(r.id)}
                        className="px-3 py-1.5 text-[12px] font-semibold bg-[#e1e8fd] text-[#00288e] rounded-lg hover:bg-[#c9d4fb]">
                        Regenerate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="border-t border-[#c4c5d5] px-4 py-3 flex items-center justify-between">
              <span className="text-[13px] text-[#757684]">{filtered.length} reports</span>
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
