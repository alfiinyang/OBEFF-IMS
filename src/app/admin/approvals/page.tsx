'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import {
  UserCheck,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function ApprovalsPage() {
  const { profiles, lineageEdges, approveUser, rejectUser, approveLineage, rejectLineage } = useFamily();
  const [activeTab, setActiveTab] = useState<'users' | 'lineage'>('users');
  const [actionFeedback, setActionFeedback] = useState('');

  const pendingUsers = profiles.filter((p) => p.status === 'Pending');
  const pendingEdges = lineageEdges.filter((e) => e.approval_status === 'Pending');

  const handleApproveUser = async (id: string, name: string) => {
    await approveUser(id);
    setActionFeedback(`Successfully activated account for ${name}. In-app and email notifications dispatched.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleRejectUser = async (id: string, name: string) => {
    await rejectUser(id);
    setActionFeedback(`Rejected application for ${name}. Notification sent.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleApproveLineage = async (edgeId: string, childName: string) => {
    await approveLineage(edgeId);
    setActionFeedback(`Approved lineage link for ${childName}. Live family tree updated.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleRejectLineage = async (edgeId: string, childName: string) => {
    await rejectLineage(edgeId, 'Lineage details could not be validated against historical records.');
    setActionFeedback(`Rejected lineage proposal for ${childName}. Member notified.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Admin Approvals Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and authenticate pending user sign-ups and family tree lineage submissions.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Account Sign-Ups</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('lineage')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'lineage'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Lineage Requests</span>
            {pendingEdges.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-teal-500 text-white rounded-full">
                {pendingEdges.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 1. ACCOUNT REGISTRATIONS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-800">All Registrations Clear</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are no pending member sign-ups awaiting verification.
              </p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-amber-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={user.avatar_url}
                      alt={user.first_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/20"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-xs font-mono font-semibold text-emerald-700">
                        Reserved ID: {user.family_id}
                      </p>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-amber-200">
                        Awaiting Verification
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleRejectUser(user.id, `${user.first_name} ${user.last_name}`)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApproveUser(user.id, `${user.first_name} ${user.last_name}`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                  </div>
                </div>

                {/* Submitted PII Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{user.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>DOB: {user.date_of_birth || 'Unspecified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{user.address || 'No address'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. LINEAGE REQUESTS TAB */}
      {activeTab === 'lineage' && (
        <div className="space-y-4">
          {pendingEdges.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-teal-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-800">All Lineage Requests Clear</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are no pending parental link proposals awaiting verification.
              </p>
            </div>
          ) : (
            pendingEdges.map((edge) => {
              const child = profiles.find((p) => p.id === edge.child_id);
              const parent = profiles.find((p) => p.id === edge.parent_id);

              return (
                <div
                  key={edge.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                        Proposed {edge.relation_type} Connection
                      </span>
                      <div className="flex items-center gap-3 mt-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Child Applicant:</p>
                          <p className="font-bold text-sm text-slate-900">
                            {child ? `${child.first_name} ${child.last_name}` : 'Applicant'}
                          </p>
                          <p className="text-xs font-mono text-emerald-700">{child?.family_id}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Proposed Parent:</p>
                          <p className="font-bold text-sm text-slate-900">
                            {parent ? `${parent.first_name} ${parent.last_name}` : 'Relative'}
                          </p>
                          <p className="text-xs font-mono text-emerald-700">{parent?.family_id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() =>
                          handleRejectLineage(
                            edge.id,
                            child ? `${child.first_name} ${child.last_name}` : 'Member'
                          )
                        }
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() =>
                          handleApproveLineage(
                            edge.id,
                            child ? `${child.first_name} ${child.last_name}` : 'Member'
                          )
                        }
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Link Tree</span>
                      </button>
                    </div>
                  </div>

                  {edge.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
                      <strong>Applicant Verification Note:</strong> {edge.notes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
