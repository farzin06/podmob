import React, { useState } from 'react';
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

  if (!isExpanded || !currentEpisode) return null;

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seekTo(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06070B]/95 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Top Ambient Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-48 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#06070B]/70 backdrop-blur-md z-10">
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2.5 -ml-2 rounded-2xl glass-panel text-slate-300 hover:text-white transition-all transform active:scale-95"
          title="Minimize player"
        >
          <ChevronDown size={24} />
        </button>

        <div className="text-center max-w-[240px]">
          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block">
            Playing From
          </span>
          <span className="text-xs font-extrabold text-slate-200 truncate block">
            {currentEpisode.podcast_title || 'Podcast'}
          </span>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Content Center Column */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-md mx-auto w-full">
        {/* Cover Artwork with Glow */}
        <div className="relative my-3 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse-slow" />

          {currentEpisode.effective_image_url || currentEpisode.image_url ? (
            <img
              src={currentEpisode.effective_image_url || currentEpisode.image_url || ''}
              alt={currentEpisode.title}
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[28px] object-cover shadow-2xl ring-1 ring-white/15"
            />
          ) : (
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[28px] glass-panel-elevated flex items-center justify-center text-indigo-400">
              <Radio size={72} />
            </div>
          )}
        </div>

        {/* Title & Creator */}
        <div className="w-full text-center my-3 flex flex-col items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-100 line-clamp-2 leading-snug px-2">
            {currentEpisode.title}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm">
            <User size={12} />
            <span>{currentEpisode.author || currentEpisode.podcast_author || 'Creator'}</span>
          </div>
        </div>

        {/* Scrub Slider */}
        <div className="w-full my-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={position}
            onChange={handleSeekChange}
            className="w-full h-2 cursor-pointer bg-slate-800/80 rounded-full"
          />
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mt-2 px-1">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Big Audio Playback Controls */}
        <div className="flex items-center justify-center gap-8 my-3">
          {/* Rewind 15s */}
          <button
            onClick={() => skipBackward(15)}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-3 rounded-2xl glass-panel hover:bg-slate-800 transition-transform active:scale-90"
            title="Rewind 15s"
          >
            <RotateCcw size={22} />
            <span className="text-[10px] font-black text-indigo-400">15s</span>
          </button>

          {/* Big Play / Pause / Loading Button */}
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-500/20 transition-all transform active:scale-95"
          >
            {isLoading ? (
              <Loader2 size={36} className="animate-spin text-white" />
            ) : isPlaying ? (
              <Pause size={34} className="fill-white" />
            ) : (
              <Play size={34} className="fill-white ml-1.5" />
            )}
          </button>

          {/* Forward 30s */}
          <button
            onClick={() => skipForward(30)}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-3 rounded-2xl glass-panel hover:bg-slate-800 transition-transform active:scale-90"
            title="Forward 30s"
          >
            <RotateCw size={22} />
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
