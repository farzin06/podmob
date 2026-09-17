import React, { useState, useEffect } from 'react';
import { Podcast, Episode } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { EpisodeCard } from '../components/EpisodeCard.js';
import { useAudio } from '../context/AudioContext.js';
import { formatLocationAndLanguage } from '../utils/formatters.js';
import {
  ArrowLeft,
  User,
  Radio,
  Search,
  X,
  Loader2,
  RefreshCw,
  Play,
  Globe,
  ListMusic,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  podcastId: string;
  onBack: () => void;
  onSelectCreator?: (creator: string) => void;
}

export const PodcastDetailScreen: React.FC<Props> = ({
  podcastId,
  onBack,
  onSelectCreator,
}) => {
  const [podcast, setPodcast] = useState<(Podcast & { episodes: Episode[] }) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { playEpisode, setIsExpanded } = useAudio();

  const fetchPodcast = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPodcastById(podcastId);
      setPodcast(data);
    } catch (err) {
      console.error('Failed to load podcast details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPodcast();
  }, [podcastId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (podcast?.feed_source_id) {
        await apiClient.syncFeedSource(podcast.feed_source_id);
      } else {
        await apiClient.syncAllFeedSources();
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    }
    await fetchPodcast();
  };

  const handlePlayLatest = () => {
    if (podcast?.episodes && podcast.episodes.length > 0) {
      playEpisode(podcast.episodes[0]);
      setIsExpanded(true);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-36">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Radio size={18} className="absolute text-indigo-400 animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 font-bold">Loading show details...</span>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center py-36">
        <p className="text-sm font-bold text-slate-400">Podcast not found</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black rounded-2xl shadow-md active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  const locationInfo = formatLocationAndLanguage(podcast.language);
  const episodesList = podcast.episodes || [];
  const filteredEpisodes = episodesList.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ep.description && ep.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Parse categories if present
  const categoriesList = podcast.categories
    ? podcast.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0 && c.toLowerCase() !== 'podcasts')
        .slice(0, 3)
    : [];

  return (
    <div className="w-full pb-32 overflow-y-auto px-3.5 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/85 backdrop-blur-xl border-b border-white/5 py-3 flex items-center justify-between -mx-3.5 sm:-mx-6 px-3.5 sm:px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-200 hover:text-white glass-panel px-3.5 py-1.5 rounded-2xl transition-all transform active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Library</span>
        </button>

        <div className="text-center max-w-[170px] sm:max-w-[220px] truncate">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Show View</span>
          <span className="text-xs font-bold text-slate-200 truncate block">{podcast.title}</span>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 text-slate-400 hover:text-slate-200 glass-panel rounded-2xl transition-all transform active:scale-95"
          title="Refresh Feed Episodes"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
        </button>
      </div>

      {/* Option 4: Audiophile Studio Ribbon Showcase */}
      <div className="mt-3 mb-2 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#080B12] shadow-2xl p-4 sm:p-5 text-center">
        {/* Dynamic Ambient Blur Backdrop */}
        {podcast.image_url && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={podcast.image_url}
              alt=""
              className="w-full h-full object-cover scale-150 blur-3xl opacity-25 transform -translate-y-6"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080B12]/40 via-[#080B12]/90 to-[#080B12]" />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Square Album Cover with Realistic Depth Shadow */}
          <div className="relative mb-2.5 group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-[0_20px_45px_rgba(0,0,0,0.9)] ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.02]">
              {podcast.image_url ? (
                <img
                  src={podcast.image_url}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-900 to-purple-900 text-indigo-300">
                  <Radio size={44} />
                </div>
              )}
            </div>
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500/20 via-pink-500/15 to-purple-500/20 rounded-3xl blur-xl -z-10 opacity-80" />
          </div>

          {/* Show Title */}
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug mb-1">
            {podcast.title}
          </h1>

          {/* Creator Chip */}
          <button
            onClick={() => podcast.author && onSelectCreator?.(podcast.author)}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-slate-300 hover:text-pink-300 bg-white/5 border border-white/10 transition-colors mb-3 active:scale-95"
          >
            <User size={12} className="text-pink-400" />
            <span className="truncate max-w-[240px]">{podcast.author || 'Unknown Creator'}</span>
          </button>

          {/* 3-Column Metrics Ribbon Grid */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-2.5">
            {/* Tile 1: Episodes */}
            <div className="glass-panel p-2 rounded-2xl text-center border border-white/5">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block mb-0.5">
                EPISODES
              </span>
              <span className="text-xs sm:text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                <ListMusic size={12} className="text-indigo-400" />
                <span>{episodesList.length}</span>
              </span>
            </div>

            {/* Tile 2: Location */}
            <div className="glass-panel p-2 rounded-2xl text-center border border-white/5">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block mb-0.5">
                LOCATION
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 flex items-center justify-center gap-1 truncate px-1">
                <span className="text-xs">{locationInfo.flag}</span>
                <span className="truncate">{locationInfo.location}</span>
              </span>
            </div>

            {/* Tile 3: Language */}
            <div className="glass-panel p-2 rounded-2xl text-center border border-white/5">
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
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
              {categoriesList.map((cat) => (
                <div
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold"
                >
                  <Sparkles size={10} className="text-purple-400" />
                  <span>{cat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Full-Width High-Contrast Play Button */}
          {episodesList.length > 0 && (
            <button
              onClick={handlePlayLatest}
              className="w-full max-w-md py-2.5 sm:py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
            >
              <Play size={14} className="fill-slate-950 stroke-slate-950" />
              <span className="tracking-wide">START LISTENING</span>
            </button>
          )}
        </div>

        {/* Description Accordion Box */}
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
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Episodes Stream List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs px-0.5 my-1">
          <span className="font-extrabold uppercase tracking-widest text-slate-500 text-[10px]">
            Episodes Stream
          </span>
          <span className="font-extrabold text-indigo-400 text-[11px] glass-panel px-2.5 py-0.5 rounded-full">
            {filteredEpisodes.length} available
          </span>
        </div>

        {filteredEpisodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 glass-panel rounded-3xl">
            No episodes matched your search.
          </div>
        ) : (
          filteredEpisodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} showPodcastName={false} />
          ))
        )}
      </div>
    </div>
  );
};

