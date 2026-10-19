'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  Mic2, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Layers, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Play,
  HardDrive,
  Radio,
  Sliders,
  BatteryCharging,
  Fingerprint
} from 'lucide-react';
import { DeviceScrollShowcase } from '@/components/DeviceScrollShowcase';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-950 flex flex-col selection:bg-amber-200 selection:text-amber-950">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-28 border-b border-zinc-200/70">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-200/30 via-gold-200/20 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Elegant Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200/70 text-amber-900 text-xs font-semibold tracking-wide shadow-xs mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Dedicated LecturePod Device &bull; Autonomous Offline Capture
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 max-w-4xl mx-auto leading-[1.08]">
              Never Lose a Lecture.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900">
                Never Miss a Concept.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-base sm:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Place the compact <strong>LecturePod Device</strong> on your classroom desk. It records studio-quality audio completely offline, auto-syncs over Wi-Fi, and transforms raw lectures into structured study kits, flashcards, and exam quizzes.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-md ring-1 ring-zinc-800 transition hover:scale-[1.01]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
              <Link
                href="#device"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl shadow-xs transition"
              >
                Explore LecturePod Device
              </Link>
            </div>

            {/* ================= PREMIUM HARDWARE + SAAS PRODUCT PREVIEW ================= */}
            <div className="mt-16 max-w-5xl mx-auto bg-zinc-950 rounded-3xl p-2 sm:p-3 shadow-2xl ring-1 ring-zinc-800/80 text-left">
              {/* Studio Device Top Bar */}
              <div className="px-5 py-3.5 bg-zinc-900/90 rounded-2xl flex items-center justify-between border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs font-mono tracking-tight text-zinc-400 ml-2">
                    LecturePod Hardware OS &bull; Secure Sync Protocol v1.2
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LecturePod Unit Online
                  </span>
                  <span className="hidden sm:inline-block text-zinc-600">|</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-zinc-400">
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-400" /> 94%
                  </span>
                </div>
              </div>

              {/* Hardware & Workspace Showcase */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-b-2xl">
                {/* Physical Hardware Representation (5 cols) */}
                <div className="md:col-span-5 bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono text-amber-400 font-bold">LECTUREPOD HARDWARE</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[11px] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Classroom Unit
                      </span>
                    </div>

                    {/* Real Physical Device Photo Card */}
                    <div className="my-4 relative rounded-2xl bg-black/60 border border-zinc-800 p-2 overflow-hidden flex items-center justify-center">
                      <img 
                        src="/images/device-hero.png" 
                        alt="LecturePod Physical Hardware Device" 
                        className="w-full h-56 object-cover rounded-xl filter drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span className="text-amber-400 flex items-center gap-1">
                          <Mic2 className="w-3 h-3" /> REC 00:12:36
                        </span>
                        <span className="text-emerald-400">85% BATT</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span className="text-zinc-200 font-semibold">10.5 &times; 6.5 &times; 2.0 cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sync Interface:</span>
                      <span className="text-emerald-400 font-semibold">Auto Wi-Fi / Hotspot</span>
                    </div>
                  </div>
                </div>

                {/* Real Workspace Preview (7 cols) */}
                <div className="md:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/90 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        Computer Science &bull; CS 402
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        Ready
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-zinc-950 tracking-tight">
                      TCP Congestion Control & Congestion Avoidance Algorithms
                    </h3>

                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                      &quot;Flow control protects the receiver buffer via rwnd. Congestion control protects the global network pipe via cwnd. Notice how AIMD guarantees fairness...&quot;
                    </p>

                    {/* Key formulas / Takeaway preview */}
                    <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800 font-mono">
                      <span className="text-amber-800 font-semibold">Efficiency Formula: </span>
                      Throughput = (MSS / RTT) &times; (1 / &radic;p)
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                      <FileText className="w-3.5 h-3.5 text-zinc-500" /> Synthesized Notes
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" /> 16 Flashcards
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> Exam Quiz
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                      <Play className="w-3.5 h-3.5 text-amber-600" /> 48m Audio
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HARDWARE SPECIFICATION & MULTI-PROFILE SHOWCASE ================= */}
        <section id="device" className="py-16 md:py-24 bg-white border-b border-zinc-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Multi-Profile Scroll Showcase Component */}
            <DeviceScrollShowcase />

            {/* Core Architecture Pillars */}
            <div className="text-center max-w-2xl mx-auto pt-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Acoustic Hardware Engineering
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 mt-2 tracking-tight">
                Engineered for Academic Survival
              </h2>
              <p className="text-zinc-600 text-sm mt-3 leading-relaxed">
                Engineered specifically for lecture halls, laboratories, and seminar rooms. Never drain your phone battery or worry about missing crucial exam hints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="p-7 bg-[#F8F9FA] rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-amber-400 flex items-center justify-center mb-5 ring-1 ring-zinc-800 shadow-sm">
                    <WifiOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">100% Offline Recording</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    Operates flawlessly in signal-dead basement halls. Recordings are encrypted and cached safely on the device&apos;s high-endurance local queue.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-200/60 text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero data loss guarantee
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-7 bg-[#F8F9FA] rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-amber-400 flex items-center justify-center mb-5 ring-1 ring-zinc-800 shadow-sm">
                    <Wifi className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">Intelligent Auto-Sync</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    As soon as your phone hotspot, campus Wi-Fi, or home network comes within range, the LecturePod Device syncs all audio in the background without user intervention.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-200/60 text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Idempotent upload contract
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-7 bg-[#F8F9FA] rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-amber-400 flex items-center justify-center mb-5 ring-1 ring-zinc-800 shadow-sm">
                    <Fingerprint className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">Cryptographic Pairing</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    Link your physical device in seconds using a one-time 6-character code. Your audio recordings are isolated strictly to your student account.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-200/60 text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Encrypted device secrets
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-24 bg-[#F8F9FA] border-b border-zinc-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                End-to-End Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 mt-2 tracking-tight">
                From Classroom Voice to Midterm Mastery
              </h2>
              <p className="text-zinc-600 text-sm mt-3">
                No manual uploading each day. The system takes care of the friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Record',
                  desc: 'One press on your LecturePod Device starts recording. High-fidelity audio is preserved locally even in dead zones.',
                  badge: 'Offline-First Audio',
                },
                {
                  step: '02',
                  title: 'Sync',
                  desc: 'Detects Wi-Fi or phone hotspot automatically. Audio uploads securely with server checksum verification.',
                  badge: 'Automatic Sync',
                },
                {
                  step: '03',
                  title: 'Transcribe',
                  desc: 'Processes technical jargon across English, Hindi, and Hinglish. Timestamps anchor every sentence to the audio.',
                  badge: 'Multilingual AI',
                },
                {
                  step: '04',
                  title: 'Master',
                  desc: 'Review structured markdown notes, practice 3D flashcards, take exam quizzes, and print revision sheets.',
                  badge: 'Ready for Exams',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-white rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="w-10 h-10 rounded-2xl bg-zinc-950 text-amber-400 flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
                      {item.step}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950">{item.title}</h3>
                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-zinc-100 text-[11px] font-semibold text-zinc-600">
                    &bull; {item.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section id="features" className="py-24 bg-white border-b border-zinc-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Study Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 mt-2 tracking-tight">
                Designed for Serious Academic Workloads
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-7 bg-[#F8F9FA] rounded-3xl border border-zinc-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Structured AI Notes</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Headings, mathematical definitions, practical examples, and exam takeaways synthesized straight from professor explanations. Editable with live autosave.
                </p>
              </div>

              <div className="p-7 bg-[#F8F9FA] rounded-3xl border border-zinc-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Spaced Repetition Flashcards</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Interactive 3D flip cards with mastery progress tracking. Mark concepts as difficult or mastered to focus study time where it matters most.
                </p>
              </div>

              <div className="p-7 bg-[#F8F9FA] rounded-3xl border border-zinc-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Transcript-Derived Quizzes</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Multiple-choice exam simulations derived directly from the lecture transcript. Instant scoring and detailed explanations for every single choice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRIVACY SECTION ================= */}
        <section id="privacy" className="py-24 bg-[#F8F9FA] border-b border-zinc-200/70">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 rounded-3xl bg-zinc-950 text-amber-400 flex items-center justify-center mx-auto mb-5 ring-1 ring-zinc-800 shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Your Classroom Audio is Private</h2>
            <p className="text-zinc-600 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Every lecture recording, transcript, and note is cryptographically isolated to your student account with Row-Level Security. No student can ever search or access another student&apos;s audio.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-zinc-950">User Isolation</h4>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Enforced server-side. Zero cross-account data leakage.
                </p>
              </div>
              <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-zinc-950">Hashed Secrets</h4>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Device API tokens use salted HMAC-SHA256 signatures.
                </p>
              </div>
              <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-zinc-950">Open Data Export</h4>
                <p className="text-[11px] text-zinc-600 mt-1">
                  One-click full JSON backup of all your notes, flashcards, and quizzes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section id="faq" className="py-24 bg-white border-b border-zinc-200/70">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Clarifications
              </span>
              <h2 className="text-3xl font-extrabold text-zinc-950 mt-2 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-zinc-200/80 bg-[#F8F9FA]">
                <h4 className="text-sm font-bold text-zinc-950">
                  What is the LecturePod Device?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  The LecturePod Device is a dedicated, compact acoustic capture unit that students carry to classroom lectures. It captures crystal-clear audio, buffers recordings offline, and syncs automatically whenever an authorized connection becomes available.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200/80 bg-[#F8F9FA]">
                <h4 className="text-sm font-bold text-zinc-950">
                  Does the LecturePod Device require Wi-Fi during the lecture?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  No. It is built completely offline-first. It preserves your recordings on local storage and only uploads when you reconnect to Wi-Fi, your phone hotspot, or your home network.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200/80 bg-[#F8F9FA]">
                <h4 className="text-sm font-bold text-zinc-950">
                  Does LecturePod support mixed Hindi and English (Hinglish)?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Yes! The platform is designed to handle multilingual classroom speech, preserving technical English terms alongside Hindi explanations accurately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white py-12 border-t border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
              <Mic2 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-bold text-sm text-zinc-950">LecturePod</span>
            <span className="text-xs text-zinc-600 ml-2">
              &copy; {new Date().getFullYear()} LecturePod. Studio-Grade Learning Platform.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="#privacy" className="hover:text-zinc-950 transition">
              Privacy Policy
            </Link>
            <Link href="#device" className="hover:text-zinc-950 transition">
              LecturePod Device
            </Link>
            <Link href="/login" className="hover:text-zinc-950 transition">
              Student Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
