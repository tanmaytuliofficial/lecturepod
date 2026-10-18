'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  status: 'new' | 'learning' | 'mastered' | 'difficult';
}

interface Props {
  lectureId: string;
  initialCards: Flashcard[];
}

export function FlashcardDeck({ lectureId, initialCards }: Props) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500">
        <Sparkles className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h3 className="text-base font-semibold text-zinc-800">No Flashcards Available</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
          Flashcards are automatically generated from lecture transcripts once AI processing completes.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const masteredCount = cards.filter((c) => c.status === 'mastered').length;
  const difficultCount = cards.filter((c) => c.status === 'difficult').length;
  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const updateCardStatus = async (status: 'mastered' | 'difficult') => {
    if (!currentCard || updating) return;
    setUpdating(true);
    try {
      await fetch(`/api/lectures/${lectureId}/flashcards/${currentCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, status } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header & Metrics */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-zinc-800">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {masteredCount} Mastered
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">
              <AlertTriangle className="w-3 h-3" /> {difficultCount} Needs Review
            </span>
          </div>
        </div>

        <button
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-100 transition"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-amber-600 h-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 3D Flashcard Flip Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer perspective-1000 select-none"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-2xl shadow-sm border border-zinc-200 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT: Question */}
          <div className="absolute inset-0 backface-hidden bg-white p-8 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-zinc-600 uppercase tracking-wider font-semibold">
              <span>Question</span>
              <span className="inline-flex items-center gap-1 text-zinc-600">
                <RotateCw className="w-3 h-3" /> Click to Flip
              </span>
            </div>
            <div className="text-center my-auto px-4">
              <p className="text-lg md:text-xl font-medium text-zinc-900 leading-relaxed">
                {currentCard.question}
              </p>
            </div>
            <div className="text-center text-xs text-zinc-600">
              Press space or click anywhere to reveal answer
            </div>
          </div>

          {/* BACK: Answer */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 text-white p-8 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-400 uppercase tracking-wider font-semibold">
              <span>Answer</span>
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <RotateCw className="w-3 h-3" /> Click to Flip back
              </span>
            </div>
            <div className="text-center my-auto px-4">
              <p className="text-lg md:text-xl font-normal text-zinc-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>
            <div className="text-center text-xs text-zinc-400">
              Card flipped
            </div>
          </div>
        </div>
      </div>

      {/* Mastery & Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Difficult / Mastered Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateCardStatus('difficult')}
            disabled={updating}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              currentCard.status === 'difficult'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'border-zinc-200 text-zinc-700 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Mark Difficult
          </button>
          <button
            onClick={() => updateCardStatus('mastered')}
            disabled={updating}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              currentCard.status === 'mastered'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'border-zinc-200 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Mastered
          </button>
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-sm font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-medium transition"
          >
            Next <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
