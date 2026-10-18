import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { generateDeviceToken } from '@/lib/auth/device-auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pairing_code, device_identifier, device_name, firmware_version, ip_address } = body;

    if (!pairing_code || !device_identifier) {
      return NextResponse.json(
        { error: 'Missing pairing_code or device_identifier' },
        { status: 400 }
      );
    }

    const cleanCode = pairing_code.trim().toUpperCase();
    const db = getDatabase();

    // Check token validity
    const tokenRecord = db.prepare(`
      SELECT token, user_id, expires_at, used 
      FROM device_pairing_tokens 
      WHERE token = ?
    `).get(cleanCode) as { token: string; user_id: string; expires_at: string; used: number } | undefined;

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid pairing code. Please generate a new code from your web dashboard.' },
        { status: 404 }
      );
    }

    if (tokenRecord.used) {
      return NextResponse.json(
        { error: 'This pairing code has already been used. Please generate a fresh code.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    if (new Date(tokenRecord.expires_at) < new Date(now)) {
      return NextResponse.json(
        { error: 'This pairing code has expired. Pairing codes are valid for 15 minutes.' },
        { status: 400 }
      );
    }

    const userId = tokenRecord.user_id;

    // Fetch student profile for acknowledgment
    const student = db.prepare('SELECT full_name, email FROM profiles WHERE id = ?').get(userId) as { full_name: string; email: string };

    // Check if device already registered for this user or create new device record
    const existingDevice = db.prepare('SELECT id FROM devices WHERE device_identifier = ?').get(device_identifier) as { id: string } | undefined;
    
    let deviceId = existingDevice?.id;
    if (existingDevice) {
      db.prepare(`
        UPDATE devices 
        SET user_id = ?, name = ?, status = 'online', ip_address = ?, firmware_version = ?, last_heartbeat_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(userId, device_name || 'Lecture Pod Pi 4', ip_address || null, firmware_version || 'v1.2.0-rpi4', deviceId);
    } else {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.prepare(`
        INSERT INTO devices (id, user_id, name, device_identifier, status, ip_address, firmware_version, last_heartbeat_at)
        VALUES (?, ?, ?, ?, 'online', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        deviceId,
        userId,
        device_name || 'Lecture Pod Pi 4',
        device_identifier,
        ip_address || null,
        firmware_version || 'v1.2.0-rpi4'
      );
    }

    // Mark pairing token as used
    db.prepare('UPDATE device_pairing_tokens SET used = 1 WHERE token = ?').run(cleanCode);

    // Generate permanent cryptographic device token
    const apiToken = generateDeviceToken(device_identifier, userId);

    return NextResponse.json({
      success: true,
      device_id: deviceId,
      device_name: device_name || 'Lecture Pod Pi 4',
      device_identifier,
      student_name: student?.full_name || 'Student',
      api_token: apiToken,
      message: 'Raspberry Pi 4 successfully paired with student account.'
    });
  } catch (error: any) {
    console.error('Pairing error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
