'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { UserProfile, UserRole, UserStatus } from '@/types';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function MemberManagementPage() {
  const { profiles, updateUserRole, updateUserStatus, currentUser } = useFamily();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.family_id.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole, userName: string) => {
    await updateUserRole(userId, newRole);
    setToastMessage(`Updated ${userName}'s role to ${newRole}. In-app and email notification sent.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus, userName: string) => {
    await updateUserStatus(userId, newStatus);
    setToastMessage(`Changed ${userName}'s status to ${newStatus}. In-app and email notification sent.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Member Registry & Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full administrative directory with unmasked PII, role assignments, and account status controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member, ID, email..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-52 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Member Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Member Details</th>
                <th className="px-4 py-3.5">Contact & DOB (PII)</th>
                <th className="px-4 py-3.5">Address</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition">
                  {/* Name & ID */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url}
                        alt={user.first_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="font-mono text-[11px] text-emerald-700 font-semibold">
                          {user.family_id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact & DOB */}
                  <td className="px-4 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{user.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>DOB: {user.date_of_birth || 'Not recorded'}</span>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-slate-600 truncate flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{user.address || 'Address unlisted'}</span>
                    </p>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4">
                    <select
                      value={user.role}
                      disabled={user.id === currentUser.id}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as UserRole,
                          `${user.first_name} ${user.last_name}`
                        )
                      }
                      className="p-1 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                      <option value="Super-Admin">Super-Admin</option>
                    </select>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    {user.id !== currentUser.id && (
                      <div className="inline-flex items-center gap-1">
                        {user.status === 'Active' ? (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                user.id,
                                'Suspended',
                                `${user.first_name} ${user.last_name}`
                              )
                            }
                            className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition"
                            title="Suspend user account"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                user.id,
                                'Active',
                                `${user.first_name} ${user.last_name}`
                              )
                            }
                            className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition"
                            title="Reactivate user account"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
