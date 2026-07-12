'use client';
import { useEffect, useState } from 'react';
import { apiFetch, formatMinutes } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Overview {
  total_users: number; active_groups: number; avg_focus_time_minutes: number;
  quizzes_completed: number; anti_cheat_flags: number; premium_subscribers: number;
  dau: number;
}
interface DauPoint { day: string; dau: number }

const STAT_COLORS = [
  { icon: 'person', color: '#00288e', trend: '+12.5%', positive: true },
  { icon: 'groups', color: '#855300', trend: '+5.2%', positive: true },
  { icon: 'timer', color: '#611e00', trend: '-1.1%', positive: false },
  { icon: 'quiz', color: '#b8c4ff', trend: '+22.4%', positive: true },
  { icon: 'security', color: '#ffb95f', trend: '0.0%', positive: null },
  { icon: 'workspace_premium', color: '#ffb59a', trend: '+8.7%', positive: true },
];

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[240px] text-[#757684]">
      <span className="material-symbols-outlined text-[40px] mb-2">bar_chart</span>
      <p className="text-sm">No analytics data yet — seed the database first</p>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dauData, setDauData] = useState<DauPoint[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      apiFetch<Overview>('/admin/overview'),
      apiFetch<DauPoint[]>('/admin/analytics/dau'),
    ]).then(([ov, dau]) => {
      if (ov.status === 'fulfilled') setOverview(ov.value);
      else setError('Backend offline. Start the server.');
      if (dau.status === 'fulfilled') setDauData(dau.value);
      setLoading(false);
    });
  }, []);

  const kpiLabels = [
    'Total Users', 'Active Study Groups', 'Avg. Daily Focus Time',
    'Quizzes Completed', 'Anti-Cheat Flags', 'Premium Subscribers',
  ];

  const kpiValues = overview ? [
    overview.total_users.toLocaleString(),
    overview.active_groups?.toLocaleString() || '—',
    formatMinutes(overview.avg_focus_time_minutes || 0),
    overview.quizzes_completed?.toLocaleString() || '—',
    (overview.anti_cheat_flags ?? '—').toString(),
    overview.premium_subscribers?.toLocaleString() || '—',
  ] : [];

  if (error) {
    return (
      <div className="p-6 max-w-[1280px] mx-auto">
        <div className="bg-[#fff3cd] border border-[#ffc107] rounded-xl p-6">
          <div className="flex items-center gap-2 font-semibold text-[#856404]">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>{error}</span>
          </div>
          <p className="text-sm text-[#856404] mt-1">Once the backend is running, run <code className="bg-[#ffeeba] px-1 rounded">python seed.py</code> to populate data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1280px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#00288e] mb-1">Dashboard Overview</h1>
          <p className="text-[16px] leading-[24px] text-[#444653]">
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#e9edff] rounded-lg text-[14px] leading-[20px] font-semibold text-[#141b2b] border border-[#c4c5d5] hover:bg-[#d3daef] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            Last 30 Days
          </button>
          <button className="w-10 h-10 bg-[#e9edff] rounded-lg border border-[#c4c5d5] flex items-center justify-center hover:bg-[#d3daef] transition-colors text-[#141b2b]">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiValues.map((value, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#c4c5d5] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -z-10 opacity-[0.05] group-hover:opacity-[0.10] transition-opacity"
                  style={{ background: STAT_COLORS[i]?.color || '#00288e' }} />
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f1f3ff] flex items-center justify-center"
                    style={{ color: STAT_COLORS[i]?.color || '#00288e' }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {STAT_COLORS[i]?.icon || 'person'}
                    </span>
                  </div>
                  {STAT_COLORS[i]?.trend && (
                    <div className={`flex items-center px-2 py-1 rounded text-sm font-medium ${
                      STAT_COLORS[i]?.positive === true ? 'text-emerald-600 bg-emerald-50' :
                      STAT_COLORS[i]?.positive === false ? 'text-[#ba1a1a] bg-[#ffdad6]/50' :
                      'text-[#444653] bg-[#dce2f7]'
                    }`}>
                      <span className="material-symbols-outlined text-sm mr-1">
                        {STAT_COLORS[i]?.positive === true ? 'trending_up' :
                         STAT_COLORS[i]?.positive === false ? 'trending_down' : 'horizontal_rule'}
                      </span>
                      {STAT_COLORS[i]?.trend}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#444653] uppercase mb-1">{kpiLabels[i]}</p>
                  <h3 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] font-bold">{value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Side Column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#c4c5d5] shadow-sm p-6 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[20px] leading-[28px] font-semibold text-[#141b2b]">Daily Active Users</h3>
                  <p className="text-[14px] leading-[20px] text-[#444653]">30-day performance trend</p>
                </div>
                <button className="p-2 rounded hover:bg-[#e9edff] text-[#444653] transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              {dauData.length === 0 ? <EmptyChart /> : (
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dauData}>
                      <defs>
                        <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e40af" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#c4c5d5" strokeOpacity={0.3} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#757684' }} tickFormatter={v => v?.slice(5)} interval={4} />
                      <YAxis tick={{ fontSize: 11, fill: '#757684' }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c4c5d5' }} />
                      <Area type="monotone" dataKey="dau" stroke="#1e40af" strokeWidth={2} fill="url(#dauGrad)" dot={false} name="DAU" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Side Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Loading State */}
              <div className="bg-white rounded-xl border border-[#c4c5d5] shadow-sm p-6 min-h-[190px] flex flex-col justify-center items-center text-center">
                <div className="relative w-12 h-12 mb-4">
                  <svg className="animate-spin text-[#b8c4ff]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                  </svg>
                </div>
                <h4 className="text-[14px] leading-[20px] font-semibold text-[#141b2b] mb-1">Crunching Numbers...</h4>
                <p className="text-[14px] leading-[20px] text-[#444653]">Fetching latest regional data</p>
              </div>

              {/* Error / Empty State */}
              <div className="bg-white rounded-xl border border-[#fea619]/30 shadow-sm p-6 min-h-[190px] flex flex-col justify-center items-center text-center bg-[#ffddb8]/10">
                <div className="w-12 h-12 rounded-full bg-[#fea619]/20 text-[#684000] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <h4 className="text-[14px] leading-[20px] font-semibold text-[#684000] mb-1">Data Unavailable</h4>
                <p className="text-[14px] leading-[20px] text-[#684000]/80 mb-4 px-4">The synchronization with the legacy server timed out.</p>
                <button className="text-sm text-[#855300] border border-[#855300]/30 px-4 py-1.5 rounded hover:bg-[#fea619]/10 transition-colors font-semibold">
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}