import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { getDatabase } from '@/lib/db';

const SESSION_COOKIE = 'lecturepod_session';
const SECRET = process.env.SESSION_SECRET || 'lecturepod_fallback_secret_32_characters_key!';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  college_school?: string;
  course_branch?: string;
  semester_class?: string;
  preferred_language: 'english' | 'hindi' | 'hinglish';
  study_goals?: string;
  created_at?: string;
}

// Password hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

// Session token generation with HMAC signature
export function createSessionToken(userId: string): string {
  const data = JSON.stringify({ userId, issued: Date.now() });
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(base64Data).digest('base64url');
    if (signature !== expectedSignature) return null;
    const parsed = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf8'));
    return parsed.userId || null;
  } catch {
    return null;
  }
}

// Get authenticated user from request cookies or Authorization header (Server Components & Route Handlers)
export async function getCurrentUser(): Promise<UserSession | null> {
  let token: string | null = null;

  // 1. Check Authorization header
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  } catch {}

  // 2. Check Cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE);
      if (sessionCookie?.value) {
        token = sessionCookie.value;
      }
    } catch {}
  }

  if (!token) return null;

  const userId = verifySessionToken(token);
  if (!userId) return null;

  const db = getDatabase();
  const profile = db.prepare('SELECT id, email, full_name, college_school, course_branch, semester_class, preferred_language, study_goals, created_at FROM profiles WHERE id = ?').get(userId) as UserSession | undefined;

  return profile || null;
}

export { SESSION_COOKIE };
