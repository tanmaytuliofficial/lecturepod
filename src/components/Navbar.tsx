'use client';

import React from 'react';
import Link from 'next/link';
import { Mic2, ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm group-hover:bg-zinc-800 transition">
            <Mic2 className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-900">
            Lecture<span className="text-amber-600">Pod</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <Link href="#features" className="hover:text-zinc-900 transition">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-zinc-900 transition">
            How It Works
          </Link>
          <Link href="#device" className="hover:text-zinc-900 transition">
            Pi 4 Hardware
          </Link>
          <Link href="#privacy" className="hover:text-zinc-900 transition">
            Privacy & Security
          </Link>
          <Link href="#faq" className="hover:text-zinc-900 transition">
            FAQ
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg shadow-xs transition"
          >
            Get Started
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
