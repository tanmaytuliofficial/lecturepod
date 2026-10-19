'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  Mic2
} from 'lucide-react';

export default function DevicePairingPage() {
  const router = useRouter();

  // 6-digit OTP code state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Request & animation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairedData, setPairedData] = useState<{
    deviceId: string;
    ownerName: string;
    ownerEmail?: string;
  } | null>(null);

  // Demo simulator state
  const [simulating, setSimulating] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [simulatedDevice, setSimulatedDevice] = useState<string | null>(null);

  // Auto-focus first input box on page load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle single digit input
  const handleChange = (index: number, value: string) => {
    // Only accept numeric or alphanumeric characters
    const cleanChar = value.slice(-1).toUpperCase();
    if (value && !/^[A-Z0-9]$/.test(cleanChar)) return;

    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input if digit entered
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste of full 6-character code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    // Focus last filled digit or 5th
    const nextIdx = Math.min(pastedData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === 6;

  // Submit pairing request
  const handlePair = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete) {
      setError('Please enter all 6 characters of the pairing code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pair-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair_code: fullCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pairing failed. Please check the code.');
      }

      // Successful pairing animation state
      setPairedData({
        deviceId: data.device?.device_id || 'LP-4B89',
        ownerName: data.owner?.full_name || 'Tanmay Tuli',
        ownerEmail: data.owner?.email,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper simulator: Register a sample device e.g. LP-4B89 on edge and auto-fill code
  const handleSimulateHardwareDevice = async () => {
    setSimulating(true);
    setError(null);

    const randomSampleId = `LP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const randomSampleCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch('/api/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: randomSampleId,
          pair_code: randomSampleCode,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Simulator registration failed');
      }

      setSimulatedDevice(randomSampleId);
      setSimulatedCode(randomSampleCode);

      // Auto-populate 6 digit inputs for instant testing
      const newDigits = randomSampleCode.split('');
      setDigits(newDigits);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-300 relative overflow-hidden font-sans">
      
      {/* Linear-Style Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[280px] bg-zinc-800/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="px-6 py-5 border-b border-zinc-850/80 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-center text-white shadow-xs group-hover:border-zinc-500 transition">
            <Mic2 className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Lecture<span className="text-amber-400">Pod</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-500 ml-1">/ Hardware Pairing</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-zinc-900"
          >
            Dashboard
          </Link>
          <Link
            href="/lectures"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-850 transition"
          >
            Library →
          </Link>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
        
        {/* ================= CARD CONTAINER ================= */}
        <div className="w-full bg-[#0D0D12]/90 border border-zinc-800/90 rounded-3xl p-7 sm:p-10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500">
          
          {/* Subtle Top Specular Lighting */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-b from-amber-400/10 via-transparent to-transparent blur-md pointer-events-none" />

          {!pairedData ? (
            /* ================= PAIRING FORM STATE ================= */
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-amber-400 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Cryptographic Edge Link
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Pair Your Lecture Pod
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Enter the 6-character authentication code displayed on your device’s OLED screen.
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Centered 6-Digit OTP Field */}
              <form onSubmit={handlePair} className="space-y-7">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-11 h-14 sm:w-13 sm:h-16 rounded-2xl bg-zinc-950 border border-zinc-800 text-center text-xl sm:text-2xl font-mono font-bold text-white shadow-inner focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 transition-all duration-200 select-all"
                      placeholder="•"
                    />
                  ))}
                </div>

                {/* Primary Champagne-Gold Action Button */}
                <button
                  type="submit"
                  disabled={loading || !isComplete}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-[0_0_25px_rgba(251,191,36,0.25)] hover:shadow-[0_0_35px_rgba(251,191,36,0.45)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Verifying Edge Protocol...</span>
                    </>
                  ) : (
                    <>
                      <span>Pair Device</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Hardware Instructions Callout */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-zinc-200">
                  <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Where do I find my pairing code?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Power on your physical Lecture Pod device. The 6-digit code will appear on the OLED display next to the Wi-Fi status beacon.
                </p>
              </div>

              {/* Hardware Edge Simulator Trigger (Zero-friction Testing) */}
              <div className="pt-4 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-zinc-500 text-[11px]">
                  Testing without physical hardware?
                </div>
                <button
                  type="button"
                  onClick={handleSimulateHardwareDevice}
                  disabled={simulating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-[11px] font-mono transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{simulating ? 'Simulating Device...' : 'Simulate Device LP-4B89'}</span>
                </button>
              </div>

              {simulatedCode && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono text-center">
                  Simulator Active: Device <strong>{simulatedDevice}</strong> generated code <strong>{simulatedCode}</strong> (Auto-filled)
                </div>
              )}

            </div>
          ) : (
            /* ================= SMOOTH SUCCESS ANIMATION STATE ================= */
            <div className="space-y-8 text-center animate-scaleIn py-4">
              
              {/* Glowing Success Badge */}
              <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />
              </div>

              {/* Requested Success Copy */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HARDWARE LINK VERIFIED
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Device <span className="text-amber-400 font-mono">{pairedData.deviceId}</span> Successfully Linked to <span className="text-white">{pairedData.ownerName}</span>&apos;s Account!
                </h2>

                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Your classroom audio captures will now sync automatically and transform into AI study kits, flashcards, and quizzes.
                </p>
              </div>

              {/* Hardware Telemetry Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Device Identifier:</span>
                  <span className="text-white font-bold">{pairedData.deviceId}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Owner Account:</span>
                  <span className="text-amber-400 font-medium">{pairedData.ownerName}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Sync Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> PAIRED &bull; READY
                  </span>
                </div>
              </div>

              {/* Redirect Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => router.push('/lectures')}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to Lecture Library Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-zinc-850/80 text-center text-xs text-zinc-600 font-mono">
        LecturePod Edge Infrastructure &bull; Secure Protocol v1.2 &bull; &copy; 2026
      </footer>

      {/* Smooth Scale Animation */}
      <style jsx global>{`
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-scaleIn {
          animation: scaleIn 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-shake {
          animation: shake 300ms ease-in-out;
        }
      `}</style>
    </div>
  );
}
