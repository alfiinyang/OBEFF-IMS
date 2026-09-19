'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { Megaphone, Pin, Plus, CheckCircle2, Shield, Calendar } from 'lucide-react';

export default function AnnouncementsManagerPage() {
  const { posts, createPost } = useFamily();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const announcements = posts.filter((p) => p.is_admin_announcement);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    await createPost(content, mediaUrl || undefined, true, true);
    setIsSubmitting(false);
    setContent('');
    setMediaUrl('');
    setToast('Official priority announcement published and broadcasted to members!');
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Official Family Announcements</h1>
            <p className="text-xs text-slate-500">
              Publish high-priority official announcements that pin to the top of all user feeds and trigger email notifications.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Publisher Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          Publish New Official Announcement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Message
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Official update regarding upcoming general assembly or family milestone..."
              rows={4}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attached Video Link or Image URL (Optional)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
              <Pin className="w-3 h-3 text-amber-600" />
              Will be pinned at the top of the feed with priority visual styling.
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Broadcasting...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Current Active Announcements */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Current Active Announcements</h2>
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/30 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900">
                    Official Admin Bulletin
                  </span>
                  {item.is_pinned && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>

              <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-slate-500 flex items-center gap-2">
                <span>Published by: {item.author.first_name} {item.author.last_name}</span>
                <span>•</span>
                <span>{item.likes_count} Likes</span>
                <span>•</span>
                <span>{item.comments_count} Comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
