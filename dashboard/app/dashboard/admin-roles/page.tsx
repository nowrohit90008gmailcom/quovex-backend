'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, formatDate, cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  display_name: string | null;
  email: string | null;
  admin_role: 'superadmin' | 'support' | null;
  last_active: string | null;
  created_at: string;
}

interface RoleOption {
  value: string;
  label: string;
  bg: string;
  text: string;
}

function RoleBadge({ role }: { role: string | null }) {
  const roles: Record<string, RoleOption> = {
    superadmin: { value: 'superadmin', label: 'Superadmin', bg: 'bg-[#00288e]', text: 'text-white' },
    support: { value: 'support', label: 'Support', bg: 'bg-[#7c3aed]', text: 'text-white' },
  };
  const r = role ? roles[role] : null;
  if (!r) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1f3ff] text-[#444653]">
        User
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', r.bg, r.text)}>
      {r.label}
    </span>
  );
}

export default function AdminRolesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const { searchQuery } = usePageHeader({
    searchPlaceholder: 'Search by name or email...',
    addNewLabel: null,
  });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<AdminUser[]>('/admin/roles');
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    setSaving(userId);
    try {
      await apiFetch(`/admin/roles/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_role: newRole || null }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, admin_role: (newRole as AdminUser['admin_role']) || null } : u));
      showToast('Role updated successfully');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Update failed', false);
    } finally {
      setSaving(null);
    }
  };

  const filtered = users.filter(u =>
    !searchQuery ||
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const superadminCount = users.filter(u => u.admin_role === 'superadmin').length;
  const supportCount = users.filter(u => u.admin_role === 'support').length;

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b] md:text-[30px] md:leading-[38px] md:tracking-[-0.02em] md:font-bold">Admin Roles</h1>
          <p className="text-[16px] leading-[24px] text-[#444653] mt-1">Manage administrator access and permissions</p>
        </div>
        <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff] transition-colors active:scale-95">
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span className="text-[14px] leading-[20px] font-semibold">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Admins', value: users.length, icon: 'admin_panel_settings', color: '#00288e', bg: '#e9edff' },
          { label: 'Superadmins', value: superadminCount, icon: 'shield_person', color: '#00288e', bg: '#e9edff' },
          { label: 'Support', value: supportCount, icon: 'support_agent', color: '#7c3aed', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <span className="material-symbols-outlined text-[22px]" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[24px] leading-[32px] font-bold text-[#141b2b]">{s.value}</p>
              <p className="text-[14px] leading-[20px] text-[#757684]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Legend */}
      <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 mb-6">
        <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#444653] uppercase mb-4">Role Permissions</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { role: 'Superadmin', perms: ['Full platform access', 'Manage admin roles', 'Delete content', 'Financial data'], color: '#00288e' },
            { role: 'Support', perms: ['View users & sessions', 'Review anti-cheat flags', 'Process KYC', 'Send notifications'], color: '#7c3aed' },
          ].map(r => (
            <div key={r.role} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9ff]">
              <span className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: r.color }} />
              <div>
                <p className="text-[12px] leading-[16px] font-semibold text-[#141b2b] mb-1">{r.role}</p>
                {r.perms.map(p => (
                  <p key={p} className="text-[12px] leading-[16px] text-[#757684]">{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ba1a1a]">error</span>
          <p className="text-sm text-[#93000a]">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white border border-[#c4c5d5] rounded-xl">
          <span className="material-symbols-outlined animate-spin text-[32px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c4c5d5] bg-[#f1f3ff]">
                  {['Admin', 'Email', 'Current Role', 'Change Role', 'Last Active', 'Since'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-[14px] leading-[20px] font-semibold text-[#444653] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c5d5]/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <span className="material-symbols-outlined text-5xl text-[#c4c5d5] block mb-2">admin_panel_settings</span>
                      <p className="text-[14px] leading-[20px] text-[#757684]">No admin users found</p>
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#00288e] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {u.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-[14px] leading-[20px] font-semibold text-[#141b2b]">{u.display_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] leading-[20px] text-[#444653]">{u.email ?? '—'}</td>
                    <td className="px-6 py-4"><RoleBadge role={u.admin_role} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.admin_role ?? ''}
                          onChange={e => updateRole(u.id, e.target.value)}
                          disabled={saving === u.id}
                          className="pl-3 pr-8 py-1.5 border border-[#c4c5d5] rounded-lg text-xs font-medium bg-white text-[#141b2b] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">Regular User</option>
                          <option value="support">Support</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                        {saving === u.id && (
                          <span className="material-symbols-outlined animate-spin text-[18px] text-[#00288e]">progress_activity</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] leading-[20px] text-[#757684]">
                      {u.last_active ? formatDate(u.last_active) : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-[14px] leading-[20px] text-[#757684]">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
