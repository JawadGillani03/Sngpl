/**
 * LoginScreen Component
 * Full-screen authentication gate for the GeoWell application.
 * Hardcoded credentials — frontend only.
 *
 * Default credentials:
 *   ID: Jawad Gillani   |  Password: jawad174@
 *   ID: Waqar Hussain   |  Password: waqar174@
 *   ID: Iftikhar Ahmad  |  Password: 9309@
 *
 * Add/change users in the VALID_USERS array below.
 */

import React, { useState, useRef, useEffect } from 'react';
import { RiDropFill, RiEyeLine, RiEyeOffLine, RiLockLine, RiUserLine, RiShieldLine } from 'react-icons/ri';

// ── Hardcoded credentials — change these ──────────────────────────
const VALID_USERS = [
  { id: 'Jawad Gillani',  password: 'jawad174@' },
  { id: 'Waqar Hussain',  password: 'waqar174@' },
  { id: 'Iftikhar Ahmad', password: '9309@'     },
  { id: 'User 1', password: '174@'     }
];
// ─────────────────────────────────────────────────────────────────

export default function LoginScreen({ onLogin, darkMode }) {
  const [userId,       setUserId]       = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [shaking,      setShaking]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const idRef = useRef(null);

  useEffect(() => { idRef.current?.focus(); }, []);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');

    if (!userId.trim() || !password) {
      setError('Please enter both User ID and password.');
      triggerShake();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const match = VALID_USERS.find(
        (u) => u.id === userId.trim() && u.password === password
      );

      if (match) {
        onLogin(match.id); // ← pass the user's name up
      } else {
        setLoading(false);
        setError('Invalid User ID or password. Please try again.');
        setPassword('');
        triggerShake();
        idRef.current?.focus();
      }
    }, 600);
  };

  const inputBase = `
    w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body
    border-2 outline-none transition-all duration-200
    focus:ring-2 focus:ring-petroleum-500/30
  `;

  const inputTheme = (hasError) => darkMode
    ? `bg-well-800 border-well-700 text-white placeholder-well-600
       focus:border-petroleum-500 ${hasError ? 'border-red-500/60' : ''}`
    : `bg-stone-50 border-stone-200 text-well-900 placeholder-stone-400
       focus:border-petroleum-400 ${hasError ? 'border-red-400' : ''}`;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        px-4 py-8 overflow-y-auto
        ${darkMode
          ? 'bg-well-950'
          : 'bg-gradient-to-br from-stone-100 via-white to-stone-50'
        }
      `}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-petroleum-600' : 'bg-petroleum-200'}`} />
        <div className={`absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-amber-600' : 'bg-amber-200'}`} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${darkMode ? '#fff' : '#000'} 1px, transparent 1px),
                              linear-gradient(90deg, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Login card */}
      <div className={`relative w-full max-w-sm ${shaking ? 'animate-shake' : ''}`}>
        <div className={`rounded-2xl border overflow-hidden shadow-2xl ${darkMode ? 'bg-well-900/90 border-well-800 backdrop-blur-xl' : 'bg-white/90 border-stone-200 backdrop-blur-xl'}`}>

          {/* Card header */}
          <div className={`px-6 pt-8 pb-6 text-center border-b ${darkMode ? 'border-well-800' : 'border-stone-100'}`}>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-petroleum-600 flex items-center justify-center shadow-petroleum">
                  <RiDropFill className="text-white text-2xl" />
                </div>
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-emerald-400 border-2 ${darkMode ? 'border-well-900' : 'border-white'}`}>
                  <RiShieldLine className="text-white text-[8px]" />
                </span>
              </div>
            </div>
            <h1 className={`font-display font-bold text-xl sm:text-2xl ${darkMode ? 'text-white' : 'text-well-900'}`}>
              GeoWell
            </h1>
            <p className={`font-body text-xs sm:text-sm mt-1 ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
              Proximity Analyzer · Sign in to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4" noValidate>

            {/* User ID */}
            <div className="relative">
              <label htmlFor="login-id" className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-well-300' : 'text-stone-600'}`}>
                User ID
              </label>
              <div className="relative">
                <RiUserLine className={`absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none ${darkMode ? 'text-well-500' : 'text-stone-400'}`} />
                <input
                  id="login-id"
                  ref={idRef}
                  type="text"
                  autoComplete="username"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your user ID"
                  disabled={loading}
                  className={`${inputBase} ${inputTheme(!!error)}`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="login-pw" className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-well-300' : 'text-stone-600'}`}>
                Password
              </label>
              <div className="relative">
                <RiLockLine className={`absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none ${darkMode ? 'text-well-500' : 'text-stone-400'}`} />
                <input
                  id="login-pw"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your password"
                  disabled={loading}
                  className={`${inputBase} pr-11 ${inputTheme(!!error)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors duration-150 ${darkMode ? 'text-well-500 hover:text-well-200' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  {showPassword ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs font-body ${darkMode ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-500'}`}
                role="alert"
              >
                <RiLockLine className="text-sm flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-xl mt-2
                font-display font-bold text-sm text-white
                bg-petroleum-600 hover:bg-petroleum-500
                shadow-petroleum transition-all duration-200
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-petroleum-400 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                <>
                  <RiShieldLine className="text-base" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={`px-6 py-3 border-t text-center ${darkMode ? 'border-well-800' : 'border-stone-100'}`}>
            <p className={`font-mono text-[10px] ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
              v1.0.0 · GeoWell Pro · Secured Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}