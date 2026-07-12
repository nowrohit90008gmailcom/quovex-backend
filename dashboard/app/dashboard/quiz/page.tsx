'use client';
import { useState, useEffect } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  question_type: string;
  subject: string;
  exam_tag: string | null;
  difficulty: string;
  status: string;
}

interface QuizData {
  questions: Question[];
  total: number;
  by_difficulty: Record<string, number>;
  by_subject: Record<string, number>;
  by_exam: Record<string, number>;
}

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-[#d1e7dd] text-[#0f5132]',
  medium: 'bg-[#fff3cd] text-[#856404]',
  hard: 'bg-[#ffdad6] text-[#93000a]',
};

export default function QuizPage() {
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterExam, setFilterExam] = useState('all');
  const [filterDiff, setFilterDiff] = useState('all');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{questions: Question[]; total: number; by_difficulty: Record<string, number>; by_subject: Record<string, number>; by_exam: Record<string, number>}>('/admin/quiz');
      setData(res);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiFetch('/admin/quiz/generate', { method: 'POST' });
      showToast('Question generation job queued');
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { load(); }, []);

  const { searchQuery } = usePageHeader({
    searchPlaceholder: 'Search questions by text or subject...',
    addNewLabel: 'Generate Questions',
    onAddNew: handleGenerate,
  });

  const displayed = data
    ? data.questions.filter((q) => {
        if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase()) && !q.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
        if (filterExam !== 'all' && q.exam_tag !== filterExam) return false;
        if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
        return true;
      })
    : [];

  const subjects = data ? Object.keys(data.by_subject).sort() : [];
  const exams = data ? Object.keys(data.by_exam).sort() : [];

  const topSubjects = data
    ? Object.entries(data.by_subject).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  const topExams = data
    ? Object.entries(data.by_exam).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Question Library</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Manage and review AI-generated quiz questions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#757684]">
          <span className="material-symbols-outlined text-[48px] block mb-2">quiz</span>
          <p className="text-[16px] leading-[24px]">Unable to load quiz data</p>
        </div>
      ) : (
        <>
          {/* Info banner */}
          <div className="bg-[#d1e7dd] border border-[#0f5132]/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#0f5132] text-[22px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div>
              <p className="text-[14px] leading-[20px] font-semibold text-[#0f5132]">No review queue — questions go live instantly</p>
              <p className="text-[14px] leading-[20px] text-[#0f5132]/80 mt-0.5">All AI-generated questions are auto-approved and published immediately.</p>
            </div>
          </div>

          {/* Bento stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Questions */}
            <div className="bg-white border border-[#c4c5d5] rounded-xl p-5 shadow-sm">
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#444653] uppercase mb-1">Total Questions</p>
              <p className="text-[32px] leading-[40px] font-bold text-[#141b2b]">{data.total}</p>
            </div>

            {/* Difficulty Split */}
            <div className="bg-white border border-[#c4c5d5] rounded-xl p-5 shadow-sm">
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#444653] uppercase mb-3">Difficulty Split</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.by_difficulty).map(([d, n]) => (
                  <div key={d} className="flex items-center gap-1.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', DIFF_COLORS[d] || 'bg-[#e9edff] text-[#00288e]')}>{d}</span>
                    <span className="text-[14px] leading-[20px] font-bold text-[#141b2b]">{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Subjects */}
            <div className="bg-white border border-[#c4c5d5] rounded-xl p-5 shadow-sm">
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#444653] uppercase mb-3">Top 5 Subjects</p>
              <div className="space-y-2">
                {topSubjects.length === 0 ? (
                  <p className="text-[14px] leading-[20px] text-[#757684]">No data</p>
                ) : topSubjects.map(([s, n]) => (
                  <div key={s} className="flex items-center justify-between">
                    <span className="text-[14px] leading-[20px] text-[#141b2b] truncate max-w-[120px]">{s}</span>
                    <span className="text-[14px] leading-[20px] font-semibold text-[#444653]">{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Exams */}
            <div className="bg-white border border-[#c4c5d5] rounded-xl p-5 shadow-sm">
              <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#444653] uppercase mb-3">Top 5 Exams</p>
              <div className="space-y-2">
                {topExams.length === 0 ? (
                  <p className="text-[14px] leading-[20px] text-[#757684]">No data</p>
                ) : topExams.map(([e, n]) => (
                  <div key={e} className="flex items-center justify-between">
                    <span className="text-[14px] leading-[20px] text-[#141b2b] truncate max-w-[120px]">{e}</span>
                    <span className="text-[14px] leading-[20px] font-semibold text-[#444653]">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Exams</option>
                {exams.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <select
                value={filterDiff}
                onChange={(e) => setFilterDiff(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                onClick={load}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors w-full sm:w-auto active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-3 border-b border-[#c4c5d5] bg-[#f1f3ff] flex items-center justify-between">
              <span className="text-[14px] leading-[20px] font-semibold text-[#444653]">{displayed.length} question{displayed.length !== 1 ? 's' : ''}</span>
              <span className="text-[14px] leading-[20px] text-[#757684]">All live • No pending review</span>
            </div>
            <div className="divide-y divide-[#c4c5d5]/50 max-h-[600px] overflow-y-auto">
              {displayed.length === 0 ? (
                <div className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined text-[48px] block mb-2">quiz</span>
                  <p className="text-[16px] leading-[24px]">No questions match your filters</p>
                </div>
              ) : displayed.map((q) => (
                <div key={q.id} className="p-6 hover:bg-[#f8f9ff] transition-colors group">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e1e8fd] text-[#00288e]">{q.subject}</span>
                    {q.exam_tag && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#ffddb8] text-[#684000]">{q.exam_tag}</span>
                    )}
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold', DIFF_COLORS[q.difficulty] || 'bg-[#e9edff] text-[#00288e]')}>{q.difficulty}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#f1f3ff] text-[#444653] uppercase">{q.question_type}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#d1e7dd] text-[#0f5132] ml-auto">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      live
                    </span>
                  </div>
                  <p className="text-[14px] leading-[22px] font-medium text-[#141b2b] mb-3">{q.text}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={cn(
                            'px-3 py-2 rounded-lg text-[13px] leading-[18px] border',
                            opt === q.correct_answer
                              ? 'bg-[#d1e7dd] border-[#0f5132]/30 text-[#0f5132] font-semibold'
                              : 'bg-[#f9f9ff] border-[#c4c5d5] text-[#444653]'
                          )}
                        >
                          <span className="font-mono mr-1.5">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <div className="flex items-start gap-2 text-[13px] leading-[18px] text-[#757684] bg-[#f1f3ff] rounded-lg px-3 py-2">
                      <span className="material-symbols-outlined text-[#fea619] text-[16px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
