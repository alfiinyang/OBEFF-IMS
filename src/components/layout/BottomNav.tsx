'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, GitFork, Users, BookOpen, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on auth screens or admin portal
  if (['/login', '/signup', '/pending'].includes(pathname) || pathname.startsWith('/admin')) {
    return null;
  }

  const links = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/tree', label: 'Tree', icon: GitFork },
    { href: '/directory', label: 'Directory', icon: Users },
    { href: '/lineage', label: 'Lineage', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-emerald-100 shadow-lg px-2 py-1.5 flex justify-around items-center">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-100/70' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
