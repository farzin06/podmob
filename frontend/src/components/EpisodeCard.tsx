import React from 'react';
import { Episode } from '../types/index.js';
import { Play, Pause, Clock, Calendar, User, Radio, Loader2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext.js';

interface Props {
  episode: Episode;
  showPodcastName?: boolean;
}

export const EpisodeCard: React.FC<Props> = ({ episode, showPodcastName = true }) => {
  const { currentEpisode, isPlaying, isLoading, playEpisode } = useAudio();

  const isCurrent = currentEpisode?.id === episode.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isCurrentlyLoading = isCurrent && isLoading;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const progressPercent =
    episode.position_seconds && episode.duration_seconds
      ? Math.min(100, Math.round((episode.position_seconds / episode.duration_seconds) * 100))
      : 0;

  return (
    <div
      onClick={() => playEpisode(episode)}
      className={`group relative rounded-3xl p-3.5 sm:p-4 transition-all duration-300 ease-out cursor-pointer overflow-hidden border active:scale-[0.98] ${
        isCurrent
          ? 'glass-panel-elevated border-indigo-500/60 shadow-xl shadow-indigo-600/15 ring-1 ring-indigo-500/30'
          : 'glass-panel hover:bg-slate-900/90 border-white/5 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Cover Art + Play / Loading Button */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900 shadow-md ring-1 ring-white/10">
          {episode.effective_image_url || episode.image_url ? (
            <img
              src={episode.effective_image_url || episode.image_url || ''}
              alt={episode.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-indigo-400">
              <Radio size={22} />
            </div>
          )}

          {/* Overlay Button: Loader or Soundwave or Play */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isCurrentlyPlaying || isCurrentlyLoading
                ? 'bg-indigo-600/80 text-white backdrop-blur-[2px]'
                : 'bg-black/35 text-white group-hover:bg-black/55'
            }`}
          >
            {isCurrentlyLoading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : isCurrentlyPlaying ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 bg-white rounded-full soundwave-1" />
                <span className="w-1 bg-white rounded-full soundwave-2" />
                <span className="w-1 bg-white rounded-full soundwave-3" />
              </div>
            ) : (
              <Play size={18} className="fill-white ml-0.5 transition-transform group-hover:scale-110" />
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 gap-1">
          {/* Creator & Show Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {episode.author && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-300 border border-pink-500/20 max-w-[130px] truncate">
                <User size={10} />
                <span className="truncate">{episode.author}</span>
              </span>
            )}
            {showPodcastName && episode.podcast_title && (
              <span className="text-[11px] font-medium text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                {episode.podcast_title}
              </span>
            )}
          </div>

          {/* Episode Title */}
          <h3
            className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug transition-colors duration-200 ${
              isCurrent ? 'text-indigo-400 font-extrabold' : 'text-slate-100 group-hover:text-indigo-300'
            }`}
          >
            {episode.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
            {episode.duration && (
              <div className="flex items-center gap-1 font-medium">
                <Clock size={11} className="text-slate-500" />
                <span>{episode.duration}</span>
              </div>
            )}
            {episode.published_at && (
              <div className="flex items-center gap-1 font-medium">
                <Calendar size={11} className="text-slate-500" />
                <span>{formatDate(episode.published_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar (if listened) */}
      {progressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
