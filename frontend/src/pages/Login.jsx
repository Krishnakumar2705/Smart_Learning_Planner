import React, { useState } from 'react';
import useStore from '../store/useStore';
import { BrainCircuit, ShieldAlert, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, register, googleLoginSimulate } = useStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isRegisterMode) {
      if (!username || !email || !password) {
        setAuthError('All fields are required');
        return;
      }
      const res = await register(username, email, password);
      if (!res.success) setAuthError(res.error);
    } else {
      if (!email || !password) {
        setAuthError('Email and password are required');
        return;
      }
      const res = await login(email, password);
      if (!res.success) setAuthError(res.error);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30 dark:bg-none dark:bg-[#05060b] overflow-hidden px-4">
      <div className="bg-glow-purple -top-40 -left-40"></div>
      <div className="bg-glow-blue -bottom-40 -right-40"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10 shadow-2xl border border-slate-200 dark:border-white/10 pulse-glow">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-3">
            <BrainCircuit className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 leading-none">Smart Learning Planner</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Hyper-personalized AI study maps & analytics</p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Username</label>
              <input
                type="text"
                placeholder="Karan Sharma"
                className="w-full px-4 py-2.5 glass-input text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@domain.com"
              className="w-full px-4 py-2.5 glass-input text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 glass-input text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <hr className="border-slate-200 dark:border-white/10" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-white dark:bg-[#0d0f19] text-slate-400 dark:text-gray-500 text-xs font-semibold">OR</span>
        </div>

        <button
          onClick={() => googleLoginSimulate(email, username)}
          type="button"
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-200 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-slate-300 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-semibold rounded-xl text-xs transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fillRule="evenodd" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Simulate Google Sign-In</span>
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-gray-400 mt-6">
          {isRegisterMode ? 'Already registered?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0 ml-1"
          >
            {isRegisterMode ? 'Log In' : 'Register Free'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
