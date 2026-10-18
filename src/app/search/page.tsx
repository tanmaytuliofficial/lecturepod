'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentLayout } from '@/components/StudentLayout';
import { 
  Search, 
  Library, 
  ListOrdered, 
  FileText, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [results, setResults] = useState<{
    lectures: any[];
    transcripts: any[];
    notes: any[];
    flashcards: any[];
  }>({ lectures: [], transcripts: [], notes: [], flashcards: [] });

  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});

    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (term: string) => {
    if (!term.trim() || term.trim().length < 2) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setResults(data.results || { lectures: [], transcripts: [], notes: [], flashcards: [] });
      setTotalMatches(data.totalMatches || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <StudentLayout user={currentUser} breadcrumbs={[{ label: 'Concept Search' }]}>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Global Concept & Lecture Search
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Search across lecture titles, subjects, transcripts, study notes, and flashcards
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a concept, formula, keyword, or exam topic (e.g. Eigenvalues, TCP, Entropy)..."
            className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white shadow-xs focus:outline-hidden focus:border-amber-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 px-5 py-2 text-xs font-semibold text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs">Searching database archive...</p>
          </div>
        ) : hasSearched && totalMatches === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-zinc-400" />
            <h4 className="text-sm font-semibold text-zinc-800">No Matches Found</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              We couldn&apos;t find any lectures, transcripts, or notes containing &quot;{query}&quot;. Try a different keyword or check spelling.
            </p>
          </div>
        ) : hasSearched ? (
          <div className="space-y-8">
            <div className="text-xs font-semibold text-zinc-500">
              Found <span className="text-zinc-900 font-bold">{totalMatches}</span> results across your study archive:
            </div>

            {/* 1. Lectures Matching Title / Subject */}
            {results.lectures.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Library className="w-4 h-4" /> Lectures ({results.lectures.length})
                </h3>
                <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden shadow-2xs">
                  {results.lectures.map((lec) => (
                    <Link
                      key={lec.id}
                      href={`/lectures/${lec.id}`}
                      className="p-4 hover:bg-zinc-50/80 transition flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {lec.subject}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-amber-800 transition mt-1">
                          {lec.title}
                        </h4>
                        {lec.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{lec.description}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Transcript Segments */}
            {results.transcripts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4" /> Spoken Classroom Quotes ({results.transcripts.length})
                </h3>
                <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden shadow-2xs">
                  {results.transcripts.map((t) => (
                    <Link
                      key={t.segment_id}
                      href={`/lectures/${t.lecture_id}?tab=transcript`}
                      className="p-4 hover:bg-zinc-50/80 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-zinc-500">
                            {t.lecture_title} ({t.lecture_subject})
                          </span>
                          <span className="text-xs text-zinc-300">•</span>
                          <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">
                            {formatSeconds(t.start_time)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-800 italic leading-relaxed group-hover:text-zinc-900">
                          &quot;{t.text}&quot;
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Study Notes */}
            {results.notes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Study Notes & Summaries ({results.notes.length})
                </h3>
                <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden shadow-2xs">
                  {results.notes.map((n) => (
                    <Link
                      key={n.material_id}
                      href={`/lectures/${n.lecture_id}?tab=notes`}
                      className="p-4 hover:bg-zinc-50/80 transition flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-500">
                          {n.lecture_title} ({n.lecture_subject})
                        </span>
                        <p className="text-xs text-zinc-800 line-clamp-2 mt-1">{n.summary}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Flashcards */}
            {results.flashcards.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Flashcards ({results.flashcards.length})
                </h3>
                <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden shadow-2xs">
                  {results.flashcards.map((fc) => (
                    <Link
                      key={fc.card_id}
                      href={`/lectures/${fc.lecture_id}?tab=flashcards`}
                      className="p-4 hover:bg-zinc-50/80 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-zinc-500">
                          {fc.lecture_title}
                        </span>
                        <p className="text-xs font-semibold text-zinc-900">Q: {fc.question}</p>
                        <p className="text-xs text-zinc-600">A: {fc.answer}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-amber-500" />
            <h4 className="text-sm font-semibold text-zinc-700">Enter a Search Term Above</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Quickly find any formula, theorem, or classroom discussion across all your recorded subjects.
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <SearchPageContent />
    </React.Suspense>
  );
}
