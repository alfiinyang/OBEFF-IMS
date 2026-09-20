'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { Post } from '@/types';
import PostMediaEmbed from './PostMediaEmbed';
import {
  Pin,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Sparkles,
  Shield,
  ShieldAlert,
  Video,
  Image as ImageIcon,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  Flag,
  AlertTriangle,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  showAuthorControlsOnly?: boolean; // When rendered in profile view
}

export default function PostCard({ post }: PostCardProps) {
  const {
    currentUser,
    toggleLikePost,
    addComment,
    editPost,
    deletePost,
    reportPost,
    quarantinePost,
    appealQuarantine,
    resolveAppeal,
    removePost,
    restorePost,
  } = useFamily();

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editMediaUrl, setEditMediaUrl] = useState(post.media_url || '');

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasonCategory, setReportReasonCategory] = useState('Inappropriate Content');
  const [reportReasonDetails, setReportReasonDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportSubmittedId, setReportSubmittedId] = useState<string | null>(null);

  // Appeal Modal state
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmittedId, setAppealSubmittedId] = useState<string | null>(null);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  // Admin Moderation Modal state
  const [showModModal, setShowModModal] = useState<'quarantine' | 'remove' | null>(null);
  const [modReason, setModReason] = useState('');

  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthor = currentUser.id === post.author_id;
  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);
  const isQuarantined = post.status === 'quarantined';
  const isRemoved = post.status === 'removed';
  const isPinnedAnnouncement = post.is_admin_announcement && post.is_pinned;

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    editPost(post.id, editContent, editMediaUrl.trim() || undefined);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this post? This action will permanently remove it from all records and log an immutable audit record.')) {
      deletePost(post.id, isAuthor ? 'Author self-deleted post' : 'Administrative deletion');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReasonDetails.trim()) return;
    const fullReason = `${reportReasonCategory}: ${reportReasonDetails.trim()}`;
    const trackableId = await reportPost(post.id, fullReason);
    setReportSubmittedId(trackableId);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportSubmittedId(null);
      setShowReportModal(false);
      setReportReasonDetails('');
    }, 3000);
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) return;
    setIsSubmittingAppeal(true);
    const trackableId = await appealQuarantine(post.id, appealReason.trim());
    setAppealSubmittedId(trackableId);
    setIsSubmittingAppeal(false);
    setTimeout(() => {
      setShowAppealModal(false);
      setAppealSubmittedId(null);
      setAppealReason('');
    }, 3000);
  };

  const handleExecuteModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modReason.trim()) return;

    if (showModModal === 'quarantine') {
      await quarantinePost(post.id, modReason.trim());
    } else if (showModModal === 'remove') {
      await removePost(post.id, modReason.trim());
    }
    setShowModModal(null);
    setModReason('');
  };

  // If permanently removed and viewer is not admin/author, hide completely
  if (isRemoved && !isAdmin && !isAuthor) {
    return null;
  }

  return (
    <article
      id={`post-${post.id}`}
      className={`rounded-3xl transition overflow-hidden ${
        isQuarantined
          ? 'bg-amber-50/40 border-2 border-amber-300 shadow-sm ring-4 ring-amber-500/5'
          : isPinnedAnnouncement
          ? 'bg-gradient-to-b from-emerald-50/70 to-white border-2 border-emerald-500/40 shadow-md ring-4 ring-emerald-500/5'
          : 'bg-white border border-slate-200/80 shadow-xs'
      }`}
    >
      {/* 1. Priority Header Badge for Admin Announcements */}
      {isPinnedAnnouncement && !isQuarantined && (
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-400 text-slate-900 rounded-lg">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Official Family Announcement
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <Pin className="w-3 h-3" />
            Pinned Priority
          </div>
        </div>
      )}

      {/* 2. Quarantine Banner */}
      {isQuarantined && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-100 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold">This post is under administrative quarantine</p>
                  <span className="px-2 py-0.2 text-[10px] font-mono font-bold bg-amber-700/60 rounded-full text-amber-100">
                    Hidden from general feed
                  </span>
                </div>
                {post.moderation_reason && (
                  <p className="text-[11px] text-amber-100 mt-0.5">
                    Reason: &quot;{post.moderation_reason}&quot;
                  </p>
                )}
                {post.moderated_by && (
                  <p className="text-[10px] text-amber-200 mt-0.5">
                    Quarantined by: {post.moderated_by}
                  </p>
                )}
              </div>
            </div>

            {/* Author Appeal Action or Status */}
            <div className="flex items-center gap-2">
              {isAuthor && (
                <>
                  {post.appeal?.status === 'pending' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-700/80 border border-amber-400/50 rounded-xl text-xs font-semibold text-amber-100 shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-200" />
                      <span>Appeal Pending ({post.appeal.id})</span>
                    </div>
                  ) : post.appeal?.status === 'rejected' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-100 font-medium">
                        Appeal rejected ({post.appeal.id})
                      </span>
                      <button
                        onClick={() => setShowAppealModal(true)}
                        className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-xs font-bold hover:bg-amber-50 transition cursor-pointer"
                      >
                        Re-Appeal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAppealModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white text-amber-900 text-xs font-bold hover:bg-amber-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Appeal Quarantine</span>
                    </button>
                  )}
                </>
              )}

              {isAdmin && (
                <button
                  onClick={() => restorePost(post.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-amber-400/40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Post</span>
                </button>
              )}
            </div>
          </div>

          {/* Appeal statement preview if submitted */}
          {post.appeal && (
            <div className="mt-2 pt-2 border-t border-amber-400/30 text-xs text-amber-100 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Appeal Reference: {post.appeal.id}</span>
                <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-white/20 uppercase tracking-wider">
                  Status: {post.appeal.status}
                </span>
              </div>
              <p className="text-[11px] italic bg-amber-700/40 p-2 rounded-xl text-amber-100">
                &quot;{post.appeal.message}&quot;
              </p>
              {post.appeal.resolution_notes && (
                <p className="text-[11px] text-amber-200">
                  Reviewer Decision Note: {post.appeal.resolution_notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Removed Banner (only visible to Author/Admin) */}
      {isRemoved && (
        <div className="bg-rose-600 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-100 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">This post was removed by an administrator</p>
              {post.moderation_reason && (
                <p className="text-[11px] text-rose-100 mt-0.5">
                  Reason: &quot;{post.moderation_reason}&quot;
                </p>
              )}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => restorePost(post.id)}
              className="px-2.5 py-1 rounded-lg bg-white text-rose-900 text-xs font-semibold hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Author Header & Action Menu */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={post.author.first_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {post.author.first_name} {post.author.last_name}
                </span>
                {['Admin', 'Super-Admin'].includes(post.author.role) && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    Elder / Admin
                  </span>
                )}
                {post.edited_at && (
                  <span className="text-[10px] text-slate-400 italic">
                    (edited)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {new Date(post.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Context Menu Dropdown (Author & Admin Controls) */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Post actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in duration-150 text-xs"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {/* Author Controls */}
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsEditing(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleDelete();
                      }}
                      className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete Post</span>
                    </button>
                  </>
                )}

                {/* Member Report Control */}
                {!isAuthor && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowReportModal(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Report Post</span>
                  </button>
                )}

                {/* Admin Moderation Controls */}
                {isAdmin && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Admin Moderation
                    </div>
                    {!isQuarantined && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowModModal('quarantine');
                        }}
                        className="w-full px-3.5 py-2 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quarantine Post</span>
                      </button>
                    )}
                    {!isRemoved && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowModModal('remove');
                        }}
                        className="w-full px-3.5 py-2 text-left text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Remove Post</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content (or Edit Form) */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-3 mb-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span>Editing Your Post</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              required
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
            <input
              type="url"
              value={editMediaUrl}
              onChange={(e) => setEditMediaUrl(e.target.value)}
              placeholder="Paste YouTube video or external image link..."
              className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
            {editMediaUrl.trim() && (
              <div className="pt-1">
                <p className="text-[10px] font-semibold text-slate-500 mb-1">Live Media Preview:</p>
                <PostMediaEmbed url={editMediaUrl.trim()} allowLightbox={false} className="max-h-56" />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line mb-4 font-normal">
            {post.content}
          </p>
        )}

        {/* Media Embeds (YouTube stream or direct client-rendered external image - zero server download) */}
        {!isEditing && post.media_url && (
          <div className="mb-4">
            <PostMediaEmbed url={post.media_url} alt={`Attachment from ${post.author.first_name}`} />
          </div>
        )}

        {/* Interaction Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLikePost(post.id)}
              className={`flex items-center gap-1.5 font-medium transition cursor-pointer ${
                post.has_liked ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${post.has_liked ? 'fill-rose-600 text-rose-600' : ''}`}
              />
              <span>{post.likes_count}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-emerald-700 font-medium transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || (post.comments ? post.comments.length : 0)} Comments</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthor && (
              <button
                onClick={() => setShowReportModal(true)}
                className="text-slate-400 hover:text-amber-600 transition p-1"
                title="Report Post"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-emerald-700 transition font-medium cursor-pointer"
              title="Share post internally"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comments Section Drawer */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a warm reply to your family..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2 mt-3">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl text-xs flex gap-2.5">
                    <img
                      src={c.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={c.author.first_name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {c.author.first_name} {c.author.last_name}
                      </p>
                      <p className="text-slate-600 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-2 text-xs text-slate-400">
                  No replies yet. Be the first to chime in!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Report Post Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            {reportSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Complaint Logged Successfully</h3>
                {reportSubmittedId && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-bold text-emerald-700">
                    Trackable Complaint ID: {reportSubmittedId}
                  </div>
                )}
                <p className="text-xs text-slate-500 leading-relaxed">
                  Thank you for helping safeguard the OBEFF community. Administrators have been notified with this reference ID to review this content.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900">Report Post to Admins</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Please specify why this post from <strong>{post.author.first_name} {post.author.last_name}</strong> should be reviewed by family administrators:
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category of Concern
                  </label>
                  <select
                    value={reportReasonCategory}
                    onChange={(e) => setReportReasonCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="Inappropriate Content">Inappropriate / Offensive Content</option>
                    <option value="Harassment / Unfriendly Tone">Harassment / Disrespectful Tone</option>
                    <option value="Misleading Information">False or Misleading Information</option>
                    <option value="Privacy Violation">Personal Privacy / Data Exposure</option>
                    <option value="Spam / Commercial Ads">Spam or Irrelevant Advertisements</option>
                    <option value="Other">Other Community Guideline Breach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Details / Explanation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportReasonDetails}
                    onChange={(e) => setReportReasonDetails(e.target.value)}
                    placeholder="Provide a clear description of the issue..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    A unique Complaint Reference ID (e.g. CMP-XXXXX) will be generated automatically for audit tracking.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReasonDetails.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Author Quarantine Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            {appealSubmittedId ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Appeal Submitted Successfully</h3>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-bold text-emerald-700">
                  Trackable Appeal ID: {appealSubmittedId}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your formal appeal statement has been dispatched to family administrators. You will be notified in-app and by email upon review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-sm text-slate-900">Appeal Quarantine Decision</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAppealModal(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl text-xs text-amber-800 leading-relaxed border border-amber-200">
                  <p className="font-semibold">Original Quarantine Reason:</p>
                  <p className="italic mt-0.5">&quot;{post.moderation_reason || 'Compliance with family decorum'}&quot;</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Statement / Grounds for Appeal <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Provide relevant context, clarification, or explanation why this post meets family standards..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    An auto-generated trackable ID (e.g. APL-XXXXX) will be assigned for administrative tracking.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAppealModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!appealReason.trim() || isSubmittingAppeal}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    {isSubmittingAppeal ? 'Submitting...' : 'Submit Appeal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Admin Moderation Dialog (Quarantine or Remove) */}
      {showModModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <form onSubmit={handleExecuteModeration} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {showModModal === 'quarantine' ? 'Quarantine Post' : 'Remove Post Completely'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModModal(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl text-xs text-amber-800 leading-relaxed border border-amber-200">
                <strong>Administrative Requirement:</strong> You must state a clear, documented rationale.
                The author (<strong>{post.author.first_name} {post.author.last_name}</strong>) will be notified immediately in-app and by email with your explanation.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Description / Reason for Action <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={modReason}
                  onChange={(e) => setModReason(e.target.value)}
                  placeholder="e.g. Content contains unverified claims that breach family decorum guidelines..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modReason.trim()}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition ${
                    showModModal === 'quarantine'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {showModModal === 'quarantine' ? 'Quarantine' : 'Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
