'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { usePageHeader } from '@/components/layout/HeaderContext';

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

interface Summary {
  total_rewards_this_month: number; total_cash_value_usd: number; pending_count: number;
  kyc_review_count: number; approved_count: number; sent_count: number; budget_used_usd: number;
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

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'kyc' | 'create' | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const { searchQuery: searchUser } = usePageHeader({
    searchPlaceholder: 'Search by user name or email…',
    addNewLabel: 'Create Reward',
    onAddNew: () => setModalMode('create'),
  });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterTrack !== 'all') params.set('track', filterTrack);
      if (searchUser) params.set('search_user', searchUser);
      const [rewardsData, summaryData] = await Promise.allSettled([
        apiFetch<Reward[]>(`/admin/rewards?${params}`),
        apiFetch<Summary>('/admin/rewards/summary'),
      ]);
      if (rewardsData.status === 'fulfilled') setRewards(rewardsData.value);
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
    } catch (e: any) { showToast(e.message, false); }
    finally { setLoading(false); }
  }, [filterStatus, filterTrack, searchUser]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleKYCApprove = async (reward: Reward, approved: boolean, notes: string, ref: string) => {
    try {
      await apiFetch(`/admin/rewards/${reward.id}/kyc`, {
        method: 'POST',
        body: JSON.stringify({ approved, notes, kyc_reference: ref }),
      });
      showToast(approved ? 'KYC Approved' : 'KYC Rejected');
      setModalMode(null);
      loadData();
    } catch (e: any) { showToast(e.message, false); }
  };

  const handleMarkSent = async (rewardId: string) => {
    try {
      await apiFetch(`/admin/rewards/${rewardId}/mark-sent`, { method: 'POST' });
      showToast('Marked as Sent');
      loadData();
    } catch (e: any) { showToast(e.message, false); }
  };

  const handleEditReward = async (rewardId: string, data: Record<string, any>) => {
    try {
      await apiFetch(`/admin/rewards/${rewardId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      showToast('Reward updated');
      setModalMode(null);
      loadData();
    } catch (e: any) { showToast(e.message, false); }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Delete this reward? This cannot be undone.')) return;
    try {
      await apiFetch(`/admin/rewards/${rewardId}`, { method: 'DELETE' });
      showToast('Reward deleted');
      loadData();
    } catch (e: any) { showToast(e.message, false); }
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Rewards Management</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Create, edit, KYC-verify and dispatch monthly rewards</p>
        </div>
        <button onClick={() => setModalMode('create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00288e] text-white rounded-lg text-[14px] leading-[20px] font-semibold hover:bg-[#1e40af] transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Reward
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Pending" value={summary?.pending_count ?? 0} icon="hourglass_empty" color="#92400e" bg="#fef3c7" />
        <SummaryCard label="KYC Review" value={summary?.kyc_review_count ?? 0} icon="verified_user" color="#1e40af" bg="#dbeafe" />
        <SummaryCard label="Approved" value={summary?.approved_count ?? 0} icon="check_circle" color="#065f46" bg="#d1fae5" />
        <SummaryCard label="Budget Used" value={summary ? formatCurrency(summary.budget_used_usd) : '—'} icon="payments" color="#00288e" bg="#e9edff" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 cursor-pointer w-full sm:w-auto">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="kyc_review">KYC Review</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filterTrack} onChange={e => setFilterTrack(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-[#f9f9ff] border border-[#c4c5d5] rounded-lg text-sm text-[#444653] focus:ring-2 focus:ring-[#00288e]/20 cursor-pointer w-full sm:w-auto">
            <option value="all">All Tracks</option>
            <option value="study">Study</option>
            <option value="quiz">Quiz</option>
            <option value="overall">Overall</option>
          </select>
          <button onClick={loadData} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors w-full sm:w-auto active:scale-95">
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-[14px] leading-[20px] font-semibold hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">User</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Track / Tier</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Period</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Reward</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">KYC</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5d5]/50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                </td></tr>
              ) : rewards.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-[#757684]">
                  <span className="material-symbols-outlined text-[48px] block mb-2">card_giftcard</span>
                  <p>No rewards found</p>
                </td></tr>
              ) : rewards.map(r => (
                <tr key={r.id} className="hover:bg-white transition-colors group border-b border-[#c4c5d5]/50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-[14px] leading-[20px] text-[#141b2b]">{r.user_name || '—'}</div>
                    <div className="text-[14px] leading-[20px] text-[#757684]">{r.user_email}</div>
                    {r.user_country && <div className="text-[14px] leading-[20px] text-[#757684]">{r.user_country}</div>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#00288e]">{TRACK_ICONS[r.track]}</span>
                      <span className="text-[14px] leading-[20px] font-medium text-[#141b2b] capitalize">{r.track}</span>
                    </div>
                    <div className="text-[14px] leading-[20px] text-[#757684] mt-0.5">
                      #{r.rank_at_freeze} · {r.tier.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-[#444653]">{r.period_month}</td>
                  <td className="py-4 px-6">
                    <div className="text-[14px] leading-[20px] font-medium text-[#141b2b]">
                      {r.reward_type === 'giftcard' ? `${formatCurrency(r.reward_amount_usd || 0)} Gift Card` : 'Badge'}
                    </div>
                    {r.reward_description && (
                      <div className="text-[14px] leading-[20px] text-[#757684] truncate max-w-40">{r.reward_description}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {r.reward_type === 'badge' ? (
                      <span className="text-[14px] leading-[20px] text-[#757684]">N/A</span>
                    ) : r.kyc_verified ? (
                      <span className="inline-flex items-center gap-1 text-sm text-[#065f46] font-medium">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Verified
                      </span>
                    ) : r.status === 'kyc_review' ? (
                      <button onClick={() => { setSelectedReward(r); setModalMode('kyc'); }}
                        className="inline-flex items-center gap-1 text-sm text-[#1e40af] font-semibold bg-[#dbeafe] px-2.5 py-1 rounded-lg hover:bg-[#bfdbfe] transition-colors">
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        Review
                      </button>
                    ) : (
                      <span className="text-[14px] leading-[20px] text-[#757684]">Pending claim</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', STATUS_CONFIG[r.status].className)}>
                      {STATUS_CONFIG[r.status].label}
                    </span>
                    {r.admin_notes && (
                      <div className="text-[10px] text-[#757684] mt-1 truncate max-w-32" title={r.admin_notes}>{r.admin_notes.slice(0, 40)}…</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionBtn icon="edit" title="Edit reward" onClick={() => { setSelectedReward(r); setModalMode('edit'); }} />
                      {r.status === 'approved' && (
                        <ActionBtn icon="local_shipping" title="Mark as sent" onClick={() => handleMarkSent(r.id)} />
                      )}
                      {r.status === 'kyc_review' && (
                        <ActionBtn icon="verified_user" title="KYC review" onClick={() => { setSelectedReward(r); setModalMode('kyc'); }} />
                      )}
                      {r.status !== 'sent' && (
                        <ActionBtn icon="delete" title="Delete" onClick={() => handleDeleteReward(r.id)} danger />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border-t border-[#c4c5d5] px-6 py-4 text-[14px] leading-[20px] text-[#757684]">
          Showing {rewards.length} reward{rewards.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Modals */}
      {modalMode === 'kyc' && selectedReward && (
        <KYCModal reward={selectedReward} onClose={() => { setModalMode(null); setSelectedReward(null); }} onSubmit={handleKYCApprove} />
      )}
      {modalMode === 'edit' && selectedReward && (
        <EditRewardModal reward={selectedReward} onClose={() => { setModalMode(null); setSelectedReward(null); }} onSubmit={(data) => handleEditReward(selectedReward.id, data)} />
      )}
      {modalMode === 'create' && (
        <CreateRewardModal onClose={() => setModalMode(null)} onCreated={() => { setModalMode(null); loadData(); showToast('Reward created'); }} />
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
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100 p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, color, bg }: { label: string; value: string | number; icon: string; color: string; bg: string }) {
  return (
    <div className="bg-white border border-[#c4c5d5] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <p className="text-[14px] leading-[20px] text-[#444653] font-medium">{label}</p>
          <p className="text-[24px] leading-[32px] font-bold text-[#141b2b]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, title, onClick, danger }: { icon: string; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      className={cn('p-1.5 rounded-lg transition-colors',
        danger ? 'text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6]' : 'text-[#757684] hover:text-[#00288e] hover:bg-[#e9edff]')}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

function KYCModal({ reward, onClose, onSubmit }: { reward: Reward; onClose: () => void; onSubmit: (r: Reward, approved: boolean, notes: string, ref: string) => void }) {
  const [notes, setNotes] = useState('');
  const [kycRef, setKycRef] = useState('');

  return (
    <Modal title="Manual KYC Review" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-[#f1f3ff] rounded-xl p-4">
          <p className="text-sm font-semibold text-[#141b2b]">{reward.user_name}</p>
          <p className="text-xs text-[#757684]">{reward.user_email} · {reward.user_country}</p>
          <div className="mt-2 flex gap-3 text-xs text-[#444653]">
            <span>Track: <b className="capitalize">{reward.track}</b></span>
            <span>Tier: <b>{reward.tier.replace(/_/g, ' ')}</b></span>
            <span>Rank: <b>#{reward.rank_at_freeze}</b></span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#00288e]">
            {reward.reward_description || `${formatCurrency(reward.reward_amount_usd || 0)} Gift Card`}
          </p>
        </div>

        <div className="border border-[#fea619]/30 bg-[#fef3c7] rounded-xl p-3">
          <p className="text-xs font-semibold text-[#92400e] mb-1">Manual KYC Instructions</p>
          <p className="text-xs text-[#92400e]">
            Verify the winner&apos;s identity via WhatsApp/email before approving.
            Enter a reference ID (e.g., thread ID, screenshot filename) for audit trail.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">Reference ID (WhatsApp/Email thread)</label>
          <input value={kycRef} onChange={e => setKycRef(e.target.value)}
            placeholder="e.g., WA-2024-07-15-priya or email-july-reward"
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Any notes about the verification process…"
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => onSubmit(reward, false, notes, kycRef)}
            className="flex-1 py-2.5 border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-xl text-sm font-semibold hover:bg-[#ffdad6] transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            Reject KYC
          </button>
          <button onClick={() => onSubmit(reward, true, notes, kycRef)} disabled={!kycRef.trim()}
            className="flex-1 py-2.5 bg-[#00288e] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Approve KYC
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EditRewardModal({ reward, onClose, onSubmit }: { reward: Reward; onClose: () => void; onSubmit: (data: Record<string, any>) => void }) {
  const [tier, setTier] = useState(reward.tier);
  const [amount, setAmount] = useState(reward.reward_amount_usd?.toString() || '');
  const [description, setDescription] = useState(reward.reward_description || '');
  const [rewardType, setRewardType] = useState<RewardType>(reward.reward_type);
  const [status, setStatus] = useState<RewardStatus>(reward.status);
  const [adminNotes, setAdminNotes] = useState(reward.admin_notes || '');

  const handleSubmit = () => {
    onSubmit({
      tier, reward_type: rewardType, reward_amount_usd: amount ? parseFloat(amount) : null,
      reward_description: description || null, status, admin_notes: adminNotes || null,
    });
  };

  return (
    <Modal title="Edit Reward" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-[#f1f3ff] rounded-xl p-3 text-sm text-[#141b2b]">
          <b>{reward.user_name}</b> · {reward.period_month} · {reward.track}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Tier</label>
            <select value={tier} onChange={e => setTier(e.target.value)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20">
              <option value="top_3">Top 3</option>
              <option value="top_10">Top 10</option>
              <option value="top_100">Top 100</option>
              <option value="top_1000">Top 1000</option>
              <option value="special">Special</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Reward Type</label>
            <select value={rewardType} onChange={e => setRewardType(e.target.value as RewardType)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20">
              <option value="giftcard">Gift Card</option>
              <option value="badge">Badge</option>
            </select>
          </div>
        </div>

        {rewardType === 'giftcard' && (
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Amount (USD)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01"
              placeholder="e.g. 50"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e]" />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Amazon Gift Card — July Top Scorer"
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as RewardStatus)}
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20">
            <option value="pending">Pending</option>
            <option value="kyc_review">KYC Review</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">Admin Notes</label>
          <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2}
            placeholder="Internal notes for this reward…"
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-[#c4c5d5] text-[#444653] rounded-xl text-sm font-semibold hover:bg-[#f1f3ff] transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#00288e] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CreateRewardModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [userId, setUserId] = useState('');
  const [track, setTrack] = useState<Track>('study');
  const [period, setPeriod] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [tier, setTier] = useState('top_3');
  const [rank, setRank] = useState('1');
  const [type, setType] = useState<RewardType>('giftcard');
  const [amount, setAmount] = useState('50');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!userId.trim()) { setError('User ID is required'); return; }
    setSubmitting(true); setError('');
    try {
      await apiFetch('/admin/rewards', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId.trim(), track, period_month: period, tier,
          rank_at_freeze: parseInt(rank), reward_type: type,
          reward_amount_usd: type === 'giftcard' ? parseFloat(amount) : null,
          reward_description: description || null,
        }),
      });
      onCreated();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal title="Create Reward Manually" onClose={onClose}>
      <div className="space-y-4">
        <div className="border border-[#c4c5d5] bg-[#f1f3ff] rounded-xl p-3">
          <p className="text-xs text-[#444653]">
            <b>Note:</b> Manual rewards are for edge cases (e.g., competition corrections, goodwill rewards).
            Monthly automated rewards are created by the leaderboard freeze job.
          </p>
        </div>

        {error && <div className="bg-[#ffdad6] text-[#93000a] px-3 py-2 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">User ID (UUID)</label>
          <input value={userId} onChange={e => setUserId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm font-mono text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Track</label>
            <select value={track} onChange={e => setTrack(e.target.value as Track)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20">
              <option value="study">Study</option>
              <option value="quiz">Quiz</option>
              <option value="overall">Overall</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Period</label>
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Tier</label>
            <select value={tier} onChange={e => setTier(e.target.value)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20">
              <option value="top_3">Top 3</option>
              <option value="top_10">Top 10</option>
              <option value="top_100">Top 100</option>
              <option value="top_1000">Top 1000</option>
              <option value="special">Special</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Rank at Freeze</label>
            <input type="number" value={rank} onChange={e => setRank(e.target.value)} min="1"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#444653] mb-1.5">Reward Type</label>
            <select value={type} onChange={e => setType(e.target.value as RewardType)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20">
              <option value="giftcard">Gift Card</option>
              <option value="badge">Badge</option>
            </select>
          </div>
          {type === 'giftcard' && (
            <div>
              <label className="block text-xs font-semibold text-[#444653] mb-1.5">Amount (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444653] mb-1.5">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Amazon Gift Card — Special Recognition"
            className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 py-2.5 border border-[#c4c5d5] text-[#444653] rounded-xl text-sm font-semibold hover:bg-[#f1f3ff] transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 bg-[#00288e] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {submitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            Create Reward
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4c5d5]">
          <h2 className="font-bold text-[#141b2b] text-lg">{title}</h2>
          <button onClick={onClose} className="text-[#757684] hover:text-[#141b2b] p-1 rounded-lg hover:bg-[#f1f3ff] transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
