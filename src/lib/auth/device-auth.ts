import crypto from 'crypto';
import { getDatabase } from '@/lib/db';

const DEVICE_SALT = process.env.DEVICE_API_SALT || 'lecturepod_rpi_device_salt_2025';

export function generateDeviceToken(deviceIdentifier: string, userId: string): string {
  const timestamp = Date.now().toString();
  const raw = `${deviceIdentifier}:${userId}:${timestamp}:${DEVICE_SALT}`;
  const hash = crypto.createHmac('sha256', DEVICE_SALT).update(raw).digest('hex');
  const tokenPayload = Buffer.from(JSON.stringify({ deviceIdentifier, userId, timestamp, hash })).toString('base64url');
  return `lpd_${tokenPayload}`;
}

export function verifyDeviceToken(token: string): { deviceIdentifier: string; userId: string } | null {
  try {
    if (!token.startsWith('lpd_')) return null;
    const base64 = token.slice(4);
    const parsed = JSON.parse(Buffer.from(base64, 'base64url').toString('utf8'));
    const { deviceIdentifier, userId, timestamp, hash } = parsed;
    
    const raw = `${deviceIdentifier}:${userId}:${timestamp}:${DEVICE_SALT}`;
    const expectedHash = crypto.createHmac('sha256', DEVICE_SALT).update(raw).digest('hex');
    
    if (hash !== expectedHash) return null;

    // Verify device exists and is paired to this user in database
    const db = getDatabase();
    const device = db.prepare('SELECT id, user_id FROM devices WHERE device_identifier = ? AND user_id = ?').get(deviceIdentifier, userId);
    if (!device) return null;

    return { deviceIdentifier, userId };
  } catch {
    return null;
  }
}
