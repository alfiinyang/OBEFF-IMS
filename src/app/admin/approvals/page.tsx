'use client';

import React, { useState, useEffect } from 'react';
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
  Flag,
  AlertTriangle,
  RotateCcw,
  Trash2,
  X,
  MessageSquare,
} from 'lucide-react';

export default function ApprovalsPage() {
  const {
    profiles,
    lineageEdges,
    posts,
    approveUser,
    rejectUser,
    approveLineage,
    rejectLineage,
    quarantinePost,
    removePost,
    restorePost,
    dismissReport,
  } = useFamily();

  const [activeTab, setActiveTab] = useState<'users' | 'lineage' | 'moderation'>('users');
  const [actionFeedback, setActionFeedback] = useState('');

  // Moderation modal state
  const [moderatingPostId, setModeratingPostId] = useState<string | null>(null);
  const [moderationAction, setModerationAction] = useState<'quarantine' | 'remove' | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  // Check URL search params on mount (e.g. ?tab=moderation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'moderation') setActiveTab('moderation');
      if (tabParam === 'lineage') setActiveTab('lineage');
    }
  }, []);

  const pendingUsers = profiles.filter((p) => p.status === 'Pending');
  const pendingEdges = lineageEdges.filter((e) => e.approval_status === 'Pending');

  // Reported or quarantined posts
  const reportedPosts = posts.filter(
    (p) => (p.reports && p.reports.some((r) => r.status === 'pending')) || p.status === 'quarantined'
  );
  const pendingReportCount = posts.reduce(
    (acc, p) => acc + (p.reports ? p.reports.filter((r) => r.status === 'pending').length : 0),
    0
  );

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

  const handleConfirmModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingPostId || !moderationReason.trim() || !moderationAction) return;

    if (moderationAction === 'quarantine') {
      await quarantinePost(moderatingPostId, moderationReason.trim());
      setActionFeedback('Post has been placed under quarantine. Author has been notified with your rationale.');
    } else if (moderationAction === 'remove') {
      await removePost(moderatingPostId, moderationReason.trim());
      setActionFeedback('Post has been permanently removed. Author has been notified with your rationale.');
    }

    setModeratingPostId(null);
    setModerationAction(null);
    setModerationReason('');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleDismissReport = (postId: string, reportId: string) => {
    dismissReport(postId, reportId);
    setActionFeedback('Report dismissed. Post remains published in good standing.');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleRestore = (postId: string) => {
    restorePost(postId);
    setActionFeedback('Post restored to public feed successfully.');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Admin Approvals & Moderation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authenticate pending member accounts, verify family tree lineage links, and review reported content.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
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

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'moderation'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-amber-500" />
            <span>Post Moderation</span>
            {pendingReportCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full animate-pulse">
                {pendingReportCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 1. Account Registrations Queue */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold text-slate-800 text-sm">Approvals Queue is Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are currently no new family member sign-ups awaiting verification.
              </p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={user.first_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">
                        {user.first_name} {user.last_name}
                      </h2>
                      <p className="text-xs font-mono font-semibold text-emerald-700">
                        Assigned ID: {user.family_id}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Applied: {new Date(user.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectUser(user.id, `${user.first_name} ${user.last_name}`)}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>DOB: {user.date_of_birth || 'Not specified'}</span>
                  </div>
                  {user.address && (
                    <div className="sm:col-span-3 flex items-start gap-2 pt-1 border-t border-slate-200/40">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Lineage Requests Queue */}
      {activeTab === 'lineage' && (
        <div className="space-y-4">
          {pendingEdges.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold text-slate-800 text-sm">No Pending Lineage Proposals</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All submitted family tree parentage proposals have been authenticated and linked.
              </p>
            </div>
          ) : (
            pendingEdges.map((edge) => {
              const child = profiles.find((p) => p.id === edge.child_id);
              const parent = profiles.find((p) => p.id === edge.parent_id);

              return (
                <div
                  key={edge.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
                        <GitPullRequest className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {child ? `${child.first_name} ${child.last_name}` : 'Unknown Child'}
                          </span>
                          <span className="text-xs text-slate-400">proposes</span>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                            {edge.relation_type}: {parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown Parent'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Applicant ID: {child?.family_id} • Target Parent ID: {parent?.family_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleRejectLineage(
                            edge.id,
                            child ? `${child.first_name} ${child.last_name}` : 'Member'
                          )
                        }
                        className="px-3.5 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
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

      {/* 3. Post Moderation & Reported Content Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {reportedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold text-slate-800 text-sm">No Reported Content</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No family posts have been reported or flagged for moderation. All shared stories are in good standing!
              </p>
            </div>
          ) : (
            reportedPosts.map((post) => {
              const pendingReports = (post.reports || []).filter((r) => r.status === 'pending');

              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs space-y-4 ${
                    post.status === 'quarantined'
                      ? 'border-amber-300 ring-2 ring-amber-500/10'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Status Banner */}
                  {post.status === 'quarantined' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Currently Quarantined: &quot;{post.moderation_reason}&quot;
                      </span>
                      <button
                        onClick={() => handleRestore(post.id)}
                        className="px-2.5 py-1 bg-white text-amber-900 rounded-lg text-[11px] font-bold border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
                      >
                        Restore Post
                      </button>
                    </div>
                  )}

                  {/* Post Info & Preview */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={post.author.first_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {post.author.first_name} {post.author.last_name}
                        </p>
                        <p className="text-[11px] font-mono text-emerald-700">
                          {post.author.family_id} • Posted on {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2">
                      {post.status !== 'quarantined' && (
                        <button
                          onClick={() => {
                            setModeratingPostId(post.id);
                            setModerationAction('quarantine');
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Quarantine</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setModeratingPostId(post.id);
                          setModerationAction('remove');
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Remove Post</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {post.content}
                    {post.media_url && (
                      <p className="mt-2 text-[11px] text-slate-500 truncate">
                        Media attachment: <span className="underline">{post.media_url}</span>
                      </p>
                    )}
                  </div>

                  {/* Reports Breakdown */}
                  {pendingReports.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-rose-500" />
                        <span>Member Reports ({pendingReports.length}):</span>
                      </p>

                      <div className="space-y-2">
                        {pendingReports.map((report) => (
                          <div
                            key={report.id}
                            className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-start justify-between gap-3 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-rose-900">
                                Reported by {report.reporter_name}
                              </p>
                              <p className="text-slate-700 mt-0.5">
                                Reason: &quot;{report.reason}&quot;
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(report.created_at).toLocaleString()}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDismissReport(post.id, report.id)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold border border-slate-200 transition cursor-pointer"
                            >
                              Dismiss Report
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Admin Action Reason Modal */}
      {moderatingPostId && moderationAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <form onSubmit={handleConfirmModeration} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {moderationAction === 'quarantine' ? 'Quarantine Post' : 'Permanently Remove Post'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModeratingPostId(null);
                    setModerationAction(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl text-xs text-amber-800 leading-relaxed border border-amber-200">
                <strong>Administrative Rule:</strong> You must state a clear, documented rationale. The author will be notified in-app and by email with your explanation.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Description / Reason for Action <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Provide a clear, respectful explanation for this moderation action..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModeratingPostId(null);
                    setModerationAction(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!moderationReason.trim()}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition cursor-pointer ${
                    moderationAction === 'quarantine'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {moderationAction === 'quarantine' ? 'Quarantine' : 'Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
