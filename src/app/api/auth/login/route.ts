import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/db';
import { verifyPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDatabase();

    const user = db.prepare(`
      SELECT id, email, password_hash, full_name, college_school, course_branch, semester_class, preferred_language, study_goals
      FROM profiles 
      WHERE email = ?
    `).get(cleanEmail) as {
      id: string;
      email: string;
      password_hash: string;
      full_name: string;
      college_school?: string;
      course_branch?: string;
      semester_class?: string;
      preferred_language: string;
      study_goals?: string;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const sessionToken = createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    const { password_hash, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
