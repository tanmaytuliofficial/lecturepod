import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { StudentNav } from '@/components/StudentNav';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Library, 
  Clock, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  Search, 
  PlusCircle, 
  FileText, 
  CalendarCheck2, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { SeedDemoButton } from './seed-demo-button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const db = getDatabase();

  // 1. Fetch real statistics
  const totalLecturesCount = (db.prepare('SELECT count(*) as cnt FROM lectures WHERE user_id = ?').get(user.id) as any)?.cnt || 0;
  
  const awaitingProcessingCount = (db.prepare(`
    SELECT count(*) as cnt FROM lectures 
    WHERE user_id = ? AND status IN ('saved_on_device', 'waiting_to_sync', 'uploading', 'transcribing', 'generating_study_material')
  `).get(user.id) as any)?.cnt || 0;

  const completedStudyKitsCount = (db.prepare(`
    SELECT count(*) as cnt FROM lectures 
    WHERE user_id = ? AND status = 'ready'
  `).get(user.id) as any)?.cnt || 0;

  // 2. Fetch Recent Lectures
  const recentLectures = db.prepare(`
    SELECT 
      l.id, l.title, l.subject, l.recording_date, l.duration_seconds, l.status, l.created_at,
      d.name as device_name
    FROM lectures l
    LEFT JOIN devices d ON l.device_id = d.id
    WHERE l.user_id = ?
    ORDER BY l.recording_date DESC
    LIMIT 5
  `).all(user.id) as any[];

  // 3. Fetch Paired Devices & Live Status
  const devices = db.prepare(`
    SELECT id, name, device_identifier, status, last_heartbeat_at, last_sync_at, queued_recordings
    FROM devices
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 3
  `).all(user.id) as any[];

  // 4. Fetch Study Tasks / Planner Reminders
  const upcomingTasks = db.prepare(`
    SELECT id, title, due_date, completed, lecture_id
    FROM study_tasks
    WHERE user_id = ? AND completed = 0
    ORDER BY due_date ASC, created_at DESC
    LIMIT 4
  `).all(user.id) as any[];

  const formatDuration = (secs: number) => {
    if (!secs) return '0 min';
    const m = Math.floor(secs / 60);
    return `${m} min`;
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
      <StudentNav user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================= GREETING & QUICK ACTIONS ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Welcome back, {user.full_name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {user.college_school ? `${user.college_school} • ` : ''}
              {user.course_branch ? `${user.course_branch} • ` : ''}
              Here is your lecture capture and revision overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/lectures"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-2xs transition"
            >
              <Library className="w-3.5 h-3.5 text-zinc-500" />
              All Lectures
            </Link>

            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-2xs transition"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              Global Search
            </Link>

            <Link
              href="/devices"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-2xs transition"
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              Manage Device
            </Link>

            <Link
              href="/lectures?new=true"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-2xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              Add Recording
            </Link>
          </div>
        </div>

        {/* ================= METRIC CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Lectures */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total Saved Lectures
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                <Library className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-zinc-900">
              {totalLecturesCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Synced from your device or uploaded
            </p>
          </div>

          {/* Awaiting Processing */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Processing Queue
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-zinc-900">
              {awaitingProcessingCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Syncing, transcribing, or generating notes
            </p>
          </div>

          {/* Completed Study Kits */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Completed Study Kits
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-zinc-900">
              {completedStudyKitsCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Ready with notes, flashcards & quizzes
            </p>
          </div>

          {/* Device Sync Status */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Raspberry Pi Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {devices.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    devices[0].status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`} />
                  <span className="text-lg font-bold text-zinc-900 capitalize">
                    {devices[0].status}
                  </span>
                </div>
              ) : (
                <span className="text-base font-semibold text-zinc-400">
                  No Device Paired
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 truncate">
              {devices.length > 0
                ? devices[0].last_sync_at
                  ? `Last sync: ${formatDate(devices[0].last_sync_at)}`
                  : 'Awaiting initial Wi-Fi sync'
                : 'Connect via Device Management'}
            </p>
          </div>
        </div>

        {/* ================= MAIN CONTENT SPLIT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Lectures (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Recent Classroom Lectures</h2>
              <Link
                href="/lectures"
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1"
              >
                View Library <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentLectures.length === 0 ? (
              /* Honest Empty State for New Students */
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">No Lectures Synced Yet</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Your lecture library is currently empty. Connect your physical Raspberry Pi 4 to auto-sync classroom audio, or seed sample lectures to test the AI workspace.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/devices"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    Pair Raspberry Pi 4
                  </Link>

                  <SeedDemoButton />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden shadow-2xs">
                {recentLectures.map((lec) => (
                  <Link
                    key={lec.id}
                    href={`/lectures/${lec.id}`}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
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
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-amber-800 transition">
                        {lec.title}
                      </h3>
                      {lec.device_name && (
                        <p className="text-[11px] text-zinc-400">Captured by {lec.device_name}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={lec.status} />
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Study Planner & Connected Devices (1 col) */}
          <div className="space-y-6">
            {/* Study Planner Tasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                  <CalendarCheck2 className="w-4 h-4 text-zinc-500" /> Study Planner
                </h2>
                <Link
                  href="/planner"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Manage
                </Link>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-3">
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 space-y-2">
                    <p className="text-xs">No pending revision tasks</p>
                    <Link
                      href="/planner"
                      className="inline-block text-xs font-semibold text-zinc-900 hover:text-amber-700 underline"
                    >
                      + Create study task
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start gap-2.5 text-left"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 truncate">{t.title}</p>
                          {t.due_date && (
                            <p className="text-[11px] text-zinc-500 mt-0.5">Due: {t.due_date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Paired Hardware Unit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-zinc-500" /> Paired Hardware
                </h2>
                <Link
                  href="/devices"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Configure
                </Link>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs">
                {devices.length === 0 ? (
                  <div className="text-center py-4 text-zinc-400 space-y-2">
                    <p className="text-xs">No Raspberry Pi paired yet</p>
                    <Link
                      href="/devices"
                      className="inline-block px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition"
                    >
                      Generate Pairing Code
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devices.map((d) => (
                      <div key={d.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900">{d.name}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            d.status === 'online'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-500">ID: {d.device_identifier}</p>
                        <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 flex justify-between">
                          <span>Queue: {d.queued_recordings || 0} pending</span>
                          <span>Heartbeat: {d.last_heartbeat_at ? 'Active' : 'Never'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
