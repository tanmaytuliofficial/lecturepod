'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-950 flex flex-col selection:bg-amber-200 selection:text-amber-950">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION (2ND SCREENSHOT PART) ================= */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-36">
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
          </div>
        </section>

        {/* Blank workspace below - waiting for user's step-by-step guidance */}
      </main>
    </div>
  );
}
