import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateStudyKit } from '@/lib/ai';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  // Create or retrieve a demo device
  const demoIdentifier = `LP-DEV-DEMO-${user.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}`;
  let device = db.prepare("SELECT id FROM devices WHERE device_identifier = ?").get(demoIdentifier) as any;
  if (!device) {
    const devId = `dev_demo_${Date.now()}`;
    db.prepare(`
      INSERT INTO devices (id, user_id, name, device_identifier, status, ip_address, firmware_version, last_heartbeat_at, last_sync_at)
      VALUES (?, ?, 'LecturePod Device (Studio Unit)', ?, 'online', '192.168.1.104', 'v1.2.0-lp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(devId, user.id, demoIdentifier);
    device = { id: devId };
  }

  const demoLectures = [
    {
      title: 'Eigenvalues, Eigenvectors and Diagonalization',
      subject: 'Linear Algebra',
      description: 'Matrix diagonalization theorems, characteristic polynomial roots, and geometric interpretations in R^n.',
      tags: ['Mathematics', 'Linear Algebra', 'Exam High Priority'],
      duration: 3120, // 52 minutes
      status: 'ready',
      transcriptSegments: [
        { startTime: 0, endTime: 48, speaker: 'Prof. Miller', text: 'Good morning everyone. Today we tackle one of the absolute cornerstones of Linear Algebra: Eigenvalues and Eigenvectors.' },
        { startTime: 48, endTime: 120, speaker: 'Prof. Miller', text: 'Recall our fundamental transformation equation: A times v equals lambda times v. The vector v represents directions that undergo pure stretching without rotation.' },
        { startTime: 120, endTime: 240, speaker: 'Prof. Miller', text: 'To find the eigenvalues lambda, we compute the determinant of (A minus lambda times I) and set it to zero. This yields the characteristic polynomial.' },
        { startTime: 240, endTime: 360, speaker: 'Prof. Miller', text: 'For your mid-terms, always verify whether geometric multiplicity equals algebraic multiplicity. If they do for all eigenvalues, the matrix is fully diagonalizable.' }
      ]
    },
    {
      title: 'TCP Congestion Control & Flow Control Mechanics',
      subject: 'Computer Networks',
      description: 'Slow Start, Congestion Avoidance, AIMD (Additive Increase Multiplicative Decrease), and sliding window protocols.',
      tags: ['Networking', 'Computer Science', 'Core Concepts'],
      duration: 2700, // 45 minutes
      status: 'ready',
      transcriptSegments: [
        { startTime: 0, endTime: 60, speaker: 'Dr. Sarah Chen', text: 'Welcome back. Today we delve into how the Internet prevents collapse under heavy load: TCP congestion control algorithms.' },
        { startTime: 60, endTime: 150, speaker: 'Dr. Sarah Chen', text: 'Distinguish clearly between Flow Control and Congestion Control. Flow control protects the receiver buffer via rwnd. Congestion control protects the network pipe via cwnd.' },
        { startTime: 150, endTime: 280, speaker: 'Dr. Sarah Chen', text: 'AIMD stands for Additive Increase Multiplicative Decrease. When an ACK is received, cwnd grows linearly. When a packet loss occurs, cwnd halves immediately.' },
        { startTime: 280, endTime: 400, speaker: 'Dr. Sarah Chen', text: 'Be sure to know the difference between TCP Reno and TCP Cubic for the upcoming quiz. Cubic uses a concave/convex polynomial curve for high-bandwidth delay products.' }
      ]
    },
    {
      title: 'Second Law of Thermodynamics & Entropy',
      subject: 'Physics & Engineering',
      description: 'Carnot cycle limits, Clausius inequality, reversible processes, and statistical interpretation of entropy.',
      tags: ['Physics', 'Thermodynamics', 'Midterm Prep'],
      duration: 3450, // 57 minutes
      status: 'ready',
      transcriptSegments: [
        { startTime: 0, endTime: 55, speaker: 'Prof. Verma', text: 'Namaskar students. In today’s lecture on Thermodynamics, we explore why heat naturally flows from hot bodies to cold bodies, but never the reverse.' },
        { startTime: 55, endTime: 140, speaker: 'Prof. Verma', text: 'The Second Law states that in any isolated system, the total entropy delta S is always greater than or equal to zero. Reversible processes yield delta S = 0.' },
        { startTime: 140, endTime: 260, speaker: 'Prof. Verma', text: 'Let us examine the maximum theoretical efficiency of any heat engine operating between temperatures TH and TC: eta equals 1 minus TC divided by TH.' }
      ]
    }
  ];

  for (const item of demoLectures) {
    // Check if already seeded
    const existing = db.prepare('SELECT id FROM lectures WHERE user_id = ? AND title = ?').get(user.id, item.title) as any;
    if (existing) continue;

    const lectureId = `lec_demo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullText = item.transcriptSegments.map(s => s.text).join('\n\n');

    db.prepare(`
      INSERT INTO lectures (
        id, user_id, device_id, device_recording_id, title, subject, description,
        tags, recording_date, duration_seconds, file_size_bytes, audio_url, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 28400000, '/uploads/audio/demo.wav', 'ready')
    `).run(
      lectureId,
      user.id,
      device.id,
      `DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      item.title,
      item.subject,
      item.description,
      JSON.stringify(item.tags),
      item.duration
    );

    // Insert transcript
    const transcriptId = `tr_demo_${lectureId}`;
    db.prepare(`
      INSERT INTO transcripts (id, lecture_id, full_text, language)
      VALUES (?, ?, ?, 'en')
    `).run(transcriptId, lectureId, fullText);

    // Insert transcript segments
    const insertSeg = db.prepare(`
      INSERT INTO transcript_segments (id, transcript_id, start_time, end_time, speaker, text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const seg of item.transcriptSegments) {
      insertSeg.run(
        `seg_${Math.random().toString(36).substring(2, 7)}`,
        transcriptId,
        seg.startTime,
        seg.endTime,
        seg.speaker,
        seg.text
      );
    }

    // Generate study kit
    const studyKit = await generateStudyKit(item.title, item.subject, fullText, 'english');

    db.prepare(`
      INSERT INTO study_materials (
        id, lecture_id, summary, key_concepts, structured_notes_markdown,
        definitions, important_examples, formulas_and_facts, exam_takeaways
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `sm_${lectureId}`,
      lectureId,
      studyKit.summary,
      JSON.stringify(studyKit.keyConcepts),
      studyKit.structuredNotesMarkdown,
      JSON.stringify(studyKit.definitions),
      JSON.stringify(studyKit.importantExamples),
      JSON.stringify(studyKit.formulasAndFacts),
      JSON.stringify(studyKit.examTakeaways)
    );

    // Flashcards
    const insertCard = db.prepare(`
      INSERT INTO flashcards (id, lecture_id, user_id, question, answer, status)
      VALUES (?, ?, ?, ?, ?, 'new')
    `);
    for (const fc of studyKit.flashcards) {
      insertCard.run(`fc_${Math.random().toString(36).substring(2, 7)}`, lectureId, user.id, fc.question, fc.answer);
    }

    // Quiz
    const quizId = `qz_${lectureId}`;
    db.prepare(`
      INSERT INTO quizzes (id, lecture_id, user_id, title)
      VALUES (?, ?, ?, ?)
    `).run(quizId, lectureId, user.id, `${item.title} — Comprehension Test`);

    const insertQ = db.prepare(`
      INSERT INTO quiz_questions (id, quiz_id, question, options, correct_option_index, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const q of studyKit.quiz) {
      insertQ.run(
        `qq_${Math.random().toString(36).substring(2, 7)}`,
        quizId,
        q.question,
        JSON.stringify(q.options),
        q.correctOptionIndex,
        q.explanation
      );
    }

    // Seed a revision study task
    db.prepare(`
      INSERT INTO study_tasks (id, user_id, lecture_id, title, description, due_date, completed)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(
      `tsk_${Math.random().toString(36).substring(2, 7)}`,
      user.id,
      lectureId,
      `Review ${item.subject}: ${item.title}`,
      `Revise the generated notes and attempt flashcards before the upcoming quiz.`,
      new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Explicit demo sample lectures, flashcards, quizzes, and tasks seeded successfully.'
  });
}
