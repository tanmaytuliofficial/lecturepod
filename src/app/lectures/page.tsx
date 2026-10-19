'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentLayout } from '@/components/StudentLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Search, 
  Grid, 
  List, 
  Filter, 
  PlusCircle, 
  Play, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Download, 
  Clock, 
  Calendar, 
  HardDrive, 
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  Zap,
  Volume2,
  FileText,
  HelpCircle,
  Layers,
  Bot,
  ChevronRight,
  Send,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface Lecture {
  id: string;
  title: string;
  subject: string;
  description?: string;
  tags?: string;
  recording_date: string;
  duration_seconds: number;
  file_size_bytes: number;
  audio_url?: string;
  status: string;
  error_message?: string;
  device_name?: string;
}

function LecturesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Active Offering Tab: all | audios | notes | practice | flashcards | mentor
  const initialTab = searchParams.get('tab') || 'all';
  const [activeOfferingTab, setActiveOfferingTab] = useState<string>(initialTab);

  // Filters & layout state
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // AI Mentor Chat State
  const [mentorLectureId, setMentorLectureId] = useState<string>('');
  const [mentorQuestion, setMentorQuestion] = useState<string>('');
  const [mentorLoading, setMentorLoading] = useState<boolean>(false);
  const [mentorMessages, setMentorMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time?: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! Main hoon aapka **LecturePod AI Mentor**. Apne recorded lectures mein se koi bhi doubt, formula, ya conceptual derivation poochhiye — main step-by-step explain karunga!',
      time: 'Just now'
    }
  ]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(searchParams.get('new') === 'true');
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit modal
  const [editLecture, setEditLecture] = useState<Lecture | null>(null);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Demo simulator state
  const [simulatingSync, setSimulatingSync] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const fetchLectures = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedStatus) params.append('status', selectedStatus);
      if (sortOrder) params.append('sort', sortOrder);

      const res = await fetch(`/api/lectures?${params.toString()}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setLectures(data.lectures || []);
      setSubjects(data.subjects || []);
      if (!mentorLectureId && data.lectures?.length > 0) {
        setMentorLectureId(data.lectures[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject, selectedStatus, sortOrder, router, mentorLectureId]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});

    fetchLectures();
  }, [fetchLectures]);

  const handleSimulateSync = async () => {
    setSimulatingSync(true);
    try {
      const res = await fetch('/api/demo/simulate-sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBannerNotice(data.message || 'Simulated lecture captured & AI study kit generated!');
        fetchLectures();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingSync(false);
    }
  };

  const handleSendMentorQuestion = async (qText?: string) => {
    const textToSend = qText || mentorQuestion;
    if (!textToSend.trim() || mentorLoading) return;

    const userMsg = { role: 'user' as const, text: textToSend, time: 'Just now' };
    setMentorMessages(prev => [...prev, userMsg]);
    if (!qText) setMentorQuestion('');
    setMentorLoading(true);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: mentorLectureId,
          question: textToSend,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMentorMessages(prev => [
          ...prev,
          { role: 'assistant', text: data.answer, time: 'Just now' }
        ]);
      } else {
        setMentorMessages(prev => [
          ...prev,
          { role: 'assistant', text: data.error || 'Doubt clear karne mein error aaya. Kripya punah prayas karein.', time: 'Just now' }
        ]);
      }
    } catch (e) {
      setMentorMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Network connection issue. Please retry.', time: 'Just now' }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formTitle.trim()) {
      setFormError('Lecture title is required');
      return;
    }
    if (!formSubject.trim()) {
      setFormError('Subject is required');
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('subject', formSubject);
      formData.append('description', formDescription);
      formData.append('tags', formTags);
      if (selectedFile) {
        formData.append('audio', selectedFile);
      }

      const res = await fetch('/api/lectures', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lecture');
      }

      setShowAddModal(false);
      setFormTitle('');
      setFormSubject('');
      setFormDescription('');
      setFormTags('');
      setSelectedFile(null);
      fetchLectures();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLecture) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lectures/${editLecture.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          subject: formSubject,
          description: formDescription,
        }),
      });
      if (res.ok) {
        setEditLecture(null);
        fetchLectures();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/lectures/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      fetchLectures();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs) return '0m';
    const m = Math.floor(secs / 60);
    return `${m} min`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const readyLectures = lectures.filter(l => l.status === 'ready');

  return (
    <StudentLayout user={currentUser} workspace="study" breadcrumbs={[{ label: 'Study Library' }]}>
      <div className="space-y-6">
        {/* Notice */}
        {bannerNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 mb-1.5">
              <span>ACADEMIC WORKSPACE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Classroom Study Library
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Explore your classroom recordings with synchronized audios, structured notes, practice problems, flashcards, and AI doubt solver.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateSync}
              disabled={simulatingSync}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
              title="Simulate a new classroom lecture upload from hardware"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {simulatingSync ? 'Syncing...' : 'Simulate Audio Sync'}
            </button>

            <button
              onClick={() => {
                setFormTitle('');
                setFormSubject('');
                setFormDescription('');
                setFormTags('');
                setSelectedFile(null);
                setFormError(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload Recording</span>
            </button>
          </div>
        </div>

        {/* ================= CATEGORY OFFERINGS TABS ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200/80 dark:border-zinc-800/80">
          {[
            { id: 'all', label: 'All Offerings', icon: BookOpen, count: lectures.length },
            { id: 'audios', label: 'Classroom Audios', icon: Volume2, count: lectures.length },
            { id: 'notes', label: 'Structured Notes', icon: FileText, count: readyLectures.length },
            { id: 'practice', label: 'Practice Problems (DPP)', icon: HelpCircle, count: readyLectures.length },
            { id: 'flashcards', label: '3D Flashcards', icon: Layers, count: readyLectures.length },
            { id: 'mentor', label: 'AI Study Mentor', icon: Bot, badge: 'AI COACH' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeOfferingTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveOfferingTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= IF ACTIVE TAB IS AI STUDY MENTOR ================= */}
        {activeOfferingTab === 'mentor' && (
          <div className="bg-white dark:bg-[#111114] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-950 dark:text-white">
                  <Bot className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                    LecturePod AI Study Mentor
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Intelligent Conceptual Doubt Solver • Grounded in your classroom lectures
                  </p>
                </div>
              </div>

              {/* Lecture Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">Lecture:</span>
                <select
                  value={mentorLectureId}
                  onChange={(e) => setMentorLectureId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {lectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.subject})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Recommended Doubt Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Explain the core concept in simple Hinglish',
                  'What are the key formulas and equations to memorize?',
                  'Give me 3 high-yield exam practice problems with solutions',
                  'Summarize the professor’s main takeaways for the exam',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => handleSendMentorQuestion(promptText)}
                    disabled={mentorLoading}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-750 transition disabled:opacity-50"
                  >
                    ✨ {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
              {mentorMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-zinc-400">
                    <span>{msg.role === 'user' ? 'You' : 'AI Study Mentor'}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-br-none'
                        : 'bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {mentorLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-zinc-600 dark:text-zinc-400 font-semibold animate-pulse">
                  <Bot className="w-4 h-4 animate-spin text-amber-500" />
                  <span>AI Mentor is thinking and analyzing lecture notes...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMentorQuestion();
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={mentorQuestion}
                onChange={(e) => setMentorQuestion(e.target.value)}
                placeholder="Ask any doubt about this lecture (e.g. 'Explain step 2 of Raft consensus')..."
                className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
              <button
                type="submit"
                disabled={!mentorQuestion.trim() || mentorLoading}
                className="px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* ================= SEARCH & FILTERS TOOLBAR ================= */}
        {activeOfferingTab !== 'mentor' && (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lectures by title, subject, tags, or concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="ready">Ready</option>
                <option value="transcribing">Transcribing</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>

              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    layout === 'grid'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-1.5 rounded-lg transition ${
                    layout === 'list'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= LECTURES LIST / GRID ================= */}
        {activeOfferingTab !== 'mentor' && (
          loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
              <p className="text-xs">Loading classroom study library...</p>
            </div>
          ) : lectures.length === 0 ? (
            <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Lectures Found</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Start capturing lectures with your LecturePod Device, or simulate an automatic upload right now.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSimulateSync}
                  disabled={simulatingSync}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
                >
                  <Zap className="w-3.5 h-3.5 text-zinc-950" />
                  {simulatingSync ? 'Syncing...' : 'Simulate Audio Sync'}
                </button>
              </div>
            </div>
          ) : layout === 'grid' ? (
            /* ================= GRID VIEW WITH LECTUREPOD WORKFLOW ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lec) => (
                <div
                  key={lec.id}
                  className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-lg truncate max-w-[160px]">
                        {lec.subject}
                      </span>
                      <StatusBadge status={lec.status} size="sm" />
                    </div>

                    <Link href={`/lectures/${lec.id}`} className="block">
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">
                        {lec.title}
                      </h3>
                    </Link>

                    {lec.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {lec.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400 dark:text-zinc-500 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(lec.recording_date)}
                      </span>
                      {lec.duration_seconds > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(lec.duration_seconds)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ================= STUDY OFFERINGS ARROW CHAIN ================= */}
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Study Offerings:
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/lectures/${lec.id}?tab=audio`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold transition border border-zinc-200 dark:border-zinc-700"
                        title="Listen to classroom audio"
                      >
                        <Volume2 className="w-3 h-3 text-zinc-500" />
                        <span>Audios</span>
                      </Link>

                      <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />

                      <Link
                        href={`/lectures/${lec.id}?tab=notes`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold transition border border-zinc-200 dark:border-zinc-700"
                        title="Read structured notes"
                      >
                        <FileText className="w-3 h-3 text-zinc-500" />
                        <span>Notes</span>
                      </Link>

                      <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />

                      <Link
                        href={`/lectures/${lec.id}?tab=quiz`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold transition border border-zinc-200 dark:border-zinc-700"
                        title="Practice problems & DPP"
                      >
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                        <span>Practice</span>
                      </Link>

                      <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />

                      <Link
                        href={`/lectures/${lec.id}?tab=flashcards`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold transition border border-zinc-200 dark:border-zinc-700"
                        title="3D Flip flashcards"
                      >
                        <Layers className="w-3 h-3 text-zinc-500" />
                        <span>Cards</span>
                      </Link>

                      <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />

                      <button
                        onClick={() => {
                          setMentorLectureId(lec.id);
                          setActiveOfferingTab('mentor');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-[11px] font-bold transition shadow-xs"
                        title="Ask AI Mentor doubt solver"
                      >
                        <Bot className="w-3 h-3" />
                        <span>AI Mentor</span>
                      </button>
                    </div>

                    {/* Bottom Edit & Retry */}
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/lectures/${lec.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-amber-500"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditLecture(lec);
                            setFormTitle(lec.title);
                            setFormSubject(lec.subject);
                            setFormDescription(lec.description || '');
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(lec.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ================= LIST VIEW WITH LECTUREPOD WORKFLOW ================= */
            <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-xs">
              {lectures.map((lec) => (
                <div key={lec.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-lg">
                        {lec.subject}
                      </span>
                      <StatusBadge status={lec.status} size="sm" />
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">{formatDate(lec.recording_date)}</span>
                      {lec.duration_seconds > 0 && (
                        <>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500">{formatDuration(lec.duration_seconds)}</span>
                        </>
                      )}
                    </div>
                    <Link href={`/lectures/${lec.id}`} className="block">
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition truncate">
                        {lec.title}
                      </h3>
                    </Link>
                  </div>

                  {/* Flow Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <Link
                      href={`/lectures/${lec.id}?tab=audio`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                    >
                      Audios
                    </Link>
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                    <Link
                      href={`/lectures/${lec.id}?tab=notes`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                    >
                      Notes
                    </Link>
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                    <Link
                      href={`/lectures/${lec.id}?tab=quiz`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                    >
                      Practice
                    </Link>
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                    <Link
                      href={`/lectures/${lec.id}?tab=flashcards`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                    >
                      Cards
                    </Link>
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                    <button
                      onClick={() => {
                        setMentorLectureId(lec.id);
                        setActiveOfferingTab('mentor');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition shadow-xs"
                    >
                      AI Mentor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Modal: Add Lecture */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Upload Classroom Recording</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Lecture Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus Algorithms"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Key topics covered..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Audio Recording (Optional)</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-zinc-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold disabled:opacity-50"
                  >
                    {submitting ? 'Uploading...' : 'Save Lecture'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Lecture */}
        {editLecture && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Edit Lecture Metadata</h3>
                <button onClick={() => setEditLecture(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Lecture Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditLecture(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Update Lecture'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Delete this lecture?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                This will permanently delete the audio, transcript, notes, flashcards, and quizzes. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default function LecturesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <LecturesPageContent />
    </Suspense>
  );
}
