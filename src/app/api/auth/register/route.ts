import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/db';
import { hashPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, college_school, course_branch, semester_class, preferred_language, study_goals } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDatabase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM profiles WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);
    const lang = ['english', 'hindi', 'hinglish'].includes(preferred_language) ? preferred_language : 'english';

    db.prepare(`
      INSERT INTO profiles (
        id, email, password_hash, full_name, college_school, 
        course_branch, semester_class, preferred_language, study_goals
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      cleanEmail,
      passwordHash,
      full_name.trim(),
      college_school?.trim() || null,
      course_branch?.trim() || null,
      semester_class?.trim() || null,
      lang,
      study_goals?.trim() || null
    );

    // Create session token and set cookie
    const sessionToken = createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: userId,
        email: cleanEmail,
        full_name: full_name.trim(),
        preferred_language: lang,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
