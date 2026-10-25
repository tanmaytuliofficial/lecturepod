/**
 * Lecture Pod LLM Extraction Prompts & JSON Schema Specifications
 */

export const LECTURE_EXTRACTION_SYSTEM_PROMPT = `You are the lead Academic AI Synthesizer for Lecture Pod — a university-grade hardware audio intelligence platform.
Your objective is to analyze a raw classroom lecture transcript and extract high-yield, structured academic materials.

You must extract:
1. A concise, accurate academic title for the lecture.
2. Comprehensive structured study notes in clean GitHub-flavored markdown (with executive summary, core concept hierarchy, detailed explanations, and practical examples).
3. Key formulas and definitions with formal mathematical or conceptual precision.
4. Exactly 5 high-yield practice quiz questions (multiple-choice format with 4 options, 0-indexed correct answer, and pedagogical explanation).
5. Exactly 5 active-recall flashcards (front question, back answer).

Output MUST be strictly valid JSON matching the required schema with zero markdown formatting outside the JSON object.`;

export function buildLectureExtractionUserPrompt(transcript: string, titleHint?: string, subjectHint?: string): string {
  return `Extract structured study notes, key formulas/definitions, 5 practice quiz questions, and 5 flashcards from this lecture transcript.

${titleHint ? `Course/Topic Hint: ${titleHint}\n` : ''}${subjectHint ? `Subject Area: ${subjectHint}\n` : ''}
--- LECTURE TRANSCRIPT ---
${transcript}
-------------------------

Return the result as a JSON object strictly following this structure:
{
  "title": "Concise Academic Lecture Title",
  "subject": "Inferred Subject Category (e.g. Computer Science, Physics, Mathematics)",
  "summary": "2-3 paragraph executive summary of the lecture",
  "structured_notes": "Full comprehensive markdown notes with headers, bullet points, and key takeaways",
  "key_formulas": [
    {
      "term": "Term or Formula Name",
      "formula": "Mathematical expression or core definition",
      "context": "Brief explanation of when and why it is used"
    }
  ],
  "flashcards": [
    {
      "question": "Clear conceptual question testing recall",
      "answer": "Accurate, concise explanation"
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question testing analytical understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "correct_answer": "Option A",
      "explanation": "Detailed explanation of why this option is correct"
    }
  ]
}`;
}

export interface ExtractedStudyMaterial {
  title: string;
  subject?: string;
  summary: string;
  structured_notes: string;
  key_formulas: Array<{
    term: string;
    formula: string;
    context: string;
  }>;
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correct_answer_index: number;
    correct_answer: string;
    explanation: string;
  }>;
}
