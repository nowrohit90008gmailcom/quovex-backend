'use client';
import { useState } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface PushForm {
  title: string; body: string;
  segment_country: string; segment_exam_tag: string;
  segment_streak_min: string; segment_inactive_days: string;
}

const PRESETS = [
  { label: 'Daily Reminder', title: 'Time to study!', body: 'Even 30 minutes a day keeps your streak alive. Open the app and start a session.' },
  { label: 'Streak Risk', title: 'Streak at risk!', body: 'You haven\'t studied today! Your streak is on the line — open StudyTimer now.' },
  { label: 'Rewards', title: 'Rewards are here!', body: 'Top performers for this month have been selected. Check your rewards in the app!' },
  { label: 'Quiz', title: 'New questions added!', body: 'Fresh quiz questions for JEE, NEET, and UPSC are ready. Test your knowledge now.' },
];

export default function NotificationsPage() {
  const [form, setForm] = useState<PushForm>({
    title: '', body: '', segment_country: '', segment_exam_tag: '', segment_streak_min: '', segment_inactive_days: '',
  });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const applyPreset = (p: { title: string; body: string }) => {
    setForm(f => ({ ...f, title: p.title, body: p.body }));
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) { showToast('Title and body are required', false); return; }
    setSending(true);
    try {
      const payload: Record<string, any> = { title: form.title, body: form.body };
      if (form.segment_country) payload.segment_country = form.segment_country;
      if (form.segment_exam_tag) payload.segment_exam_tag = form.segment_exam_tag;
      if (form.segment_streak_min) payload.segment_streak_min = parseInt(form.segment_streak_min);
      if (form.segment_inactive_days) payload.segment_inactive_days = parseInt(form.segment_inactive_days);
      await apiFetch('/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showToast('Notification sent successfully');
      setForm({ title: '', body: '', segment_country: '', segment_exam_tag: '', segment_streak_min: '', segment_inactive_days: '' });
    } catch (e: any) { showToast(e.message, false); }
    finally { setSending(false); }
  };

  const { searchQuery: searchUser } = usePageHeader({
    searchPlaceholder: undefined,
    addNewLabel: 'Send Notification',
    onAddNew: handleSend,
  });

  const charCount = form.body.length;
  const charLimit = 500;

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Push Notifications</h1>
        <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Compose and send segmented push notifications to users</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* LEFT: Composer */}
        <div className="col-span-3 space-y-4">
          {/* Compose Card */}
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
            <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#00288e]">edit_note</span>
              Compose Message
            </h2>

            {/* Quick Presets */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#444653] mb-2">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className="text-xs px-3 py-1.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] hover:text-[#00288e] hover:border-[#00288e] transition-colors font-medium">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1.5">Title <span className="text-[#ba1a1a]">*</span></label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={100} placeholder="Notification title…"
                  className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1.5">Body <span className="text-[#ba1a1a]">*</span></label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  maxLength={charLimit} rows={4} placeholder="Notification message…"
                  className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all resize-none" />
                <p className={cn('text-right text-xs mt-1', charCount > charLimit * 0.9 ? 'text-[#ba1a1a] font-bold' : 'text-[#757684]')}>
                  {charCount}/{charLimit}
                </p>
              </div>
            </div>
          </div>

          {/* Targeting Card */}
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
            <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#00288e]">target</span>
              Audience Targeting
              <span className="ml-1 text-xs font-normal text-[#757684]">(leave blank = all users)</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1.5">Country</label>
                <select value={form.segment_country} onChange={e => setForm(f => ({ ...f, segment_country: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 cursor-pointer">
                  <option value="">All Countries</option>
                  <option value="India">India</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Nigeria">Nigeria</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1.5">Exam</label>
                <select value={form.segment_exam_tag} onChange={e => setForm(f => ({ ...f, segment_exam_tag: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 cursor-pointer">
                  <option value="">All Exams</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="SAT">SAT</option>
                  <option value="GATE">GATE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1.5">Min Streak (days)</label>
                <input type="number" min="0" value={form.segment_streak_min}
                  onChange={e => setForm(f => ({ ...f, segment_streak_min: e.target.value }))}
                  placeholder="e.g. 7"
                  className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1.5">Inactive Days</label>
                <input type="number" min="1" value={form.segment_inactive_days}
                  onChange={e => setForm(f => ({ ...f, segment_inactive_days: e.target.value }))}
                  placeholder="e.g. 3"
                  className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button onClick={handleSend} disabled={sending || !form.title.trim() || !form.body.trim()}
            className="w-full py-3 bg-[#00288e] text-white rounded-xl font-semibold text-sm hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 active:scale-[0.99]">
            {sending ? (
              <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Sending…</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">send</span> Send Notification</>
            )}
          </button>
        </div>

        {/* RIGHT: Preview */}
        <div className="col-span-2">
          <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 sticky top-6">
            <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#00288e]">visibility</span>
              Device Preview
            </h2>
            {/* Phone Mockup */}
            <div className="bg-[#1a1c1e] rounded-2xl p-4 mx-auto max-w-[240px] shadow-lg">
              <div className="bg-[#2c2e30] rounded-xl p-3 mb-2 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00288e] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-[16px]">timer</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{form.title || 'Notification title'}</p>
                  <p className="text-[#9aa0a6] text-[11px] leading-tight mt-0.5 line-clamp-3">{form.body || 'Your notification message will appear here.'}</p>
                </div>
              </div>
              <div className="text-[#757684] text-[10px] text-center">StudyTimer · now</div>
            </div>

            {/* Targeting Summary */}
            <div className="mt-4 border-t border-[#c4c5d5] pt-4 space-y-2.5">
              <p className="text-xs font-semibold text-[#444653]">Targeting Summary</p>
              {[
                ['Country', form.segment_country || 'All'],
                ['Exam', form.segment_exam_tag || 'All'],
                ['Min Streak', form.segment_streak_min ? `${form.segment_streak_min}+ days` : 'Any'],
                ['Inactive ≥', form.segment_inactive_days ? `${form.segment_inactive_days} days` : 'N/A'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-[#757684]">{k}</span>
                  <span className="font-medium text-[#141b2b]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="text-[14px] leading-[20px] font-semibold">{toast.ok ? 'Success' : 'Error'}</p>
            <p className="text-[14px] leading-[20px] opacity-80">{toast.msg}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
