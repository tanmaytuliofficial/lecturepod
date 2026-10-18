import { getDatabase } from '@/lib/db';
import { transcribeAudio, generateStudyKit } from '@/lib/ai';

/**
 * Background pipeline: Transcribing -> Generating Study Material -> Ready
 */
export async function processLectureInBackground(
  lectureId: string, 
  audioFilePath: string, 
  title: string, 
  subject: string, 
  userId: string
) {
  const db = getDatabase();
  try {
    // 1. Set status to transcribing
    db.prepare("UPDATE lectures SET status = 'transcribing' WHERE id = ?").run(lectureId);

    // 2. Transcribe audio
    const transcription = await transcribeAudio(audioFilePath, 'en', title, subject);

    // 3. Save transcript
    const transcriptId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT OR REPLACE INTO transcripts (id, lecture_id, full_text, language)
      VALUES (?, ?, ?, ?)
    `).run(transcriptId, lectureId, transcription.fullText, transcription.language);

    // Save segments
    const insertSegment = db.prepare(`
      INSERT INTO transcript_segments (id, transcript_id, start_time, end_time, speaker, text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const seg of transcription.segments) {
      insertSegment.run(
        `seg_${Math.random().toString(36).substring(2, 8)}`,
        transcriptId,
        seg.startTime,
        seg.endTime,
        seg.speaker,
        seg.text
      );
    }

    // 4. Set status to generating_study_material
    db.prepare("UPDATE lectures SET status = 'generating_study_material' WHERE id = ?").run(lectureId);

    // 5. Generate Study Kit (Notes, Summary, Flashcards, Quiz)
    const studyKit = await generateStudyKit(title, subject, transcription.fullText, 'english');

    // Save study materials
    const studyMaterialId = `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT OR REPLACE INTO study_materials (
        id, lecture_id, summary, key_concepts, structured_notes_markdown,
        definitions, important_examples, formulas_and_facts, exam_takeaways
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      studyMaterialId,
      lectureId,
      studyKit.summary,
      JSON.stringify(studyKit.keyConcepts),
      studyKit.structuredNotesMarkdown,
      JSON.stringify(studyKit.definitions),
      JSON.stringify(studyKit.importantExamples),
      JSON.stringify(studyKit.formulasAndFacts),
      JSON.stringify(studyKit.examTakeaways)
    );

    // Save flashcards
    const insertCard = db.prepare(`
      INSERT INTO flashcards (id, lecture_id, user_id, question, answer, status)
      VALUES (?, ?, ?, ?, ?, 'new')
    `);
    for (const card of studyKit.flashcards) {
      insertCard.run(
        `fc_${Math.random().toString(36).substring(2, 8)}`,
        lectureId,
        userId,
        card.question,
        card.answer
      );
    }

    // Save quiz
    const quizId = `qz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO quizzes (id, lecture_id, user_id, title)
      VALUES (?, ?, ?, ?)
    `).run(quizId, lectureId, userId, `${title} — Mastery Quiz`);

    const insertQ = db.prepare(`
      INSERT INTO quiz_questions (id, quiz_id, question, options, correct_option_index, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const q of studyKit.quiz) {
      insertQ.run(
        `qq_${Math.random().toString(36).substring(2, 8)}`,
        quizId,
        q.question,
        JSON.stringify(q.options),
        q.correctOptionIndex,
        q.explanation
      );
    }

    // 6. Set status to ready!
    db.prepare("UPDATE lectures SET status = 'ready', error_message = NULL WHERE id = ?").run(lectureId);
  } catch (err: any) {
    console.error(`Processing failed for lecture ${lectureId}:`, err);
    db.prepare("UPDATE lectures SET status = 'failed', error_message = ? WHERE id = ?").run(err.message, lectureId);
  }
}
