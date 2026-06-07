'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FullLogo } from '@/components/LogoMark';

export default function LoginPage() {
  const router   = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطأ في تسجيل الدخول');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 py-8"
         style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a00 0%, #030712 60%)' }}>

      {/* ===== Logo ===== */}
      <div className="mb-10">
        <FullLogo />
      </div>

      {/* ===== Login card ===== */}
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="bg-gray-900/90 rounded-2xl p-7 space-y-5 border border-gray-800 shadow-2xl backdrop-blur"
        >
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm text-gray-400 font-medium">اسم المستخدم</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                placeholder="أدخل اسم المستخدم"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm text-gray-400 font-medium">كلمة المرور</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pr-10 pl-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                placeholder="أدخل كلمة المرور"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw
                  ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:bg-orange-900 disabled:text-orange-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide shadow-lg shadow-orange-900/30"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  جاري الدخول...
                </span>
              : 'دخول'
            }
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          تواصل مع المدير إذا نسيت كلمة المرور
        </p>
      </div>
    </div>
  );
}
