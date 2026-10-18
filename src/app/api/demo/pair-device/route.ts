import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateDeviceToken } from '@/lib/auth/device-auth';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    // Check if user already has a device
    let device = db.prepare('SELECT id, device_identifier FROM devices WHERE user_id = ?').get(user.id) as any;

    let deviceId = device?.id;
    let demoIdentifier = device?.device_identifier;

    if (device) {
      db.prepare(`
        UPDATE devices
        SET status = 'online',
            last_heartbeat_at = CURRENT_TIMESTAMP,
            last_sync_at = CURRENT_TIMESTAMP,
            ip_address = '192.168.1.104',
            firmware_version = 'v1.2.0-lp',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(deviceId);
    } else {
      demoIdentifier = `LP-SIM-${user.id.slice(-6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      deviceId = `dev_sim_${Date.now()}`;
      db.prepare(`
        INSERT INTO devices (id, user_id, name, device_identifier, status, ip_address, firmware_version, last_heartbeat_at, last_sync_at)
        VALUES (?, ?, 'LecturePod Device (Studio Lab)', ?, 'online', '192.168.1.104', 'v1.2.0-lp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(deviceId, user.id, demoIdentifier);
    }

    const apiToken = generateDeviceToken(demoIdentifier, user.id);

    return NextResponse.json({
      success: true,
      device_id: deviceId,
      device_name: 'LecturePod Device (Studio Lab)',
      device_identifier: demoIdentifier,
      api_token: apiToken,
      message: 'Simulated LecturePod Device paired and connected online successfully!'
    });
  } catch (error: any) {
    console.error('Demo pair device error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
