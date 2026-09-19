'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { Search, Mail, Phone, MapPin, Calendar, ShieldCheck, Users, Lock } from 'lucide-react';

export default function DirectoryPage() {
  const { profiles, currentUser } = useFamily();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);

  const activeMembers = profiles.filter((p) => p.status === 'Active');

  const filtered = activeMembers.filter((m) => {
    const matchesSearch =
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.family_id.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.address && m.address.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'All' || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Family Member Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified contact records for approved members of the OBEFF lineage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or city..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-56 sm:w-64"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Super-Admin">Super-Admin</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>
        </div>
      </div>

      {/* RBAC Status Notice */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="text-emerald-900 font-medium">
                <strong>Administrator View:</strong> You have elevated RBAC authorization to view full addresses, DOBs, and emergency contacts.
              </span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-slate-600">
                <strong>Privacy Shield Active:</strong> Residential addresses and dates of birth are protected under family privacy rules.
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-emerald-800 font-bold hidden sm:inline-block">
          {filtered.length} Active Records
        </span>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={member.first_name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-xs font-mono font-semibold text-emerald-700">
                  {member.family_id}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    member.role === 'Super-Admin'
                      ? 'bg-amber-100 text-amber-900'
                      : member.role === 'Admin'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>

              {/* PII Shield Handling */}
              {isAdmin || member.id === currentUser.id ? (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{member.phone || 'Phone unlisted'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>DOB: {member.date_of_birth || 'Not recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{member.address || 'Address unlisted'}</span>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Personal address & DOB shielded
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
