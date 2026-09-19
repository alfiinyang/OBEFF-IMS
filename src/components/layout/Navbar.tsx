'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFamily } from '@/lib/state-context';
import NotificationBell from '../notifications/NotificationBell';
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
  ChevronDown,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useFamily();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);
  const isAdminSection = pathname.startsWith('/admin');
  const isPublicAuthPage = ['/', '/login', '/signup', '/pending'].includes(pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isPublicAuthPage) {
    return null;
  }

  const navLinks = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/tree', label: 'Family Tree', icon: GitFork },
    { href: '/directory', label: 'Directory', icon: Users },
    { href: '/lineage', label: 'My Lineage', icon: BookOpen },
  ];

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    router.push('/login');
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Super-Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
            {/* Admin Console Switcher Pill (Only for Admins / Super-Admins) */}
            {isAdmin && (
              <Link
                href={isAdminSection ? '/feed' : '/admin/dashboard'}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border shadow-xs ${
                  isAdminSection
                    ? 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {isAdminSection ? (
                  <>
                    <Home className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Family Feed</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Admin Console</span>
                  </>
                )}
              </Link>
            )}

            {/* In-app Notification Bell */}
            <NotificationBell />

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/80 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentUser.first_name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono font-medium">
                    {currentUser.family_id}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu Modal */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900">
                        {currentUser.first_name} {currentUser.last_name}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRoleBadgeStyle(
                          currentUser.role
                        )}`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">
                      ID: {currentUser.family_id}
                    </p>
                  </div>

                  {/* Navigation Options */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Contact</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 transition"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>Administrator Console</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
          <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-[11px] text-slate-500">{currentUser.family_id}</p>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              {currentUser.role}
            </span>
          </div>

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

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <User className="w-5 h-5 text-slate-400" />
            Profile & Settings
          </Link>

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200"
            >
              <Shield className="w-5 h-5 text-emerald-600" />
              Administrator Dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
