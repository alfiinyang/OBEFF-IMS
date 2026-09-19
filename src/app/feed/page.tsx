'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import {
  Pin,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Sparkles,
  Shield,
  Video,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export default function FeedPage() {
  const { currentUser, posts, createPost, toggleLikePost, addComment } = useFamily();
  const [newContent, setNewContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isOfficialAnnouncement, setIsOfficialAnnouncement] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    await createPost(newContent, mediaUrl || undefined, isOfficialAnnouncement, isPinned);
    setNewContent('');
    setMediaUrl('');
    setIsOfficialAnnouncement(false);
    setIsPinned(false);
    setShowMediaInput(false);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  const handleShare = (postId: string) => {
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  // Helper to extract YouTube embed ID
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. POST COMPOSER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentUser.first_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={`Share an update or family celebration, ${currentUser.first_name}...`}
                rows={3}
                className="w-full p-2.5 text-sm rounded-xl border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none transition"
              />
            </div>
          </div>

          {showMediaInput && (
            <div className="pl-12">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Paste YouTube video link or image URL..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Admin Announcement Toggles */}
          {isAdmin && (
            <div className="pl-12 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={isOfficialAnnouncement}
                    onChange={(e) => {
                      setIsOfficialAnnouncement(e.target.checked);
                      if (e.target.checked) setIsPinned(true);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                  />
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Official Admin Announcement
                  </span>
                </label>

                {isOfficialAnnouncement && (
                  <span className="text-[11px] font-medium bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3 text-amber-700" />
                    Pinned Priority
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pl-12 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                  showMediaInput ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Add Media/Video</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!newContent.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Publish</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. TIMELINE FEED */}
      <div className="space-y-5">
        {posts.map((post) => {
          const isPinnedAnnouncement = post.is_admin_announcement && post.is_pinned;
          const youtubeEmbed = post.media_url ? getYouTubeEmbedUrl(post.media_url) : null;
          const isImage = post.media_url && !youtubeEmbed && (post.media_url.match(/\.(jpeg|jpg|gif|png|webp)/i) || post.media_url.includes('unsplash.com'));

          return (
            <article
              key={post.id}
              className={`rounded-3xl transition overflow-hidden ${
                isPinnedAnnouncement
                  ? 'bg-gradient-to-b from-emerald-50/70 to-white border-2 border-emerald-500/40 shadow-md ring-4 ring-emerald-500/5'
                  : 'bg-white border border-slate-200/80 shadow-xs'
              }`}
            >
              {/* Priority Header Badge for Admin Announcements */}
              {isPinnedAnnouncement && (
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

              <div className="p-5 sm:p-6">
                {/* Author Info */}
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
                </div>

                {/* Content Text */}
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line mb-4 font-normal">
                  {post.content}
                </p>

                {/* Rich Media Embeds */}
                {youtubeEmbed && (
                  <div className="mb-4 rounded-2xl overflow-hidden aspect-video border border-slate-200">
                    <iframe
                      src={youtubeEmbed}
                      title="YouTube preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                {isImage && (
                  <div className="mb-4 rounded-2xl overflow-hidden max-h-96 border border-slate-200">
                    <img
                      src={post.media_url}
                      alt="Post visual attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 font-medium transition ${
                        post.has_liked ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.has_liked ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                      <span>{post.likes_count}</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 hover:text-emerald-700 font-medium transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count} Comments</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1 hover:text-emerald-700 transition font-medium"
                    title="Share post internally"
                  >
                    {copiedPostId === post.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {activeCommentPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Write a warm reply to your family..."
                        className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Existing Comments List */}
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
                          Be the first to share a warm response!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
