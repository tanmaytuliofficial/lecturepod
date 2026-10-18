import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { processLectureInBackground } from '@/lib/ai/pipeline';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const status = searchParams.get('status')?.trim() || '';
  const subject = searchParams.get('subject')?.trim() || '';
  const sort = searchParams.get('sort')?.trim() || 'newest';

  const db = getDatabase();

  let sql = `
    SELECT 
      l.id, l.title, l.subject, l.description, l.tags, 
      l.recording_date, l.duration_seconds, l.file_size_bytes, 
      l.audio_url, l.status, l.error_message, l.created_at,
      d.name as device_name, d.device_identifier
    FROM lectures l
    LEFT JOIN devices d ON l.device_id = d.id
    WHERE l.user_id = ?
  `;
  const params: any[] = [user.id];

  if (status) {
    sql += ` AND l.status = ?`;
    params.push(status);
  }

  if (subject) {
    sql += ` AND l.subject = ?`;
    params.push(subject);
  }

  if (q) {
    sql += ` AND (
      LOWER(l.title) LIKE ? 
      OR LOWER(l.subject) LIKE ? 
      OR LOWER(l.description) LIKE ?
      OR EXISTS (
        SELECT 1 FROM transcripts t 
        WHERE t.lecture_id = l.id AND LOWER(t.full_text) LIKE ?
      )
    )`;
    const likeQuery = `%${q}%`;
    params.push(likeQuery, likeQuery, likeQuery, likeQuery);
  }

  if (sort === 'oldest') {
    sql += ` ORDER BY l.recording_date ASC`;
  } else if (sort === 'title') {
    sql += ` ORDER BY l.title ASC`;
  } else {
    sql += ` ORDER BY l.recording_date DESC`;
  }

  const lectures = db.prepare(sql).all(...params);

  // Get distinct subjects for filter dropdown
  const subjects = db.prepare('SELECT DISTINCT subject FROM lectures WHERE user_id = ? AND subject IS NOT NULL').all(user.id).map((r: any) => r.subject);

  return NextResponse.json({ lectures, subjects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title = (formData.get('title') as string)?.trim();
    const subject = (formData.get('subject') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || null;
    const tags = (formData.get('tags') as string)?.trim() || '[]';
    const file = formData.get('audio') as File | null;

    if (!title || !subject) {
      return NextResponse.json({ error: 'Title and subject are required.' }, { status: 400 });
    }

    const db = getDatabase();
    const lectureId = `lec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const recordingDate = new Date().toISOString();

    let audioUrl: string | null = null;
    let audioFileName: string | null = null;
    let fileSizeBytes = 0;
    const durationSeconds = 420; // Default simulated/estimated duration if manual test
    const initialStatus = 'uploaded';
    let targetFilePath = '';

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name) || '.wav';
      audioFileName = `${lectureId}${ext}`;
      targetFilePath = path.join(uploadDir, audioFileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(targetFilePath, buffer);
      audioUrl = `/uploads/audio/${audioFileName}`;
      fileSizeBytes = buffer.length;
    } else {
      // Create empty mock audio placeholder so player has valid file
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      audioFileName = `${lectureId}_sample.wav`;
      targetFilePath = path.join(uploadDir, audioFileName);
      createMinimalWav(targetFilePath);
      audioUrl = `/uploads/audio/${audioFileName}`;
      fileSizeBytes = 44100 * 2 * 4; // approx size
    }

    db.prepare(`
      INSERT INTO lectures (
        id, user_id, title, subject, description, tags, 
        recording_date, duration_seconds, file_size_bytes, 
        audio_url, audio_file_name, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      lectureId,
      user.id,
      title,
      subject,
      description,
      tags,
      recordingDate,
      durationSeconds,
      fileSizeBytes,
      audioUrl,
      audioFileName,
      initialStatus
    );

    // Trigger AI background processing
    processLectureInBackground(lectureId, targetFilePath, title, subject, user.id).catch(console.error);

    return NextResponse.json({
      success: true,
      lecture_id: lectureId,
      message: 'Lecture created and AI processing pipeline started.'
    });
  } catch (error: any) {
    console.error('Create lecture error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create lecture' }, { status: 500 });
  }
}

function createMinimalWav(filepath: string) {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(44100, 24); // Sample rate
  buffer.writeUInt32LE(44100 * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32); // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(0, 40);
  fs.writeFileSync(filepath, buffer);
}
