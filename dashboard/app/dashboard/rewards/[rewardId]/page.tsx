'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, cn, formatDate, formatCurrency } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type RewardStatus = 'pending' | 'kyc_review' | 'approved' | 'sent' | 'rejected';
type RewardType = 'giftcard' | 'badge';
type Track = 'study' | 'quiz' | 'overall';

interface Reward {
  id: string; user_id: string; user_name: string | null; user_email: string | null;
  user_country: string | null; track: Track; period_month: string; tier: string;
  rank_at_freeze: number; reward_type: RewardType; reward_amount_usd: number | null;
  reward_description: string | null; status: RewardStatus; kyc_verified: boolean;
  kyc_verification_id: string | null; claimed_at: string | null; sent_at: string | null;
  admin_notes: string | null; created_at: string;
}

const STATUS_CONFIG: Record<RewardStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-[#fef3c7] text-[#92400e]' },
  kyc_review: { label: 'KYC Review', className: 'bg-[#dbeafe] text-[#1e40af]' },
  approved:   { label: 'Approved',   className: 'bg-[#d1fae5] text-[#065f46]' },
  sent:       { label: 'Sent',       className: 'bg-[#e9edff] text-[#00288e]' },
  rejected:   { label: 'Rejected',   className: 'bg-[#ffdad6] text-[#93000a]' },
};

const TRACK_ICONS: Record<Track, string> = {
  study: 'timer', quiz: 'quiz', overall: 'emoji_events',
};

export default function RewardDetailPage() {
  const params = useParams<{ rewardId: string }>();
  const router = useRouter();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadReward = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch<Reward>(`/admin/rewards/${params.rewardId}`);
      setReward(data);
      setAdminNotes(data.admin_notes || '');
    } catch (e: any) {
      setError(e.message || 'Backend offline');
    } finally { setLoading(false); }
  }, [params.rewardId]);

  useEffect(() => { loadReward(); }, [loadReward]);

  const handleStatusChange = async (newStatus: RewardStatus) => {
    if (!reward) return;
    try {
      await apiFetch(`/admin/rewards/${reward.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Status changed to ${STATUS_CONFIG[newStatus].label}`);
      loadReward();
    } catch (e: any) { showToast(e.message, false); }
  };

  const handleSaveNotes = async () => {
    if (!reward) return;
    setSavingNotes(true);
    try {
      await apiFetch(`/admin/rewards/${reward.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_notes: adminNotes }),
      });
      showToast('Notes saved');
    } catch (e: any) { showToast(e.message, false); }
    finally { setSavingNotes(false); }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[960px] mx-auto">
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[#00288e] text-[40px]">progress_activity</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[960px] mx-auto">
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[#757684] block mb-3">error_outline</span>
          <p className="text-[#93000a] font-medium mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadReward} className="px-5 py-2 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af] transition-colors">Retry</button>
            <Link href="/dashboard/rewards" className="px-5 py-2 border border-[#c4c5d5] text-[#444653] rounded-lg text-sm font-semibold hover:bg-[#f1f3ff] transition-colors">Back to Rewards</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!reward) return null;

  const showActions = reward.status !== 'sent' && reward.status !== 'rejected';

  return (
    <div className="p-6 max-w-[960px] mx-auto space-y-6">
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

      {/* Back Button */}
      <Link href="/dashboard/rewards" className="inline-flex items-center gap-1.5 text-sm text-[#757684] hover:text-[#00288e] transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Rewards
      </Link>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-[#c4c5d5] p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-[#00288e]">{TRACK_ICONS[reward.track]}</span>
            <div>
              <h1 className="text-xl font-bold text-[#141b2b]">{reward.track.charAt(0).toUpperCase() + reward.track.slice(1)} Reward</h1>
              <p className="text-sm text-[#757684]">ID: {reward.id}</p>
            </div>
          </div>
          <span className={cn('inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold', STATUS_CONFIG[reward.status].className)}>
            {STATUS_CONFIG[reward.status].label}
          </span>
        </div>

        {/* User Info */}
        <div className="bg-[#f1f3ff] rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-[#141b2b]">{reward.user_name || '—'}</p>
          <p className="text-xs text-[#757684]">{reward.user_email} · {reward.user_country || '—'}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <DetailBox label="Period" value={reward.period_month} />
          <DetailBox label="Tier" value={reward.tier.replace(/_/g, ' ')} />
          <DetailBox label="Rank" value={`#${reward.rank_at_freeze}`} />
          <DetailBox label="Type" value={reward.reward_type === 'giftcard' ? 'Gift Card' : 'Badge'} />
          {reward.reward_type === 'giftcard' && (
            <DetailBox label="Amount" value={formatCurrency(reward.reward_amount_usd || 0)} />
          )}
          <DetailBox label="KYC" value={reward.kyc_verified ? 'Verified' : 'Not Verified'} />
          {reward.claimed_at && <DetailBox label="Claimed" value={formatDate(reward.claimed_at)} />}
          {reward.sent_at && <DetailBox label="Sent" value={formatDate(reward.sent_at)} />}
        </div>

        {/* Description */}
        {reward.reward_description && (
          <div>
            <p className="text-xs text-[#757684] mb-1">Description</p>
            <p className="text-sm text-[#141b2b] bg-[#f1f3ff] px-3 py-2 rounded-lg">{reward.reward_description}</p>
          </div>
        )}
      </div>

      {/* Status Actions */}
      <div className="bg-white rounded-xl border border-[#c4c5d5] p-5">
        <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#00288e]">swap_horiz</span>
          Status Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {showActions && (
            <>
              {(reward.status === 'pending' || reward.status === 'kyc_review') && (
                <button onClick={() => handleStatusChange('approved')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#065f46] text-white rounded-lg text-sm font-semibold hover:bg-[#047857] transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Approve
                </button>
              )}
              {reward.status === 'approved' && (
                <button onClick={() => handleStatusChange('sent')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af] transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  Mark Sent
                </button>
              )}
              <button onClick={() => handleStatusChange('rejected')}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-lg text-sm font-semibold hover:bg-[#ffdad6] transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Reject
              </button>
            </>
          )}
          {reward.status === 'sent' && (
            <div className="text-sm text-[#757684] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#065f46]">check_circle</span>
              Final state — reward has been sent
            </div>
          )}
          {reward.status === 'rejected' && (
            <div className="text-sm text-[#757684] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">cancel</span>
              Reward has been rejected
            </div>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-xl border border-[#c4c5d5] p-5">
        <h2 className="font-semibold text-[#141b2b] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#00288e]">sticky_note_2</span>
          Admin Notes
        </h2>
        <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
          rows={4} placeholder="Internal notes about this reward…"
          className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all resize-none mb-3" />
        <button onClick={handleSaveNotes} disabled={savingNotes}
          className="px-5 py-2.5 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition-colors flex items-center gap-2 active:scale-95">
          {savingNotes && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
          Save Notes
        </button>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#c4c5d5] rounded-xl p-3">
      <p className="text-xs text-[#757684]">{label}</p>
      <p className="text-sm font-semibold text-[#141b2b] mt-0.5">{value}</p>
    </div>
  );
}
