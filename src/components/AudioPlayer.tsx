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
  AlertCircle
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
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-center text-zinc-500">
        <AlertCircle className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p className="text-sm font-medium text-zinc-700">Audio Recording Not Yet Synced</p>
        <p className="text-xs text-zinc-500 mt-1">
          This lecture was registered but the audio payload is either syncing or waiting for Pi network connectivity.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
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

      <div className="flex flex-col gap-3">
        {/* Progress Bar & Timestamps */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-xs text-zinc-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-10)}
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              title="Skip back 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition shadow-xs"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              title="Skip forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={cyclePlaybackRate}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition"
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
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <a
              href={audioUrl}
              download={`${title.replace(/[^a-zA-Z0-9]/g, '_')}.wav`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition"
              title="Download recording"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        </div>

        {hasError && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2 mt-2">
            Unable to stream audio stream. Audio might be a mock test placeholder or still uploading.
          </p>
        )}
      </div>
    </div>
  );
}
