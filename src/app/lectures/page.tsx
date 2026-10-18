'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentNav } from '@/components/StudentNav';
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
  AlertCircle
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

  // Filters & layout state
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(searchParams.get('new') === 'true');
  const [editLecture, setEditLecture] = useState<Lecture | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for adding/editing
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAudioFile, setFormAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchLectures = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedSubject) params.set('subject', selectedSubject);
      if (selectedStatus) params.set('status', selectedStatus);
      if (sortOrder) params.set('sort', sortOrder);

      const res = await fetch(`/api/lectures?${params.toString()}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setLectures(data.lectures || []);
      setSubjects(data.subjects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject, selectedStatus, sortOrder, router]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});

    fetchLectures();
  }, [fetchLectures]);

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('subject', formSubject);
      if (formDescription) formData.append('description', formDescription);
      if (formAudioFile) formData.append('audio', formAudioFile);

      const res = await fetch('/api/lectures', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lecture');

      setShowAddModal(false);
      setFormTitle('');
      setFormSubject('');
      setFormDescription('');
      setFormAudioFile(null);
      fetchLectures();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLecture = async (e: React.FormEvent) => {
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

      if (!res.ok) throw new Error('Update failed');
      setEditLecture(null);
      fetchLectures();
    } catch (err: any) {
      setFormError(err.message);
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

  const handleRetryProcessing = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/lectures/${id}/process`, { method: 'POST' });
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <StudentNav user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Classroom Lecture Library
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Search, filter, replay recordings, and review AI study kits
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormTitle('');
                setFormSubject('');
                setFormDescription('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              Add Recording
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, tags, or transcript..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-hidden focus:border-amber-600"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-hidden focus:border-amber-600"
            >
              <option value="">All Processing States</option>
              <option value="ready">Ready (Completed)</option>
              <option value="transcribing">Transcribing</option>
              <option value="generating_study_material">Generating Study Kit</option>
              <option value="uploaded">Uploaded</option>
              <option value="waiting_to_sync">Waiting to Sync</option>
              <option value="failed">Failed (Retry Available)</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-hidden focus:border-amber-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (Title)</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 p-0.5">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-md ${
                  layout === 'grid' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500'
                }`}
                title="Grid layout"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-md ${
                  layout === 'list' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500'
                }`}
                title="List layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= LECTURE LISTINGS ================= */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs">Loading lecture library...</p>
          </div>
        ) : lectures.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">No Lectures Found</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {searchQuery || selectedSubject || selectedStatus
                  ? 'No lectures matched your current filters. Try resetting the search or subject filter.'
                  : 'Start capturing lectures with your Raspberry Pi 4 device, or add a permitted test recording to experience the AI study kit workspace.'}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setFormTitle('Introduction to Algorithms');
                  setFormSubject('Computer Science');
                  setShowAddModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                Add Test Recording
              </button>

              <Link
                href="/devices"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition"
              >
                Connect Raspberry Pi
              </Link>
            </div>
          </div>
        ) : layout === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lectures.map((lec) => (
              <div
                key={lec.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                      {lec.subject}
                    </span>
                    <StatusBadge status={lec.status} size="sm" />
                  </div>

                  <Link href={`/lectures/${lec.id}`} className="block">
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-amber-800 transition line-clamp-2">
                      {lec.title}
                    </h3>
                  </Link>

                  {lec.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{lec.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(lec.recording_date)}
                    </span>
                    {lec.duration_seconds > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDuration(lec.duration_seconds)}
                      </span>
                    )}
                    {lec.file_size_bytes > 0 && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> {formatFileSize(lec.file_size_bytes)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <Link
                    href={`/lectures/${lec.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-amber-700"
                  >
                    Open Workspace
                  </Link>

                  <div className="flex items-center gap-1">
                    {lec.status === 'failed' && (
                      <button
                        onClick={(e) => handleRetryProcessing(lec.id, e)}
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md transition"
                        title="Retry AI processing"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditLecture(lec);
                        setFormTitle(lec.title);
                        setFormSubject(lec.subject);
                        setFormDescription(lec.description || '');
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
                      title="Edit details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(lec.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                      title="Delete lecture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden shadow-2xs">
            {lectures.map((lec) => (
              <div
                key={lec.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/80 transition"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {lec.subject}
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500">{formatDate(lec.recording_date)}</span>
                    {lec.duration_seconds > 0 && (
                      <>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="text-xs text-zinc-500">{formatDuration(lec.duration_seconds)}</span>
                      </>
                    )}
                  </div>
                  <Link href={`/lectures/${lec.id}`}>
                    <h3 className="text-sm font-bold text-zinc-900 hover:text-amber-800 transition truncate">
                      {lec.title}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={lec.status} />

                  <div className="flex items-center gap-1">
                    {lec.status === 'failed' && (
                      <button
                        onClick={(e) => handleRetryProcessing(lec.id, e)}
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md transition"
                        title="Retry processing"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditLecture(lec);
                        setFormTitle(lec.title);
                        setFormSubject(lec.subject);
                        setFormDescription(lec.description || '');
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(lec.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= ADD RECORDING MODAL ================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-base font-bold text-zinc-900">Add Classroom Recording</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateLecture} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus & Paxos"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Subject / Course *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Description / Topics Covered (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Key topics, exam warnings, or chapter numbers..."
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Audio File (Optional WAV / MP3 / M4A)
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFormAudioFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    If no audio file is uploaded, a sample test audio placeholder will be generated automatically.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating & Starting AI...' : 'Create & Process'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= EDIT MODAL ================= */}
        {editLecture && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-base font-bold text-zinc-900">Edit Lecture Details</h3>
                <button
                  onClick={() => setEditLecture(null)}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateLecture} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setEditLecture(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900">Delete Lecture?</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  This will permanently remove the audio recording, transcript, study notes, flashcards, and quizzes. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LecturesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <LecturesPageContent />
    </React.Suspense>
  );
}
