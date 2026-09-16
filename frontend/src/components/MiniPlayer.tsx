import React from 'react';
import { useAudio } from '../context/AudioContext.js';
import { Play, Pause, Radio, Loader2, X } from 'lucide-react';

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
    closePlayer,
    formatTime,
  } = useAudio();

  if (!currentEpisode) return null;

  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    closePlayer();
  };

  return (
    <div className="w-full px-3 pb-2 pt-1 relative z-40 animate-modal-fade">
      <div className="w-full glass-panel-elevated rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl transition-all duration-300 hover:border-indigo-500/50">
        {/* Micro progress line with elapsed / duration */}
        <div className="w-full h-1 bg-slate-900 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-3 py-2 flex items-center justify-between gap-2.5">
          {/* Left: Artwork + Title + Timestamp (Click to Expand Full Player) */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 ring-1 ring-white/10 shadow-md">
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
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                  {currentEpisode.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] sm:text-[11px] font-semibold text-pink-400 truncate max-w-[110px] sm:max-w-[150px]">
                  {currentEpisode.author || currentEpisode.podcast_title || 'Now Playing'}
                </p>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 flex-shrink-0">
                  {formatTime(position)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls (Playback Speed, Play/Pause, Close) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Speed toggle pill */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white rounded-lg text-[10px] font-black border border-white/10 transition-all active:scale-90"
              title="Cycle Speed"
            >
              {speed}x
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : isPlaying ? (
                <Pause size={15} className="fill-white" />
              ) : (
                <Play size={15} className="fill-white ml-0.5" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90 ml-0.5"
              title="Close Player"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
