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

  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { full_name, college_school, course_branch, semester_class, preferred_language, study_goals } = body;

    const db = getDatabase();
    db.prepare(`
      UPDATE profiles
      SET 
        full_name = COALESCE(?, full_name),
        college_school = ?,
        course_branch = ?,
        semester_class = ?,
        preferred_language = COALESCE(?, preferred_language),
        study_goals = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      full_name || null,
      college_school ?? null,
      course_branch ?? null,
      semester_class ?? null,
      preferred_language || null,
      study_goals ?? null,
      user.id
    );

    const updated = db.prepare('SELECT id, email, full_name, college_school, course_branch, semester_class, preferred_language, study_goals, created_at FROM profiles WHERE id = ?').get(user.id);

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Profile update failed' }, { status: 500 });
  }
}
