import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({
      query: q,
      lectures: [],
      transcripts: [],
      notes: [],
      flashcards: []
    });
  }

  const db = getDatabase();
  const pattern = `%${q}%`;

  // 1. Search Lectures by title, subject, description
  const lectures = db.prepare(`
    SELECT id, title, subject, description, recording_date, status, duration_seconds
    FROM lectures
    WHERE user_id = ? AND (
      title LIKE ? OR subject LIKE ? OR description LIKE ? OR tags LIKE ?
    )
    ORDER BY recording_date DESC
    LIMIT 10
  `).all(user.id, pattern, pattern, pattern, pattern);

  // 2. Search Transcripts (find matching segments)
  const transcripts = db.prepare(`
    SELECT 
      ts.id as segment_id, ts.start_time, ts.end_time, ts.speaker, ts.text,
      l.id as lecture_id, l.title as lecture_title, l.subject as lecture_subject
    FROM transcript_segments ts
    JOIN transcripts t ON ts.transcript_id = t.id
    JOIN lectures l ON t.lecture_id = l.id
    WHERE l.user_id = ? AND ts.text LIKE ?
    LIMIT 10
  `).all(user.id, pattern);

  // 3. Search Study Notes and Summaries
  const notes = db.prepare(`
    SELECT 
      sm.id as material_id, sm.summary, sm.structured_notes_markdown,
      l.id as lecture_id, l.title as lecture_title, l.subject as lecture_subject
    FROM study_materials sm
    JOIN lectures l ON sm.lecture_id = l.id
    WHERE l.user_id = ? AND (
      sm.summary LIKE ? OR sm.structured_notes_markdown LIKE ?
    )
    LIMIT 10
  `).all(user.id, pattern, pattern);

  // 4. Search Flashcards
  const flashcards = db.prepare(`
    SELECT 
      fc.id as card_id, fc.question, fc.answer, fc.status,
      l.id as lecture_id, l.title as lecture_title, l.subject as lecture_subject
    FROM flashcards fc
    JOIN lectures l ON fc.lecture_id = l.id
    WHERE fc.user_id = ? AND (
      fc.question LIKE ? OR fc.answer LIKE ?
    )
    LIMIT 10
  `).all(user.id, pattern, pattern);

  return NextResponse.json({
    query: q,
    results: {
      lectures,
      transcripts,
      notes,
      flashcards
    },
    totalMatches: lectures.length + transcripts.length + notes.length + flashcards.length
  });
}
