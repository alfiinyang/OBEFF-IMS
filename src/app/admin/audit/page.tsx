'use client';

import React from 'react';
import { useFamily } from '@/lib/state-context';
import { ShieldCheck, Calendar, User, Clock, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = useFamily();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">System Audit Trail</h1>
            <p className="text-xs text-slate-500">
              Immutable chronological records of administrative decisions, activations, and lineage approvals.
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action Executed</th>
                <th className="px-4 py-3.5">Admin Actor</th>
                <th className="px-4 py-3.5">Target Member</th>
                <th className="px-5 py-3.5">Metadata / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    {log.admin_name}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {log.target_user_name || 'System / Platform'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
