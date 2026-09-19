'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Calendar, Bell, CheckCircle2, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useFamily();
  const [formData, setFormData] = useState({
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    avatarUrl: currentUser.avatar_url || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      phone: formData.phone,
      address: formData.address,
      avatar_url: formData.avatarUrl,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser.first_name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {currentUser.first_name} {currentUser.last_name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
              Permanent Family ID: {currentUser.family_id}
            </p>
            <p className="text-xs text-slate-500 mt-1">{currentUser.email}</p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Link
                href="/settings/notifications"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>Notification Settings</span>
              </Link>
              {['Admin', 'Super-Admin'].includes(currentUser.role) && (
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-emerald-200"
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
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile contact details updated successfully!</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Edit Personal Contact Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Profile Photo URL</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
