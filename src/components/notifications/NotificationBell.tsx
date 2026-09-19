'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '@/lib/state-context';
import { Bell, CheckCheck, Sliders, ShieldAlert, Megaphone, Heart, UserCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, currentUser, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } = useFamily();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = notifications.filter((n) => n.recipient_id === currentUser.id);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Approval':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'Announcement':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      case 'Engagement':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white animate-pulse">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  {unreadNotificationCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
              <Link
                href="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
                title="Notification Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {userNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No notifications right now.
              </div>
            ) : (
              userNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                    !n.is_read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 p-2 bg-white rounded-xl shadow-xs border border-slate-100 flex-shrink-0 h-fit">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.action_url && (
                        <Link
                          href={n.action_url}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/settings/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-emerald-700 font-medium hover:underline"
            >
              Configure Email & Alert Preferences
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
