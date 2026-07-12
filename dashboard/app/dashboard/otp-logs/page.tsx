'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface OTPLog {
  id: string;
  email: string;
  status: 'verified' | 'expired' | 'pending';
  sent_at: string;
  verified_at: string | null;
  ip_address: string | null;
}

interface OTPLogsResponse {
  data: OTPLog[];
  total: number;
  page: number;
  per_page: number;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; dot: string }> = {
  verified: { label: 'Verified', bg: 'bg-[#d1e7dd] text-[#0f5132]', dot: 'bg-[#0f5132]' },
  expired: { label: 'Expired', bg: 'bg-[#ffdad6] text-[#93000a]', dot: 'bg-[#ba1a1a]' },
  pending: { label: 'Pending', bg: 'bg-[#fff3cd] text-[#684000]', dot: 'bg-[#fea619]' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', s.bg)}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', s.dot)} />
      {s.label}
    </span>
  );
}

export default function OTPLogsPage() {
  const [logs, setLogs] = useState<OTPLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { searchQuery: searchEmail } = usePageHeader({
    searchPlaceholder: 'Search by email...',
    addNewLabel: null,
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        status: statusFilter,
      });
      if (searchEmail) params.set('search', searchEmail);
      const res = await apiFetch<OTPLogsResponse>(`/admin/otp-logs?${params}`);
      setLogs(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load OTP logs');
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchEmail, statusFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleRefresh = () => {
    if (page === 1) loadLogs();
    else setPage(1);
  };

  const totalPages = Math.ceil(total / perPage);

  const statCards = [
    { label: 'Total Sent', value: total, icon: 'forward_to_inbox', color: '#00288e', bg: '#e9edff', border: 'border-t-[#00288e]', progress: 100 },
    { label: 'Verified', value: logs.filter(l => l.status === 'verified').length, icon: 'verified', color: '#0f5132', bg: '#d1e7dd', border: 'border-t-[#0f5132]', progress: total > 0 ? Math.round((logs.filter(l => l.status === 'verified').length / total) * 100) : 0 },
    { label: 'Expired / Failed', value: logs.filter(l => l.status === 'expired').length, icon: 'timer_off', color: '#93000a', bg: '#ffdad6', border: 'border-t-[#ba1a1a]', progress: total > 0 ? Math.round((logs.filter(l => l.status === 'expired').length / total) * 100) : 0 },
    { label: 'Pending', value: logs.filter(l => l.status === 'pending').length, icon: 'hourglass_empty', color: '#684000', bg: '#fff3cd', border: 'border-t-[#fea619]', progress: total > 0 ? Math.round((logs.filter(l => l.status === 'pending').length / total) * 100) : 0 },
  ];

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">OTP Logs</h1>
        <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Monitor OTP verification activity and delivery status</p>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className={cn('bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 border-t-4', s.border)}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <span className="text-[24px] leading-[32px] font-bold text-[#141b2b]">{s.value}</span>
            </div>
            <p className="text-[12px] leading-[16px] text-[#757684] mb-2">{s.label}</p>
            <div className="w-full bg-[#c4c5d5]/30 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={handleRefresh} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors w-full sm:w-auto active:scale-95">
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-[14px] leading-[20px] font-semibold hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ba1a1a]">error</span>
          <p className="text-sm text-[#93000a]">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                {['Email', 'Status', 'Sent At', 'Verified At', 'IP Address', 'Actions'].map(h => (
                  <th key={h} className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5d5]/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#757684]">
                    <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#757684]">
                    <span className="material-symbols-outlined text-[48px] block mb-2 text-[#757684]">sms_failed</span>
                    <p className="text-[16px] leading-[24px] font-semibold text-[#141b2b]">No OTP logs found</p>
                    <p className="text-[14px] leading-[20px] mt-1">No verification requests match your current filters</p>
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-[#f8f9ff] transition-colors group">
                  <td className="py-4 px-6">
                    <span className="text-[14px] leading-[20px] font-medium text-[#141b2b]">{log.email}</span>
                  </td>
                  <td className="py-4 px-6"><StatusPill status={log.status} /></td>
                  <td className="py-4 px-6 text-[14px] leading-[20px] font-mono text-[#444653]">
                    {new Date(log.sent_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-[14px] leading-[20px] font-mono text-[#444653]">
                    {log.verified_at ? new Date(log.verified_at).toLocaleString() : '—'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs text-[#757684]">{log.ip_address || '—'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => alert(`OTP details for ${log.email}\nStatus: ${log.status}\nSent: ${log.sent_at}\nIP: ${log.ip_address || 'N/A'}`)}
                      className="p-1.5 text-[#757684] hover:text-[#00288e] rounded hover:bg-[#e9edff] transition-colors"
                      title="View details"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {total > 0 && (
          <div className="border-t border-[#c4c5d5] px-6 py-4 flex items-center justify-between">
            <span className="text-[14px] leading-[20px] text-[#757684]">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} entries
            </span>
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
    </div>
  );
}
