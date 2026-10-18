import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import crypto from 'crypto';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  // Generate clean 6-character uppercase alphanumeric code: e.g. "LP-8842"
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  const token = `LP-${randomChars}`;

  // Expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO device_pairing_tokens (token, user_id, expires_at, used)
    VALUES (?, ?, ?, 0)
  `).run(token, user.id, expiresAt);

  return NextResponse.json({
    success: true,
    pairing_code: token,
    expires_at: expiresAt,
    expires_in_minutes: 15,
  });
}
