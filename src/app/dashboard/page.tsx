'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Radio, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  Sun, 
  Moon, 
  LogOut, 
  Layers, 
  Sparkles,
  CheckCircle2,
  Cpu,
  Wifi,
  FileText
} from 'lucide-react';

export default function DashboardPortalHub() {
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Quick Demo Simulator states
  const [simulatingPair, setSimulatingPair] = useState(false);
  const [simulatingSync, setSimulatingSync] = useState(false);

  const fetchPortalData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const auth = await authRes.json();
      setUserData(auth.user);

      const [lecRes, devRes] = await Promise.all([
        fetch('/api/lectures'),
        fetch('/api/devices'),
      ]);

      const [lecData, devData] = await Promise.all([
        lecRes.json(),
        devRes.json(),
      ]);

      setLectures(lecData.lectures || []);
      setDevices(devData.devices || []);
    } catch (e) {
      console.error(e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleSimulatePair = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSimulatingPair(true);
    try {
      const res = await fetch('/api/demo/pair-device', { method: 'POST' });
      const d = await res.json();
      if (res.ok) {
        setBannerMsg('Demo LecturePod Device connected & telemetry online!');
        await fetchPortalData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingPair(false);
    }
  };

  const handleSimulateSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSimulatingSync(true);
    try {
      const res = await fetch('/api/demo/simulate-sync', { method: 'POST' });
      const d = await res.json();
      if (res.ok) {
        setBannerMsg(d.message || 'New lecture audio synced and AI study kit generated!');
        await fetchPortalData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingSync(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-zinc-300 dark:border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Loading student workspace...</p>
        </div>
      </div>
    );
  }

  const studentName = userData?.full_name?.split(' ')[0] || 'Student';
  const pairedDevice = devices.length > 0 ? devices[0] : null;
  const isDeviceOnline = pairedDevice?.status === 'online';
  const readyLecturesCount = lectures.filter((l: any) => l.status === 'ready').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
      {/* ================= MINIMAL TOP NAV ================= */}
      <header className="w-full px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#09090B]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-amber-400 dark:text-zinc-950 flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              LP
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">
                Lecture<span className="text-amber-500">Pod</span>
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Student Hub
              </span>
            </div>
          </div>

          {/* Right Controls: Dark Mode Toggle + User Pill + Sign Out */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
              title="Toggle Black & White Dark Mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Student Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                {studentName[0]}
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hidden sm:inline">
                {userData?.full_name}
              </span>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= NOTIFICATION TOAST ================= */}
      {bannerMsg && (
        <div className="max-w-2xl mx-auto mt-4 px-4 w-full">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{bannerMsg}</span>
            </div>
            <button
              onClick={() => setBannerMsg(null)}
              className="text-amber-700 dark:text-amber-400 hover:opacity-75 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= 3 BIG HERO CARDS ================= */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 py-8 sm:py-12">
        {/* Welcome Pitch */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Session 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 dark:text-white">
            Welcome back, {studentName}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium">
            Select your workspace to get started:
          </p>
        </div>

        {/* The 3 Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* ================= OPTION 1: CONFIGURE LECTUREPOD DEVICE ================= */}
          <div
            onClick={() => router.push('/devices')}
            className="group relative cursor-pointer bg-white dark:bg-[#121215] border-2 border-zinc-200/90 dark:border-zinc-800/90 hover:border-emerald-500/80 dark:hover:border-emerald-400 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Ambient Corner Glow on Hover */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition duration-300 pointer-events-none" />

            <div>
              {/* Card Header & Custom Radar Animation */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Option 01
                  </span>
                  <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Hardware Suite</span>
                  </div>
                </div>

                {/* Animated Pulsing Radar Beacon */}
                <div className="relative flex items-center justify-center w-14 h-14">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-radar-ping" />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition duration-300">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                Configure LecturePod Device
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Pair your physical recording unit, inspect local offline audio queue, calibrate Wi-Fi auto-sync, or run edge simulation diagnostics.
              </p>

              {/* Hardware Micro-Badge Telemetry */}
              <div className="mt-6 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-600 dark:text-zinc-400">Device Status</span>
                  {pairedDevice ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {pairedDevice.status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      DEMO READY
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  <span>{pairedDevice ? pairedDevice.device_identifier : 'LP-SIM-STUDIO'}</span>
                  <span>v1.2.0-lp</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2.5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 dark:group-hover:text-zinc-950 transition shadow-sm"
              >
                <span>Open Device Manager</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {!pairedDevice && (
                <button
                  onClick={handleSimulatePair}
                  disabled={simulatingPair}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                >
                  <Zap className="w-3 h-3 text-emerald-500" />
                  <span>{simulatingPair ? 'Connecting...' : 'One-Click Demo Pair'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= OPTION 2: STUDY ================= */}
          <div
            onClick={() => router.push('/lectures')}
            className="group relative cursor-pointer bg-white dark:bg-[#121215] border-2 border-zinc-200/90 dark:border-zinc-800/90 hover:border-amber-500/80 dark:hover:border-amber-400 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Ambient Corner Glow on Hover */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition duration-300 pointer-events-none" />

            <div>
              {/* Card Header & Custom Audio Waveform Animation */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Option 02
                  </span>
                  <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Knowledge Hub</span>
                  </div>
                </div>

                {/* Animated Equalizer Waveform */}
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 shadow-xs group-hover:scale-110 transition duration-300">
                  <span className="w-1 bg-amber-500 rounded-full animate-eq-1" />
                  <span className="w-1 bg-amber-500 rounded-full animate-eq-2" />
                  <span className="w-1 bg-amber-500 rounded-full animate-eq-3" />
                  <span className="w-1 bg-amber-500 rounded-full animate-eq-4" />
                  <span className="w-1 bg-amber-500 rounded-full animate-eq-5" />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Study
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Explore synchronized classroom recordings, read structured AI notes, search timestamped transcripts, and export revision sheets.
              </p>

              {/* Study Offerings Micro-Pill */}
              <div className="mt-6 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-600 dark:text-zinc-400">Lectures Available</span>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                    {lectures.length} Total
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    AI Notes
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Transcripts
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Revision Sheets
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2.5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 group-hover:bg-amber-500 dark:group-hover:bg-amber-400 dark:group-hover:text-zinc-950 transition shadow-sm"
              >
                <span>Enter Study Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={handleSimulateSync}
                disabled={simulatingSync}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{simulatingSync ? 'Simulating...' : 'Simulate Audio Sync'}</span>
              </button>
            </div>
          </div>

          {/* ================= OPTION 3: TEST ================= */}
          <div
            onClick={() => router.push('/test')}
            className="group relative cursor-pointer bg-white dark:bg-[#121215] border-2 border-zinc-200/90 dark:border-zinc-800/90 hover:border-purple-500/80 dark:hover:border-purple-400 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Ambient Corner Glow on Hover */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition duration-300 pointer-events-none" />

            <div>
              {/* Card Header & Custom Floating Trophy / Target Animation */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                    Option 03
                  </span>
                  <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Evaluation Arena</span>
                  </div>
                </div>

                {/* Animated Gentle Float Test Icon */}
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs animate-gentle-float group-hover:scale-110 transition duration-300">
                  <Layers className="w-6 h-6" />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                Test
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Challenge your retention with interactive 3D flashcards, take lecture comprehension quizzes, and track your concept mastery score.
              </p>

              {/* Test Offerings Micro-Pill */}
              <div className="mt-6 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-600 dark:text-zinc-400">Assessment Kits</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">
                    {readyLecturesCount} Quizzes Ready
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    3D Flashcards
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Exam MCQs
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Score History
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2.5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 group-hover:bg-purple-600 dark:group-hover:bg-purple-400 dark:group-hover:text-zinc-950 transition shadow-sm"
              >
                <span>Start Testing & Quizzes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/test');
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
              >
                <Layers className="w-3 h-3 text-purple-500" />
                <span>Practice 3D Flashcards</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ================= MINIMAL FOOTER ================= */}
      <footer className="w-full px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800/80 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">LecturePod</span>
            <span>•</span>
            <span>Autonomous AI Lecture Synthesis Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/planner" className="hover:text-zinc-950 dark:hover:text-white transition">
              Study Planner
            </Link>
            <Link href="/search" className="hover:text-zinc-950 dark:hover:text-white transition">
              Search
            </Link>
            <Link href="/settings" className="hover:text-zinc-950 dark:hover:text-white transition">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
