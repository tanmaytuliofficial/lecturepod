import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyDeviceToken } from '@/lib/auth/device-auth';

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

    const body = await req.json();
    const { lecture_id, device_recording_id } = body;

    const db = getDatabase();
    const lecture = db.prepare(`
      SELECT id, status, audio_url, file_size_bytes 
      FROM lectures 
      WHERE (id = ? OR device_recording_id = ?) AND user_id = ?
    `).get(lecture_id || '', device_recording_id || '', authResult.userId) as {
      id: string;
      status: string;
      audio_url: string;
      file_size_bytes: number;
    } | undefined;

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Update last sync on device record
    db.prepare(`
      UPDATE devices 
      SET last_sync_at = CURRENT_TIMESTAMP, status = 'online'
      WHERE device_identifier = ? AND user_id = ?
    `).run(authResult.deviceIdentifier, authResult.userId);

    return NextResponse.json({
      acknowledged: true,
      lecture_id: lecture.id,
      status: lecture.status,
      file_verified: Boolean(lecture.audio_url && lecture.file_size_bytes > 0),
      timestamp: new Date().toISOString(),
      retention_directive: 'safe_to_purge_if_local_retention_allows'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'ACK failed' }, { status: 500 });
  }
}
