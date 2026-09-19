'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/lib/state-context';
import { notifyAdminsApprovalRequired } from '@/lib/notifications';
import { ShieldCheck, ArrowRight, Lock, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { UserProfile } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { profiles } = useFamily();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newApplicant: UserProfile = {
      id: `user-${Date.now()}`,
      family_id: `OBEFF-00${profiles.length + 101}`,
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      address: formData.address,
      date_of_birth: formData.dateOfBirth,
      role: 'Member',
      status: 'Pending',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      created_at: new Date().toISOString(),
    };

    // Notify all active admins in-app and by email (PRD mandatory requirement)
    const admins = profiles.filter((p) => ['Admin', 'Super-Admin'].includes(p.role) && p.status === 'Active');
    await notifyAdminsApprovalRequired(
      admins,
      newApplicant,
      'NEW_REGISTRATION',
      `New family member submitted registration details for ${formData.firstName} ${formData.lastName}.`
    );

    setIsSubmitting(false);
    router.push('/pending');
  };

  return (
    <div className="max-w-lg mx-auto my-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Family Member Sign Up</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Every new registration requires verification by a family administrator to protect lineage accuracy and privacy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First Name"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last Name"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Choose a strong password"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="City, State, Country"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Protected by Row-Level Security. Never visible to non-admin members.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Submitting Verification...' : 'Submit Application'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
