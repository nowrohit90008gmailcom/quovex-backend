'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Overview' },
  { href: '/dashboard/users', icon: 'group', label: 'Users' },
  { href: '/dashboard/students', icon: 'school', label: 'Students' },
  { href: '/dashboard/leaderboards', icon: 'leaderboard', label: 'Leaderboards' },
  { href: '/dashboard/rewards', icon: 'card_giftcard', label: 'Rewards', badge: 'KYC' },
  { href: '/dashboard/rewards/config', icon: 'settings_suggest', label: 'Reward Config' },
  { href: '/dashboard/anti-cheat', icon: 'security', label: 'Anti-Cheat' },
  { href: '/dashboard/quiz', icon: 'quiz', label: 'Quiz Questions' },
  { href: '/dashboard/exam-tags', icon: 'label', label: 'Exam Tags' },
  { href: '/dashboard/topics', icon: 'topic', label: 'Topics' },
  { href: '/dashboard/badges', icon: 'military_tech', label: 'Badges' },
  { href: '/dashboard/app-lock', icon: 'lock', label: 'App Lock' },
  { href: '/dashboard/referral', icon: 'group_add', label: 'Referral' },
  { href: '/dashboard/reports', icon: 'summarize', label: 'Reports' },
  { href: '/dashboard/otp-logs', icon: 'sms_failed', label: 'OTP Logs' },
  { href: '/dashboard/analytics', icon: 'query_stats', label: 'Analytics' },
  { href: '/dashboard/notifications', icon: 'notifications', label: 'Notifications' },
];

const BOTTOM_NAV = [
  { href: '/dashboard/admin-roles', icon: 'admin_panel_settings', label: 'Admin Roles' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ display_name?: string; admin_role?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/rewards') return pathname === '/dashboard/rewards';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#111827] border-r border-[#c4c5d5]/20 shadow-xl flex flex-col py-8 z-50 overflow-y-auto">
      {/* Brand */}
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
          <img src="/logo.png" alt="Quovex" className="w-8 h-8" />
          <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-white font-bold">Quovex</h2>
        </div>
        <p className="text-[#9CA3AF] text-[12px] leading-[16px] tracking-[0.05em] font-medium uppercase ml-11">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, icon, label, badge }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-4 active:scale-95',
                active
                  ? 'bg-[#1F2937] text-white border-l-4 border-[#1e40af]'
                  : 'text-[#9CA3AF] border-l-4 border-transparent hover:text-white hover:bg-[#1F2937]/50',
              )}>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {icon}
              </span>
              <span className="text-[14px] leading-[20px] font-semibold">{label}</span>
              {badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-[#fea619] text-[#2a1700] text-[10px] font-bold tracking-wide">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-4 border-t border-[#c4c5d5]/20 mx-3" />

        {BOTTOM_NAV.map(({ href, icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-4 active:scale-95',
                active
                  ? 'bg-[#1F2937] text-white border-l-4 border-[#1e40af]'
                  : 'text-[#9CA3AF] border-l-4 border-transparent hover:text-white hover:bg-[#1F2937]/50',
              )}>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {icon}
              </span>
              <span className="text-[14px] leading-[20px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 pt-6 border-t border-[#c4c5d5]/20">
        <div className="flex items-center justify-between group cursor-pointer hover:bg-[#1F2937] p-2 -mx-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e40af] flex items-center justify-center text-white text-sm font-bold border-2 border-[#fea619]/30 shrink-0">
              {user?.display_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[14px] leading-[20px] font-semibold">{user?.display_name || 'Admin User'}</span>
              <span className="text-[#9CA3AF] text-[12px] leading-[16px] tracking-[0.05em] font-medium capitalize">{user?.admin_role || 'Super Admin'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-[#9CA3AF] hover:text-[#ba1a1a] transition-colors p-1" title="Logout">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}