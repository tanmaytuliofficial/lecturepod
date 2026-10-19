'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Mic2, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  KeyRound, 
  Mail, 
  Layers, 
  Cpu, 
  BatteryCharging, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { LecturePodDevice } from '@/components/LecturePodDevice';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'device' | 'gallery'>('device');
  const [activeProfile, setActiveProfile] = useState<'front' | 'side' | 'back' | 'angled'>('front');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student.demo@lecturepod.edu',
          password: 'demoPassword123!',
          full_name: 'Aarav Sharma',
          college_school: 'Indian Institute of Technology, Delhi',
          course_branch: 'Computer Science & Engineering',
          semester_class: '5th Semester',
          preferred_language: 'hinglish',
          study_goals: 'Score 9+ CGPA and master systems programming.'
        }),
      });

      if (!res.ok && res.status !== 409) {
        throw new Error('Could not initialize demo account');
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student.demo@lecturepod.edu',
          password: 'demoPassword123!',
        }),
      });

      if (!loginRes.ok) {
        const loginData = await loginRes.json();
        throw new Error(loginData.error || 'Demo sign in failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090C] text-zinc-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Navigation */}
      <header className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-xs group-hover:border-zinc-500 transition">
            <Mic2 className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Lecture<span className="text-amber-500">Pod</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            DEVICE OS v1.2
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDemoSignIn}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Demo Login</span>
          </button>

          <Link
            href="/register"
            className="text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            Register Pod →
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center">
        {/* Title & Introduction */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Hardware Authentication Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In with Your LecturePod
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400">
            Enter credentials inside the pod screen or press the illuminated button to authenticate
          </p>
        </div>

        {/* ================= 2-COLUMN VIEW: DEVICE CHASSIS & HARDWARE SHOWCASE ================= */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl">
          
          {/* Left Column: Real Hardware Profile Showcase & Tech Specs (5 cols) */}
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-6">
            <div className="bg-[#121216] border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Physical Hardware Profiles
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  10.5 cm &times; 6.5 cm &times; 2.0 cm
                </span>
              </div>

              {/* Profile Image Viewport */}
              <div className="relative h-64 bg-[#09090C] rounded-2xl border border-zinc-850 p-4 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                {activeProfile === 'front' && (
                  <div className="flex flex-col items-center justify-center animate-fadeIn text-center">
                    <img 
                      src="/images/profile-front.png" 
                      alt="LecturePod Front View" 
                      className="h-44 object-contain filter drop-shadow-lg"
                    />
                    <span className="mt-3 text-[11px] font-mono text-zinc-400">
                      Front Profile &bull; 6.5 cm width &bull; OLED Display & LED Ring
                    </span>
                  </div>
                )}

                {activeProfile === 'side' && (
                  <div className="flex flex-col items-center justify-center animate-fadeIn text-center">
                    <img 
                      src="/images/profile-side.png" 
                      alt="LecturePod Side View" 
                      className="h-44 object-contain filter drop-shadow-lg"
                    />
                    <span className="mt-3 text-[11px] font-mono text-zinc-400">
                      Side Profile &bull; 2.0 cm ultra-slim &bull; USB-C Charging Port
                    </span>
                  </div>
                )}

                {activeProfile === 'back' && (
                  <div className="flex flex-col items-center justify-center animate-fadeIn text-center">
                    <img 
                      src="/images/profile-back.png" 
                      alt="LecturePod Back View" 
                      className="h-44 object-contain filter drop-shadow-lg"
                    />
                    <span className="mt-3 text-[11px] font-mono text-zinc-400">
                      Back Profile &bull; Acoustic chamber grille &bull; Matte finish
                    </span>
                  </div>
                )}

                {activeProfile === 'angled' && (
                  <div className="flex flex-col items-center justify-center animate-fadeIn text-center">
                    <img 
                      src="/images/profile-angled.png" 
                      alt="LecturePod Angled View" 
                      className="h-44 object-contain filter drop-shadow-lg"
                    />
                    <span className="mt-3 text-[11px] font-mono text-zinc-400">
                      Angled 3D Profile &bull; Beveled ergonomic palm grip
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Selector Buttons */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { key: 'front', label: 'Front' },
                  { key: 'side', label: 'Side' },
                  { key: 'back', label: 'Back' },
                  { key: 'angled', label: 'Angled' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveProfile(item.key as any)}
                    className={`py-1.5 rounded-xl text-xs font-medium transition font-mono border ${
                      activeProfile === item.key
                        ? 'bg-zinc-800 text-white border-amber-500/50 shadow-xs'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Hardware Specs Bullet points */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>High-Fidelity Audio Array</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>100% Offline Storage</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>One Button Record / Stop</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>USB-C Quick Charge</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Note */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div>
                <p className="font-semibold text-zinc-200">Testing platform without hardware?</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Use pre-seeded student account (Aarav Sharma)</p>
              </div>
              <button
                onClick={handleDemoSignIn}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition text-xs shrink-0"
              >
                Instant Access →
              </button>
            </div>
          </div>

          {/* Right Column: Physical LecturePod Device Housing the Login (6 cols) */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center">
            <form onSubmit={handleSubmit} className="w-full">
              <LecturePodDevice
                isSubmitting={loading}
                onButtonPress={() => handleSubmit()}
                buttonLabel="Press Illuminated Button to Log In"
                statusText="STANDBY / READY"
              >
                {/* Diagnostics Error Notification inside OLED */}
                {error && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* OLED Login Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-amber-400" />
                      Student Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo Credentials: student.demo@lecturepod.edu / demoPassword123!')}
                        className="text-[10px] font-mono text-amber-500 hover:text-amber-400 transition"
                      >
                        Help?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition font-mono"
                    />
                  </div>

                  {/* Standard Submit Button as fallback inside screen */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Verifying Pod...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </>
                    )}
                  </button>
                </div>
              </LecturePodDevice>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-zinc-900 text-center text-xs text-zinc-600 font-mono">
        LecturePod Hardware Suite &bull; Autonomous Classroom Capture System &bull; &copy; 2026
      </footer>
    </div>
  );
}
