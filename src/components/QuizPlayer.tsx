'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface Props {
  lectureId: string;
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  previousAttempts?: Array<{
    id: string;
    score: number;
    total_questions: number;
    completed_at: string;
  }>;
}

export function QuizPlayer({ lectureId, quizId, title, questions, previousAttempts = [] }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-12 text-center text-zinc-500 shadow-xs max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto ring-1 ring-amber-200/60 shadow-xs mb-4">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-zinc-950">No Quiz Generated Yet</h3>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
          The quiz is automatically generated from the audio transcript once AI synthesis completes.
        </p>
      </div>
    );
  }

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lectures/${lectureId}/quiz/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quizId,
          answers: selectedAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScoreResult({
          score: data.score,
          total: data.total_questions,
          percentage: data.percentage,
        });
        setIsSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60 mb-2">
            <Sparkles className="w-3 h-3 text-amber-600" />
            AI Comprehension Assessment
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">{title}</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {questions.length} questions derived directly from the classroom audio recording
          </p>
        </div>

        {/* Previous attempts pill */}
        {previousAttempts.length > 0 && (
          <div className="text-xs text-zinc-600 bg-white border border-zinc-200/80 px-4 py-2 rounded-2xl shadow-xs">
            Best Attempt:{' '}
            <span className="font-bold text-zinc-950">
              {Math.max(...previousAttempts.map((a) => Math.round((a.score / a.total_questions) * 100)))}%
            </span>{' '}
            <span className="text-zinc-400">({previousAttempts.length} tests)</span>
          </div>
        )}
      </div>

      {/* Result Card on submission */}
      {isSubmitted && scoreResult && (
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-8 text-center space-y-4 ring-1 ring-zinc-800 shadow-xl">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Assessment Completed</h3>
            <p className="text-xs text-zinc-400 mt-1">
              You scored <span className="font-bold text-amber-400 text-sm">{scoreResult.score}</span> out of{' '}
              <span className="font-bold text-white text-sm">{scoreResult.total}</span> (
              <span className="font-bold text-amber-400 text-sm">{scoreResult.percentage}%</span>)
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
            </button>
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const studentChoice = selectedAnswers[q.id];
          const isCorrect = isSubmitted && studentChoice === q.correct_option_index;
          const isWrong = isSubmitted && studentChoice !== undefined && studentChoice !== q.correct_option_index;

          return (
            <div
              key={q.id}
              className={`bg-white dark:bg-[#121215] border rounded-3xl p-7 transition shadow-xs ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/10 bg-emerald-50/15 dark:bg-emerald-950/20'
                    : 'border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/10 bg-rose-50/15 dark:bg-rose-950/20'
                  : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-300 font-mono shrink-0">
                  {qIndex + 1 < 10 ? `0${qIndex + 1}` : qIndex + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white leading-relaxed">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="mt-5 space-y-3">
                    {q.options.map((option, optIdx) => {
                      const isOptionSelected = studentChoice === optIdx;
                      const isOptionCorrect = q.correct_option_index === optIdx;

                      let optionStyle = 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optionStyle = 'border-rose-400 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 line-through';
                        } else {
                          optionStyle = 'border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20 text-zinc-400 opacity-60';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'border-amber-500 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium ring-2 ring-amber-400/20 shadow-xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          disabled={isSubmitted}
                          className={`w-full text-left px-4 py-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between transition ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition shrink-0 ${
                                isSubmitted
                                  ? isOptionCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : isOptionSelected
                                    ? 'bg-rose-500 text-white'
                                    : 'border border-zinc-300 dark:border-zinc-700 text-zinc-400'
                                  : isOptionSelected
                                  ? 'bg-amber-400 text-zinc-950'
                                  : 'border border-zinc-300/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-relaxed">{option}</span>
                          </div>

                          {isSubmitted && isOptionCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {isSubmitted && isOptionSelected && !isOptionCorrect && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation box on review */}
                  {isSubmitted && q.explanation && (
                    <div className="mt-5 p-4 bg-zinc-900 text-white rounded-2xl text-xs space-y-1 ring-1 ring-zinc-800">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> Conceptual Explanation
                      </div>
                      <p className="text-zinc-300 leading-relaxed pt-0.5">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Action Bar */}
      {!isSubmitted && (
        <div className="sticky bottom-6 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-zinc-950/10">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Progress:{' '}
            <span className="font-bold text-zinc-950 dark:text-white">
              {answeredCount} of {questions.length} answered
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition shadow-xs"
          >
            {submitting ? 'Scoring...' : 'Submit Assessment'}
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          </button>
        </div>
      )}
    </div>
  );
}
