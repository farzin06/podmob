import React, { useState } from 'react';
import { DiscoverPodcast } from '../types/index.js';
import { useAudio } from '../context/AudioContext.js';
import { User, Radio, Plus, Check, Loader2, Play, Pause, Sparkles, ChevronRight, Layers } from 'lucide-react';

interface Props {
  podcast: DiscoverPodcast;
  isSubscribed?: boolean;
  onSelect: (podcast: DiscoverPodcast) => void;
  onSubscribe: (podcast: DiscoverPodcast) => Promise<void>;
}

export const DiscoverCard: React.FC<Props> = ({
  podcast,
  isSubscribed = false,
  onSelect,
  onSubscribe,
}) => {
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedLocally, setSubscribedLocally] = useState(isSubscribed);

  const { currentEpisode, isPlaying, isLoading, togglePlayPause, playEpisode, setIsExpanded, position, duration } = useAudio();

  const isCurrentShow = Boolean(
    currentEpisode &&
      (currentEpisode.podcast_title?.toLowerCase() === podcast.title.toLowerCase() ||
        String(currentEpisode.podcast_id) === String(podcast.id))
  );

  const isShowPlaying = isCurrentShow && isPlaying;
  const isShowLoading = isCurrentShow && isLoading;

  const handleSubscribeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subscribedLocally) return;

    try {
      setSubscribing(true);
      await onSubscribe(podcast);
      setSubscribedLocally(true);
    } catch (err) {
      console.error('Failed to subscribe:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handlePlayButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentShow) {
      togglePlayPause();
      return;
    }

    if (podcast.sampleEpisodes && podcast.sampleEpisodes.length > 0) {
      const topEp = podcast.sampleEpisodes[0];
      playEpisode({
        id: String(topEp.id || Math.random()),
        podcast_id: String(podcast.id),
        guid: String(topEp.id || ''),
        title: topEp.title,
        description: topEp.description || '',
        author: podcast.author,
        audio_url: topEp.audioUrl || podcast.url,
        duration: topEp.duration || null,
        duration_seconds: 0,
        published_at: topEp.publishedAt || null,
        image_url: podcast.image || podcast.artwork,
        file_size: 0,
        file_type: 'audio/mpeg',
        created_at: '',
        podcast_title: podcast.title,
        podcast_author: podcast.author,
        is_preview: true,
      });
      setIsExpanded(true);
    } else {
      // Open detail modal to fetch and play live episodes
      onSelect(podcast);
    }
  };

  const categoriesText = Array.isArray(podcast.categories)
    ? podcast.categories.slice(0, 2).join(' • ')
    : typeof podcast.categories === 'object' && podcast.categories
    ? Object.values(podcast.categories).slice(0, 2).join(' • ')
    : '';

  const progressPercent =
    isCurrentShow && duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;

  return (
    <div
      onClick={() => onSelect(podcast)}
      className={`group relative rounded-3xl p-3 sm:p-3.5 transition-all duration-300 ease-out cursor-pointer flex items-center justify-between gap-3 sm:gap-4 overflow-hidden shadow-md hover:shadow-xl active:scale-[0.98] border ${
        isCurrentShow
          ? 'glass-panel-elevated border-indigo-500/70 shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-500/40'
          : 'glass-panel hover:glass-panel-elevated border-white/5 hover:border-indigo-500/40'
      }`}
    >
      {/* Left Artwork with Overlay Controls */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 overflow-hidden flex-shrink-0 ring-1 ring-white/10 shadow-md">
        {podcast.image || podcast.artwork ? (
          <img
            src={podcast.image || podcast.artwork}
            alt={podcast.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-400">
            <Radio size={28} />
          </div>
        )}

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

        {/* Mini Play / Pause Overlay Button on Thumbnail */}
        <button
          onClick={handlePlayButtonClick}
          className={`absolute inset-0 m-auto w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isShowPlaying || isShowLoading
              ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/50'
              : 'bg-black/50 hover:bg-indigo-600/90 text-white opacity-90 group-hover:opacity-100 group-hover:scale-105'
          }`}
          title={isCurrentShow ? (isPlaying ? 'Pause' : 'Play') : 'Preview Show'}
        >
          {isShowLoading ? (
            <Loader2 size={15} className="animate-spin text-white" />
          ) : isShowPlaying ? (
            <div className="flex items-center gap-0.5">
              <span className="w-0.5 bg-white rounded-full soundwave-1" />
              <span className="w-0.5 bg-white rounded-full soundwave-2" />
              <span className="w-0.5 bg-white rounded-full soundwave-3" />
            </div>
          ) : (
            <Play size={14} className="fill-white ml-0.5" />
          )}
        </button>

        {/* Micro Progress Bar on Artwork */}
        {isCurrentShow && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Middle Content Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        {/* Categories / Trending Rank */}
        <div className="flex items-center gap-2 flex-wrap">
          {podcast.trendingRank && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[9px] font-black">
              #{podcast.trendingRank}
            </span>
          )}
          {categoriesText && (
            <span className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase truncate max-w-[150px] sm:max-w-[200px]">
              {categoriesText}
            </span>
          )}
        </div>

        {/* Channel Title */}
        <h3 className={`text-xs sm:text-sm font-bold line-clamp-1 leading-snug transition-colors ${
          isCurrentShow ? 'text-indigo-300 font-extrabold' : 'text-slate-100 group-hover:text-indigo-300'
        }`}>
          {podcast.title}
        </h3>

        {/* Creator & Episodes Count */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
          <div className="flex items-center gap-1 text-pink-400 font-semibold truncate max-w-[130px] sm:max-w-[180px]">
            <User size={11} className="flex-shrink-0" />
            <span className="truncate">{podcast.author || 'Creator'}</span>
          </div>

          {podcast.episodeCount ? (
            <span className="text-slate-500 flex-shrink-0">• {podcast.episodeCount} eps</span>
          ) : null}
        </div>

        {/* Now playing indicator */}
        {isCurrentShow && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] font-extrabold text-indigo-400">
            <Sparkles size={10} />
            <span className="truncate">{currentEpisode?.title || 'Now Playing'}</span>
          </div>
        )}
      </div>

      {/* Right Actions: Subscribe Pill */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleSubscribeClick}
          disabled={subscribing}
          className={`px-3 py-1.5 rounded-2xl text-[10px] sm:text-xs font-black flex items-center gap-1.5 transition-all transform active:scale-95 shadow-md ${
            subscribedLocally
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
          }`}
          title={subscribedLocally ? 'In Library' : 'Subscribe'}
        >
          {subscribing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : subscribedLocally ? (
            <Check size={12} className="stroke-[3]" />
          ) : (
            <Plus size={12} className="stroke-[3]" />
          )}
          <span>{subscribedLocally ? 'Added' : 'Add'}</span>
        </button>

        <div className="text-slate-600 group-hover:text-slate-300 transition-colors hidden sm:block">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};
