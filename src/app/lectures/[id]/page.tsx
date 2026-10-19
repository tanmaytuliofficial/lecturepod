'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentLayout } from '@/components/StudentLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { AudioPlayer } from '@/components/AudioPlayer';
import { FlashcardDeck } from '@/components/FlashcardDeck';
import { QuizPlayer } from '@/components/QuizPlayer';
import { 
  ArrowLeft, 
  RotateCcw, 
  FileText, 
  Volume2, 
  ListOrdered, 
  Layers, 
  HelpCircle, 
  Bookmark, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Search, 
  Clock, 
  Calendar, 
  Sparkles,
  Loader2,
  HardDrive,
  Edit2,
  Save,
  AlertCircle,
  Bot,
  Send
} from 'lucide-react';

export default function LectureWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);

  const initialTab = (searchParams?.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<
    'overview' | 'audio' | 'transcript' | 'notes' | 'flashcards' | 'quiz' | 'revision' | 'mentor'
  >(['overview', 'audio', 'transcript', 'notes', 'flashcards', 'quiz', 'revision', 'mentor'].includes(initialTab) ? initialTab : 'overview');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // AI Mentor state
  const [mentorQuestion, setMentorQuestion] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorMessages, setMentorMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! Main hoon aapka LecturePod AI Mentor. Is lecture ke kisi bhi concept, formula, derivation ya exam question ke baare mein poochhiye — main step-by-step explain karunga!'
    }
  ]);

  // Transcript search
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Notes editing state
  const [notesMarkdown, setNotesMarkdown] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  const fetchLectureData = async () => {
    try {
      const res = await fetch(`/api/lectures/${id}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        throw new Error('Lecture not found');
      }
      const json = await res.json();
      setData(json);
      if (json?.studyMaterials?.structured_notes_markdown) {
        setNotesMarkdown(json.studyMaterials.structured_notes_markdown);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});

    fetchLectureData();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch(`/api/lectures/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structured_notes_markdown: notesMarkdown }),
      });
      setIsEditingNotes(false);
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCopyTranscript = () => {
    if (data?.transcript?.full_text) {
      navigator.clipboard.writeText(data.transcript.full_text);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    }
  };

  const handleRetryProcessing = async () => {
    try {
      await fetch(`/api/lectures/${id}/process`, { method: 'POST' });
      fetchLectureData();
    } catch (e) {
      console.error(e);
    }
  };

  const downloadNotesMarkdown = () => {
    if (!notesMarkdown) return;
    const blob = new Blob([notesMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data?.lecture?.title || 'Lecture_Notes').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAskMentor = async (qText?: string) => {
    const text = qText || mentorQuestion;
    if (!text.trim() || mentorLoading) return;
    setMentorMessages(prev => [...prev, { role: 'user', text }]);
    if (!qText) setMentorQuestion('');
    setMentorLoading(true);
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId: id, question: text })
      });
      const d = await res.json();
      setMentorMessages(prev => [...prev, { role: 'assistant', text: d.answer || 'Doubt solved.' }]);
    } catch {
      setMentorMessages(prev => [...prev, { role: 'assistant', text: 'Network connection error. Please try again.' }]);
    } finally {
      setMentorLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout user={currentUser} workspace="study" breadcrumbs={[{ label: 'Lecture Workspace' }]}>
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
          <p className="text-xs">Loading lecture workspace...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!data?.lecture) {
    return (
      <StudentLayout user={currentUser} workspace="study" breadcrumbs={[{ label: 'Lecture Not Found' }]}>
        <div className="py-20 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Lecture Not Found</h2>
          <p className="text-xs text-zinc-500 mt-1">This lecture does not exist or you do not have permission.</p>
          <Link href="/lectures" className="mt-4 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold">
            Back to Library
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { lecture, transcript, studyMaterials, flashcards, quiz } = data;

  // Filter transcript segments
  const filteredSegments = (transcript?.segments || []).filter((seg: any) =>
    transcriptSearch ? seg.text.toLowerCase().includes(transcriptSearch.toLowerCase()) : true
  );

  return (
    <StudentLayout
      user={currentUser}
      workspace="study"
      breadcrumbs={[
        { label: 'Lecture Library', href: '/lectures' },
        { label: lecture.title }
      ]}
    >
      <div className="space-y-6">
        {/* Top Banner & Header */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/lectures"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              {lecture.subject}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                  {lecture.title}
                </h1>
                <StatusBadge status={lecture.status} />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {new Date(lecture.recording_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {lecture.duration_seconds > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {Math.floor(lecture.duration_seconds / 60)} min
                  </span>
                )}
                {lecture.device_name && (
                  <span className="inline-flex items-center gap-1 font-mono text-zinc-400">
                    <HardDrive className="w-3.5 h-3.5" />
                    {lecture.device_name}
                  </span>
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {lecture.status === 'failed' && (
                <button
                  onClick={handleRetryProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Processing
                </button>
              )}
            </div>
          </div>

          {/* 7 Workspace Tabs */}
          <div className="mt-6 flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200/80 dark:border-zinc-800 -mb-6 sm:-mb-8 pb-0 text-xs font-semibold scrollbar-none">
            {[
              { id: 'overview', label: 'Overview', icon: Bookmark },
              { id: 'audio', label: 'Audio Player', icon: Volume2 },
              { id: 'transcript', label: 'Transcript', icon: ListOrdered },
              { id: 'notes', label: 'AI Notes', icon: FileText },
              { id: 'flashcards', label: `Flashcards (${flashcards?.length || 0})`, icon: Layers },
              { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
              { id: 'revision', label: 'Revision Sheet', icon: Sparkles },
              { id: 'mentor', label: 'AI Study Mentor', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition whitespace-nowrap text-xs ${
                    isActive
                      ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-bold bg-amber-500/10 rounded-t-xl'
                      : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-zinc-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Workspace Body */}
        <div className="w-full">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl">
            {/* AI Summary Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Lecture Summary
              </div>
              <p className="text-sm text-zinc-800 leading-relaxed font-normal">
                {studyMaterials?.summary ||
                  (lecture.status === 'ready'
                    ? 'Summary ready.'
                    : 'AI summary will appear automatically once transcription and processing complete.')}
              </p>
            </div>

            {/* Key Concepts */}
            {studyMaterials?.key_concepts && studyMaterials.key_concepts.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Key Concepts Covered
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {studyMaterials.key_concepts.map((concept: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-semibold text-zinc-800 flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Timeline */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-7 shadow-xs space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Processing Lifecycle & Pipeline Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className={`p-4 rounded-2xl border ${lecture.audio_url ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                  <p className="text-xs font-bold">1. Device Capture</p>
                  <p className="text-[11px] mt-0.5">{lecture.audio_url ? 'Audio Synced' : 'Queued on LecturePod Device'}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${transcript ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                  <p className="text-xs font-bold">2. Speech-to-Text</p>
                  <p className="text-[11px] mt-0.5">{transcript ? 'Transcribed' : 'Pending'}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${studyMaterials ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                  <p className="text-xs font-bold">3. Notes & Summary</p>
                  <p className="text-[11px] mt-0.5">{studyMaterials ? 'Synthesized' : 'Pending'}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${flashcards?.length > 0 ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                  <p className="text-xs font-bold">4. Study Kit</p>
                  <p className="text-[11px] mt-0.5">{flashcards?.length > 0 ? 'Flashcards & Quiz Ready' : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AUDIO PLAYER ================= */}
        {activeTab === 'audio' && (
          <div className="space-y-6 max-w-2xl">
            <AudioPlayer
              audioUrl={lecture.audio_url}
              title={lecture.title}
              durationSeconds={lecture.duration_seconds}
              seekTime={seekTime}
            />

            {/* Hint about timestamps */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">Pro-Tip: </span>
              In the <strong>Transcript</strong> tab, click any time badge (e.g.{' '}
              <span className="font-mono bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">01:45</span>) to jump the audio player straight to that moment of the lecture.
            </div>
          </div>
        )}

        {/* ================= TAB 3: TRANSCRIPT ================= */}
        {activeTab === 'transcript' && (
          <div className="space-y-6 max-w-3xl">
            {/* Search & Copy Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search inside this lecture transcript..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-600 font-mono">
                  Language: {transcript?.language?.toUpperCase() || 'EN'}
                </span>

                <button
                  onClick={handleCopyTranscript}
                  disabled={!transcript?.full_text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Full Transcript
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Segments Display */}
            {!transcript ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
                <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-800">Transcription In Progress</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  The audio is currently being processed by speech recognition. Once done, timestamped lines will appear here.
                </p>
              </div>
            ) : filteredSegments.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-xs">
                No transcript segments matched &quot;{transcriptSearch}&quot;.
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 shadow-2xs overflow-hidden">
                {filteredSegments.map((seg: any) => (
                  <div key={seg.id} className="p-4 hover:bg-zinc-50/60 transition flex items-start gap-3">
                    <button
                      onClick={() => {
                        setSeekTime(seg.start_time);
                        setActiveTab('audio');
                      }}
                      className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-mono text-[11px] font-semibold shrink-0 transition"
                      title="Jump audio to this timestamp"
                    >
                      {formatSeconds(seg.start_time)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-zinc-400 mr-2">
                        {seg.speaker || 'Instructor'}:
                      </span>
                      <span className="text-xs text-zinc-800 leading-relaxed">{seg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: AI NOTES ================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6 max-w-3xl">
            {/* Notes Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-700">Structured Lecture Notes</span>
                {notesSavedNotice && (
                  <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Autosaved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditingNotes ? (
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-100 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Markdown
                  </button>
                )}

                <button
                  onClick={downloadNotesMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-100 rounded-lg transition"
                  title="Download as Markdown"
                >
                  <Download className="w-3.5 h-3.5" /> Export .md
                </button>
              </div>
            </div>

            {/* Notes Content */}
            {!studyMaterials ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
                <Sparkles className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-800">Notes Generation In Progress</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Once audio is transcribed, structured markdown notes with exam takeaways will appear here.
                </p>
              </div>
            ) : isEditingNotes ? (
              <textarea
                rows={22}
                value={notesMarkdown}
                onChange={(e) => setNotesMarkdown(e.target.value)}
                className="w-full p-5 bg-white border border-zinc-300 rounded-2xl font-mono text-xs text-zinc-900 leading-relaxed focus:outline-hidden focus:border-amber-600 shadow-2xs"
              />
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-2xs prose prose-zinc max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans text-zinc-800">
                  {notesMarkdown}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: FLASHCARDS ================= */}
        {activeTab === 'flashcards' && (
          <FlashcardDeck lectureId={lecture.id} initialCards={flashcards || []} />
        )}

        {/* ================= TAB 6: QUIZ ================= */}
        {activeTab === 'quiz' && (
          <QuizPlayer
            lectureId={lecture.id}
            quizId={quiz?.id || ''}
            title={quiz?.title || `${lecture.title} Quiz`}
            questions={quiz?.questions || []}
            previousAttempts={quiz?.recentAttempts || []}
          />
        )}

        {/* ================= TAB 7: REVISION SHEET ================= */}
        {activeTab === 'revision' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-800">One-Page Exam Revision Sheet</h2>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 print:p-0 print:border-none">
              {/* Header */}
              <div className="border-b border-zinc-200 pb-4">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  {lecture.subject}
                </span>
                <h1 className="text-xl font-extrabold text-zinc-900 mt-0.5">{lecture.title}</h1>
                <p className="text-xs text-zinc-500 mt-1">High-Yield Exam Preparation Capsule</p>
              </div>

              {/* Definitions list */}
              {studyMaterials?.definitions && studyMaterials.definitions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Important Definitions & Terms
                  </h3>
                  <div className="space-y-2">
                    {studyMaterials.definitions.map((def: any, i: number) => (
                      <div key={i} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs">
                        <strong className="text-zinc-900 font-semibold">{def.term}: </strong>
                        <span className="text-zinc-600">{def.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas and Facts */}
              {studyMaterials?.formulas_and_facts && studyMaterials.formulas_and_facts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Formulas & Key Facts
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-700">
                    {studyMaterials.formulas_and_facts.map((fact: string, i: number) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exam Takeaways */}
              {studyMaterials?.exam_takeaways && studyMaterials.exam_takeaways.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Exam-Focused Takeaways & High-Yield Questions
                  </h3>
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    {studyMaterials.exam_takeaways.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-900">
                        <span className="font-bold">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. AI STUDY MENTOR TAB */}
        {activeTab === 'mentor' && (
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                    AI Doubt Mentor for {lecture.title}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Ask any question, conceptual derivation, or exam problem on this lecture.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2">
              {[
                'Explain the main concept in simple Hinglish',
                'What are the key formulas to remember for the exam?',
                'Give me 2 practice problems with solutions based on this lecture',
                'What is the professor emphasizing most for tests?'
              ].map((pText) => (
                <button
                  key={pText}
                  onClick={() => handleAskMentor(pText)}
                  disabled={mentorLoading}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition"
                >
                  ✨ {pText}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
              {mentorMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-zinc-400 mb-1">{m.role === 'user' ? 'You' : 'AI Study Mentor'}</span>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-w-2xl ${
                    m.role === 'user'
                      ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-br-none'
                      : 'bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-xs'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {mentorLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-purple-600 dark:text-purple-400 font-semibold animate-pulse">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>AI Mentor is analyzing lecture context...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleAskMentor(); }} className="flex items-center gap-2">
              <input
                type="text"
                value={mentorQuestion}
                onChange={(e) => setMentorQuestion(e.target.value)}
                placeholder="Type your doubt about this lecture..."
                className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!mentorQuestion.trim() || mentorLoading}
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </StudentLayout>
  );
}
