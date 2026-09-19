'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/state-context';
import { BookOpen, GitPullRequest, CheckCircle2, Clock, XCircle, Send, Users, ShieldAlert } from 'lucide-react';

export default function LineagePage() {
  const { currentUser, profiles, lineageEdges, submitLineage } = useFamily();
  const [selectedParentId, setSelectedParentId] = useState('');
  const [relationType, setRelationType] = useState<'Father' | 'Mother'>('Father');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // User's own lineage edges
  const myEdges = lineageEdges.filter((e) => e.child_id === currentUser.id);
  const approvedFather = myEdges.find((e) => e.relation_type === 'Father' && e.approval_status === 'Approved');
  const approvedMother = myEdges.find((e) => e.relation_type === 'Mother' && e.approval_status === 'Approved');

  const possibleParents = profiles.filter(
    (p) => p.id !== currentUser.id && p.status === 'Active'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) return;

    setIsSubmitting(true);
    await submitLineage(selectedParentId, relationType, notes);
    setIsSubmitting(false);
    setSuccessMessage(`Lineage proposal for ${relationType} submitted successfully! Admins have been alerted.`);
    setSelectedParentId('');
    setNotes('');

    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Lineage Records</h1>
            <p className="text-xs text-slate-500">
              Submit and verify your ancestral connections to anchor your place on the visual Family Tree.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Current Verified Links Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Current Verified Parents
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Father */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Paternal (Father)
            </span>
            {approvedFather ? (
              <div className="flex items-center gap-3">
                <img
                  src={
                    profiles.find((p) => p.id === approvedFather.parent_id)?.avatar_url ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                  }
                  alt="Father"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {profiles.find((p) => p.id === approvedFather.parent_id)?.first_name}{' '}
                    {profiles.find((p) => p.id === approvedFather.parent_id)?.last_name}
                  </p>
                  <p className="text-xs text-emerald-700 font-mono">
                    {profiles.find((p) => p.id === approvedFather.parent_id)?.family_id}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">
                No verified father recorded yet.
              </div>
            )}
          </div>

          {/* Mother */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Maternal (Mother)
            </span>
            {approvedMother ? (
              <div className="flex items-center gap-3">
                <img
                  src={
                    profiles.find((p) => p.id === approvedMother.parent_id)?.avatar_url ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
                  }
                  alt="Mother"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {profiles.find((p) => p.id === approvedMother.parent_id)?.first_name}{' '}
                    {profiles.find((p) => p.id === approvedMother.parent_id)?.last_name}
                  </p>
                  <p className="text-xs text-emerald-700 font-mono">
                    {profiles.find((p) => p.id === approvedMother.parent_id)?.family_id}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">
                No verified mother recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Propose / Update Lineage Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-emerald-600" />
          Propose or Update Lineage Link
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Proposing a link will notify family administrators for verification before updating the live tree.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Connection Type
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as 'Father' | 'Mother')}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="Father">Father (Paternal)</option>
                <option value="Mother">Mother (Maternal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Family Relative
              </label>
              <select
                required
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="">-- Choose from family registry --</option>
                {possibleParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.family_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Notes for Admin (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Eldest son of Dr. Edet Obeff from the Calabar household..."
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedParentId}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting to Queue...' : 'Submit Link for Review'}</span>
          </button>
        </form>
      </div>

      {/* Lineage Request History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Submission History & Status</h2>
        <div className="divide-y divide-slate-100">
          {myEdges.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No lineage submissions recorded yet.</p>
          ) : (
            myEdges.map((edge) => {
              const parent = profiles.find((p) => p.id === edge.parent_id);
              return (
                <div key={edge.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {edge.relation_type}: {parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown'}
                      </span>
                      {edge.approval_status === 'Approved' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {edge.approval_status === 'Pending' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {edge.approval_status === 'Rejected' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </div>
                    {edge.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">{edge.notes}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(edge.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
