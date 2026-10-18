import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyDeviceToken } from '@/lib/auth/device-auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid device token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const authResult = verifyDeviceToken(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized: Invalid device token' }, { status: 401 });
    }

    const body = await req.json();
    const { device_identifier, ip_address, queued_recordings, upload_progress_pct, firmware_version } = body;

    const db = getDatabase();
    db.prepare(`
      UPDATE devices 
      SET 
        status = 'online',
        last_heartbeat_at = CURRENT_TIMESTAMP,
        queued_recordings = ?,
        upload_progress_pct = ?,
        ip_address = COALESCE(?, ip_address),
        firmware_version = COALESCE(?, firmware_version),
        updated_at = CURRENT_TIMESTAMP
      WHERE device_identifier = ? AND user_id = ?
    `).run(
      queued_recordings ?? 0,
      upload_progress_pct ?? 0,
      ip_address || null,
      firmware_version || null,
      authResult.deviceIdentifier,
      authResult.userId
    );

    return NextResponse.json({
      status: 'online',
      acknowledged_at: new Date().toISOString(),
      sync_requested: false
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Heartbeat processing failed' }, { status: 500 });
  }
}
