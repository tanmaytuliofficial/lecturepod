'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export function SeedDemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
          Seeding Sample Lectures...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Load Sample Demo Lectures
        </>
      )}
    </button>
  );
}
