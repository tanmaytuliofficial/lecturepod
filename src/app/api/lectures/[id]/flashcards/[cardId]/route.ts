import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, cardId } = await params;
  try {
    const body = await req.json();
    const { status } = body;

    if (!['new', 'learning', 'mastered', 'difficult'].includes(status)) {
      return NextResponse.json({ error: 'Invalid card status' }, { status: 400 });
    }

    const db = getDatabase();
    const result = db.prepare(`
      UPDATE flashcards 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND lecture_id = ? AND user_id = ?
    `).run(status, cardId, id, user.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update flashcard' }, { status: 500 });
  }
}
