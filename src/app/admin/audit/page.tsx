'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import {
  ShieldCheck,
  Search,
  Trash2,
  AlertTriangle,
  Flag,
  GitPullRequest,
  UserCheck,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = useFamily();
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs based on tag filter and search query
  const filteredLogs = auditLogs.filter((log) => {
    const matchesTag =
      selectedTag === 'ALL'
        ? true
        : selectedTag === 'DELETIONS'
        ? log.tag === 'Content-Deletion' || log.action_type.includes('DELETE')
        : selectedTag === 'APPEALS'
        ? log.tag === 'Quarantine-Appeal' || log.tag === 'Appeal-Resolution'
        : selectedTag === 'COMPLAINTS'
        ? log.tag === 'Complaint-Report' || log.action_type.includes('REPORT')
        : selectedTag === 'LINEAGE'
        ? log.tag?.startsWith('Lineage') || log.action_type.includes('LINEAGE')
        : selectedTag === 'REGISTRATIONS'
        ? log.tag?.startsWith('Account') || log.action_type.includes('ACCOUNT')
        : true;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (log.trackable_id && log.trackable_id.toLowerCase().includes(query)) ||
      (log.action_type && log.action_type.toLowerCase().includes(query)) ||
      (log.admin_name && log.admin_name.toLowerCase().includes(query)) ||
      (log.target_user_name && log.target_user_name.toLowerCase().includes(query)) ||
      (log.tag && log.tag.toLowerCase().includes(query)) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(query));

    return matchesTag && matchesSearch;
  });

  const getTagBadge = (tag?: string, trackableId?: string) => {
    if (tag === 'Content-Deletion' || trackableId?.startsWith('DEL')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          Content-Deletion
        </span>
      );
    }
    if (tag === 'Quarantine-Appeal' || tag === 'Appeal-Resolution' || trackableId?.startsWith('APL')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
          {tag || 'Quarantine-Appeal'}
        </span>
      );
    }
    if (tag === 'Complaint-Report' || trackableId?.startsWith('CMP')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          Complaint-Report
        </span>
      );
    }
    if (tag === 'Post-Quarantine' || trackableId?.startsWith('QRN')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
          Post-Quarantine
        </span>
      );
    }
    if (tag?.startsWith('Lineage') || trackableId?.startsWith('LIN')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
          {tag || 'Lineage'}
        </span>
      );
    }
    if (tag?.startsWith('Account') || trackableId?.startsWith('REG')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
          {tag || 'Account-Admin'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {tag || 'System'}
      </span>
    );
  };

  const getTrackableIdBadge = (trackableId?: string) => {
    if (!trackableId) {
      return <span className="text-slate-400 font-mono text-[11px]">-</span>;
    }
    let colorClass = 'bg-slate-100 text-slate-800 border-slate-300';
    if (trackableId.startsWith('DEL')) colorClass = 'bg-rose-50 text-rose-800 border-rose-300 font-extrabold';
    if (trackableId.startsWith('APL')) colorClass = 'bg-blue-50 text-blue-800 border-blue-300 font-extrabold';
    if (trackableId.startsWith('CMP')) colorClass = 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold';
    if (trackableId.startsWith('QRN')) colorClass = 'bg-orange-50 text-orange-800 border-orange-300 font-extrabold';
    if (trackableId.startsWith('LIN')) colorClass = 'bg-teal-50 text-teal-800 border-teal-300 font-extrabold';
    if (trackableId.startsWith('REG')) colorClass = 'bg-purple-50 text-purple-800 border-purple-300 font-extrabold';

    return (
      <span className={`px-2.5 py-0.5 rounded-lg font-mono text-xs border ${colorClass}`}>
        {trackableId}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">System Audit Trail & Records</h1>
            <p className="text-xs text-slate-500">
              Immutable chronological records of administrative decisions, content deletions, appeals, and trackable IDs.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Trackable ID, actor..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setSelectedTag('ALL')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            selectedTag === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Records ({auditLogs.length})
        </button>
        <button
          onClick={() => setSelectedTag('DELETIONS')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            selectedTag === 'DELETIONS'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Deletions [DEL]</span>
        </button>
        <button
          onClick={() => setSelectedTag('APPEALS')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            selectedTag === 'APPEALS'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Appeals [APL]</span>
        </button>
        <button
          onClick={() => setSelectedTag('COMPLAINTS')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            selectedTag === 'COMPLAINTS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Complaints [CMP]</span>
        </button>
        <button
          onClick={() => setSelectedTag('LINEAGE')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            selectedTag === 'LINEAGE'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-teal-700 hover:bg-teal-50 border border-teal-200'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Lineage [LIN]</span>
        </button>
        <button
          onClick={() => setSelectedTag('REGISTRATIONS')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            selectedTag === 'REGISTRATIONS'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Registrations [REG]</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Trackable ID</th>
                <th className="px-4 py-3.5">Category Tag</th>
                <th className="px-4 py-3.5">Action Executed</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Target</th>
                <th className="px-5 py-3.5">Details & Rationale</th>
                <th className="px-5 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getTrackableIdBadge(log.trackable_id)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getTagBadge(log.tag, log.trackable_id)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {log.admin_name}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {log.target_user_name || 'System / Platform'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-[11px] max-w-xs">
                      {log.metadata ? (
                        <div className="space-y-0.5">
                          {log.metadata.reason && (
                            <p className="font-medium text-slate-800">
                              Rationale: &quot;{log.metadata.reason}&quot;
                            </p>
                          )}
                          {log.metadata.resolution_notes && (
                            <p className="font-medium text-slate-800">
                              Notes: &quot;{log.metadata.resolution_notes}&quot;
                            </p>
                          )}
                          {log.metadata.appeal_message && (
                            <p className="italic text-slate-700">
                              Statement: &quot;{log.metadata.appeal_message}&quot;
                            </p>
                          )}
                          {log.metadata.content_snippet && (
                            <p className="italic text-slate-500 truncate">
                              Content: &quot;{log.metadata.content_snippet}&quot;
                            </p>
                          )}
                          {!log.metadata.reason &&
                            !log.metadata.resolution_notes &&
                            !log.metadata.appeal_message &&
                            !log.metadata.content_snippet && (
                              <span className="font-mono text-[10px] text-slate-400">
                                {JSON.stringify(log.metadata)}
                              </span>
                            )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
