import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateStudyKit } from '@/lib/ai';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    // Ensure user has a device
    let device = db.prepare('SELECT id FROM devices WHERE user_id = ?').get(user.id) as any;

    if (!device) {
      const demoIdentifier = `LP-SIM-${user.id.slice(-6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const devId = `dev_sim_${Date.now()}`;
      db.prepare(`
        INSERT INTO devices (id, user_id, name, device_identifier, status, ip_address, firmware_version, last_heartbeat_at, last_sync_at)
        VALUES (?, ?, 'LecturePod Device (Studio Lab)', ?, 'online', '192.168.1.104', 'v1.2.0-lp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(devId, user.id, demoIdentifier);
      device = { id: devId };
    }

    const sampleLecturesPool = [
      {
        title: 'Deep Learning & Transformer Attention Mechanisms',
        subject: 'Artificial Intelligence',
        description: 'Scaled dot-product attention, multi-head projections, positional encoding, and self-attention computational complexity.',
        tags: ['AI', 'Transformers', 'Deep Learning'],
        duration: 3300,
        transcriptSegments: [
          { startTime: 0, endTime: 45, speaker: 'Prof. Vaswani', text: 'Welcome to Lecture 14. Today we break down the Transformer architecture that powers modern LLMs.' },
          { startTime: 45, endTime: 110, speaker: 'Prof. Vaswani', text: 'The core innovation is Self-Attention: calculating softmax of Q times K transpose divided by the square root of dk, all multiplied by V.' },
          { startTime: 110, endTime: 220, speaker: 'Prof. Vaswani', text: 'Multi-head attention permits the model to simultaneously attend to information from disparate representation subspaces at different positions.' },
          { startTime: 220, endTime: 340, speaker: 'Prof. Vaswani', text: 'Remember for the exam: Self-attention has quadratic O(n^2) complexity with sequence length, which drives the need for efficient attention mechanisms.' }
        ]
      },
      {
        title: 'Distributed Systems & Raft Consensus Algorithm',
        subject: 'Distributed Computing',
        description: 'Leader election, log replication, split-brain avoidance, heartbeat timers, and safety invariants in consensus protocols.',
        tags: ['Systems', 'Distributed Systems', 'Consensus'],
        duration: 2880,
        transcriptSegments: [
          { startTime: 0, endTime: 50, speaker: 'Dr. Ongaro', text: 'In today’s lecture, we explore how distributed machines agree on a shared replicated log despite node failures: the Raft Consensus protocol.' },
          { startTime: 50, endTime: 130, speaker: 'Dr. Ongaro', text: 'Raft decomposes consensus into three independent subproblems: Leader Election, Log Replication, and Safety.' },
          { startTime: 130, endTime: 240, speaker: 'Dr. Ongaro', text: 'A candidate transitions to leader only after accumulating votes from a strict quorum—a majority of cluster nodes.' },
          { startTime: 240, endTime: 360, speaker: 'Dr. Ongaro', text: 'Crucial exam takeaway: The Leader Append-Only invariant guarantees that a leader never overwrites or truncates its own log entries.' }
        ]
      }
    ];

    // Pick a lecture that is not yet in the user's library
    let chosen = sampleLecturesPool[0];
    const existingFirst = db.prepare('SELECT id FROM lectures WHERE user_id = ? AND title = ?').get(user.id, chosen.title) as any;
    if (existingFirst) {
      chosen = sampleLecturesPool[1];
    }

    const lectureId = `lec_sim_${Date.now()}`;
    const fullText = chosen.transcriptSegments.map(s => s.text).join('\n\n');

    db.prepare(`
      INSERT INTO lectures (
        id, user_id, device_id, device_recording_id, title, subject, description,
        tags, recording_date, duration_seconds, file_size_bytes, audio_url, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 31200000, '/uploads/audio/demo.wav', 'ready')
    `).run(
      lectureId,
      user.id,
      device.id,
      `SIM-${Date.now()}`,
      chosen.title,
      chosen.subject,
      chosen.description,
      JSON.stringify(chosen.tags),
      chosen.duration
    );

    // Insert transcript
    const transcriptId = `tr_sim_${lectureId}`;
    db.prepare(`
      INSERT INTO transcripts (id, lecture_id, full_text, language)
      VALUES (?, ?, ?, 'en')
    `).run(transcriptId, lectureId, fullText);

    // Insert transcript segments
    const insertSeg = db.prepare(`
      INSERT INTO transcript_segments (id, transcript_id, start_time, end_time, speaker, text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const seg of chosen.transcriptSegments) {
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
    const studyKit = await generateStudyKit(chosen.title, chosen.subject, fullText, 'english');

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
      VALUES (?, ?, ?, ?, ?, 'learning')
    `);
    for (const fc of studyKit.flashcards) {
      insertCard.run(
        `fc_${Math.random().toString(36).substring(2, 7)}`,
        lectureId,
        user.id,
        fc.question,
        fc.answer
      );
    }

    // Quiz
    const quizId = `qz_${lectureId}`;
    db.prepare(`
      INSERT INTO quizzes (id, lecture_id, user_id, title)
      VALUES (?, ?, ?, ?)
    `).run(quizId, lectureId, user.id, `${chosen.title} — Comprehension Test`);

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

    // Update device last_sync_at
    db.prepare(`UPDATE devices SET last_sync_at = CURRENT_TIMESTAMP, status = 'online' WHERE id = ?`).run(device.id);

    return NextResponse.json({
      success: true,
      lecture_id: lectureId,
      title: chosen.title,
      subject: chosen.subject,
      message: 'New recording simulated from LecturePod Device: audio synced and AI study kit generated!'
    });
  } catch (error: any) {
    console.error('Simulate sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
