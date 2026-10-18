'use client';

import React from 'react';
import Link from 'next/link';
import { Mic2, ArrowRight, Sparkles } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-zinc-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-sm ring-1 ring-zinc-800 group-hover:scale-[1.02] transition">
            <Mic2 className="w-4 h-4 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-zinc-950 flex items-center gap-1">
              Lecture<span className="text-amber-600">Pod</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-zinc-600">
              Acoustic AI Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-600">
          <Link href="#device" className="hover:text-zinc-950 transition flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
            LecturePod Device
          </Link>
          <Link href="#features" className="hover:text-zinc-950 transition">
            Intelligence
          </Link>
          <Link href="#how-it-works" className="hover:text-zinc-950 transition">
            Workflow
          </Link>
          <Link href="#privacy" className="hover:text-zinc-950 transition">
            Security & Privacy
          </Link>
          <Link href="#faq" className="hover:text-zinc-950 transition">
            FAQ
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3.5 py-2 rounded-xl hover:bg-zinc-100/80 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-xl shadow-xs ring-1 ring-zinc-800 hover:scale-[1.01] transition"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
