import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  const profile = db.prepare('SELECT id, email, full_name, college_school, course_branch, semester_class, preferred_language, study_goals, created_at FROM profiles WHERE id = ?').get(user.id);
  const devices = db.prepare('SELECT id, name, device_identifier, status, firmware_version, created_at FROM devices WHERE user_id = ?').all(user.id);
  const lectures = db.prepare('SELECT * FROM lectures WHERE user_id = ?').all(user.id);
  const flashcards = db.prepare('SELECT * FROM flashcards WHERE user_id = ?').all(user.id);
  const tasks = db.prepare('SELECT * FROM study_tasks WHERE user_id = ?').all(user.id);
  const quizAttempts = db.prepare('SELECT * FROM quiz_attempts WHERE user_id = ?').all(user.id);

  const exportPayload = {
    exported_at: new Date().toISOString(),
    platform: 'Lecture Pod',
    profile,
    devices,
    lectures,
    flashcards,
    tasks,
    quiz_attempts: quizAttempts
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="lecturepod_export_${new Date().toISOString().slice(0, 10)}.json"`
    }
  });
}
