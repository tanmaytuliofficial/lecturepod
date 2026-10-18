import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();

  const lecture = db.prepare(`
    SELECT 
      l.*,
      d.name as device_name, d.device_identifier
    FROM lectures l
    LEFT JOIN devices d ON l.device_id = d.id
    WHERE l.id = ? AND l.user_id = ?
  `).get(id, user.id) as any;

  if (!lecture) {
    return NextResponse.json({ error: 'Lecture not found or access denied.' }, { status: 404 });
  }

  // Fetch transcript
  const transcript = db.prepare('SELECT * FROM transcripts WHERE lecture_id = ?').get(id) as any;
  let segments: any[] = [];
  if (transcript) {
    segments = db.prepare('SELECT * FROM transcript_segments WHERE transcript_id = ? ORDER BY start_time ASC').all(transcript.id);
  }

  // Fetch study materials
  const studyMaterials = db.prepare('SELECT * FROM study_materials WHERE lecture_id = ?').get(id) as any;
  let parsedStudyMaterials: any = null;
  if (studyMaterials) {
    parsedStudyMaterials = {
      ...studyMaterials,
      key_concepts: JSON.parse(studyMaterials.key_concepts || '[]'),
      definitions: JSON.parse(studyMaterials.definitions || '[]'),
      important_examples: JSON.parse(studyMaterials.important_examples || '[]'),
      formulas_and_facts: JSON.parse(studyMaterials.formulas_and_facts || '[]'),
      exam_takeaways: JSON.parse(studyMaterials.exam_takeaways || '[]'),
    };
  }

  // Fetch flashcards
  const flashcards = db.prepare('SELECT * FROM flashcards WHERE lecture_id = ? ORDER BY created_at ASC').all(id);

  // Fetch quiz
  const quiz = db.prepare('SELECT * FROM quizzes WHERE lecture_id = ?').get(id) as any;
  let quizQuestions: any[] = [];
  let recentAttempts: any[] = [];
  if (quiz) {
    const rawQuestions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ?').all(quiz.id);
    quizQuestions = rawQuestions.map((q: any) => ({
      ...q,
      options: JSON.parse(q.options || '[]')
    }));
    recentAttempts = db.prepare('SELECT * FROM quiz_attempts WHERE quiz_id = ? ORDER BY completed_at DESC LIMIT 5').all(quiz.id);
  }

  return NextResponse.json({
    lecture: {
      ...lecture,
      tags: lecture.tags ? JSON.parse(lecture.tags) : []
    },
    transcript: transcript ? { ...transcript, segments } : null,
    studyMaterials: parsedStudyMaterials,
    flashcards,
    quiz: quiz ? { ...quiz, questions: quizQuestions, recentAttempts } : null
  });
}

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
    const { title, subject, description, tags } = body;

    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM lectures WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE lectures
      SET 
        title = COALESCE(?, title),
        subject = COALESCE(?, subject),
        description = ?,
        tags = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      title || null,
      subject || null,
      description ?? null,
      tags ? JSON.stringify(tags) : null,
      id,
      user.id
    );

    return NextResponse.json({ success: true, message: 'Lecture updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();

  const lecture = db.prepare('SELECT id, audio_file_name FROM lectures WHERE id = ? AND user_id = ?').get(id, user.id) as any;
  if (!lecture) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  // Delete local audio file if present
  if (lecture.audio_file_name) {
    try {
      const audioPath = path.join(process.cwd(), 'public', 'uploads', 'audio', lecture.audio_file_name);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (e) {
      console.warn('Failed to delete audio file:', e);
    }
  }

  db.prepare('DELETE FROM lectures WHERE id = ? AND user_id = ?').run(id, user.id);

  return NextResponse.json({ success: true, message: 'Lecture deleted.' });
}
