'use client';

import React, { useState, useEffect } from 'react';
import { Mic2, BatteryCharging, Wifi, Sparkles, Loader2, Play, Square } from 'lucide-react';

interface LecturePodDeviceProps {
  children?: React.ReactNode;
  isSubmitting?: boolean;
  onButtonPress?: () => void;
  statusText?: string;
  buttonLabel?: string;
  showWaveform?: boolean;
  mode?: 'login' | 'register' | 'device' | 'active';
  recordingTimer?: string;
}

export function LecturePodDevice({
  children,
  isSubmitting = false,
  onButtonPress,
  statusText = 'Recording...',
  buttonLabel = 'Tap Button to Authenticate',
  showWaveform = true,
  mode = 'login',
  recordingTimer = '00:12:36',
}: LecturePodDeviceProps) {
  const [seconds, setSeconds] = useState(36);
  const [isPressed, setIsPressed] = useState(false);

  // Subtle live timer increment to feel real
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTimer = recordingTimer.replace(/:36$/, `:${seconds.toString().padStart(2, '0')}`);

  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 300);
    if (onButtonPress) {
      onButtonPress();
    }
  };

  return (
    <div className="relative mx-auto select-none">
      {/* Ambient Device Shadow / Table Reflection */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-black/60 blur-2xl rounded-full pointer-events-none" />

      {/* Main Physical Device Chassis */}
      <div 
        className="relative w-full max-w-[390px] bg-[#121215] border border-zinc-700/70 rounded-[44px] p-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col justify-between transition-all duration-300"
        style={{ minHeight: '620px' }}
      >
        {/* Top Edge: Microphone Pinhole & Bevel Accent */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/80 shadow-inner" />
          <div className="w-1 h-1 rounded-full bg-zinc-800 border border-zinc-700/60 shadow-inner" />
        </div>

        {/* ================= UPPER OLED DISPLAY PANEL ================= */}
        <div className="relative mt-2 rounded-[26px] bg-[#070709] border border-zinc-800/90 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)] p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* OLED Glass Specular Glare */}
          <div className="absolute -top-24 -left-24 w-64 h-48 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent rotate-12 pointer-events-none rounded-full blur-xs" />

          {/* OLED Status Bar Header */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pb-3 border-b border-zinc-900 relative z-10">
            {/* Left: Mic Status */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <Mic2 className="w-3.5 h-3.5 text-zinc-400" />
            </div>

            {/* Center: Live Timer & Waveform */}
            <div className="flex flex-col items-center">
              <span className="text-white font-bold tracking-wider text-xs">
                {formattedTimer}
              </span>
              {showWaveform && (
                <div className="flex items-center gap-0.5 mt-1 h-3">
                  {[4, 12, 8, 16, 24, 14, 20, 10, 18, 6, 12].map((height, i) => (
                    <span
                      key={i}
                      className="w-[2px] bg-sky-400 rounded-full animate-pulse"
                      style={{
                        height: `${height * 0.4}px`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Battery & Status */}
            <div className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300 font-bold">85%</span>
            </div>
          </div>

          {/* OLED Display Content (e.g., Login Form / Active UI) */}
          <div className="relative z-10 py-4 flex-1 flex flex-col justify-center">
            {children}
          </div>

          {/* OLED Bottom Telemetry */}
          <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[10px] font-mono text-zinc-500 relative z-10">
            <span className="flex items-center gap-1 text-emerald-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LP-OS v1.2 ONLINE
            </span>
            <span className="text-zinc-500">{statusText}</span>
          </div>
        </div>

        {/* ================= LOWER HARDWARE CONTROL SECTION ================= */}
        <div className="mt-6 mb-2 flex flex-col items-center justify-center space-y-4">
          {/* Iconic Physical Button: Glowing Blue Ring + Red Square */}
          <button
            type={onButtonPress ? 'button' : 'submit'}
            onClick={handlePress}
            disabled={isSubmitting}
            title="Press LecturePod Button to Authenticate"
            className={`relative w-20 h-20 rounded-full bg-[#0E0E12] border-[3.5px] border-blue-500 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(59,130,246,0.65),inset_0_0_15px_rgba(59,130,246,0.35)] hover:shadow-[0_0_40px_rgba(59,130,246,0.9),inset_0_0_20px_rgba(59,130,246,0.5)] active:scale-95 transition-all duration-200 group ${
              isPressed ? 'scale-90 border-blue-400' : ''
            }`}
          >
            {/* Outer Blue Glow Ring */}
            <div className="absolute inset-0 rounded-full border border-blue-300/40 pointer-events-none" />

            {/* Center Red Stop/Record Square */}
            {isSubmitting ? (
              <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
            ) : (
              <div className="w-6 h-6 rounded-[5px] bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] group-hover:bg-red-500 transition-colors" />
            )}
          </button>

          {/* Action Helper Prompt */}
          <p className="text-[11px] font-medium text-zinc-400 tracking-wide">
            {buttonLabel}
          </p>

          {/* Laser-Engraved "Lecture Pod" Brand Branding */}
          <div className="pt-2 text-center">
            <span className="text-xs font-semibold tracking-wider text-zinc-300/80 uppercase">
              Lecture Pod
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
