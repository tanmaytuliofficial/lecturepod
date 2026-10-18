import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const tasks = db.prepare(`
    SELECT 
      t.id, t.title, t.description, t.due_date, t.completed, t.created_at,
      l.id as lecture_id, l.title as lecture_title, l.subject as lecture_subject
    FROM study_tasks t
    LEFT JOIN lectures l ON t.lecture_id = l.id
    WHERE t.user_id = ?
    ORDER BY t.completed ASC, t.due_date ASC, t.created_at DESC
  `).all(user.id);

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, due_date, lecture_id } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    const taskId = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const db = getDatabase();

    db.prepare(`
      INSERT INTO study_tasks (id, user_id, lecture_id, title, description, due_date, completed)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(
      taskId,
      user.id,
      lecture_id || null,
      title.trim(),
      description?.trim() || null,
      due_date || null
    );

    return NextResponse.json({ success: true, task_id: taskId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 });
  }
}
