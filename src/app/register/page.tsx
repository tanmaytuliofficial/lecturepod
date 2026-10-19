'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mic2, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  KeyRound, 
  ChevronRight,
  Radio,
  BookOpen,
  Trophy,
  ArrowRight,
  RotateCw,
  BatteryCharging
} from 'lucide-react';
import { LecturePodDevice } from '@/components/LecturePodDevice';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animation Stage: 'portrait' -> 'rotating' -> 'landscape'
  const [animStage, setAnimStage] = useState<'portrait' | 'rotating' | 'landscape'>('portrait');

  const triggerRotation = () => {
    // Stage 1: Rotate counter-clockwise (-90deg) so Top Screen goes to LEFT and Button goes to RIGHT
    setAnimStage('rotating');
    setTimeout(() => {
      // Stage 2: Switch to widescreen landscape layout which has Screen on LEFT and Button on RIGHT
      setAnimStage('landscape');
    }, 550);
  };

  const triggerRotateBack = () => {
    setAnimStage('rotating');
    setTimeout(() => {
      setAnimStage('portrait');
    }, 450);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || 'Tanmay Tuli',
          email: email || 'student@scalyth.tech',
          password: password || 'pass1234',
        }),
      });

      if (!res.ok && res.status === 409) {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email || 'student@scalyth.tech', 
            password: password || 'pass1234' 
          }),
        });
      } else if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      setLoading(false);
      triggerRotation();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isLandscape = animStage === 'landscape';
  const isRotating = animStage === 'rotating';

  return (
    <div className="min-h-screen bg-[#09090C] text-zinc-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-xs group-hover:border-zinc-500 transition">
            <Mic2 className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Lecture<span className="text-amber-500">Pod</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!isLandscape ? (
            <button
              onClick={triggerRotation}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Rotate</span>
            </button>
          ) : (
            <button
              onClick={triggerRotateBack}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Portrait Mode</span>
            </button>
          )}

          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 transition"
          >
            Sign In →
          </Link>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center">
        
        {/* Title above device (Portrait only) */}
        {!isLandscape && !isRotating && (
          <div className="text-center max-w-xl mx-auto mb-8 transition-opacity duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              New Student Provisioning
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Provision Your LecturePod Account
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400">
              Register your credentials to unlock your classroom workspace
            </p>
          </div>
        )}

        {/* ================= ANIMATED DEVICE CONTAINER ================= */}
        <div className="w-full flex justify-center items-center">
          
          {/* 1. PORTRAIT / ROTATING TRANSITION STATE */}
          {!isLandscape ? (
            <div 
              style={{
                transition: 'transform 550ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 550ms ease-out',
                transform: isRotating ? 'rotate(-90deg) scale(0.92)' : 'rotate(0deg) scale(1)',
                opacity: isRotating ? 0.75 : 1,
                transformOrigin: 'center center',
              }}
              className="w-full max-w-md flex justify-center"
            >
              <form onSubmit={handleSubmit} className="w-full">
                <LecturePodDevice
                  isSubmitting={loading}
                  onButtonPress={() => handleSubmit()}
                  buttonLabel="Press Illuminated Button to Register"
                  statusText="READY"
                >
                  {error && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-amber-400" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tanmay Tuli"
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-amber-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tanmay@scalyth.tech"
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        Create Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>Provisioning...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Registration</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </>
                      )}
                    </button>
                  </div>
                </LecturePodDevice>
              </form>
            </div>
          ) : (
            /* ================= 2. ZOOMED LANDSCAPE HARDWARE CONSOLE WITH 3 CLEAN OPTIONS ================= */
            <div 
              style={{
                animation: 'scaleIn 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
              className="w-full max-w-6xl"
            >
              {/* Landscape Device Frame */}
              <div className="relative w-full bg-[#121215] border border-zinc-700/80 rounded-[48px] p-6 sm:p-8 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col lg:flex-row items-center gap-6">
                
                {/* Top Pinhole Microphones */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700 shadow-inner" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/60 shadow-inner" />
                </div>

                {/* ================= ZOOMED OLED DISPLAY ================= */}
                <div className="relative flex-1 w-full rounded-[32px] bg-[#070709] border border-zinc-800/90 shadow-[inset_0_2px_16px_rgba(0,0,0,0.95)] p-6 sm:p-8 overflow-hidden">
                  {/* Subtle Glass Specular Reflection */}
                  <div className="absolute -top-32 -left-32 w-96 h-64 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent rotate-12 pointer-events-none rounded-full blur-md" />

                  {/* Clean OLED Header (Zero Gimmicky Text) */}
                  <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-zinc-900 relative z-10">
                    {/* Left: REC Indicator & Waveform */}
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
                      <span className="text-red-400 font-bold tracking-wider">REC</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-zinc-300 font-bold">00:12:48</span>
                      <div className="hidden sm:flex items-center gap-0.5 h-3 ml-2">
                        {[6, 14, 22, 12, 28, 16, 20, 10, 18, 8, 14].map((h, i) => (
                          <span
                            key={i}
                            className="w-[2px] bg-sky-400 rounded-full animate-pulse"
                            style={{ height: `${h * 0.4}px`, animationDelay: `${i * 70}ms` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Right: Battery & Network Status */}
                    <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <BatteryCharging className="w-3.5 h-3.5" /> 85%
                      </span>
                      <span className="text-zinc-500 font-mono">Wi-Fi Synced</span>
                    </div>
                  </div>

                  {/* ================= THE 3 CLEAN OPTIONS ================= */}
                  <div className="py-6 relative z-10">
                    <div className="text-center max-w-xl mx-auto mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Select Your LecturePod Workspace
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Configure your device, start studying, or launch a test arena
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* ================= OPTION 1: CONFIGURE DEVICE ================= */}
                      <div 
                        onClick={() => router.push('/devices')}
                        className="group cursor-pointer bg-[#0D0D10] hover:bg-[#15151A] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">
                              OPTION 01
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition">
                              <Radio className="w-4 h-4 text-amber-400" />
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                            Configure Device
                          </h3>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Pair hardware unit, inspect offline queues, and auto-sync recordings.
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-bold text-white group-hover:text-amber-400 transition">
                          <span>Open Console</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </div>
                      </div>

                      {/* ================= OPTION 2: STUDY ================= */}
                      <div 
                        onClick={() => router.push('/lectures')}
                        className="group cursor-pointer bg-[#0D0D10] hover:bg-[#15151A] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded-md">
                              OPTION 02
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition">
                              <BookOpen className="w-4 h-4 text-sky-400" />
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition">
                            Study Workspace
                          </h3>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Classroom audios, synced transcripts, AI synthesized notes, and flashcards.
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-bold text-white group-hover:text-sky-400 transition">
                          <span>Enter Study</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </div>
                      </div>

                      {/* ================= OPTION 3: TEST ================= */}
                      <div 
                        onClick={() => router.push('/test')}
                        className="group cursor-pointer bg-[#0D0D10] hover:bg-[#15151A] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">
                              OPTION 03
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition">
                              <Trophy className="w-4 h-4 text-amber-300" />
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                            Test Arena
                          </h3>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Timed practice quizzes, 3D flip card decks, and exam readiness.
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-bold text-white group-hover:text-amber-300 transition">
                          <span>Start Test</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Clean Bottom Bar */}
                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-500 relative z-10">
                    <span className="text-emerald-400/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      CONNECTED
                    </span>
                    <span className="text-zinc-500">STANDBY</span>
                  </div>
                </div>

                {/* ================= RIGHT CONTROL BEZEL (PHYSICAL BUTTON) ================= */}
                <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-5 p-2 shrink-0">
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      onClick={() => router.push('/dashboard')}
                      title="Tap button to jump to Full Dashboard"
                      className="relative w-18 h-18 rounded-full bg-[#0E0E12] border-[3.5px] border-blue-500 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(59,130,246,0.65),inset_0_0_15px_rgba(59,130,246,0.35)] hover:shadow-[0_0_40px_rgba(59,130,246,0.9)] active:scale-95 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-[5px] bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] group-hover:bg-red-500 transition-colors" />
                    </div>
                  </div>

                  {/* Laser-Engraved Silkscreen Branding */}
                  <div className="text-center pt-2">
                    <span className="text-xs font-bold tracking-widest text-zinc-400/80 uppercase">
                      Lecture Pod
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-zinc-900 text-center text-xs text-zinc-600 font-mono">
        LecturePod Hardware Suite &bull; &copy; 2026
      </footer>

      {/* CSS Animation Keyframe */}
      <style jsx global>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
