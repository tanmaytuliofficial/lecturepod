'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { 
  LayoutDashboard, 
  Library, 
  CalendarCheck2, 
  Radio, 
  Search, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Mic2,
  Sparkles,
  Sun,
  Moon,
  Zap,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Volume2,
  FileText,
  Layers,
  HelpCircle,
  ArrowLeft,
  Bot
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  user?: {
    id?: string;
    full_name?: string;
    email?: string;
    college_school?: string;
    course_branch?: string;
    preferred_language?: string;
  } | null;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  workspace?: 'study' | 'device' | 'default';
}

export function StudentLayout({ children, user, breadcrumbs = [], workspace = 'default' }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [simulatingSync, setSimulatingSync] = useState(false);
  const [simulatingPair, setSimulatingPair] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const isStudyMode = workspace === 'study' || pathname.startsWith('/lectures') || pathname.startsWith('/test') || pathname.startsWith('/planner');
  const isDeviceMode = workspace === 'device' || pathname.startsWith('/devices');

  const navGroups = isStudyMode
    ? [
        {
          group: 'ACADEMIC OFFERINGS',
          items: [
            { label: 'Portal Hub', href: '/dashboard', icon: ArrowLeft },
            { label: 'All Lectures', href: '/lectures', icon: Library },
            { label: 'Classroom Audios', href: '/lectures?tab=audios', icon: Volume2 },
            { label: 'Structured Notes', href: '/lectures?tab=notes', icon: FileText },
            { label: 'Practice & Quizzes', href: '/test?tab=quizzes', icon: HelpCircle },
            { label: '3D Flashcards', href: '/test?tab=flashcards', icon: Layers },
            { 
              label: 'AI Study Mentor', 
              href: '/lectures?tab=mentor', 
              icon: Bot, 
              badge: 'AI COACH', 
              badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' 
            },
          ],
        },
        {
          group: 'STUDY TOOLS',
          items: [
            { label: 'Study Planner', href: '/planner', icon: CalendarCheck2 },
            { label: 'Concept Search', href: '/search', icon: Search },
            { label: 'Settings & Profile', href: '/settings', icon: Settings },
          ],
        },
      ]
    : [
        {
          group: 'LEARN & REVISE',
          items: [
            { label: 'Portal Hub', href: '/dashboard', icon: ArrowLeft },
            { label: 'Study Library', href: '/lectures', icon: Library },
            { label: 'Test & Quizzes', href: '/test', icon: Sparkles },
            { label: 'Study Planner', href: '/planner', icon: CalendarCheck2 },
          ],
        },
        {
          group: 'HARDWARE MANAGEMENT',
          items: [
            { 
              label: 'LecturePod Device', 
              href: '/devices', 
              icon: Radio,
              badge: 'ONLINE',
              badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            },
            { label: 'Concept Search', href: '/search', icon: Search },
          ],
        },
        {
          group: 'PREFERENCES',
          items: [
            { label: 'Settings & Privacy', href: '/settings', icon: Settings },
          ],
        },
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

  const handleSimulateSync = async () => {
    setSimulatingSync(true);
    try {
      const res = await fetch('/api/demo/simulate-sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Simulated lecture recorded & synced!');
        router.refresh();
      } else {
        showNotification(data.error || 'Failed to simulate sync');
      }
    } catch (e) {
      showNotification('Network error while simulating sync');
    } finally {
      setSimulatingSync(false);
    }
  };

  const handleSimulatePair = async () => {
    setSimulatingPair(true);
    try {
      const res = await fetch('/api/demo/pair-device', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Simulated device connected online!');
        router.refresh();
      } else {
        showNotification(data.error || 'Failed to pair simulated device');
      }
    } catch (e) {
      showNotification('Network error while simulating device');
    } finally {
      setSimulatingPair(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const displayName = user?.full_name || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ring-1 ring-zinc-800 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white dark:bg-[#0D0D10] border-r border-zinc-200/80 dark:border-zinc-800/80 z-40 select-none transition-colors duration-200">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-zinc-900 flex items-center justify-center text-white ring-1 ring-zinc-800 shadow-sm group-hover:scale-105 transition">
              <Mic2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5">
                Lecture<span className="text-amber-500">Pod</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  STUDY
                </span>
              </span>
              <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                AI Learning Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-zinc-400 dark:text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${item.badgeColor || 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Study Mode: AI Mentor Widget | Device Mode: Hardware Suite */}
          {isStudyMode ? (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>LecturePod AI Mentor</span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Clear doubts from any classroom lecture instantly in English or Hinglish.
              </p>
              <Link
                href="/lectures?tab=mentor"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-[11px] font-bold transition shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-400 dark:text-amber-600" />
                <span>Ask Doubt to Mentor →</span>
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Hardware Demo Suite</span>
              </div>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Hardware in production? Test the entire physical sync & capture flow right now.
              </p>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={handleSimulateSync}
                  disabled={simulatingSync}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[11px] font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {simulatingSync ? 'Simulating...' : 'Simulate Audio Sync'}
                </button>
                <button
                  onClick={handleSimulatePair}
                  disabled={simulatingPair}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  <Radio className="w-3 h-3 text-emerald-500" />
                  {simulatingPair ? 'Pairing...' : 'Simulate Device Pair'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Theme Toggle & Profile */}
        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
          {/* Black & White Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition"
            title="Toggle Black & White Dark Mode"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{isDark ? 'Dark Mode (On)' : 'Light Mode (On)'}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              B&W
            </span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <Link href="/settings" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {initial}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-500 transition">
                  {displayName}
                </span>
                <span className="text-[10px] text-zinc-600 dark:text-zinc-300 truncate">
                  {user?.preferred_language ? user.preferred_language.toUpperCase() : 'STUDENT'}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE SLIDE-OVER DRAWER ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0D0D10] h-full flex flex-col shadow-2xl z-10 p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-amber-400">
                  <Mic2 className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm tracking-tight">LecturePod</span>
              </Link>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5">
              {navGroups.map((grp) => (
                <div key={grp.group} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1">
                    {grp.group}
                  </div>
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2">
                  {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#09090B]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 transition"
              title="Return to 3-Option Portal Hub"
            >
              <span>← Hub</span>
            </Link>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-zinc-600 dark:text-zinc-300 hidden sm:inline">LecturePod</span>
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((b, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                    {b.href ? (
                      <Link href={b.href} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-zinc-950 dark:text-white font-bold">{b.label}</span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                  <span className="text-zinc-950 dark:text-white font-bold capitalize">
                    {pathname.replace('/', '') || 'Dashboard'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Action Icons: Demo Fast-Actions + Theme Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Simulator Pill */}
            <button
              onClick={handleSimulateSync}
              disabled={simulatingSync}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition disabled:opacity-50"
              title="Simulate a new classroom recording upload and AI synthesis"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{simulatingSync ? 'Simulating...' : 'Simulate Device Sync'}</span>
            </button>

            {/* Dark Mode Switcher (B&W High Contrast) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            {/* Language Tag */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {user?.preferred_language ? user.preferred_language.toUpperCase() : 'HINGLISH'}
            </div>

            {/* Avatar Pill */}
            <Link
              href="/settings"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 transition text-xs font-bold text-zinc-900 dark:text-white"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center text-[11px] font-extrabold">
                {initial}
              </div>
              <span className="hidden sm:inline">{displayName.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
