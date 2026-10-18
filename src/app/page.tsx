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
  RotateCw,
  HardDrive
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Physical Raspberry Pi 4 Device + Automated Student Workspace
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-4xl mx-auto leading-[1.15]">
              Never Lose a Lecture.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800">
                Never Miss a Concept.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Lecture Pod captures classroom lectures locally without internet, auto-syncs over Wi-Fi, and turns spoken explanations into structured notes, revision sheets, flashcards, and quizzes.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-md transition"
              >
                Get Started
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl transition"
              >
                Explore Features
              </Link>
            </div>

            {/* Hero Live Interface / Product Preview */}
            <div className="mt-14 max-w-5xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden text-left">
              <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-zinc-400">
                    LecturePod v1.2 — Physical Device Sync Protocol
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  RPi4 Hardware Online
                </span>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-50/50">
                {/* Device Card */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-mono">LP-PI4-A82F</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        Paired
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">Raspberry Pi 4 Model B</h4>
                        <p className="text-xs text-zinc-500">Classroom Pod Unit</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 text-xs space-y-1 text-zinc-600 font-mono">
                    <div className="flex justify-between">
                      <span>Offline Storage:</span>
                      <span className="text-zinc-900 font-semibold">0 pending (synced)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Heartbeat:</span>
                      <span className="text-emerald-700 font-semibold">Just now</span>
                    </div>
                  </div>
                </div>

                {/* Lecture Process Card */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                        Linear Algebra & Matrices
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        Ready
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-zinc-900">
                      Eigenvalues, Characteristic Polynomials & Diagonalization
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      &quot;To find the eigenvalues lambda, we compute the determinant of (A minus lambda times I) and set it to zero...&quot;
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
                      <FileText className="w-3.5 h-3.5 text-zinc-500" /> AI Notes
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" /> 12 Flashcards
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> Practice Quiz
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
                      <Play className="w-3.5 h-3.5 text-zinc-500" /> Audio 52m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-20 bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Autonomous Workflow
              </span>
              <h2 className="text-3xl font-bold text-zinc-900 mt-2">
                From Classroom Audio to Exam Prep in 4 Steps
              </h2>
              <p className="text-zinc-600 text-sm mt-2">
                No manual uploading each day. The physical pod handles recording and syncing autonomously.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Record</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    Student turns on the Lecture Pod device in class. It records high-fidelity audio locally on the Raspberry Pi 4 MicroSD card, even with zero internet or phone reception.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center gap-1.5 text-xs text-zinc-500">
                  <WifiOff className="w-3.5 h-3.5" /> 100% Offline Capable
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Sync</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    When campus Wi-Fi, home internet, or your phone hotspot becomes available, the device agent detects the connection and auto-syncs recordings with idempotent verification.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Automatic Background Sync
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Understand</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    The platform processes audio using configured speech-to-text models, supporting English, Hindi, and Hinglish lectures. Timestamps anchor every phrase to the original audio.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Multilingual AI Transcription
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                    04
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Revise</h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    Access executive summaries, structured editable notes, key formulas, interactive flashcards, practice quizzes, and concise printable revision sheets directly on your dashboard.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center gap-1.5 text-xs text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Complete Study Kits
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section id="features" className="py-20 bg-[#FAFAFA] border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Engineered for Students
              </span>
              <h2 className="text-3xl font-bold text-zinc-900 mt-2">
                Everything You Need to Ace Your Exams
              </h2>
              <p className="text-zinc-600 text-sm mt-2">
                A focused, distraction-free SaaS workspace built for real academic workloads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <HardDrive className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Zero-Loss Offline Recording</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Basement lecture halls with no cellular service? No problem. The local queue guarantees that no lecture is ever lost. Files remain safe until the server verifies receipt.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Structured AI Notes & Revision Sheets</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Clear headings, key definitions, real-world examples, and mathematical equations synthesized directly from your professor&apos;s spoken words. Editable with live autosave.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Spaced Repetition Flashcards</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Interactive 3D flashcards with mastery tracking. Mark concepts as difficult or mastered to optimize your study sessions before midterms and finals.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Exam-Focused Quizzes</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Multiple-choice quizzes generated from your syllabus. Immediate scoring, detailed explanations for every answer option, and stored attempt history.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Global Transcript & Concept Search</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Search across your entire semester. Instantly pinpoint the exact second your professor explained a theorem or gave a hint about an upcoming exam question.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Real Raspberry Pi 4 Device Telemetry</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Real heartbeats, IP detection, queue counters, and diagnostics. No fabricated connectivity statuses or fake checkmarks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HARDWARE INTEGRATION SECTION ================= */}
        <section id="device" className="py-20 bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Physical Hardware
                </span>
                <h2 className="text-3xl font-bold text-zinc-900 mt-2">
                  Built for Raspberry Pi 4 Model B
                </h2>
                <p className="text-zinc-600 text-sm mt-4 leading-relaxed">
                  The Lecture Pod agent is a lightweight, robust Python service that runs natively on Raspberry Pi OS. It uses SQLite for local offline queue management, monitors network reachability, and implements an exponential backoff sync retry protocol.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-700">
                      <strong>Cryptographic Device Pairing:</strong> Link device via 6-character token from your dashboard.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-700">
                      <strong>Idempotent Upload Contract:</strong> Prevents duplicate lecture creation during network hiccups.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-700">
                      <strong>Safe Retention Policy:</strong> Recordings are never purged locally until the server confirms integrity.
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/devices"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-amber-700 transition"
                  >
                    View Device Pairing Protocol <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Terminal Code Snippet */}
              <div className="bg-zinc-950 rounded-2xl p-6 text-zinc-300 font-mono text-xs border border-zinc-800 shadow-xl overflow-x-auto">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-800 text-zinc-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-zinc-400">pi@raspberrypi:~ $</span>
                </div>
                <div className="space-y-2 text-zinc-300">
                  <p className="text-zinc-500"># Pair device to student account</p>
                  <p className="text-amber-400">
                    python3 lecturepod_agent.py pair --code LP-8842 --server https://your-server.com
                  </p>
                  <p className="text-emerald-400 font-semibold">[SUCCESS] Device LP-PI4-A82F paired to student account.</p>
                  
                  <p className="text-zinc-500 pt-2"># Record lecture completely offline</p>
                  <p className="text-amber-400">
                    python3 lecturepod_agent.py record --title &quot;Thermodynamics&quot; --subject &quot;Physics&quot; --duration 3600
                  </p>
                  <p className="text-zinc-400">[LecturePod-Pi] Recording saved locally to queue (REC-1718-289.wav)</p>
                  <p className="text-zinc-400">[LecturePod-Pi] Auto-sync: Network detected! Uploading to server...</p>
                  <p className="text-emerald-400 font-semibold">[SUCCESS] Server ACK received. Sync verified.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRIVACY & SECURITY SECTION ================= */}
        <section id="privacy" className="py-20 bg-[#FAFAFA] border-b border-zinc-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">Privacy & Data Isolation First</h2>
            <p className="text-zinc-600 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Your classroom recordings and personal study materials belong exclusively to you. We enforce rigorous database Row Level Security and cryptographic authorization.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-5 bg-white border border-zinc-200 rounded-xl">
                <h4 className="text-sm font-semibold text-zinc-900">User-Specific Isolation</h4>
                <p className="text-xs text-zinc-600 mt-1">
                  Every query verifies your identity. No student can view, search, or access another student&apos;s audio or notes.
                </p>
              </div>
              <div className="p-5 bg-white border border-zinc-200 rounded-xl">
                <h4 className="text-sm font-semibold text-zinc-900">Hashed Credentials</h4>
                <p className="text-xs text-zinc-600 mt-1">
                  Device API keys and student passwords are cryptographically salted and hashed. Plaintext secrets are never stored.
                </p>
              </div>
              <div className="p-5 bg-white border border-zinc-200 rounded-xl">
                <h4 className="text-sm font-semibold text-zinc-900">Full Data Export</h4>
                <p className="text-xs text-zinc-600 mt-1">
                  One-click export of your complete lecture transcripts, notes, flashcards, and quiz attempts in open JSON format.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section id="faq" className="py-20 bg-white border-b border-zinc-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Common Questions
              </span>
              <h2 className="text-3xl font-bold text-zinc-900 mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50">
                <h4 className="text-sm font-semibold text-zinc-900">
                  What happens if my classroom has zero internet or cell reception?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  The Raspberry Pi 4 stores your recordings locally in its SQLite queue. As soon as you step into the library, your dorm, or turn on your mobile hotspot, the agent automatically detects the connection and syncs all pending lectures.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Does Lecture Pod support mixed Hindi and English (Hinglish) lectures?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Yes. The platform supports English, Hindi, and Hinglish lectures through configured speech-to-text models like Whisper and Groq, accurately capturing technical terms alongside Hindi explanations.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Can I use the web platform without a physical Raspberry Pi 4?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Yes! You can manually upload audio recordings or explore with our built-in sample demo lectures to test transcription, notes, flashcards, and quizzes immediately.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50">
                <h4 className="text-sm font-semibold text-zinc-900">
                  How does the system prevent duplicate lectures if Wi-Fi disconnects mid-upload?
                </h4>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Every recording generates a unique `device_recording_id` before transmission. The server uses this key for idempotent registration, ensuring duplicate retries update the same lecture rather than creating clones.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <Mic2 className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-semibold text-sm text-zinc-900">LecturePod</span>
            <span className="text-xs text-zinc-600 ml-2">
              © {new Date().getFullYear()} Lecture Pod. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="#privacy" className="hover:text-zinc-900 transition">
              Privacy Policy
            </Link>
            <Link href="#features" className="hover:text-zinc-900 transition">
              Security
            </Link>
            <Link href="/login" className="hover:text-zinc-900 transition">
              Student Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
