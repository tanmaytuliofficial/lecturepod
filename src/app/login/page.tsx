'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Auto-register or login as demo student
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

      // If registered or already exists, log in
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-xs">
            <Mic2 className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">
            Lecture<span className="text-amber-600">Pod</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Sign In to Your Student Account
        </h2>
        <p className="mt-2 text-xs text-zinc-500">
          Access your classroom lectures, transcripts, and study kits
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-zinc-200 rounded-2xl">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Student Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link has been dispatched to your email address (Simulated).')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign In Button */}
          <div className="mt-6 pt-6 border-t border-zinc-200 text-center">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg transition"
            >
              Demo Mode: Sign In with Sample Student Account
            </button>
            <p className="text-[11px] text-zinc-600 mt-1.5">
              Instantly signs in as Aarav Sharma with sample university credentials
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-zinc-900 hover:text-amber-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
