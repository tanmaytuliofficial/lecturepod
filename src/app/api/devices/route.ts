import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  // Query devices and auto-update 'offline' status if last_heartbeat_at is older than 2 minutes
  const now = new Date();
  const devices = db.prepare(`
    SELECT 
      id, name, device_identifier, status, last_heartbeat_at, last_sync_at,
      queued_recordings, upload_progress_pct, ip_address, firmware_version, created_at
    FROM devices
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(user.id) as any[];

  const updatedDevices = devices.map(d => {
    // If device was online but no heartbeat in 2.5 minutes, reflect honest offline status
    let liveStatus = d.status;
    if (d.last_heartbeat_at) {
      const diffMs = now.getTime() - new Date(d.last_heartbeat_at).getTime();
      if (diffMs > 150000 && liveStatus === 'online') {
        liveStatus = 'offline';
      }
    } else if (liveStatus === 'online') {
      liveStatus = 'paired';
    }

    return {
      ...d,
      status: liveStatus
    };
  });

  return NextResponse.json({ devices: updatedDevices });
}
