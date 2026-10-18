import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { structured_notes_markdown } = body;

    if (typeof structured_notes_markdown !== 'string') {
      return NextResponse.json({ error: 'structured_notes_markdown must be a string' }, { status: 400 });
    }

    const db = getDatabase();

    // Verify ownership of the lecture
    const lecture = db.prepare('SELECT id FROM lectures WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE study_materials
      SET structured_notes_markdown = ?, updated_at = CURRENT_TIMESTAMP
      WHERE lecture_id = ?
    `).run(structured_notes_markdown, id);

    return NextResponse.json({ success: true, message: 'Notes autosaved.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save notes' }, { status: 500 });
  }
}
