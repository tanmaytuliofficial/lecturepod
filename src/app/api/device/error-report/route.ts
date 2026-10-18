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
    const { error_type, recording_id, message, trace } = body;

    const db = getDatabase();
    db.prepare(`
      INSERT INTO processing_jobs (id, device_id, lecture_id, job_type, status, error_message)
      VALUES (?, (SELECT id FROM devices WHERE device_identifier = ?), ?, 'audio_upload', 'failed', ?)
    `).run(
      `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authResult.deviceIdentifier,
      recording_id || null,
      `[${error_type || 'SyncError'}] ${message || 'Unknown error'}`
    );

    return NextResponse.json({ reported: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Report failed' }, { status: 500 });
  }
}
