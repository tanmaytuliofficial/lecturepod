'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  RotateCw, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  BatteryCharging, 
  Mic2, 
  Volume2, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  subtitle: string;
  specs: string;
  image: string;
  description: string;
  highlights: string[];
}

const PROFILES: Profile[] = [
  {
    id: 'hero',
    name: 'Classroom Desk Perspective',
    subtitle: '3D Angled Ergonomics',
    specs: 'Compact Matte Finish • 10.5 cm × 6.5 cm',
    image: '/images/device-hero.png',
    description: 'Blends seamlessly on any student lecture desk. Matte tactile finish prevents accidental slip and captures crystal-clear lecturer audio across 300+ seat auditoriums.',
    highlights: ['Micro-textured polycarbonate shell', 'Dual beamforming noise cancellation', 'Weighted bottom for anti-skid stability']
  },
  {
    id: 'front',
    name: 'Front Profile & Controls',
    subtitle: 'OLED Glass & Halo Ring',
    specs: 'Width: 6.5 cm • Height: 10.5 cm',
    image: '/images/profile-front.png',
    description: 'Houses the high-contrast OLED telemetry screen and the iconic one-touch illuminated start/stop recording button.',
    highlights: ['Live recording timer & audio VU meter', 'Battery percentage readout', 'Instant tactile status response']
  },
  {
    id: 'side',
    name: 'Ultra-Thin Side Profile',
    subtitle: 'Universal USB-C Interface',
    specs: 'Thickness: 2.0 cm Ultra-Slim',
    image: '/images/profile-side.png',
    description: 'At just 2.0 cm thickness, slides into any pocket or pencil pouch. Features a high-speed USB-C charging and diagnostic sync port.',
    highlights: ['Universal USB-C high-speed port', 'Acoustic mic side-vent ports', 'Pocket-friendly rounded chamfers']
  },
  {
    id: 'back',
    name: 'Back Profile & Acoustic Chamber',
    subtitle: 'Laser-Etched Silkscreen',
    specs: 'Acoustic Chamber Resonance Grille',
    image: '/images/profile-back.png',
    description: 'Rear precision speaker micro-grille allows instant audio playback and offline hardware diagnostic chime alerts.',
    highlights: ['Precision speaker grille array', 'Laser-etched Lecture Pod emblem', 'Scratch-resistant velvet coating']
  },
  {
    id: 'angled',
    name: 'Angled Isometric View',
    subtitle: 'Palm-Sized Architecture',
    specs: 'Weight: ~110 grams Ultra-Light',
    image: '/images/profile-angled.png',
    description: 'Engineered for all-day campus carry. Minimalist architecture with no unnecessary buttons or distractions during intense classes.',
    highlights: ['Zero distraction design', 'No glowing distractions in dark rooms', 'Rugged impact-resistant chassis']
  }
];

export function DeviceScrollShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-cycle through profiles every 4 seconds unless user manually interacts
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PROFILES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const activeProfile = PROFILES[activeIdx];

  return (
    <div ref={containerRef} className="py-20 bg-[#09090C] text-white rounded-3xl sm:rounded-[40px] border border-zinc-800 shadow-2xl relative overflow-hidden">
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-amber-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Hardware Exploration</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Multiple Profiles & Sides</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Precision Engineered for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">
              Effortless Classroom Capture
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Examine every millimeter of the physical LecturePod device—from the high-contrast OLED display to the ultra-thin 2.0 cm chassis.
          </p>
        </div>

        {/* ================= INTERACTIVE 360° PROFILE VIEWER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#111115] border border-zinc-800/90 rounded-3xl p-6 sm:p-10 shadow-inner">
          
          {/* Left Column: Dynamic High-Res Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Viewport Card */}
            <div className="relative w-full h-[360px] sm:h-[420px] bg-[#07070A] rounded-2xl border border-zinc-800/80 p-6 flex items-center justify-center overflow-hidden group">
              {/* Radial Lighting Spot */}
              <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />
              
              {/* Technical Dimension Overlay Guides */}
              <div className="absolute top-4 left-4 font-mono text-[11px] text-zinc-500 flex items-center gap-2 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{activeProfile.specs}</span>
              </div>

              <div className="absolute bottom-4 right-4 font-mono text-[11px] text-zinc-500 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
                <span>View {activeIdx + 1} of {PROFILES.length}</span>
              </div>

              {/* Displayed Image with smooth transition */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  key={activeProfile.id}
                  src={activeProfile.image}
                  alt={activeProfile.name}
                  className="max-h-[340px] max-w-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-500 transform group-hover:scale-105"
                />
              </div>
            </div>

            {/* Profile Selection Thumbnail Buttons */}
            <div className="mt-5 w-full flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {PROFILES.map((prof, idx) => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    setAutoRotate(false);
                  }}
                  className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl border text-[11px] font-mono font-medium transition text-center truncate ${
                    activeIdx === idx
                      ? 'bg-zinc-800 text-white border-amber-500/70 shadow-sm'
                      : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  {prof.name.split(' ')[0]} View
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Profile Specs & Component Breakdown (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
                <span>Profile Detail</span>
                <span className="text-zinc-600">&bull;</span>
                <span>{activeProfile.subtitle}</span>
              </div>

              <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                {activeProfile.name}
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {activeProfile.description}
              </p>

              {/* Highlights */}
              <div className="mt-5 space-y-2.5">
                {activeProfile.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Callout: Try Device In Login Mode */}
            <div className="pt-6 border-t border-zinc-800 space-y-3">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Experience Virtual Device</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Use the physical chassis to authenticate</p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-xs shrink-0"
                >
                  <span>Open Pod Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* ================= 3 CLOSE-UP HARDWARE MACRO CARDS ================= */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Macro 1: Clear Display */}
          <div className="bg-[#111115] border border-zinc-800/90 rounded-3xl p-5 overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition">
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden bg-black mb-4 border border-zinc-850">
                <img
                  src="/images/feature-display.png"
                  alt="Clear Display Feature"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">Clear OLED Display</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Crisp high-contrast OLED screen shows live recording timers, waveform levels, and battery percentages without eye strain.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/70 text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Telemetry & Status Readout</span>
            </div>
          </div>

          {/* Macro 2: One Button Control */}
          <div className="bg-[#111115] border border-zinc-800/90 rounded-3xl p-5 overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition">
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden bg-black mb-4 border border-zinc-850">
                <img
                  src="/images/feature-button.png"
                  alt="One Button Control"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">One Button Control</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Single tactile center button with illuminated neon blue status ring. One press starts capture; one press saves and prepares sync.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/70 text-[11px] font-mono text-blue-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Zero Configuration Needed</span>
            </div>
          </div>

          {/* Macro 3: USB-C Fast Charging */}
          <div className="bg-[#111115] border border-zinc-800/90 rounded-3xl p-5 overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition">
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden bg-black mb-4 border border-zinc-850">
                <img
                  src="/images/feature-usbc.png"
                  alt="USB-C Charging"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">USB-C Fast Charging</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Recharge quickly between back-to-back classes. Multi-day standby battery life ensures you never miss semester-defining formulas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/70 text-[11px] font-mono text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Multi-Day Endurance Battery</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
