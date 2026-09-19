'use client';

import React from 'react';
import { useFamily } from '@/lib/state-context';
import { ShieldCheck, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSwitcher() {
  const { currentUser, switchDemoRole } = useFamily();
  const pathname = usePathname();
  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);
  const isInAdminPortal = pathname.startsWith('/admin');

  return (
    <div className="flex items-center gap-2">
      {/* Demo Persona Switcher (For local testing of all roles) */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 text-xs">
        <span className="px-2 text-slate-500 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Persona:
        </span>
        <button
          onClick={() => switchDemoRole('Member')}
          className={`px-2.5 py-1 rounded-full font-medium transition ${
            currentUser.role === 'Member'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Member
        </button>
        <button
          onClick={() => switchDemoRole('Admin')}
          className={`px-2.5 py-1 rounded-full font-medium transition ${
            currentUser.role === 'Admin'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => switchDemoRole('Super-Admin')}
          className={`px-2.5 py-1 rounded-full font-medium transition ${
            currentUser.role === 'Super-Admin'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Super-Admin
        </button>
      </div>

      {/* Admin Portal Toggle Button */}
      {isAdmin && (
        <Link
          href={isInAdminPortal ? '/feed' : '/admin/dashboard'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
            isInAdminPortal
              ? 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          {isInAdminPortal ? (
            <>
              <User className="w-3.5 h-3.5" />
              <span>Back to Family Feed</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Console</span>
            </>
          )}
        </Link>
      )}
    </div>
  );
}
