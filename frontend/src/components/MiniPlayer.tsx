import React from 'react';
import { useAudio } from '../context/AudioContext.js';
import { Play, Pause, FastForward, RotateCcw, Radio, Loader2, Sparkles } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentEpisode,
    isPlaying,
    isLoading,
    position,
    duration,
    speed,
    setPlaybackSpeed,
    setIsExpanded,
    togglePlayPause,
    skipForward,
    skipBackward,
    formatTime,
  } = useAudio();

  if (!currentEpisode) return null;

  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="w-full px-3 pb-2 pt-1 relative z-40">
      <div className="w-full glass-panel-elevated rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl transition-all duration-300 hover:border-indigo-500/50">
        {/* Micro progress line with elapsed / duration */}
        <div className="w-full h-1.5 bg-slate-900 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: Artwork + Title + Timestamp (Click to Expand Full Player) */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 ring-1 ring-white/10 shadow-md">
              {currentEpisode.effective_image_url || currentEpisode.image_url ? (
                <img
                  src={currentEpisode.effective_image_url || currentEpisode.image_url || ''}
                  alt={currentEpisode.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-400">
                  <Radio size={18} />
                </div>
              )}

              {/* Soundwave indicator */}
              {isPlaying && !isLoading && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center gap-0.5">
                  <span className="w-0.5 bg-white rounded-full soundwave-1" />
                  <span className="w-0.5 bg-white rounded-full soundwave-2" />
                  <span className="w-0.5 bg-white rounded-full soundwave-3" />
                </div>
              )}
            </div>

            {/* Title & Creator */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">
                  {currentEpisode.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] font-semibold text-pink-400 truncate max-w-[120px] sm:max-w-[160px]">
                  {currentEpisode.author || currentEpisode.podcast_title || 'Now Playing'}
                </p>
                <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">
                  {formatTime(position)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls (Rewind 15s, Speed Cycle, Skip 30s, Play/Pause) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Speed toggle pill */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white rounded-lg text-[10px] font-black border border-white/10 transition-all active:scale-90"
              title="Cycle Speed"
            >
              {speed}x
            </button>

            {/* Rewind 15s */}
            <button
              onClick={() => skipBackward(15)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors active:scale-90"
              title="Rewind 15s"
            >
              <RotateCcw size={16} />
            </button>

            {/* Skip 30s */}
            <button
              onClick={() => skipForward(30)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors active:scale-90"
              title="Skip 30s"
            >
              <FastForward size={16} />
            </button>

            {/* Big Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95 ml-0.5"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : isPlaying ? (
                <Pause size={16} className="fill-white" />
              ) : (
                <Play size={16} className="fill-white ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
