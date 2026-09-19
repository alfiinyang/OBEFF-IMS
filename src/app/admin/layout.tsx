'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFamily } from '@/lib/state-context';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Megaphone,
  History,
  ShieldAlert,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, profiles, lineageEdges } = useFamily();

  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);

  const pendingCount =
    profiles.filter((p) => p.status === 'Pending').length +
    lineageEdges.filter((e) => e.approval_status === 'Pending').length;

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          You are currently signed in as a regular Family Member. The Administrator Console is exclusively accessible to designated Family Administrators and Council Elders.
        </p>
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Family Feed</span>
        </Link>
      </div>
    );
  }

  const adminTabs = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/approvals', label: 'Approvals Queue', icon: UserCheck, count: pendingCount },
    { href: '/admin/members', label: 'Member Directory', icon: Users },
    { href: '/admin/announcements', label: 'Priority Bulletins', icon: Megaphone },
    { href: '/admin/audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <div className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-200/80 mr-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">Admin Console</span>
          </div>

          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href="/feed"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition whitespace-nowrap hidden md:flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Feed</span>
        </Link>
      </div>

      {/* Main Admin Route Content */}
      <main>{children}</main>
    </div>
  );
}
