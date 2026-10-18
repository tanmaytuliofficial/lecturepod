import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { quiz_id, answers } = body; // answers: { [questionId: string]: number (chosen option index) }

    if (!quiz_id || !answers) {
      return NextResponse.json({ error: 'Missing quiz_id or answers' }, { status: 400 });
    }

    const db = getDatabase();

    // Verify quiz belongs to lecture and user
    const quiz = db.prepare('SELECT id FROM quizzes WHERE id = ? AND lecture_id = ? AND user_id = ?').get(quiz_id, id, user.id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get correct answers
    const questions = db.prepare('SELECT id, correct_option_index FROM quiz_questions WHERE quiz_id = ?').all(quiz_id) as Array<{ id: string; correct_option_index: number }>;

    let score = 0;
    const totalQuestions = questions.length;

    for (const q of questions) {
      if (answers[q.id] === q.correct_option_index) {
        score++;
      }
    }

    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_questions, answers_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      quiz_id,
      user.id,
      score,
      totalQuestions,
      JSON.stringify(answers)
    );

    return NextResponse.json({
      success: true,
      attempt_id: attemptId,
      score,
      total_questions: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit quiz attempt' }, { status: 500 });
  }
}
