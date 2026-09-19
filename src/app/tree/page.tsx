'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { UserProfile } from '@/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Users,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  GitBranch,
} from 'lucide-react';

export default function FamilyTreePage() {
  const { profiles, currentUser } = useFamily();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);

  // Group members into generational hierarchy for tree rendering
  const gen1 = profiles.filter((p) => ['user-001', 'user-002'].includes(p.id));
  const gen2 = profiles.filter((p) => ['user-003'].includes(p.id));
  const gen3 = profiles.filter((p) => ['user-004', 'user-005'].includes(p.id));

  const filteredMembers = searchQuery
    ? profiles.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.family_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-600" />
            Interactive Family Tree
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified genealogical connections spanning multiple generations of the OBEFF lineage.
          </p>
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member or ID..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-44 sm:w-60"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-600">
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.4))}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7))}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 border border-slate-200/80 shadow-xs overflow-x-auto min-h-[560px] flex flex-col items-center justify-center">
        {filteredMembers ? (
          <div className="w-full max-w-xl">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
              Search Results ({filteredMembers.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 cursor-pointer shadow-xs hover:shadow-md transition flex items-center gap-3"
                >
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={m.first_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="text-xs text-emerald-700 font-mono font-medium">{m.family_id}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{m.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 flex flex-col items-center space-y-12 py-6 w-full max-w-4xl"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* TIER 1: PATRIARCH & MATRIARCH */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                Generation 1 • Elders & Roots
              </span>
              <div className="flex items-center gap-8 sm:gap-16">
                {gen1.map((elder) => (
                  <div
                    key={elder.id}
                    onClick={() => setSelectedMember(elder)}
                    className="bg-white rounded-2xl p-4 border-2 border-emerald-500/40 shadow-sm hover:shadow-md hover:border-emerald-600 transition cursor-pointer text-center w-40 sm:w-48 group"
                  >
                    <img
                      src={elder.avatar_url}
                      alt={elder.first_name}
                      className="w-16 h-16 rounded-full mx-auto object-cover ring-4 ring-emerald-100 group-hover:scale-105 transition-transform mb-2"
                    />
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {elder.first_name} {elder.last_name}
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-mono font-semibold mt-0.5">
                      {elder.family_id}
                    </p>
                    <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {elder.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Connector */}
            <div className="w-0.5 h-8 bg-emerald-300 relative">
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            {/* TIER 2: BRANCH COORDINATORS / CHILDREN */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                Generation 2 • Branches
              </span>
              <div className="flex items-center gap-8">
                {gen2.map((leader) => (
                  <div
                    key={leader.id}
                    onClick={() => setSelectedMember(leader)}
                    className="bg-white rounded-2xl p-4 border-2 border-teal-500/40 shadow-sm hover:shadow-md hover:border-teal-600 transition cursor-pointer text-center w-40 sm:w-48 group"
                  >
                    <img
                      src={leader.avatar_url}
                      alt={leader.first_name}
                      className="w-16 h-16 rounded-full mx-auto object-cover ring-4 ring-teal-100 group-hover:scale-105 transition-transform mb-2"
                    />
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {leader.first_name} {leader.last_name}
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-mono font-semibold mt-0.5">
                      {leader.family_id}
                    </p>
                    <span className="text-[10px] text-teal-700 font-bold mt-1 inline-block bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {leader.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Connector */}
            <div className="w-0.5 h-8 bg-emerald-300 relative">
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            {/* TIER 3: DESCENDANTS & YOUTH */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                Generation 3 • Descendants
              </span>
              <div className="flex items-center gap-6 sm:gap-10">
                {gen3.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedMember(child)}
                    className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition cursor-pointer text-center w-36 sm:w-44 group ${
                      child.status === 'Pending'
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    <img
                      src={child.avatar_url}
                      alt={child.first_name}
                      className="w-14 h-14 rounded-full mx-auto object-cover ring-2 ring-slate-100 group-hover:scale-105 transition-transform mb-2"
                    />
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {child.first_name} {child.last_name}
                    </h3>
                    <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                      {child.family_id}
                    </p>
                    {child.status === 'Pending' ? (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Verification Pending
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 mt-1 inline-block">
                        {child.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MEMBER DETAILS MODAL (Enforces RBAC Privacy) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <img
                src={selectedMember.avatar_url}
                alt={selectedMember.first_name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-emerald-500/20 mb-3"
              />
              <h2 className="text-lg font-bold text-slate-900">
                {selectedMember.first_name} {selectedMember.last_name}
              </h2>
              <p className="text-xs font-mono font-semibold text-emerald-700">
                {selectedMember.family_id}
              </p>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full inline-block mt-2">
                {selectedMember.role}
              </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{selectedMember.email}</span>
              </div>

              {/* PII Privacy Shield: Full contact & DOB visible only to Admins or Self */}
              {isAdmin || selectedMember.id === currentUser.id ? (
                <>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{selectedMember.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Born: {selectedMember.date_of_birth || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{selectedMember.address || 'Address unlisted'}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl text-[10px] text-emerald-800 font-medium flex items-center gap-1.5 mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Admin PII Clearance Active</span>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center leading-relaxed">
                  🔒 Residential address and date of birth are shielded for personal privacy.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
