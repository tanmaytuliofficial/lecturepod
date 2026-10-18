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
    { label: 'LecturePod Device', href: '/devices', icon: Cpu },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Settings', href: '/settings', icon: Settings },
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
      <header className="sticky top-0 z-40 bg-[#F8F9FA]/85 backdrop-blur-xl border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-7">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-950 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white ring-1 ring-zinc-800 shadow-xs">
                <Mic2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-zinc-950">
                  Lecture<span className="text-amber-600">Pod</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-600">
                  Student Workspace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-xs ring-1 ring-zinc-800'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Profile & Actions */}
          <div className="flex items-center gap-3">
            {user?.preferred_language && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-amber-50/80 text-amber-900 border border-amber-200/80 font-semibold tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {user.preferred_language.toUpperCase()}
              </span>
            )}

            <div className="text-right hidden sm:block pl-2 border-l border-zinc-200">
              <div className="text-xs font-bold text-zinc-950 tracking-tight">
                {user?.full_name || 'Student'}
              </div>
              <div className="text-[10px] text-zinc-600 font-mono truncate max-w-[150px]">
                {user?.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50/80 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex">
          <div className="w-72 bg-white h-full p-6 shadow-2xl flex flex-col justify-between border-r border-zinc-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
                    <Mic2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="font-bold text-sm text-zinc-950">LecturePod</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 py-3 border-b border-zinc-100">
                <div className="text-sm font-bold text-zinc-950">{user?.full_name || 'Student'}</div>
                <div className="text-xs text-zinc-600 truncate">{user?.email}</div>
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-zinc-950 text-white'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
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
