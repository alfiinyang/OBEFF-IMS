'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GitFork, Users, Megaphone, ArrowRight, UserPlus, LogIn, Lock } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 sm:py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-lg text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Crest */}
        <div>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-md mb-4">
            O
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-block">
            Official Family Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            OBEFF <span className="text-emerald-600">IMS</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
            A private, secure platform preserving our lineage records, verified genealogical tree, and official family updates.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <GitFork className="w-5 h-5 text-emerald-600 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800">Visual Lineage Tree</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Explore ancestry across verified generations.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Users className="w-5 h-5 text-teal-600 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800">Verified Directory</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Shielded contacts with permanent Family IDs.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Megaphone className="w-5 h-5 text-amber-500 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800">Priority Bulletins</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Never miss critical family announcements.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Lock className="w-5 h-5 text-blue-500 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800">Private & Shielded</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Ad-free with database Row-Level Security.</p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/login"
            className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2.5 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>

          <Link
            href="/signup"
            className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-200 hover:border-emerald-300 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2.5 shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Register as a Family Member</span>
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All new registrations require administrative identity verification.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
