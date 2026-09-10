import React from 'react';
import { useAudio } from '../context/AudioContext.js';
import { Play, Pause, FastForward, Radio, ChevronUp, Loader2 } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentEpisode,
    isPlaying,
    isLoading,
    position,
    duration,
    togglePlayPause,
    skipForward,
    setIsExpanded,
  } = useAudio();

  if (!currentEpisode) return null;

  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className="w-full px-3 pb-2 pt-1 relative z-40">
      <div
        onClick={() => setIsExpanded(true)}
        className="w-full glass-panel-elevated rounded-2xl border border-indigo-500/30 overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 hover:border-indigo-500/60 active:scale-[0.99]"
      >
        {/* Micro progress line */}
        <div className="w-full h-1 bg-slate-900 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Artwork + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 ring-1 ring-white/10 shadow-sm">
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

              {/* Little soundwave indicator if playing */}
              {isPlaying && !isLoading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-0.5 bg-white rounded-full soundwave-bar" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 bg-white rounded-full soundwave-bar" style={{ animationDelay: '200ms' }} />
                  <span className="w-0.5 bg-white rounded-full soundwave-bar" style={{ animationDelay: '400ms' }} />
                </div>
              )}
            </div>

            {/* Title & Creator */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">
                {currentEpisode.title}
              </h4>
              <p className="text-[11px] font-semibold text-pink-400 truncate">
                {currentEpisode.author || currentEpisode.podcast_title || 'Now Playing'}
              </p>
            </div>
          </div>

          {/* Right: Skip + Play Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                skipForward(30);
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors active:scale-90"
              title="Skip 30s"
            >
              <FastForward size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : isPlaying ? (
                <Pause size={18} className="fill-white" />
              ) : (
                <Play size={18} className="fill-white ml-0.5" />
              )}
            </button>

            <div className="p-1 text-slate-500 hover:text-slate-300">
              <ChevronUp size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
