'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { 
  ArrowLeft, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  ChevronRight, 
  Trophy, 
  BookOpen, 
  RotateCcw,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

export default function TestArenaPage() {
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards'>('quizzes');
  const [simulatingSync, setSimulatingSync] = useState(false);

  const fetchTestData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      const lecRes = await fetch('/api/lectures');
      const lecData = await lecRes.json();
      setLectures(lecData.lectures || []);
    } catch (e) {
      console.error(e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestData();
  }, [router]);

  const handleSimulateSync = async () => {
    setSimulatingSync(true);
    try {
      const res = await fetch('/api/demo/simulate-sync', { method: 'POST' });
      if (res.ok) {
        await fetchTestData();
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
          <div className="w-9 h-9 border-2 border-zinc-300 dark:border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Loading Test Arena...</p>
        </div>
      </div>
    );
  }

  const readyLectures = lectures.filter((l: any) => l.status === 'ready');

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 flex flex-col transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </Link>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Test & Assessment Arena
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hidden sm:inline">
              {user?.full_name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-purple-950/40 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Trophy className="w-3 h-3 text-amber-400" />
                EXAM READINESS & MASTERY
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Test Your Knowledge
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                Challenge yourself with multiple-choice quizzes and active-recall 3D flashcards synthesized directly from your classroom audio.
              </p>
            </div>

            {/* Assessment Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl shrink-0">
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'quizzes'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Quizzes ({readyLectures.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'flashcards'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Flashcards ({readyLectures.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {readyLectures.length === 0 ? (
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto ring-1 ring-purple-200 dark:ring-purple-800">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Test Material Ready Yet</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Test questions and flashcards are automatically generated as soon as your LecturePod Device syncs an audio recording.
            </p>
            <div className="pt-2">
              <button
                onClick={handleSimulateSync}
                disabled={simulatingSync}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-sm transition disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {simulatingSync ? 'Synthesizing...' : 'Simulate Demo Test Kit'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readyLectures.map((lec: any) => (
              <div
                key={lec.id}
                className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-lg transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800">
                      {lec.subject}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ready
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition line-clamp-2">
                    {lec.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {lec.description || 'Lecture transcript synthesized with exam-level test items.'}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    {activeTab === 'quizzes' ? (
                      <>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                        <span>Interactive Quiz</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5 text-purple-500" />
                        <span>3D Flip Deck</span>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/lectures/${lec.id}?tab=${activeTab === 'quizzes' ? 'quiz' : 'flashcards'}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>{activeTab === 'quizzes' ? 'Take Quiz' : 'Practice Cards'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
