'use client';

import React from 'react';
import { useFamily } from '@/lib/state-context';
import Link from 'next/link';
import {
  ShieldCheck,
  UserCheck,
  GitPullRequest,
  Megaphone,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { profiles, lineageEdges, posts, auditLogs, currentUser } = useFamily();

  const pendingUsers = profiles.filter((p) => p.status === 'Pending');
  const pendingLineage = lineageEdges.filter((e) => e.approval_status === 'Pending');
  const activeAnnouncements = posts.filter((p) => p.is_admin_announcement);
  const activeMembers = profiles.filter((p) => p.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-amber-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Family Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {currentUser.first_name}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Manage registrations, verify lineage connections, issue high-priority announcements, and safeguard the OBEFF family heritage records.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Accounts */}
        <Link
          href="/admin/approvals"
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            {pendingUsers.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingUsers.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Pending Registrations</p>
        </Link>

        {/* Pending Lineage */}
        <Link
          href="/admin/approvals"
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-2xl group-hover:scale-110 transition-transform">
              <GitPullRequest className="w-5 h-5" />
            </div>
            {pendingLineage.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingLineage.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Lineage Requests</p>
        </Link>

        {/* Total Active Members */}
        <Link
          href="/admin/members"
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeMembers.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Active Family Members</p>
        </Link>

        {/* Priority Announcements */}
        <Link
          href="/admin/announcements"
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeAnnouncements.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Official Bulletins</p>
        </Link>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Approvals Quick Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Review Pending Queues
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {pendingUsers.length + pendingLineage.length} Actions Required
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify new family member applications and confirm parental lineage connections before updating the live tree.
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/admin/approvals"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              <span>Open Approvals Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Member Directory Management Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Member Registry & Full PII
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Full Clearance
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              View complete directory data, assign or revoke Admin roles, manage status, and oversee generational branches.
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <span>Manage Member Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Admin Audit Activity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Recent Administrative Activity Log
          </h2>
          <Link href="/admin/audit" className="text-xs text-emerald-700 font-semibold hover:underline">
            View All Logs
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800">
                  {log.action_type.replace(/_/g, ' ')}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Admin <strong>{log.admin_name}</strong> on member{' '}
                  <strong>{log.target_user_name || 'System'}</strong>
                </p>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
