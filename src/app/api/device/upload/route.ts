import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatabase } from '@/lib/db';
import { verifyDeviceToken } from '@/lib/auth/device-auth';
import { processLectureInBackground } from '@/lib/ai/pipeline';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing device token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const authResult = verifyDeviceToken(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized: Invalid device token' }, { status: 401 });
    }

    const formData = await req.formData();
    const lectureId = formData.get('lecture_id') as string;
    const file = formData.get('file') as File | null;

    if (!lectureId || !file) {
      return NextResponse.json({ error: 'Missing lecture_id or audio file' }, { status: 400 });
    }

    const db = getDatabase();

    // Verify lecture ownership
    const lecture = db.prepare(`
      SELECT id, title, subject, user_id FROM lectures 
      WHERE id = ? AND user_id = ?
    `).get(lectureId, authResult.userId) as { id: string; title: string; subject: string; user_id: string } | undefined;

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found or not owned by student' }, { status: 404 });
    }

    // Save audio file locally
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.wav';
    const savedFileName = `${lectureId}_${Date.now()}${ext}`;
    const targetFilePath = path.join(uploadDir, savedFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetFilePath, buffer);

    const audioUrl = `/uploads/audio/${savedFileName}`;
    const fileSizeBytes = buffer.length;

    // Update lecture record to 'uploaded'
    db.prepare(`
      UPDATE lectures 
      SET 
        status = 'uploaded',
        audio_url = ?,
        audio_file_name = ?,
        file_size_bytes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(audioUrl, savedFileName, fileSizeBytes, lectureId);

    // Asynchronously kick off transcription and study material generation
    processLectureInBackground(lectureId, targetFilePath, lecture.title, lecture.subject, authResult.userId).catch(err => {
      console.error(`Background processing failed for ${lectureId}:`, err);
    });

    return NextResponse.json({
      success: true,
      lecture_id: lectureId,
      status: 'uploaded',
      audio_url: audioUrl,
      file_size_bytes: fileSizeBytes,
      message: 'Audio received successfully. Background transcription queued.'
    });
  } catch (error: any) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ error: error.message || 'Audio upload failed' }, { status: 500 });
  }
}
