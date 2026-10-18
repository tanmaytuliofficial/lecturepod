'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentNav } from '@/components/StudentNav';
import { 
  CalendarCheck2, 
  PlusCircle, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Library, 
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: number | boolean;
  lecture_id?: string;
  lecture_title?: string;
  lecture_subject?: string;
}

interface LectureOption {
  id: string;
  title: string;
  subject: string;
}

export default function StudyPlannerPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lectures, setLectures] = useState<LectureOption[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // New task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskLectureId, setTaskLectureId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setTasks(data.tasks || []);
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

    // Fetch lectures for the dropdown
    fetch('/api/lectures')
      .then((r) => r.json())
      .then((d) => setLectures(d.lectures || []))
      .catch(() => {});

    fetchTasks();
  }, [router]);

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.completed ? 0 : 1;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });
    } catch (e) {
      console.error(e);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
      fetchTasks();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          due_date: taskDueDate || null,
          lecture_id: taskLectureId || null,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskDueDate('');
        setTaskLectureId('');
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const isComp = Boolean(t.completed);
    if (filter === 'pending') return !isComp;
    if (filter === 'completed') return isComp;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => Boolean(t.completed)).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <StudentNav user={currentUser} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Study Planner & Revision Tasks
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Organize your exam preparation and connect revision tasks to captured lectures
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            New Revision Task
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'pending'
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'completed'
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs">Loading planner...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 space-y-3">
            <CalendarCheck2 className="w-8 h-8 mx-auto text-amber-500" />
            <h4 className="text-sm font-semibold text-zinc-800">
              {filter === 'completed' ? 'No Completed Tasks Yet' : 'No Pending Tasks'}
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {filter === 'completed'
                ? 'Check off tasks as you finish revising lecture notes and practicing flashcards.'
                : 'Stay ahead of your semester by scheduling quick revision sessions for your lectures.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100 shadow-2xs overflow-hidden">
            {filteredTasks.map((task) => {
              const isComp = Boolean(task.completed);
              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                    isComp ? 'bg-zinc-50/50' : 'hover:bg-zinc-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-0.5 text-zinc-400 hover:text-zinc-600 transition shrink-0"
                      title={isComp ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isComp ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isComp ? 'line-through text-zinc-400' : 'text-zinc-900'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className={`text-xs ${isComp ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
                        {task.due_date && (
                          <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Calendar className="w-3 h-3 text-amber-600" /> Due: {task.due_date}
                          </span>
                        )}

                        {task.lecture_title && (
                          <Link
                            href={`/lectures/${task.lecture_id}`}
                            className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 underline font-medium truncate max-w-xs"
                          >
                            <Library className="w-3 h-3 text-zinc-400" />
                            {task.lecture_title}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= NEW TASK MODAL ================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-base font-bold text-zinc-900">New Revision Task</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Revise Fourier Transform proofs & practice quiz"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Target flashcards score, specific formulas to memorize..."
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-hidden focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Link Lecture (Optional)
                    </label>
                    <select
                      value={taskLectureId}
                      onChange={(e) => setTaskLectureId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-hidden focus:border-amber-600 truncate"
                    >
                      <option value="">None</option>
                      {lectures.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} ({l.subject})
                        </option>
                      ))}
                    </select>
                  </div>
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
                    className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
