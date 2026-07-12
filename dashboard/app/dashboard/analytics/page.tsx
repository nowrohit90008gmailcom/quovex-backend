'use client';
import { useState, useEffect } from 'react';
import { apiFetch, cn, formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';

interface Overview {
  avg_dau: number;
  total_sessions: number;
  total_study_time: number;
  total_ad_revenue: number;
  avg_revenue_per_user: number;
}

interface DauPoint { day: string; dau: number; total_minutes?: number; sessions?: number }

interface RevenueEntry { day: string; placement_type: string; revenue_usd: number }

interface GeoRow { country: string; dau: number; total_minutes: number; revenue_usd: number }

interface Divergence {
  daily_trend: { day: string; verified_minutes: number; points_awarded: number }[];
  points_per_minute_ratio: number;
  alert?: boolean;
  alert_message?: string;
}

const DAY_OPTIONS = [7, 30, 90] as const;

const REVENUE_COLORS: Record<string, string> = {
  post_session_double: '#000666',
  plus5min: '#ac3509',
  quiz_double: '#0f5132',
  social_unlock: '#856404',
  banner: '#7c3aed',
  native: '#ec4899',
  streak_freeze: '#3b82f6',
  badge_xp: '#92400e',
  session_extend: '#0d9488',
};

const STAT_CARDS = [
  { key: 'avg_dau', label: 'Avg DAU', icon: 'person', trend: '+8.3%' },
  { key: 'total_sessions', label: 'Total Sessions', icon: 'timer', trend: '+12.1%' },
  { key: 'total_study_time', label: 'Total Study Time', icon: 'schedule', trend: '+5.7%' },
  { key: 'total_ad_revenue', label: 'Total Ad Revenue', icon: 'payments', trend: '+22.4%', fmt: (v: number) => formatCurrency(v) },
  { key: 'avg_revenue_per_user', label: 'Avg Revenue/User', icon: 'trending_up', trend: '+3.2%', fmt: (v: number) => formatCurrency(v) },
];

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] text-[#757684]">
      <span className="material-symbols-outlined text-[40px] mb-2">bar_chart</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dauData, setDauData] = useState<DauPoint[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<GeoRow[]>([]);
  const [divergenceData, setDivergenceData] = useState<Divergence | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.allSettled([
      apiFetch<Overview>(`/admin/analytics/overview?days=${days}`),
      apiFetch<DauPoint[]>(`/admin/analytics/dau?days=${days}`),
      apiFetch<RevenueEntry[]>(`/admin/analytics/revenue?days=${days}`),
      apiFetch<GeoRow[]>('/admin/analytics/geo'),
      apiFetch<Divergence>(`/admin/analytics/divergence?days=${days}`),
    ]).then(([ov, dau, rev, geo, div]) => {
      if (ov.status === 'fulfilled') setOverview(ov.value);
      else setError('Backend offline — start the server and run python seed.py');
      if (dau.status === 'fulfilled') setDauData(dau.value);
      if (rev.status === 'fulfilled') {
        const byDay: Record<string, any> = {};
        rev.value.forEach((r) => {
          if (!byDay[r.day]) byDay[r.day] = { day: r.day };
          byDay[r.day][r.placement_type] = r.revenue_usd;
        });
        setRevenueData(Object.values(byDay));
      }
      if (geo.status === 'fulfilled') setGeoData(geo.value);
      if (div.status === 'fulfilled') setDivergenceData(div.value);
      setLoading(false);
    });
  }, [days]);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#00288e]">Analytics</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Platform engagement and revenue metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                'px-4 py-2 rounded-lg text-[14px] leading-[20px] font-semibold transition-all',
                days === d
                  ? 'bg-[#00288e] text-white shadow-sm'
                  : 'bg-white border border-[#c4c5d5] text-[#444653] hover:bg-[#f1f3ff]',
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-[#fff3cd] border border-[#ffc107] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-[#856404]">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <>
          {/* 5 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STAT_CARDS.map((card) => {
              const raw = overview ? (overview as any)[card.key] : undefined;
              const value = card.fmt ? card.fmt(raw ?? 0) : (raw ?? '—').toLocaleString();
              return (
                <div key={card.key} className="bg-white rounded-xl border border-[#c4c5d5] p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#f1f3ff] flex items-center justify-center text-[#00288e]">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                    </div>
                    <div className="flex items-center px-2 py-1 rounded text-[12px] leading-[16px] font-medium text-emerald-600 bg-emerald-50">
                      <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span>
                      {card.trend}
                    </div>
                  </div>
                  <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#444653] uppercase mb-0.5">{card.label}</p>
                  <h3 className="text-[22px] leading-[28px] font-bold text-[#141b2b]">{value}</h3>
                </div>
              );
            })}
          </div>

          {/* DAU + Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#c4c5d5] p-5 shadow-sm">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#141b2b] mb-4">Daily Active Users</h3>
              {dauData.length === 0 ? (
                <EmptyChart message="No DAU data — run python seed.py" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dauData}>
                    <defs>
                      <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c4c5d5" strokeOpacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#757684' }} tickFormatter={(v) => v?.slice(5)} interval={Math.floor(days / 7)} />
                    <YAxis tick={{ fontSize: 11, fill: '#757684' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c4c5d5' }} />
                    <Area type="monotone" dataKey="dau" stroke="#1e40af" strokeWidth={2} fill="url(#dauGrad)" dot={false} name="DAU" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#c4c5d5] p-5 shadow-sm">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#141b2b] mb-4">Ad Revenue by Placement</h3>
              {revenueData.length === 0 ? (
                <EmptyChart message="No revenue data — run python seed.py" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c4c5d5" strokeOpacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#757684' }} tickFormatter={(v) => v?.slice(5)} interval={Math.floor(days / 7)} />
                    <YAxis tick={{ fontSize: 11, fill: '#757684' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c4c5d5' }} formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {Object.entries(REVENUE_COLORS).map(([key, color]) => (
                      <Bar key={key} dataKey={key} stackId="a" fill={color} name={key.replace(/_/g, ' ')} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Geo Table + Divergence Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#c4c5d5] shadow-sm">
              <div className="p-5 pb-3">
                <h3 className="text-[20px] leading-[28px] font-semibold text-[#141b2b]">Geographic Breakdown</h3>
              </div>
              {geoData.length === 0 ? (
                <div className="px-5 pb-5"><EmptyChart message="No geo data available" /></div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#f1f3ff]">
                      <tr className="border-b border-[#c4c5d5]">
                        <th className="py-3 px-5 text-[14px] leading-[20px] font-semibold text-[#444653]">Country</th>
                        <th className="py-3 px-5 text-[14px] leading-[20px] font-semibold text-[#444653] text-right">DAU</th>
                        <th className="py-3 px-5 text-[14px] leading-[20px] font-semibold text-[#444653] text-right">Minutes</th>
                        <th className="py-3 px-5 text-[14px] leading-[20px] font-semibold text-[#444653] text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c5d5]/50">
                      {geoData.map((row) => (
                        <tr key={row.country} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-3 px-5 text-[14px] leading-[20px] font-semibold text-[#141b2b]">{row.country || 'Unknown'}</td>
                          <td className="py-3 px-5 text-[14px] leading-[20px] text-[#444653] text-right">{row.dau.toLocaleString()}</td>
                          <td className="py-3 px-5 text-[14px] leading-[20px] text-[#444653] text-right">{(row.total_minutes / 60).toFixed(0)}h</td>
                          <td className="py-3 px-5 text-[14px] leading-[20px] text-[#444653] text-right">{formatCurrency(row.revenue_usd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#c4c5d5] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[20px] leading-[28px] font-semibold text-[#141b2b]">Points vs Verified Minutes</h3>
                {divergenceData?.alert && (
                  <span className="text-xs bg-[#f8d7da] text-[#842029] px-2 py-0.5 rounded-full font-semibold">Alert</span>
                )}
              </div>
              {!divergenceData?.daily_trend?.length ? (
                <EmptyChart message="No divergence data available" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <LineChart data={divergenceData.daily_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#c4c5d5" strokeOpacity={0.4} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#757684' }} tickFormatter={(v) => v?.slice(5)} interval={Math.floor(days / 7)} />
                      <YAxis tick={{ fontSize: 11, fill: '#757684' }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c4c5d5' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="verified_minutes" stroke="#1e40af" strokeWidth={2} dot={false} name="Verified Min" />
                      <Line type="monotone" dataKey="points_awarded" stroke="#fea619" strokeWidth={2} dot={false} name="Points" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex items-center justify-between text-[14px] leading-[20px] text-[#444653]">
                    <span>Ratio: <strong className="text-[#141b2b]">{divergenceData.points_per_minute_ratio}x</strong></span>
                    {divergenceData.alert_message && (
                      <span className="text-[#842029] font-medium">{divergenceData.alert_message}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
