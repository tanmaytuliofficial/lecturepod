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
    const { device_recording_id, title, subject, duration_seconds, file_size_bytes, recorded_at } = body;

    if (!device_recording_id || !title || !subject) {
      return NextResponse.json({ error: 'Missing device_recording_id, title, or subject' }, { status: 400 });
    }

    const db = getDatabase();

    // Find device ID
    const device = db.prepare('SELECT id FROM devices WHERE device_identifier = ?').get(authResult.deviceIdentifier) as { id: string } | undefined;

    // Idempotency check: see if this device_recording_id was already registered for this student
    const existing = db.prepare(`
      SELECT id, status FROM lectures 
      WHERE user_id = ? AND device_recording_id = ?
    `).get(authResult.userId, device_recording_id) as { id: string; status: string } | undefined;

    if (existing) {
      return NextResponse.json({
        success: true,
        lecture_id: existing.id,
        status: existing.status,
        message: 'Recording already registered (idempotent match).'
      });
    }

    const lectureId = `lec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const recordingDate = recorded_at || new Date().toISOString();

    db.prepare(`
      INSERT INTO lectures (
        id, user_id, device_id, device_recording_id, title, subject, 
        recording_date, duration_seconds, file_size_bytes, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting_to_sync')
    `).run(
      lectureId,
      authResult.userId,
      device?.id || null,
      device_recording_id,
      title,
      subject,
      recordingDate,
      duration_seconds || 0,
      file_size_bytes || 0
    );

    return NextResponse.json({
      success: true,
      lecture_id: lectureId,
      status: 'waiting_to_sync',
      message: 'Recording successfully registered. Ready for audio upload.'
    });
  } catch (error: any) {
    console.error('Register recording error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
