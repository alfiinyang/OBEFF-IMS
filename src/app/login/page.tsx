'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/lib/state-context';
import { Shield, Lock, Mail, ArrowRight, Loader2, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useFamily();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);

      if (res.success) {
        router.push('/feed');
      } else if (res.status === 'Pending') {
        router.push('/pending');
      } else {
        setError(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 sm:py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-lg">
        {/* Return to Entry Portal */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Back to Welcome Page</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to OBEFF IMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Private Heritage, Lineage Tree & Family Communications
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@obeff.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <span className="text-[11px] text-slate-400">
                (Any text for local preview)
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            New to the family network?{' '}
            <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
              Register for verification
            </Link>
          </p>
        </div>

        {/* Pre-configured Test Accounts Helper Drawer */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-600 py-1"
          >
            <span className="flex items-center gap-1 font-medium">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              Test Account Credentials
            </span>
            <span>{showHelper ? 'Hide ▲' : 'Show ▼'}</span>
          </button>

          {showHelper && (
            <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Super Admin (Chief Obeff)</p>
                  <p className="font-mono text-[10px] text-slate-500">admin@obeff.org</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@obeff.org');
                    setPassword('admin123');
                  }}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold"
                >
                  Fill
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Extra Admin (Dr. Edet Obeff)</p>
                  <p className="font-mono text-[10px] text-slate-500">edet.admin@obeff.org</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('edet.admin@obeff.org');
                    setPassword('admin123');
                  }}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold"
                >
                  Fill
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Member 1 (Kufre Obeff)</p>
                  <p className="font-mono text-[10px] text-slate-500">kufre.member@obeff.org</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('kufre.member@obeff.org');
                    setPassword('member123');
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold"
                >
                  Fill
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Member 2 (Maria Obeff)</p>
                  <p className="font-mono text-[10px] text-slate-500">maria.member@obeff.org</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('maria.member@obeff.org');
                    setPassword('member123');
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold"
                >
                  Fill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
