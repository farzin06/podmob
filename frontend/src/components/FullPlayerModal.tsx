import React, { useState, useMemo, useRef } from 'react';
import { useAudio } from '../context/AudioContext.js';
import {
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Radio,
  User,
  Info,
  Sliders,
  Volume2,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const FullPlayerModal: React.FC = () => {
  const {
    currentEpisode,
    isPlaying,
    isLoading,
    position,
    duration,
    speed,
    isExpanded,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setPlaybackSpeed,
    setIsExpanded,
    formatTime,
  } = useAudio();

  const [showNotes, setShowNotes] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!isExpanded || !currentEpisode) return null;

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const effectiveDuration = duration > 0 ? duration : (currentEpisode.duration_seconds || 0);
  const currentPos = isDragging && dragPosition !== null ? dragPosition : position;
  const progressPercent = effectiveDuration > 0 ? Math.min(100, Math.max(0, (currentPos / effectiveDuration) * 100)) : 0;

  const calculatePositionFromPointer = (clientX: number) => {
    if (!trackRef.current || effectiveDuration <= 0) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = offsetX / rect.width;
    return pct * effectiveDuration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    const newPos = calculatePositionFromPointer(e.clientX);
    setDragPosition(newPos);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newPos = calculatePositionFromPointer(e.clientX);
    setDragPosition(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const finalPos = calculatePositionFromPointer(e.clientX);
      seekTo(finalPos);
      setIsDragging(false);
      setDragPosition(null);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragPosition(null);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#06070B]/98 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto animate-modal-slide pb-safe">
      {/* Top Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-ambient-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 bg-pink-600/15 rounded-full blur-[100px] pointer-events-none animate-ambient-pulse" style={{ animationDelay: '-3s' }} />

      {/* Top Drag Handle for Mobile Intuition */}
      <div className="w-full flex justify-center pt-2.5 pb-1 sticky top-0 bg-[#06070B]/90 backdrop-blur-md z-20">
        <div className="w-12 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Top Header Bar */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/5 sticky top-4 bg-[#06070B]/85 backdrop-blur-md z-10">
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-2xl glass-panel text-slate-300 hover:text-white transition-all transform active:scale-95"
          title="Minimize player"
        >
          <ChevronDown size={22} />
        </button>

        <div className="text-center max-w-[220px]">
          {currentEpisode.is_preview ? (
            <span className="text-[9px] font-black tracking-widest text-pink-400 uppercase inline-flex items-center gap-1">
              <Sparkles size={10} />
              Live Discover Preview
            </span>
          ) : (
            <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase block">
              Playing From Library
            </span>
          )}
          <span className="text-xs font-black text-slate-200 truncate block">
            {currentEpisode.podcast_title || 'Podcast'}
          </span>
        </div>

        <div className="w-9" />
      </div>

      {/* Main Content Center Column */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 max-w-md mx-auto w-full">
        {/* Cover Artwork with Glow */}
        <div className="relative my-2 sm:my-3 group flex-shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse-slow" />

          {currentEpisode.effective_image_url || currentEpisode.image_url ? (
            <img
              src={currentEpisode.effective_image_url || currentEpisode.image_url || ''}
              alt={currentEpisode.title}
              className="relative w-48 h-48 sm:w-64 sm:h-64 max-w-[68vw] max-h-[32vh] aspect-square rounded-[26px] sm:rounded-[28px] object-cover shadow-2xl ring-1 ring-white/15"
            />
          ) : (
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 max-w-[68vw] max-h-[32vh] aspect-square rounded-[26px] sm:rounded-[28px] glass-panel-elevated flex items-center justify-center text-indigo-400">
              <Radio size={56} />
            </div>
          )}
        </div>

        {/* Title & Creator */}
        <div className="w-full text-center my-2 sm:my-3 flex flex-col items-center gap-1.5 sm:gap-2">
          <h2 className="text-sm sm:text-lg font-black text-slate-100 line-clamp-2 leading-snug px-2">
            {currentEpisode.title}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm max-w-[85%] truncate">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate">{currentEpisode.author || currentEpisode.podcast_author || 'Creator'}</span>
          </div>
        </div>

        {/* Liquid Aura Glowing Disc Seekbar (Option 5) */}
        <div className="w-full my-3 sm:my-4 select-none">
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="relative w-full h-10 flex items-center cursor-pointer touch-none group"
            title="Drag or tap to seek"
          >
            {/* Background Rail Track */}
            <div className="w-full h-2 sm:h-2.5 bg-slate-850 bg-slate-900/90 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
              {/* Active Filled Gradient Liquid Bar */}
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-75 relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Micro Liquid Shine Reflection */}
                <div className="absolute inset-0 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Liquid Aura Glowing Disc Thumb */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.95),0_2px_8px_rgba(0,0,0,0.6)] ring-4 ring-purple-500/40 pointer-events-none transition-transform duration-150 ${
                isDragging ? 'scale-125 ring-pink-500/50 shadow-[0_0_26px_rgba(236,72,153,1)]' : 'group-hover:scale-110'
              }`}
              style={{
                left: `${progressPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Inner Glowing Core */}
              <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500" />
            </div>

            {/* Floating Live Dragging Timestamp Badge */}
            {isDragging && (
              <div
                className="absolute -top-3 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black shadow-xl shadow-indigo-600/60 pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full border border-indigo-400/40 animate-in fade-in zoom-in-95 duration-100"
                style={{
                  left: `${progressPercent}%`,
                }}
              >
                {formatTime(currentPos)}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mt-1 px-1">
            <span className="text-indigo-400 font-extrabold">{formatTime(currentPos)}</span>
            <span className="text-slate-500">{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Big Audio Playback Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 my-2 sm:my-3">
          {/* Rewind 15s */}
          <button
            onClick={() => skipBackward(15)}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-2.5 sm:p-3 rounded-2xl glass-panel hover:bg-slate-800 transition-transform active:scale-90"
            title="Rewind 15s"
          >
            <RotateCcw size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[10px] font-black text-indigo-400">15s</span>
          </button>

          {/* Big Play / Pause / Loading Button */}
          <button
            onClick={togglePlayPause}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-500/20 transition-all transform active:scale-95"
          >
            {isLoading ? (
              <Loader2 size={30} className="animate-spin text-white sm:w-[34px] sm:h-[34px]" />
            ) : isPlaying ? (
              <Pause size={28} className="fill-white sm:w-[32px] sm:h-[32px]" />
            ) : (
              <Play size={28} className="fill-white ml-1 sm:w-[32px] sm:h-[32px]" />
            )}
          </button>

          {/* Forward 30s */}
          <button
            onClick={() => skipForward(30)}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-2.5 sm:p-3 rounded-2xl glass-panel hover:bg-slate-800 transition-transform active:scale-90"
            title="Forward 30s"
          >
            <RotateCw size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[10px] font-black text-indigo-400">30s</span>
          </button>
        </div>

        {/* Speed Selector Pills */}
        <div className="w-full my-4 flex flex-col items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
            Playback Speed
          </span>
          <div className="flex items-center gap-2">
            {speeds.map((s) => {
              const isActive = speed === s;
              return (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/40'
                      : 'glass-panel text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              );
            })}
          </div>
        </div>

        {/* Show Notes Sheet */}
        {currentEpisode.description && (
          <div className="w-full mt-4 glass-panel rounded-2xl overflow-hidden border border-white/5">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Info size={15} className="text-indigo-400" />
                <span>Episode Description & Show Notes</span>
              </div>
              <span className="text-xs font-bold text-indigo-400">
                {showNotes ? 'Hide' : 'Show'}
              </span>
            </button>

            {showNotes && (
              <div className="p-4 pt-0 text-xs leading-relaxed text-slate-300 border-t border-white/5 bg-black/20 max-h-48 overflow-y-auto">
                {currentEpisode.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
