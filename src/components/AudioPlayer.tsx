'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Download,
  AlertCircle,
  Radio
} from 'lucide-react';

interface Props {
  audioUrl?: string | null;
  title: string;
  durationSeconds?: number;
  seekTime?: number | null;
  onTimeUpdate?: (currentTime: number) => void;
}

export function AudioPlayer({ audioUrl, title, durationSeconds = 0, seekTime, onTimeUpdate }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && audioRef.current) {
      audioRef.current.currentTime = seekTime;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [seekTime]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!audioUrl) {
    return (
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 text-center text-zinc-500 shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto ring-1 ring-amber-200/60">
          <Radio className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-950">Audio Recording Not Yet Synced</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
            This lecture was registered but the audio recording is currently syncing or waiting for LecturePod Device network connectivity.
          </p>
        </div>
      </div>
    );
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl ring-1 ring-zinc-800 space-y-5">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const cur = audioRef.current.currentTime;
            setCurrentTime(cur);
            if (onTimeUpdate) onTimeUpdate(cur);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      {/* Top Header & Visualizer Simulation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">
              Studio Playback Master
            </span>
            <span className="text-xs font-bold text-zinc-100 truncate max-w-xs block">
              {title}
            </span>
          </div>
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-center gap-1 h-6">
          {[40, 70, 95, 60, 85, 45, 80, 50, 90, 65, 35].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(6, (h * 0.22))}px` : '4px',
                animationDelay: `${i * 70}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Slider Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-400 font-mono font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => skip(-10)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition"
            title="Skip back 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-zinc-950" />
            ) : (
              <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition"
            title="Skip forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={cyclePlaybackRate}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-400 transition"
            title="Cycle playback speed"
          >
            {playbackRate}x
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <a
            href={audioUrl}
            download={`${title.replace(/[^a-zA-Z0-9]/g, '_')}.wav`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
            title="Download recording"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>

      {hasError && (
        <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800/80 rounded-xl p-3">
          Unable to stream audio recording. File might be an audio placeholder or currently processing.
        </p>
      )}
    </div>
  );
}
