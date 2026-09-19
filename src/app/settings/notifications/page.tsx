'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { Bell, Mail, Megaphone, Heart, MessageSquare, ShieldCheck, CheckCircle2, Save } from 'lucide-react';

export default function NotificationSettingsPage() {
  const { preferences, updatePreferences } = useFamily();
  const [formPrefs, setFormPrefs] = useState({
    email_announcements: preferences.email_announcements,
    email_new_posts: preferences.email_new_posts,
    email_engagements: preferences.email_engagements,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(formPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notification Settings</h1>
            <p className="text-xs text-slate-500">
              Customize how and when you receive family updates, announcements, and engagement emails.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your notification preferences have been saved!</span>
        </div>
      )}

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            Email Notification Preferences
          </h2>

          {/* 1. Announcements */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Official Family Announcements
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Receive instant email delivery whenever a family administrator pins a high-priority official announcement or general assembly bulletin.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={formPrefs.email_announcements}
                onChange={(e) =>
                  setFormPrefs({ ...formPrefs, email_announcements: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* 2. New Regular Posts */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  New Regular Family Posts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Receive an email alert when relatives publish everyday posts, celebrations, and life updates on the feed.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={formPrefs.email_new_posts}
                onChange={(e) =>
                  setFormPrefs({ ...formPrefs, email_new_posts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* 3. Engagements */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl mt-0.5">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Likes & Comments on Your Posts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Receive email alerts when a family member likes or comments on your posts.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={formPrefs.email_engagements}
                onChange={(e) =>
                  setFormPrefs({ ...formPrefs, email_engagements: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Mandatory System Notice */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              <strong>Mandatory Security & Administrative Notices:</strong> In accordance with family privacy rules, account activations, administrative role changes, account suspensions, and admin approval requests are <strong>always notified both in-app and by email</strong> to ensure accountability.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
