'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import PostCard from '@/components/feed/PostCard';
import PostMediaEmbed from '@/components/feed/PostMediaEmbed';
import {
  Pin,
  Send,
  Shield,
  Video,
  Image as ImageIcon,
  X,
  Sparkles,
} from 'lucide-react';

export default function FeedPage() {
  const { currentUser, posts, createPost } = useFamily();
  const [newContent, setNewContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isOfficialAnnouncement, setIsOfficialAnnouncement] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);

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

  // Filter posts: Quarantined posts are strictly hidden from general feed, visible only to admin and the author
  // Removed posts are only visible to author or admin
  const visiblePosts = posts.filter((p) => {
    if (p.status === 'quarantined') {
      return isAdmin || p.author_id === currentUser.id;
    }
    if (p.status === 'removed') {
      return isAdmin || p.author_id === currentUser.id;
    }
    return true;
  });

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
            <div className="pl-12 space-y-2">
              <div className="relative">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste direct image link (Unsplash, Imgur, etc.) or YouTube video URL..."
                  className="w-full text-xs p-2.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Client-Side Preview (Zero Server Storage) */}
              {mediaUrl.trim() && (
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Live Media Preview (Direct Embed • Zero Server Storage)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <PostMediaEmbed url={mediaUrl.trim()} allowLightbox={false} className="max-h-60" />
                </div>
              )}
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
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  showMediaInput || mediaUrl ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <Video className="w-4 h-4 text-emerald-600" />
                <span>Add Image / Video</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!newContent.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>Publish</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. TIMELINE FEED */}
      <div className="space-y-5">
        {visiblePosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-sm">
            No family updates yet. Be the first to share an update above!
          </div>
        ) : (
          visiblePosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
