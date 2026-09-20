'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { Post } from '@/types';
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

  // Helper to extract YouTube embed ID
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbed = post.media_url ? getYouTubeEmbedUrl(post.media_url) : null;
  const isImage = post.media_url && !youtubeEmbed && (post.media_url.match(/\.(jpeg|jpg|gif|png|webp)/i) || post.media_url.includes('unsplash.com'));

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
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePost(post.id);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReasonDetails.trim()) return;
    const fullReason = `${reportReasonCategory}: ${reportReasonDetails.trim()}`;
    await reportPost(post.id, fullReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
      setReportReasonDetails('');
    }, 2000);
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
        <div className="bg-amber-500 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-100 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">This post is under administrative quarantine</p>
              {post.moderation_reason && (
                <p className="text-[11px] text-amber-100 mt-0.5">
                  Reason: &quot;{post.moderation_reason}&quot;
                </p>
              )}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => restorePost(post.id)}
              className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-xs font-semibold hover:bg-amber-50 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Post</span>
            </button>
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
              placeholder="Media / Video Link (optional)..."
              className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
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

        {/* Media Embeds */}
        {!isEditing && youtubeEmbed && (
          <div className="mb-4 rounded-2xl overflow-hidden aspect-video border border-slate-200">
            <iframe
              src={youtubeEmbed}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {!isEditing && isImage && (
          <div className="mb-4 rounded-2xl overflow-hidden max-h-96 border border-slate-200">
            <img
              src={post.media_url}
              alt="Post visual attachment"
              className="w-full h-full object-cover"
            />
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
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base text-slate-900">Report Submitted</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Thank you for helping safeguard the OBEFF community. Administrators have been notified to review this content.
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReasonDetails.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold transition"
                  >
                    Submit Report
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
