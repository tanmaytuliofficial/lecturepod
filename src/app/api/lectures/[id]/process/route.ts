import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import path from 'path';
import { processLectureInBackground } from '@/lib/ai/pipeline';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();

  const lecture = db.prepare('SELECT id, title, subject, audio_file_name, status FROM lectures WHERE id = ? AND user_id = ?').get(id, user.id) as any;
  if (!lecture) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  const audioFilePath = lecture.audio_file_name 
    ? path.join(process.cwd(), 'public', 'uploads', 'audio', lecture.audio_file_name)
    : '';

  // Trigger processing
  processLectureInBackground(lecture.id, audioFilePath, lecture.title, lecture.subject, user.id).catch(console.error);

  return NextResponse.json({
    success: true,
    message: 'AI processing job restarted.',
    status: 'transcribing'
  });
}
