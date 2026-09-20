'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import Link from 'next/link';
import PostCard from '@/components/feed/PostCard';
import CountryPhoneInput from '@/components/ui/CountryPhoneInput';
import { parsePhoneNumber } from '@/lib/phone-formatter';
import {
  User,
  Mail,
  MapPin,
  Bell,
  CheckCircle2,
  Shield,
  Save,
  MessageSquare,
  Heart,
  FileText,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, posts, updateProfile } = useFamily();
  const [activeTab, setActiveTab] = useState<'posts' | 'contact'>('posts');

  // Parse phone number into country code and local number
  const parsedPhone = parsePhoneNumber(currentUser.phone);
  const [countryCode, setCountryCode] = useState(parsedPhone.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone.phoneNumber);

  const [formData, setFormData] = useState({
    address: currentUser.address || '',
    avatarUrl: currentUser.avatar_url || '',
  });
  const [saved, setSaved] = useState(false);

  // Filter posts authored exclusively by currentUser
  const myPosts = posts.filter((p) => p.author_id === currentUser.id);

  // Aggregate engagement stats
  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes_count || 0), 0);
  const totalComments = myPosts.reduce(
    (acc, p) => acc + (p.comments_count || (p.comments ? p.comments.length : 0)),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = phoneNumber.trim() ? `${countryCode} ${phoneNumber.trim()}` : '';

    updateProfile({
      phone: fullPhone,
      address: formData.address,
      avatar_url: formData.avatarUrl,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Profile Overview Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser.first_name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-xs"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentUser.first_name} {currentUser.last_name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
              Permanent Family ID: {currentUser.family_id}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Link
                href="/settings/notifications"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>Notification Settings</span>
              </Link>
              {['Admin', 'Super-Admin'].includes(currentUser.role) && (
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile contact details updated successfully!</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>My Posts & Feed</span>
          <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[11px]">
            {myPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-slate-500" />
          <span>Personal Details & Contact</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-5">
          {/* Post Metrics Summary Card */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center">
              <p className="text-xl font-bold text-slate-900">{myPosts.length}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">My Total Posts</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center">
              <p className="text-xl font-bold text-rose-600">{totalLikes}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Likes Received</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center">
              <p className="text-xl font-bold text-teal-600">{totalComments}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Comments Received</p>
            </div>
          </div>

          {/* Member's Individual Post Timeline */}
          {myPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">No Posts Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t shared any personal updates or family stories yet. Your contributions will appear here for you to review, edit, or manage anytime.
              </p>
              <Link
                href="/feed"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
              >
                <span>Go to Family Feed & Share</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <PostCard key={post.id} post={post} showAuthorControlsOnly />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Contact & Personal Details Edit Form */
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Edit Personal Contact Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Phone Number with Country Code Dropdown and Auto-Formatting */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Phone Number (Auto-formatted by Country)
              </label>
              <CountryPhoneInput
                countryCode={countryCode}
                phoneNumber={phoneNumber}
                onCountryCodeChange={(code) => setCountryCode(code)}
                onPhoneNumberChange={(num) => setPhoneNumber(num)}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Numbers are spaced and formatted automatically (e.g. +234 708 005 5637) to match regional standards.
              </p>
            </div>

            {/* Residential Address */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, Country"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Profile Photo URL */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Profile Photo URL</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Contact Details</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
