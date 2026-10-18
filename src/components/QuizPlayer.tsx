'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  Award,
  ArrowRight
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
      <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500">
        <HelpCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h3 className="text-base font-semibold text-zinc-800">No Quiz Generated Yet</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
          The quiz is automatically generated from the transcript once AI processing completes.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {questions.length} Questions based on this lecture&apos;s audio and transcript
          </p>
        </div>

        {/* Previous attempts pill */}
        {previousAttempts.length > 0 && (
          <div className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
            Best Attempt:{' '}
            <span className="font-semibold text-zinc-900">
              {Math.max(...previousAttempts.map((a) => Math.round((a.score / a.total_questions) * 100)))}%
            </span>{' '}
            ({previousAttempts.length} total attempts)
          </div>
        )}
      </div>

      {/* Result Card on submission */}
      {isSubmitted && scoreResult && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Quiz Completed!</h3>
          <p className="text-sm text-zinc-600">
            You scored <span className="font-bold text-amber-800">{scoreResult.score}</span> out of{' '}
            <span className="font-bold text-zinc-800">{scoreResult.total}</span> (
            <span className="font-bold text-amber-700">{scoreResult.percentage}%</span>)
          </p>
          <div className="pt-2">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
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
              className={`bg-white border rounded-xl p-6 transition ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-zinc-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold text-sm text-zinc-400 font-mono mt-0.5">
                  0{qIndex + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-base font-medium text-zinc-900 leading-snug">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="mt-4 space-y-2.5">
                    {q.options.map((option, optIdx) => {
                      const isOptionSelected = studentChoice === optIdx;
                      const isOptionCorrect = q.correct_option_index === optIdx;

                      let optionStyle = 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                        } else {
                          optionStyle = 'border-zinc-200 bg-zinc-50 text-zinc-400';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'border-zinc-900 bg-zinc-900 text-white font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          disabled={isSubmitted}
                          className={`w-full text-left px-4 py-3 rounded-lg border text-sm flex items-center justify-between transition ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                                isSubmitted
                                  ? isOptionCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : isOptionSelected
                                    ? 'bg-rose-500 text-white'
                                    : 'border border-zinc-300 text-zinc-400'
                                  : isOptionSelected
                                  ? 'bg-amber-400 text-zinc-900'
                                  : 'border border-zinc-300 text-zinc-500'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>

                          {isSubmitted && isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isSubmitted && isOptionSelected && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation box on review */}
                  {isSubmitted && q.explanation && (
                    <div className="mt-4 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600">
                      <span className="font-semibold text-zinc-900">Explanation: </span>
                      {q.explanation}
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
        <div className="sticky bottom-4 bg-white/90 backdrop-blur-md border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div className="text-xs text-zinc-600">
            Answered{' '}
            <span className="font-semibold text-zinc-900">
              {answeredCount} of {questions.length}
            </span>{' '}
            questions
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
          >
            {submitting ? 'Calculating...' : 'Submit Answers'}
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}
    </div>
  );
}
