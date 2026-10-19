'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mic2, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  KeyRound, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { LecturePodDevice } from '@/components/LecturePodDevice';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/onboarding');
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
            DEVICE ENROLLMENT
          </span>
        </Link>

        <Link
          href="/login"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 transition"
        >
          Already have an account? Sign In →
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            New Student Provisioning
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Provision Your LecturePod Account
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400">
            Link your physical recording unit and start turning voice into exam materials
          </p>
        </div>

        {/* Centered Device Container */}
        <div className="w-full flex justify-center items-center max-w-md">
          <form onSubmit={handleSubmit} className="w-full">
            <LecturePodDevice
              isSubmitting={loading}
              onButtonPress={() => handleSubmit()}
              buttonLabel="Press Illuminated Button to Register"
              statusText="ENROLLING..."
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
                      placeholder="Aarav Sharma"
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
                      placeholder="student@university.edu"
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
                        <span>Provisioning Account...</span>
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
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-zinc-900 text-center text-xs text-zinc-600 font-mono">
        LecturePod Hardware Suite &bull; Autonomous Classroom Capture System &bull; &copy; 2026
      </footer>
    </div>
  );
}
