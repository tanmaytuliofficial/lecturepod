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
  Volume2,
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
          <div className="w-9 h-9 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-950 dark:border-t-white rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Loading student workspace...</p>
        </div>
      </div>
    );
  }

  const studentName = userData?.full_name?.split(' ')[0] || 'Student';
  const pairedDevice = devices.length > 0 ? devices[0] : null;
  const readyLecturesCount = lectures.filter((l: any) => l.status === 'ready').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
      {/* ================= MINIMAL EXECUTIVE TOP NAV ================= */}
      <header className="w-full px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-xs tracking-wider shadow-xs">
              LP
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">
                LecturePod
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Student Hub
              </span>
            </div>
          </div>

          {/* Right Controls: Dark Mode Toggle + User Pill + Sign Out */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
              title="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-zinc-200" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Student Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
              <div className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-bold">
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
          <div className="p-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-between text-xs font-medium shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
              <span>{bannerMsg}</span>
            </div>
            <button
              onClick={() => setBannerMsg(null)}
              className="text-zinc-400 hover:text-white dark:hover:text-zinc-950 font-bold ml-4"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Academic Session 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Welcome back, {studentName}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-normal">
            Select your workspace to get started:
          </p>
        </div>

        {/* The 3 Big Unified Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* ================= OPTION 1: CONFIGURE LECTUREPOD DEVICE ================= */}
          <div
            onClick={() => router.push('/devices')}
            className="group relative cursor-pointer bg-white dark:bg-[#111114] border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            <div>
              {/* Card Header & Radar Animation */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Option 01
                  </span>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Hardware Ecosystem</span>
                  </div>
                </div>

                {/* Radar Icon Box */}
                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition duration-300">
                    <Radio className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Configure LecturePod Device
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Pair your physical recording unit, inspect local offline audio queue, calibrate Wi-Fi auto-sync, or run edge simulation diagnostics.
              </p>

              {/* Hardware Micro-Badge Telemetry */}
              <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400">Connection Status</span>
                  {pairedDevice ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {pairedDevice.status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-zinc-400" />
                      DEMO READY
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>{pairedDevice ? pairedDevice.device_identifier : 'LP-SIM-STUDIO'}</span>
                  <span>v1.2.0-lp</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2.5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-xs"
              >
                <span>Open Device Manager</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {!pairedDevice && (
                <button
                  onClick={handleSimulatePair}
                  disabled={simulatingPair}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{simulatingPair ? 'Connecting...' : 'One-Click Demo Pair'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= OPTION 2: STUDY ================= */}
          <div
            onClick={() => router.push('/lectures')}
            className="group relative cursor-pointer bg-white dark:bg-[#111114] border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            <div>
              {/* Card Header & Equalizer Animation */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Option 02
                  </span>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Academic Workspace</span>
                  </div>
                </div>

                {/* Equalizer Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1 shadow-xs group-hover:scale-105 transition duration-300">
                  <span className="w-0.5 bg-zinc-900 dark:bg-white rounded-full animate-eq-1" />
                  <span className="w-0.5 bg-zinc-900 dark:bg-white rounded-full animate-eq-2" />
                  <span className="w-0.5 bg-zinc-900 dark:bg-white rounded-full animate-eq-3" />
                  <span className="w-0.5 bg-zinc-900 dark:bg-white rounded-full animate-eq-4" />
                  <span className="w-0.5 bg-zinc-900 dark:bg-white rounded-full animate-eq-5" />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Study & Library
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Explore synchronized classroom recordings, read structured AI notes, search timestamped transcripts, and export revision sheets.
              </p>

              {/* Study Offerings Micro-Pill */}
              <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400">Classroom Lectures</span>
                  <span className="text-zinc-950 dark:text-white font-bold">
                    {lectures.length} Synchronized
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Audios
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    AI Notes
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Transcripts
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    AI Mentor
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2.5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-xs"
              >
                <span>Enter Study Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={handleSimulateSync}
                disabled={simulatingSync}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{simulatingSync ? 'Simulating...' : 'Simulate Audio Sync'}</span>
              </button>
            </div>
          </div>

          {/* ================= OPTION 3: TEST ================= */}
          <div
            onClick={() => router.push('/test')}
            className="group relative cursor-pointer bg-white dark:bg-[#111114] border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            <div>
              {/* Card Header & Float Animation */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Option 03
                  </span>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Evaluation Arena</span>
                  </div>
                </div>

                {/* Floating Test Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shadow-xs animate-gentle-float group-hover:scale-105 transition duration-300">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Test & Assessment
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Challenge your retention with interactive 3D flashcards, take lecture comprehension quizzes, and track your concept mastery score.
              </p>

              {/* Test Offerings Micro-Pill */}
              <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400">Available Materials</span>
                  <span className="text-zinc-950 dark:text-white font-bold">
                    {readyLecturesCount} Quizzes Ready
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    3D Flashcards
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Exam MCQs
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Score History
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-2.5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-xs"
              >
                <span>Start Testing & Quizzes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/test');
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition"
              >
                <Layers className="w-3 h-3 text-zinc-500" />
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
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">LecturePod</span>
            <span>•</span>
            <span>Intelligent Lecture Capture & Learning Platform</span>
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
