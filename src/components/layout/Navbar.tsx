'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFamily } from '@/lib/state-context';
import NotificationBell from '../notifications/NotificationBell';
import AdminSwitcher from './AdminSwitcher';
import {
  Users,
  GitFork,
  BookOpen,
  User,
  Home,
  Menu,
  X,
  Shield,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useFamily();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/tree', label: 'Family Tree', icon: GitFork },
    { href: '/directory', label: 'Directory', icon: Users },
    { href: '/lineage', label: 'My Lineage', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isAdminSection = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner if in Admin Portal */}
      {isAdminSection && (
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>You are operating in the OBEFF Administrator Portal</span>
          <Link href="/feed" className="underline hover:text-emerald-200 ml-2 font-semibold">
            Return to Family View
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/feed" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                O
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  OBEFF <span className="text-emerald-600">IMS</span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Family Records & Tree
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <AdminSwitcher />

            {/* In-app Notification Bell */}
            <NotificationBell />

            {/* User Profile Avatar Pill */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/80 transition"
            >
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={currentUser.first_name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.first_name}
                </p>
                <p className="text-[10px] text-emerald-700 font-mono font-medium">
                  {currentUser.family_id}
                </p>
              </div>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
          {['Admin', 'Super-Admin'].includes(currentUser.role) && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200"
            >
              <Shield className="w-5 h-5 text-emerald-600" />
              Administrator Dashboard
            </Link>
          )}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      )}
    </header>
  );
}
