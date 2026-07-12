'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface ExamTag {
  tag: string;
  country: string | null;
  category: string | null;
  user_count: number;
  question_count: number;
}

type SortKey = 'tag' | 'country' | 'category' | 'users' | 'questions';

export default function ExamTagsPage() {
  const [tags, setTags] = useState<ExamTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery: searchTag } = usePageHeader({
    searchPlaceholder: 'Search tags...',
    addNewLabel: null,
  });
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('users');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const perPage = 10;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ExamTag[]>('/admin/exam-tags');
      setTags(data);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tags.filter((t) => {
    if (searchTag && !t.tag.toLowerCase().includes(searchTag.toLowerCase())) return false;
    if (filterCountry !== 'all' && t.country !== filterCountry) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sort === 'tag') return dir * a.tag.localeCompare(b.tag);
    if (sort === 'country') return dir * (a.country || '').localeCompare(b.country || '');
    if (sort === 'category') return dir * (a.category || '').localeCompare(b.category || '');
    if (sort === 'users') return dir * (a.user_count - b.user_count);
    if (sort === 'questions') return dir * (a.question_count - b.question_count);
    return 0;
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: SortKey) => {
    if (sort === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setSortDir(key === 'tag' || key === 'country' || key === 'category' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={cn('material-symbols-outlined text-[14px] ml-1 align-middle', sort === col ? 'text-[#00288e]' : 'text-[#c4c5d5]')}>
      {sort === col ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
    </span>
  );

  const countries = [...new Set(tags.map((t) => t.country).filter(Boolean) as string[])].sort();
  const categories = [...new Set(tags.map((t) => t.category).filter(Boolean) as string[])].sort();

  const totalUsers = tags.reduce((s, t) => s + t.user_count, 0);
  const totalQuestions = tags.reduce((s, t) => s + t.question_count, 0);
  const activeTags = tags.filter((t) => t.question_count > 0).length;
  const maxUsers = Math.max(...tags.map((t) => t.user_count), 1);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Exam Tags</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">All exam tags in use across the platform</p>
        </div>
        <button
          onClick={load}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span className="text-[14px] leading-[20px] font-semibold">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <>
          {/* Stat summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Tags', value: tags.length, icon: 'local_offer', color: '#00288e', bg: '#e1e8fd' },
              { label: 'Active Tags', value: activeTags, icon: 'done_all', color: '#0f5132', bg: '#d1e7dd' },
              { label: 'Users Tagged', value: totalUsers, icon: 'group', color: '#684000', bg: '#ffddb8' },
              { label: 'Total Questions', value: totalQuestions, icon: 'quiz', color: '#93000a', bg: '#ffdad6' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#c4c5d5] rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <span className="material-symbols-outlined text-[22px]" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-[24px] leading-[32px] font-bold text-[#141b2b]">{s.value.toLocaleString()}</p>
                  <p className="text-[14px] leading-[20px] text-[#444653]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className="bg-[#f1f3ff] border border-[#00288e]/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#00288e] text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <p className="text-[14px] leading-[20px] text-[#141b2b]">
              Tags are created automatically when users select them during onboarding or when AI generates quiz questions. Tags with no questions are highlighted for content gap review.
            </p>
          </div>

          {/* Filter row */}
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3 w-full sm:w-auto items-center">
              <select
                value={filterCountry}
                onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Countries</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-[14px] leading-[20px] text-[#757684] whitespace-nowrap">{sorted.length} tag{sorted.length !== 1 ? 's' : ''} match</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                    <th
                      onClick={() => toggleSort('tag')}
                      className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap cursor-pointer select-none hover:text-[#00288e]"
                    >
                      Tag <SortIcon col="tag" />
                    </th>
                    <th
                      onClick={() => toggleSort('country')}
                      className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap cursor-pointer select-none hover:text-[#00288e]"
                    >
                      Country <SortIcon col="country" />
                    </th>
                    <th
                      onClick={() => toggleSort('category')}
                      className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap cursor-pointer select-none hover:text-[#00288e]"
                    >
                      Category <SortIcon col="category" />
                    </th>
                    <th
                      onClick={() => toggleSort('users')}
                      className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap cursor-pointer select-none hover:text-[#00288e]"
                    >
                      Users <SortIcon col="users" />
                    </th>
                    <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Popularity</th>
                    <th
                      onClick={() => toggleSort('questions')}
                      className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap cursor-pointer select-none hover:text-[#00288e]"
                    >
                      Questions <SortIcon col="questions" />
                    </th>
                    <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c5d5]/50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#757684]">
                        <span className="material-symbols-outlined text-[48px] block mb-2">local_offer</span>
                        <p className="text-[16px] leading-[24px]">{searchTag || filterCountry !== 'all' || filterCategory !== 'all' ? 'No tags match your filters' : 'No exam tags found yet'}</p>
                      </td>
                    </tr>
                  ) : paginated.map((t) => {
                    const popularity = Math.round((t.user_count / maxUsers) * 100);
                    return (
                      <tr key={t.tag} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] leading-[16px] font-bold bg-[#00288e]/8 text-[#00288e] border border-[#00288e]/10">
                            <span className="material-symbols-outlined text-[13px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                            {t.tag}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[14px] leading-[20px] text-[#444653]">{t.country || '—'}</td>
                        <td className="py-4 px-6">
                          {t.category === 'School Board' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#e1e8fd] text-[#00288e]">{t.category}</span>
                          ) : t.category === 'Competitive' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#ffddb8] text-[#684000]">{t.category}</span>
                          ) : (
                            <span className="text-[14px] leading-[20px] text-[#757684]">{t.category || '—'}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{t.user_count.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 bg-[#c4c5d5]/50 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-[#00288e] transition-all"
                                style={{ width: `${popularity}%` }}
                              />
                            </div>
                            <span className="text-[12px] leading-[16px] font-mono text-[#444653] w-8 text-right">{popularity}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{t.question_count.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          {t.question_count > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#d1e7dd] text-[#0f5132]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0f5132] mr-1.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff3cd] text-[#856404]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#856404] mr-1.5" />
                              No Questions
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sorted.length > 0 && (
              <div className="bg-white border-t border-[#c4c5d5] px-6 py-4 flex items-center justify-between">
                <span className="text-[14px] leading-[20px] text-[#757684]">
                  Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sorted.length)} of {sorted.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded border border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'w-8 h-8 rounded text-[12px] leading-[16px] tracking-[0.05em] font-medium transition-colors',
                        p === page ? 'bg-[#1e40af] text-white' : 'hover:bg-[#e9edff] text-[#141b2b]'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > 5 && <span className="text-[#757684]">...</span>}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded border border-[#c4c5d5] text-[#444653] hover:bg-[#e9edff] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="text-[14px] leading-[20px] font-semibold">{toast.ok ? 'Success' : 'Error'}</p>
            <p className="text-[14px] leading-[20px] opacity-80">{toast.msg}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 transition-colors p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
