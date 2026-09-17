import React, { useState, useEffect } from 'react';
import { DiscoverPodcast, DiscoverEpisode } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { useAudio } from '../context/AudioContext.js';
import { formatLocationAndLanguage } from '../utils/formatters.js';
import {
  ArrowLeft,
  User,
  Radio,
  Plus,
  Check,
  Loader2,
  Play,
  Clock,
  Calendar,
  Sparkles,
  Search,
  X,
  Globe,
  ListMusic,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  podcast: DiscoverPodcast;
  onBack: () => void;
  onSubscribe: (podcast: DiscoverPodcast) => Promise<void>;
  isSubscribed?: boolean;
}

export const DiscoverDetailModal: React.FC<Props> = ({
  podcast,
  onBack,
  onSubscribe,
  isSubscribed = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [episodes, setEpisodes] = useState<DiscoverEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedLocally, setSubscribedLocally] = useState(isSubscribed);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { currentEpisode, isPlaying, isLoading, playEpisode, setIsExpanded } = useAudio();

  useEffect(() => {
    setSubscribedLocally(isSubscribed);
    setSearchQuery('');

    const loadDetails = async () => {
      try {
        setLoading(true);
        const data = await apiClient.discover.lookup(podcast.id);
        setEpisodes(data.episodes || podcast.sampleEpisodes || []);
      } catch (err) {
        setEpisodes(podcast.sampleEpisodes || []);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [podcast.id, isSubscribed]);

  const handleSubscribe = async () => {
    if (subscribedLocally) return;
    try {
      setSubscribing(true);
      await onSubscribe(podcast);
      setSubscribedLocally(true);
    } catch (err) {
      console.error('Subscription failed:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handlePlayEpisode = (ep: DiscoverEpisode) => {
    playEpisode({
      id: String(ep.id || ep.guid || Math.random()),
      podcast_id: String(podcast.id),
      guid: String(ep.guid || ep.id || ''),
      title: ep.title,
      description: ep.description || '',
      author: ep.author || podcast.author,
      audio_url: ep.audioUrl || ep.audio_url || podcast.url,
      duration: ep.duration || null,
      duration_seconds: ep.durationSeconds || ep.duration_seconds || 0,
      published_at: ep.publishedAt || ep.published_at || null,
      image_url: ep.imageUrl || ep.image_url || podcast.image || podcast.artwork,
      file_size: 0,
      file_type: 'audio/mpeg',
      created_at: '',
      podcast_title: podcast.title,
      podcast_author: podcast.author,
      is_preview: true,
    });
    setIsExpanded(true);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredEpisodes = episodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ep.description && ep.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const podcastArtwork = podcast.image || podcast.artwork;
  const locationInfo = formatLocationAndLanguage(podcast.language);

  const categoriesList = React.useMemo(() => {
    if (!podcast.categories) return [];
    if (Array.isArray(podcast.categories)) return podcast.categories.slice(0, 3);
    if (typeof podcast.categories === 'object') return Object.values(podcast.categories).slice(0, 3);
    return [];
  }, [podcast.categories]);

  return (
    <div className="w-full pb-32 overflow-y-auto px-3.5 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/85 backdrop-blur-xl border-b border-white/5 py-3 flex items-center justify-between -mx-3.5 sm:-mx-6 px-3.5 sm:px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-200 hover:text-white glass-panel px-3.5 py-1.5 rounded-2xl transition-all transform active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Discover</span>
        </button>

        <div className="text-right max-w-[170px] sm:max-w-[240px] truncate">
          <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase block">
            Discover Show
          </span>
          <span className="text-xs font-bold text-slate-200 truncate block">
            {podcast.title}
          </span>
        </div>
      </div>

      {/* Option 4: Audiophile Studio Ribbon Showcase */}
      <div className="my-4 relative overflow-hidden rounded-[30px] border border-white/10 bg-[#080B12] shadow-2xl p-5 sm:p-6 text-center">
        {/* Dynamic Ambient Blur Backdrop */}
        {podcastArtwork && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={podcastArtwork}
              alt=""
              className="w-full h-full object-cover scale-150 blur-3xl opacity-25 transform -translate-y-6"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080B12]/40 via-[#080B12]/90 to-[#080B12]" />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Square Album Cover */}
          <div className="relative mb-3 group">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-[0_20px_45px_rgba(0,0,0,0.9)] ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.02]">
              {podcastArtwork ? (
                <img
                  src={podcastArtwork}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-900 to-purple-900 text-indigo-300">
                  <Radio size={48} />
                </div>
              )}
            </div>
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500/20 via-pink-500/15 to-purple-500/20 rounded-3xl blur-xl -z-10 opacity-80" />
          </div>

          {/* Show Title */}
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-1">
            {podcast.title}
          </h1>

          {/* Creator Chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-300 bg-white/5 border border-white/10 mb-4">
            <User size={12} className="text-pink-400" />
            <span className="truncate max-w-[240px]">{podcast.author || 'Unknown Creator'}</span>
          </div>

          {/* 3-Column Metrics Ribbon Grid */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-3">
            {/* Tile 1: Episodes */}
            <div className="glass-panel p-2.5 rounded-2xl text-center border border-white/5">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block mb-0.5">
                EPISODES
              </span>
              <span className="text-xs sm:text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                <ListMusic size={12} className="text-indigo-400" />
                <span>{podcast.episodeCount || episodes.length}</span>
              </span>
            </div>

            {/* Tile 2: Location */}
            <div className="glass-panel p-2.5 rounded-2xl text-center border border-white/5">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block mb-0.5">
                LOCATION
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 flex items-center justify-center gap-1 truncate px-1">
                <span className="text-xs">{locationInfo.flag}</span>
                <span className="truncate">{locationInfo.location}</span>
              </span>
            </div>

            {/* Tile 3: Language */}
            <div className="glass-panel p-2.5 rounded-2xl text-center border border-white/5">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block mb-0.5">
                LANGUAGE
              </span>
              <span className="text-xs sm:text-sm font-black text-pink-400 flex items-center justify-center gap-1 truncate uppercase">
                <Globe size={11} className="text-pink-400 flex-shrink-0" />
                <span className="truncate">{locationInfo.language}</span>
              </span>
            </div>
          </div>

          {/* Categories Row */}
          {categoriesList.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
              {categoriesList.map((cat, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold"
                >
                  <Sparkles size={10} className="text-purple-400" />
                  <span>{cat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-2.5 items-center justify-center">
            {/* Subscribe Action Button */}
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 ${
                subscribedLocally
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-950 shadow-white/10'
              }`}
            >
              {subscribing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : subscribedLocally ? (
                <Check size={15} className="stroke-[3]" />
              ) : (
                <Plus size={15} className="stroke-[3]" />
              )}
              <span>{subscribedLocally ? 'In Your Library' : 'SUBSCRIBE TO SHOW'}</span>
            </button>

            {/* Play Sample Episode Button */}
            {episodes.length > 0 && (
              <button
                onClick={() => handlePlayEpisode(episodes[0])}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 glass-panel hover:bg-white/10 text-slate-200 border border-white/10 transition-all active:scale-98"
              >
                <Play size={13} className="fill-white" />
                <span>Preview Latest</span>
              </button>
            )}
          </div>
        </div>

        {/* Description Accordion */}
        {podcast.description && (
          <div className="mt-3 pt-2.5 border-t border-white/5 text-left">
            <p
              className={`text-xs leading-relaxed text-slate-300 ${
                showFullDescription ? '' : 'line-clamp-2'
              }`}
            >
              {podcast.description}
            </p>
            {podcast.description.length > 120 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-1.5 text-[11px] font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>{showFullDescription ? 'Show less' : 'Read full summary'}</span>
                {showFullDescription ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Episode Search Bar */}
      {episodes.length > 2 && (
        <div className="my-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search episodes in this show..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0E17] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* Episode Stream List */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-400">
            <Sparkles size={13} className="text-pink-400" />
            <span>Episodes Stream</span>
          </div>
          <span className="text-xs font-bold text-indigo-400 glass-panel px-3 py-1 rounded-full text-[11px]">
            {filteredEpisodes.length} available
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
            <span className="text-xs text-slate-400 font-bold">Loading episodes from RSS feed...</span>
          </div>
        ) : filteredEpisodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 glass-panel rounded-3xl">
            {searchQuery ? `No episodes matching "${searchQuery}"` : 'No episodes available for this feed preview.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredEpisodes.map((ep, idx) => {
              const isCurrent = currentEpisode?.title === ep.title;
              const isCurrentlyPlaying = isCurrent && isPlaying;
              const isCurrentlyLoading = isCurrent && isLoading;
              const epArtwork = ep.imageUrl || ep.image_url || podcast.image || podcast.artwork;

              return (
                <div
                  key={ep.id || ep.guid || idx}
                  onClick={() => handlePlayEpisode(ep)}
                  className={`group relative rounded-3xl p-3.5 sm:p-4 transition-all duration-300 ease-out cursor-pointer overflow-hidden border active:scale-[0.98] ${
                    isCurrent
                      ? 'glass-panel-elevated border-indigo-500/60 shadow-xl shadow-indigo-600/15 ring-1 ring-indigo-500/30'
                      : 'glass-panel hover:bg-slate-900/90 border-white/5 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    {/* Thumbnail Artwork with Overlay Play/Soundwave */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900 shadow-md ring-1 ring-white/10">
                      {epArtwork ? (
                        <img
                          src={epArtwork}
                          alt={ep.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400">
                          <Radio size={22} />
                        </div>
                      )}

                      {/* Overlay Controls */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          isCurrentlyPlaying || isCurrentlyLoading
                            ? 'bg-black/20 text-white'
                            : 'bg-black/35 text-white group-hover:bg-black/55'
                        }`}
                      >
                        {isCurrentlyLoading ? (
                          <Loader2 size={20} className="animate-spin text-white drop-shadow-md" />
                        ) : isCurrentlyPlaying ? (
                          <div className="flex items-center gap-0.5 p-1.5 rounded-full bg-black/50 backdrop-blur-[3px] border border-white/15 shadow-lg">
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
                      {/* Creator tag */}
                      {(ep.author || podcast.author) && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-300 border border-pink-500/20 max-w-[140px] truncate">
                            <User size={10} className="flex-shrink-0" />
                            <span className="truncate">{ep.author || podcast.author}</span>
                          </span>
                        </div>
                      )}

                      {/* Episode Title */}
                      <h3
                        className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug transition-colors duration-200 ${
                          isCurrent ? 'text-indigo-400 font-extrabold' : 'text-slate-100 group-hover:text-indigo-300'
                        }`}
                      >
                        {ep.title}
                      </h3>

                      {/* Meta Info: Duration & Formatted Date */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        {ep.duration && (
                          <div className="flex items-center gap-1 font-medium">
                            <Clock size={11} className="text-slate-500 flex-shrink-0" />
                            <span>{ep.duration}</span>
                          </div>
                        )}
                        {(ep.publishedAt || ep.published_at) && (
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar size={11} className="text-slate-500 flex-shrink-0" />
                            <span>{formatDate(ep.publishedAt || ep.published_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
