'use client';
import { useState, useEffect } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Student {
  id: string; display_name: string | null; full_name: string | null;
  age: number | null; institution_type: string | null; institution_name: string | null;
  class_or_year: string | null; exam_tags: string[] | null;
  verified_minutes_total: number; streak_count: number;
  daily_study_target_minutes: number;
}

interface ClassDist {
  class_or_year: string; institution_type: string; count: number;
}

const INST_ICON: Record<string, string> = {
  school: 'school', college: 'auto_stories', coaching: 'edit_note', self_study: 'home',
};

const INST_LABEL: Record<string, string> = {
  school: 'School', college: 'College', coaching: 'Coaching',
};

const INST_COLOR: Record<string, string> = {
  school: '#00288e', college: '#1e40af', coaching: '#fea619',
};

const INST_BG: Record<string, string> = {
  school: '#e9edff', college: '#dde1ff', coaching: '#fff3cd',
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [distribution, setDistribution] = useState<ClassDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [pendingInst, setPendingInst] = useState('');
  const [pendingClass, setPendingClass] = useState('');
  const [pendingExam, setPendingExam] = useState('');
  const [filters, setFilters] = useState({ institutionType: '', classYear: '', examTag: '' });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (filters.institutionType) params.set('institution_type', filters.institutionType);
        if (filters.classYear) params.set('class_or_year', filters.classYear);
        if (filters.examTag) params.set('exam_tag', filters.examTag);
        const [studentsData, distData] = await Promise.all([
          apiFetch<Student[]>(`/admin/students?${params}`),
          apiFetch<ClassDist[]>('/admin/students/class-distribution'),
        ]);
        if (!cancelled) {
          setStudents(studentsData);
          setDistribution(distData);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          showToast(e instanceof Error ? e.message : 'Backend offline', false);
          setStudents([]);
          setDistribution([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filters]);

  const handleApply = () => {
    setPage(1);
    setFilters({ institutionType: pendingInst, classYear: pendingClass, examTag: pendingExam });
  };

  const handleAdvance = async () => {
    if (!confirm('This will advance all school/college students to the next class/year. Proceed?')) return;
    setAdvancing(true);
    try {
      await apiFetch('/admin/students/advance-classes', { method: 'POST' });
      showToast('Class advance job queued');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error', false);
    } finally {
      setAdvancing(false);
    }
  };

  const { searchQuery: searchUser } = usePageHeader({
    searchPlaceholder: undefined,
    addNewLabel: 'Advance All Classes',
    onAddNew: handleAdvance,
  });

  const types = ['school', 'college', 'coaching'] as const;
  const filteredDist = distribution.filter(d => d.institution_type !== 'self_study');
  const paginated = students.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(students.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Students</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Academic profiles, class distribution, and auto-advance management.</p>
        </div>
      </div>

      {/* Class Distribution Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {types.map(t => {
          const dist = filteredDist.filter(d => d.institution_type === t);
          return (
            <div key={t} className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: INST_BG[t] }}>
                  <span className="material-symbols-outlined text-[22px]" style={{ color: INST_COLOR[t], fontVariationSettings: "'FILL' 1" }}>{INST_ICON[t]}</span>
                </div>
                <div>
                  <p className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{INST_LABEL[t]} Students</p>
                  <p className="text-[24px] leading-[32px] font-bold text-[#00288e]">{dist.reduce((s, d) => s + d.count, 0)}</p>
                </div>
              </div>
              {dist.length === 0 ? (
                <div className="flex items-center justify-center h-[100px] text-[#757684] text-[14px]">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={dist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9edff" vertical={false} />
                    <XAxis dataKey="class_or_year" tick={{ fontSize: 10, fill: '#757684' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#757684' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c4c5d5' }} />
                    <Bar dataKey="count" fill={INST_COLOR[t]} radius={[3, 3, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <select value={pendingInst} onChange={e => setPendingInst(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer">
            <option value="">All Institution Types</option>
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="coaching">Coaching</option>
            <option value="self_study">Self Study</option>
          </select>
          <input value={pendingClass} onChange={e => setPendingClass(e.target.value)} placeholder="Class / Year…"
            className="px-4 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] w-36" />
          <select value={pendingExam} onChange={e => setPendingExam(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer">
            <option value="">All Exams</option>
            {['JEE', 'NEET', 'UPSC', 'GATE', 'SAT', 'CAT', 'CLAT'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={handleApply}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00288e] text-white rounded-lg text-[14px] leading-[20px] font-semibold hover:bg-[#1e40af] transition-colors active:scale-95">
            <span className="material-symbols-outlined text-sm">search</span>
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Name</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Age</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Institution</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Class / Year</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Exam Tags</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Study Hours</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Streak</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Daily Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5d5]/50">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined text-[48px] block mb-2">backpack</span>
                  <p>No students found</p>
                </td></tr>
              ) : paginated.map(s => (
                <tr key={s.id} className="hover:bg-white transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#00288e] text-sm font-bold border border-[#c4c5d5]/30 shrink-0">
                        {(s.full_name || s.display_name || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{s.full_name || s.display_name || '—'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[14px] leading-[20px] text-[#444653]">{s.age ?? '—'}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {s.institution_type && (
                        <span className="material-symbols-outlined text-[#757684] text-sm">{INST_ICON[s.institution_type] || 'help'}</span>
                      )}
                      <span className="text-[14px] leading-[20px] text-[#444653]">{s.institution_name || s.institution_type || '—'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {s.class_or_year ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#f1f3ff] text-[#00288e]">{s.class_or_year}</span>
                    ) : (
                      <span className="text-[#757684]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {(s.exam_tags || []).slice(0, 3).map(t => (
                        <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffddb8] text-[#684000]">{t}</span>
                      ))}
                      {(s.exam_tags || []).length > 3 && (
                        <span className="text-xs text-[#757684]">+{s.exam_tags!.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-sm text-[#444653]">{Math.round(s.verified_minutes_total / 60)}h</td>
                  <td className="py-4 px-6 text-right">
                    {s.streak_count > 0 ? (
                      <span className="flex items-center justify-end gap-1 text-[#fea619] font-semibold">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                        <span className="text-[14px] leading-[20px]">{s.streak_count}</span>
                      </span>
                    ) : (
                      <span className="text-[#757684]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-[14px] leading-[20px] font-mono text-[#444653]">{s.daily_study_target_minutes || 120}m</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {students.length > 0 && (
          <div className="bg-white border-t border-[#c4c5d5] px-6 py-4 flex items-center justify-between">
            <span className="text-[14px] leading-[20px] text-[#757684]">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, students.length)} of {students.length} entries</span>
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
