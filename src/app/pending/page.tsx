'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Clock className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Under Review</h1>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        Thank you for submitting your details. To safeguard family privacy and lineage integrity, an administrator is currently reviewing your registration.
      </p>

      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left mb-6 space-y-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-700">
            <strong>Admin Notifications Dispatched:</strong> The designated family coordinators have been alerted by email and in-app notice.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <Mail className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-700">
            <strong>What happens next:</strong> Once approved, you will receive an in-app and email confirmation with your permanent <strong>Unique Family ID</strong>.
          </p>
        </div>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Sign In
      </Link>
    </div>
  );
}
