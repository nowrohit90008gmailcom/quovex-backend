'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, cn, formatMinutes, formatDate } from '@/lib/utils';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UserSession {
  id: string; start_time: string; end_time: string | null;
  mode: string; verified_minutes: number; points_awarded: number;
  is_flagged: boolean; flag_reason: string | null;
}

interface UserDetail {
  id: string; display_name: string | null; email: string | null;
  country: string | null; points_total: number; verified_minutes_total: number;
  streak_count: number; exam_tags: string[] | null;
  is_banned: boolean; ban_reason: string | null; admin_role: string | null;
  created_at: string; sessions: UserSession[];
  daily_study_target_minutes: number;
  institution_name: string | null;
}

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pointsAdj, setPointsAdj] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [adjLoading, setAdjLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [editName, setEditName] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch<UserDetail>(`/admin/users/${params.userId}`);
      setUser(data);
      setEditName(data.display_name || '');
      setEditInstitution(data.institution_name || '');
      setEditTarget(String(data.daily_study_target_minutes || 120));
    } catch (e: any) { setError(e.message || 'Backend offline'); }
    finally { setLoading(false); }
  }, [params.userId]);

  useEffect(() => { load(); }, [load]);

  const handlePointsAdjust = async () => {
    const amount = parseInt(pointsAdj);
    if (isNaN(amount) || amount === 0) { showToast('Enter a non-zero point adjustment', false); return; }
    if (!adjReason.trim() || adjReason.trim().length < 3) { showToast('Reason must be at least 3 characters', false); return; }
    setAdjLoading(true);
    try {
      await apiFetch(`/admin/users/${params.userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ points_adjustment: amount, adjustment_reason: adjReason.trim() }),
      });
      showToast(`Points adjusted by ${amount > 0 ? '+' : ''}${amount}`);
      setPointsAdj(''); setAdjReason(''); load();
    } catch (e: any) { showToast(e.message, false); }
    finally { setAdjLoading(false); }
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const body: Record<string, any> = {};
      if (editName.trim()) body.display_name = editName.trim();
      if (editInstitution.trim()) body.institution_name = editInstitution.trim();
      const target = parseInt(editTarget);
      if (!isNaN(target) && target > 0) body.daily_study_target_minutes = target;
      await apiFetch(`/admin/users/${params.userId}`, { method: 'PATCH', body: JSON.stringify(body) });
      showToast('Profile updated');
      load();
    } catch (e: any) { showToast(e.message, false); }
    finally { setEditSaving(false); }
  };

  const handleBanToggle = async () => {
    if (!user) return;
    const newBanState = !user.is_banned;
    if (newBanState && (!banReason.trim() || banReason.trim().length < 3)) {
      showToast('Ban reason must be at least 3 characters', false); return;
    }
    setBanLoading(true);
    try {
      const body: Record<string, any> = { is_banned: newBanState };
      if (newBanState) body.ban_reason = banReason.trim();
      await apiFetch(`/admin/users/${params.userId}`, { method: 'PATCH', body: JSON.stringify(body) });
      showToast(newBanState ? 'User banned' : 'User unbanned');
      setBanReason(''); load();
    } catch (e: any) { showToast(e.message, false); }
    finally { setBanLoading(false); }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[#00288e] text-[40px]">progress_activity</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[#757684] block mb-3">error_outline</span>
          <p className="text-[#93000a] font-medium mb-4">{error}</p>
          <button onClick={load} className="px-5 py-2 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af] transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="text-[14px] leading-[20px] font-semibold">{toast.ok ? 'Success' : 'Error'}</p>
            <p className="text-[14px] leading-[20px] opacity-80 text-xs">{toast.msg}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Back Nav */}
      <Link href="/dashboard/users" className="inline-flex items-center gap-1.5 text-sm text-[#757684] hover:text-[#00288e] transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Users
      </Link>

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-[#c4c5d5] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#00288e] text-xl font-bold shrink-0 border border-[#c4c5d5]/30">
              {(user.display_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#141b2b]">{user.display_name || 'Unnamed'}</h1>
                {user.admin_role && (
                  <span className="px-2 py-0.5 rounded-full bg-[#dde1ff] text-[#001453] text-[10px] font-bold uppercase tracking-wide">{user.admin_role}</span>
                )}
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold',
                  user.is_banned ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#d1e7dd] text-[#0f5132]')}>
                  {user.is_banned ? 'Banned' : 'Active'}
                </span>
              </div>
              <div className="text-sm text-[#757684] mt-0.5">{user.email}</div>
              {user.is_banned && user.ban_reason && (
                <div className="mt-1 text-xs text-[#ba1a1a] bg-[#ffdad6]/50 px-2.5 py-1 rounded-lg inline-block">Reason: {user.ban_reason}</div>
              )}
            </div>
          </div>
          <div className="text-xs text-[#757684] text-right">
            <div>Joined {formatDate(user.created_at)}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-[#f1f3ff] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00288e]">{user.points_total.toLocaleString()}</p>
            <p className="text-xs text-[#444653] mt-0.5">Total Points</p>
          </div>
          <div className="bg-[#f1f3ff] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00288e]">{formatMinutes(user.verified_minutes_total)}</p>
            <p className="text-xs text-[#444653] mt-0.5">Verified Minutes</p>
          </div>
          <div className="bg-[#f1f3ff] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00288e] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[22px] text-[#fea619]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              {user.streak_count}d
            </p>
            <p className="text-xs text-[#444653] mt-0.5">Streak</p>
          </div>
          <div className="bg-[#f1f3ff] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00288e]">{user.country || '—'}</p>
            <p className="text-xs text-[#444653] mt-0.5">Country</p>
          </div>
        </div>

        {/* Exam Tags */}
        {user.exam_tags && user.exam_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {user.exam_tags.map(t => (
              <span key={t} className="bg-[#dde1ff] text-[#00288e] px-2 py-0.5 rounded text-xs font-medium">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Card */}
      <div className="bg-white rounded-xl border border-[#c4c5d5] p-5">
        <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#00288e]">edit</span>
          Edit Profile
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1">Display Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e]/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1">Email</label>
              <input defaultValue={user.email || ''} readOnly className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm bg-[#f1f3ff] text-[#757684] cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1">Institution Name</label>
              <input value={editInstitution} onChange={e => setEditInstitution(e.target.value)} placeholder="Institution name" className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e]/20" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1">Daily Study Goal (minutes)</label>
              <input type="number" value={editTarget} onChange={e => setEditTarget(e.target.value)} placeholder="e.g. 120" min={15} max={600} className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e]/20" />
              <p className="text-[10px] text-[#757684] mt-1">Phone unlocks automatically when daily target is met</p>
            </div>
            <div className="pt-6">
              <button onClick={handleEditSave} disabled={editSaving}
                className="w-full py-2.5 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {editSaving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Points Adjustment */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-5">
          <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#00288e]">tune</span>
            Adjust Points
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1">Points Adjustment</label>
              <input type="number" value={pointsAdj} onChange={e => setPointsAdj(e.target.value)} placeholder="e.g. 100 or -50"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 font-mono" />
              <p className="text-[10px] text-[#757684] mt-1">Use positive to add, negative to deduct</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1">Reason <span className="text-[#ba1a1a]">*</span></label>
              <input value={adjReason} onChange={e => setAdjReason(e.target.value)} placeholder="Why are you adjusting points?"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e]/20" />
            </div>
            <button onClick={handlePointsAdjust} disabled={adjLoading || !pointsAdj || !adjReason.trim()}
              className="w-full py-2.5 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {adjLoading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              Apply Adjustment
            </button>
          </div>
        </div>

        {/* Ban/Unban */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-5">
          <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#00288e]">gavel</span>
            {user.is_banned ? 'Unban User' : 'Ban User'}
          </h2>
          <div className="space-y-3">
            {!user.is_banned && (
              <div>
                <label className="block text-xs font-semibold text-[#444653] mb-1">Ban Reason <span className="text-[#ba1a1a]">*</span></label>
                <input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Required reason for banning…"
                  className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e]/20" />
              </div>
            )}
            <button onClick={handleBanToggle} disabled={banLoading}
              className={cn('w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                user.is_banned ? 'bg-[#0f5132] text-white hover:bg-[#0a3b24]' : 'bg-[#ba1a1a] text-white hover:bg-[#93000a]')}>
              {banLoading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              <span className="material-symbols-outlined text-[18px]">{user.is_banned ? 'lock_open' : 'block'}</span>
              {user.is_banned ? 'Unban User' : 'Ban User'}
            </button>
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-xl border border-[#c4c5d5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c4c5d5]">
          <h2 className="font-semibold text-[#141b2b] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#00288e]">history</span>
            Session History
            <span className="text-xs font-normal text-[#757684] ml-1">({user.sessions.length} sessions)</span>
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
              <th className="text-left px-4 py-3 font-semibold text-[#444653]">Start</th>
              <th className="text-left px-4 py-3 font-semibold text-[#444653]">End</th>
              <th className="text-left px-4 py-3 font-semibold text-[#444653]">Mode</th>
              <th className="text-right px-4 py-3 font-semibold text-[#444653]">Verified</th>
              <th className="text-right px-4 py-3 font-semibold text-[#444653]">Points</th>
              <th className="text-left px-4 py-3 font-semibold text-[#444653]">Flag</th>
            </tr>
          </thead>
          <tbody>
            {user.sessions.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-[#757684]">
                <span className="material-symbols-outlined text-[36px] block mb-2">playlist_remove</span>
                No sessions recorded yet
              </td></tr>
            ) : user.sessions.map(s => {
              const modeIcons: Record<string, string> = { focus: 'psychiatry', exam: 'quiz', custom: 'tune', pomodoro: 'timer' };
              return (
                <tr key={s.id} className="border-b border-[#c4c5d5]/50 hover:bg-white transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-[#141b2b]">{formatDate(s.start_time)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#757684]">{s.end_time ? formatDate(s.end_time) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#444653]">
                      <span className="material-symbols-outlined text-[14px]">{modeIcons[s.mode] || 'schedule'}</span>
                      {s.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[#444653]">{formatMinutes(s.verified_minutes)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[#141b2b] font-semibold">{s.points_awarded}</td>
                  <td className="px-4 py-3">
                    {s.is_flagged ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#ba1a1a] bg-[#ffdad6]/50 px-2 py-0.5 rounded-full font-medium" title={s.flag_reason || ''}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                        Flagged
                      </span>
                    ) : <span className="text-xs text-[#757684]">—</span>}
                    {s.is_flagged && s.flag_reason && (
                      <div className="text-[10px] text-[#ba1a1a] mt-0.5 max-w-32 truncate" title={s.flag_reason}>{s.flag_reason}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}