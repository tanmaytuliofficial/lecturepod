'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/StudentLayout';
import { 
  User, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Check, 
  Globe, 
  Cpu, 
  AlertCircle,
  Loader2,
  HardDrive
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [collegeSchool, setCollegeSchool] = useState('');
  const [courseBranch, setCourseBranch] = useState('');
  const [semesterClass, setSemesterClass] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [studyGoals, setStudyGoals] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          setFullName(data.user.full_name || '');
          setCollegeSchool(data.user.college_school || '');
          setCourseBranch(data.user.course_branch || '');
          setSemesterClass(data.user.semester_class || '');
          setPreferredLanguage(data.user.preferred_language || 'english');
          setStudyGoals(data.user.study_goals || '');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          college_school: collegeSchool,
          course_branch: courseBranch,
          semester_class: semesterClass,
          preferred_language: preferredLanguage,
          study_goals: studyGoals,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/export';
  };

  if (loading) {
    return (
      <StudentLayout user={currentUser} breadcrumbs={[{ label: 'Settings & Privacy' }]}>
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
          <p className="text-xs">Loading settings...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout user={currentUser} breadcrumbs={[{ label: 'Settings & Privacy' }]}>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Settings & Privacy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your personal academic profile, language preferences, and data privacy controls
          </p>
        </div>

        {/* ================= PROFILE SETTINGS ================= */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-zinc-900">Academic Profile</h2>
            </div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-3.5 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-xs text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  College / School
                </label>
                <input
                  type="text"
                  value={collegeSchool}
                  onChange={(e) => setCollegeSchool(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Course / Branch
                </label>
                <input
                  type="text"
                  value={courseBranch}
                  onChange={(e) => setCourseBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Semester / Class
                </label>
                <input
                  type="text"
                  value={semesterClass}
                  onChange={(e) => setSemesterClass(e.target.value)}
                  placeholder="e.g. 5th Semester"
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Preferred Study Language
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'english', label: 'English' },
                  { id: 'hinglish', label: 'Hinglish (Mixed)' },
                  { id: 'hindi', label: 'Hindi' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreferredLanguage(item.id as any)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                      preferredLanguage === item.id
                        ? 'border-amber-600 bg-amber-50 text-amber-800'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Study Goals
              </label>
              <textarea
                rows={2}
                value={studyGoals}
                onChange={(e) => setStudyGoals(e.target.value)}
                placeholder="Target GPA, competitive exams, topics to master..."
                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ================= DATA EXPORT & PRIVACY ================= */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-zinc-900">Privacy & Data Portability</h2>
          </div>

          <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
            <p>
              <strong>Data Isolation:</strong> All lectures, audio files, transcripts, and quizzes are cryptographically tied to your student account. No other user or unauthorized device can access your recordings.
            </p>
            <p>
              <strong>AI Processing Privacy:</strong> Audio files are sent to speech recognition models solely for transcription and are not used for public model training.
            </p>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Export Student Archive</h4>
              <p className="text-[11px] text-zinc-500">
                Download all your saved lectures, transcripts, notes, flashcards, and quizzes in JSON format.
              </p>
            </div>

            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              Download JSON Archive
            </button>
          </div>
        </div>

        {/* ================= DANGER ZONE ================= */}
        <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-rose-900">Account Management</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-900 block">Delete Account & Recordings</span>
              <span className="text-zinc-500">
                Permanently delete your profile, all uploaded audio, and AI study kits.
              </span>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you absolutely sure you want to delete your student account and all recordings?')) {
                  alert('Account deletion request queued. (In production, this purges all relational data).');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-lg transition shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
