'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, cn, formatDate } from '@/lib/utils';

type NotificationType = 'event' | 'scheduled' | 'admin_broadcast';

interface NotificationLog {
  id: string; created_at: string; title: string;
  notification_type: NotificationType; trigger: string;
  sent_count: number; skipped_count: number;
}

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: string; className: string }> = {
  event:           { label: 'Event',    icon: 'event',      className: 'bg-[#dbeafe] text-[#1e40af]' },
  scheduled:       { label: 'Scheduled', icon: 'schedule',   className: 'bg-[#d1fae5] text-[#065f46]' },
  admin_broadcast: { label: 'Broadcast', icon: 'campaign',   className: 'bg-[#e9edff] text-[#00288e]' },
};

export default function NotificationHistoryPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const data = await apiFetch<NotificationLog[]>(`/admin/notifications/history?${params}`);
      setLogs(data);
    } catch (e: any) {
      setLogs([]);
    } finally { setLoading(false); }
  }, [filterType, dateFrom, dateTo]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const today = logs.filter(l => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).reduce((s, l) => s + l.sent_count, 0);

  const thisWeek = logs.filter(l => {
    const d = new Date(l.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).reduce((s, l) => s + l.sent_count, 0);

  const thisMonth = logs.filter(l => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, l) => s + l.sent_count, 0);

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Notification History</h1>
        <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Log of all push notifications sent to users</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard icon="today" label="Total Sent Today" value={today} bg="#e9edff" color="#00288e" />
        <SummaryCard icon="date_range" label="Total This Week" value={thisWeek} bg="#d1fae5" color="#065f46" />
        <SummaryCard icon="calendar_month" label="Total This Month" value={thisMonth} bg="#fef3c7" color="#92400e" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 cursor-pointer">
          <option value="all">All Types</option>
          <option value="event">Event</option>
          <option value="scheduled">Scheduled</option>
          <option value="admin_broadcast">Admin Broadcast</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#757684]">From:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#757684]">To:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
        </div>
        <button onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-sm text-[#444653] hover:bg-[#e9edff] transition-colors active:scale-95">
          <span className="material-symbols-outlined text-sm">search</span>
          <span className="text-[14px] leading-[20px] font-semibold hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Date</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Title</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Type</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Trigger</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Sent</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Skipped</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5d5]/50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined text-[48px] block mb-2">notifications_off</span>
                  <p className="font-medium mb-1">No notification logs yet</p>
                  <p className="text-xs">Notification logging will appear here once the system starts sending pushes.</p>
                </td></tr>
              ) : logs.map(log => {
                const cfg = TYPE_CONFIG[log.notification_type];
                return (
                  <tr key={log.id} className="hover:bg-white transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-[#444653]">{formatDate(log.created_at)}</td>
                    <td className="py-4 px-6 text-[14px] leading-[20px] font-medium text-[#141b2b]">{log.title}</td>
                    <td className="py-4 px-6">
                      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.className)}>
                        <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[14px] leading-[20px] text-[#757684]">{log.trigger}</td>
                    <td className="py-4 px-6 text-right text-[14px] leading-[20px] font-semibold text-[#065f46]">{log.sent_count}</td>
                    <td className="py-4 px-6 text-right text-[14px] leading-[20px] text-[#757684]">{log.skipped_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, bg, color }: { icon: string; label: string; value: number; bg: string; color: string }) {
  return (
    <div className="bg-white border border-[#c4c5d5] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <p className="text-[14px] leading-[20px] text-[#444653] font-medium">{label}</p>
          <p className="text-[24px] leading-[32px] font-bold text-[#141b2b]">{value > 0 ? value.toLocaleString() : '—'}</p>
        </div>
      </div>
    </div>
  );
}
