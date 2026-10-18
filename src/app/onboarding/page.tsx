'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic2, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [collegeSchool, setCollegeSchool] = useState('');
  const [courseBranch, setCourseBranch] = useState('');
  const [semesterClass, setSemesterClass] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [studyGoals, setStudyGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
          setFullName(data.user.full_name || '');
          if (data.user.preferred_language) {
            setPreferredLanguage(data.user.preferred_language);
          }
        }
        setFetching(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleSave = async (skipOptional: boolean = false) => {
    setLoading(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          college_school: skipOptional ? null : collegeSchool,
          course_branch: skipOptional ? null : courseBranch,
          semester_class: skipOptional ? null : semesterClass,
          preferred_language: preferredLanguage,
          study_goals: skipOptional ? null : studyGoals,
        }),
      });

      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <Mic2 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-bold text-lg text-zinc-900">LecturePod</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Welcome to Lecture Pod!
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Customize your learning profile so our AI can personalize your study notes and exam summaries.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-amber-600"
            />
          </div>

          {/* Preferred Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Preferred Lecture & Study Language
            </label>
            <p className="text-xs text-zinc-600 mb-3">
              How do your professors speak in class? This tunes speech recognition and notes synthesis.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'english', label: 'English', desc: 'Global technical terminology' },
                { id: 'hinglish', label: 'Hinglish', desc: 'Mixed Hindi & English classroom explanations' },
                { id: 'hindi', label: 'Hindi', desc: 'Formal Hindi medium lectures' },
              ].map((lang) => {
                const isSelected = preferredLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setPreferredLanguage(lang.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">{lang.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-snug">{lang.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                College or School <span className="text-zinc-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={collegeSchool}
                onChange={(e) => setCollegeSchool(e.target.value)}
                placeholder="e.g. Stanford / IIT Delhi"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Course or Branch <span className="text-zinc-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={courseBranch}
                onChange={(e) => setCourseBranch(e.target.value)}
                placeholder="e.g. Computer Science, Mechanical"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Current Semester or Class <span className="text-zinc-600 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={semesterClass}
              onChange={(e) => setSemesterClass(e.target.value)}
              placeholder="e.g. 5th Semester / Year 3"
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-amber-600"
            />
          </div>

          {/* Study Goals */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              What are your primary study goals? <span className="text-zinc-600 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={studyGoals}
              onChange={(e) => setStudyGoals(e.target.value)}
              placeholder="e.g. Preparing for end-semester exams and GATE / GRE entrance tests."
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-hidden focus:border-amber-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={loading}
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 order-2 sm:order-1"
            >
              Skip optional fields for now
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Complete & Open Dashboard
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
