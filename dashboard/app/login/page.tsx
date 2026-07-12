'use client';
import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Invalid credentials');
      }
      const data = await res.json();
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user || {}));
      // BUG FIX: remember checkbox state was tracked but never applied to cookie max-age
      const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
      document.cookie = `admin_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Strict`;
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#141b2b] font-['Inter'] overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00288e]/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#fea619]/5 blur-3xl" />
      </div>

      <main
        className="flex-grow flex items-center justify-center p-4 md:p-8 relative z-10"
        id="parallax-container"
        onMouseMove={(e) => {
          const card = document.getElementById('login-card');
          if (!card) return;
          const xAxis = (window.innerWidth / 2 - e.clientX) / 40;
          const yAxis = (window.innerHeight / 2 - e.clientY) / 40;
          const clampX = Math.max(-8, Math.min(8, xAxis));
          const clampY = Math.max(-8, Math.min(8, yAxis));
          card.style.transform = `rotateY(${clampX}deg) rotateX(${-clampY}deg) translateZ(10px)`;
        }}
        onMouseLeave={() => {
          const card = document.getElementById('login-card');
          if (!card) return;
          card.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
          card.style.transition = 'transform 0.5s ease-out';
        }}
        onMouseEnter={() => {
          const card = document.getElementById('login-card');
          if (!card) return;
          card.style.transition = 'transform 0.1s ease-out';
        }}
      >
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00288e] flex items-center justify-center shadow-lg shadow-[#00288e]/20 mb-2">
              <span className="material-symbols-outlined text-[32px] text-white">timer</span>
            </div>
            <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#00288e]">StudyTimer</h1>
            <p className="text-[18px] leading-[28px] text-[#444653]">Admin Console</p>
          </div>

          {/* Login Card */}
          <div
            id="login-card"
            className="w-full bg-white rounded-xl p-8 shadow-sm border border-[#c4c5d5]/30 flex flex-col gap-6 relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-[24px] leading-[32px] tracking-[-0.01em] font-semibold text-[#141b2b]">Sign In</h2>
              <p className="text-[14px] leading-[20px] text-[#444653]">Enter your credentials to access the console.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] rounded-lg p-3 text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#141b2b]" htmlFor="email">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#444653] text-[20px]">mail</span>
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    defaultValue=""
                    autoComplete="email"
                    placeholder="admin@studytimer.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9ff] rounded-lg border border-[#c4c5d5] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 transition-all text-[14px] text-[#141b2b] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#141b2b]" htmlFor="password">Password</label>
                  <a className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#00288e] hover:text-[#1e40af] transition-colors" href="#">Forgot password?</a>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#444653] text-[20px]">lock</span>
                  <input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    defaultValue=""
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f9f9ff] rounded-lg border border-[#c4c5d5] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 transition-all text-[14px] text-[#141b2b] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#444653] hover:text-[#141b2b] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#c4c5d5] text-[#00288e] focus:ring-[#00288e]/20"
                />
                <label htmlFor="remember" className="text-[14px] text-[#444653]">Remember me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-[#00288e] hover:bg-[#1e40af] text-white text-[14px] leading-[20px] font-semibold rounded-lg shadow-sm shadow-[#00288e]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4 md:px-8 border-t border-[#c4c5d5]/30 text-[#444653] z-10 bg-[#f9f9ff]/80 backdrop-blur-sm">
        <p className="text-[12px] leading-[16px] tracking-[0.05em] font-medium mb-4 sm:mb-0">© 2024 StudyTimer Inc. All rights reserved.</p>
        <div className="flex gap-4 text-[12px] leading-[16px] tracking-[0.05em] font-medium">
          <a className="hover:text-[#00288e] transition-colors" href="/privacy">Privacy Policy</a>
          <a className="hover:text-[#00288e] transition-colors" href="/terms">Terms of Service</a>
          <a className="hover:text-[#00288e] transition-colors" href="/support">Support</a>
        </div>
      </footer>
    </div>
  );
}