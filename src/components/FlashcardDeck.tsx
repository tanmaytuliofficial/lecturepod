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
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-12 text-center text-zinc-500 shadow-xs">
        <Sparkles className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h3 className="text-base font-bold text-zinc-950">No Flashcards Available</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
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
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-zinc-950">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> {masteredCount} Mastered
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              <AlertTriangle className="w-3 h-3" /> {difficultCount} Needs Review
            </span>
          </div>
        </div>

        <button
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 shadow-xs transition"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle Deck
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200/80 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 3D Flashcard Flip Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-88 cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-3xl shadow-md border border-zinc-200/90 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT: Question */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#121215] p-8 sm:p-10 rounded-3xl flex flex-col justify-between border-t-4 border-t-amber-500/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-widest font-bold">
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Question Concept
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
                <RotateCw className="w-3 h-3" /> Click to Flip
              </span>
            </div>
            <div className="text-center my-auto px-4">
              <p className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white leading-relaxed tracking-tight">
                {currentCard.question}
              </p>
            </div>
            <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              Click anywhere to reveal the synthesized answer
            </div>
          </div>

          {/* BACK: Answer */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-950 text-white p-8 sm:p-10 rounded-3xl flex flex-col justify-between border-t-4 border-t-amber-400">
            <div className="flex items-center justify-between text-xs text-amber-400 uppercase tracking-widest font-bold">
              <span>Answer Explanation</span>
              <span className="inline-flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                <RotateCw className="w-3 h-3" /> Click to Flip Back
              </span>
            </div>
            <div className="text-center my-auto px-4">
              <p className="text-lg sm:text-xl font-normal text-zinc-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>
            <div className="text-center text-[11px] text-zinc-500 font-medium">
              Concept Verified
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              currentCard.status === 'difficult'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'border-zinc-200/80 bg-white text-zinc-700 hover:bg-rose-50/50 hover:text-rose-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Mark Difficult
          </button>
          <button
            onClick={() => updateCardStatus('mastered')}
            disabled={updating}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              currentCard.status === 'mastered'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'border-zinc-200/80 bg-white text-zinc-700 hover:bg-emerald-50/50 hover:text-emerald-700'
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
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-xs transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-bold shadow-sm ring-1 ring-zinc-800 transition"
          >
            Next <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
