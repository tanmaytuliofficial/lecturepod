'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Library, 
  CalendarCheck2, 
  Cpu, 
  Search, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Mic2,
  Sparkles
} from 'lucide-react';

interface Props {
  user?: {
    id?: string;
    full_name?: string;
    email?: string;
    preferred_language?: string;
  } | null;
}

export function StudentNav({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Lecture Library', href: '/lectures', icon: Library },
    { label: 'Study Planner', href: '/planner', icon: CalendarCheck2 },
    { label: 'Device Management', href: '/devices', icon: Cpu },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Settings & Privacy', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs">
                <Mic2 className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-semibold text-base tracking-tight text-zinc-900">
                Lecture<span className="text-amber-600">Pod</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Profile & Actions */}
          <div className="flex items-center gap-3">
            {user?.preferred_language && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {user.preferred_language.toUpperCase()}
              </span>
            )}

            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-zinc-900">
                {user?.full_name || 'Student'}
              </div>
              <div className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                {user?.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-rose-600 p-2 rounded-lg hover:bg-zinc-100 transition border border-transparent hover:border-zinc-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                    <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="font-semibold text-sm text-zinc-900">LecturePod</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-zinc-500 hover:text-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 py-2 border-b border-zinc-100">
                <div className="text-sm font-semibold text-zinc-900">{user?.full_name || 'Student'}</div>
                <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
