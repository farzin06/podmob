import React, { useState } from 'react';
import { DiscoverPodcast } from '../types/index.js';
import { useAudio } from '../context/AudioContext.js';
import { User, Radio, Plus, Check, Loader2, Play, Pause, Sparkles } from 'lucide-react';

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
      className={`group relative rounded-3xl transition-all duration-300 ease-out cursor-pointer flex flex-col overflow-hidden shadow-lg hover:shadow-2xl active:scale-[0.98] border ${
        isCurrentShow
          ? 'glass-panel-elevated border-indigo-500/70 shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-500/40'
          : 'glass-panel hover:glass-panel-elevated border-white/5 hover:border-indigo-500/40 hover:shadow-indigo-500/10'
      }`}
    >
      {/* Artwork Box */}
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
        {podcast.image || podcast.artwork ? (
          <img
            src={podcast.image || podcast.artwork}
            alt={podcast.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-400">
            <Radio size={40} />
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Top Badges: Rank / Episodes */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {podcast.trendingRank && (
            <div className="px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-md text-[10px] font-black text-white shadow-md">
              #{podcast.trendingRank}
            </div>
          )}
          {podcast.episodeCount ? (
            <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-slate-300 border border-white/10 shadow-md">
              {podcast.episodeCount} eps
            </div>
          ) : null}
        </div>

        {/* One-Tap Subscribe Button */}
        <button
          onClick={handleSubscribeClick}
          disabled={subscribing}
          className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md shadow-lg transition-all duration-200 ${
            subscribedLocally
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-indigo-600/85 hover:bg-indigo-500 text-white border border-indigo-400/30 active:scale-90'
          }`}
          title={subscribedLocally ? 'In Library' : 'Subscribe'}
        >
          {subscribing ? (
            <Loader2 size={11} className="animate-spin" />
          ) : subscribedLocally ? (
            <Check size={11} className="stroke-[3]" />
          ) : (
            <Plus size={11} className="stroke-[3]" />
          )}
          <span>{subscribedLocally ? 'Added' : 'Add'}</span>
        </button>

        {/* Mini Player Overlay Controls on Card */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {/* Active Soundwave Indicator */}
          {isShowPlaying && !isShowLoading && (
            <div className="px-2 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-indigo-500/40 flex items-center gap-0.5 shadow-md">
              <span className="w-0.5 bg-indigo-400 rounded-full soundwave-1" />
              <span className="w-0.5 bg-indigo-400 rounded-full soundwave-2" />
              <span className="w-0.5 bg-indigo-400 rounded-full soundwave-3" />
            </div>
          )}

          {/* Quick Play/Pause Trigger */}
          <button
            onClick={handlePlayButtonClick}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 ${
              isCurrentShow
                ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-indigo-600/50 ring-2 ring-indigo-400/30'
                : 'bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-indigo-600/40 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0'
            }`}
            title={isCurrentShow ? (isPlaying ? 'Pause' : 'Play') : 'Play Show'}
          >
            {isShowLoading ? (
              <Loader2 size={15} className="animate-spin text-white" />
            ) : isShowPlaying ? (
              <Pause size={15} className="fill-white" />
            ) : (
              <Play size={15} className="fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Mini Progress Bar on Card (if this show is active) */}
        {isCurrentShow && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-1 bg-gradient-to-b from-transparent to-slate-950/60">
        <div>
          {categoriesText && (
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 truncate block">
              {categoriesText}
            </span>
          )}
          <h4
            className={`text-xs sm:text-sm font-bold line-clamp-1 transition-colors duration-200 mt-0.5 ${
              isCurrentShow ? 'text-indigo-300 font-black' : 'text-slate-100 group-hover:text-indigo-400'
            }`}
          >
            {podcast.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-400 mt-0.5">
            <User size={10} className="flex-shrink-0" />
            <span className="truncate">{podcast.author || 'Creator'}</span>
          </div>
        </div>

        {/* Now Playing badge if active */}
        {isCurrentShow && (
          <div className="flex items-center gap-1 mt-1 text-[10px] font-extrabold text-indigo-400">
            <Sparkles size={10} />
            <span className="truncate">{currentEpisode?.title || 'Now Playing'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
