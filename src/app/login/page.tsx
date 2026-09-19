'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/lib/state-context';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { profiles, setCurrentUser } = useFamily();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setError('No account found with this email address. Please register.');
      return;
    }

    if (user.status === 'Pending') {
      router.push('/pending');
      return;
    }

    if (user.status === 'Suspended') {
      setError('This account has been suspended by a family administrator.');
      return;
    }

    setCurrentUser(user);
    router.push('/feed');
  };

  const handleDemoLogin = (userEmail: string) => {
    const user = profiles.find((p) => p.email === userEmail);
    if (user) {
      setCurrentUser(user);
      router.push('/feed');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in to OBEFF IMS</h1>
        <p className="text-sm text-slate-500 mt-1">
          Private Heritage, Lineage Tree & Family Communications
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
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
              placeholder="e.g. yourname@family.org"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Demo Login Personas */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Test - One-Click Sign In:
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('dr.edet@family.org')}
            className="w-full text-left p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-800">Dr. Edet Obeff</p>
              <p className="text-[10px] text-emerald-700 font-medium">Admin & Family Member</p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              Select <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('elder.obeff@family.org')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-800">Eteidung Obeff</p>
              <p className="text-[10px] text-slate-500">Super-Admin & Family Patriarch</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Select</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('kufre.obeff@family.org')}
            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-800">Kufre Obeff</p>
              <p className="text-[10px] text-slate-500">Regular Family Member</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Select</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-slate-500">
          New to the family network?{' '}
          <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
            Register for verification
          </Link>
        </p>
      </div>
    </div>
  );
}
