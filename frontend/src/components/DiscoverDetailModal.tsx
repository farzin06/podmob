import React, { useState, useEffect } from 'react';
import { DiscoverPodcast, DiscoverEpisode } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { useAudio } from '../context/AudioContext.js';
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

        <div className="text-right max-w-[170px] sm:max-w-[240px]">
          <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase block">
            Discover Show
          </span>
          <span className="text-xs font-bold text-slate-200 truncate block">
            {podcast.title}
          </span>
        </div>
      </div>

      {/* Hero Show Overview */}
      <div className="my-4 glass-panel-elevated rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left shadow-2xl">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-950 flex-shrink-0 shadow-2xl ring-1 ring-white/15">
          {podcast.image || podcast.artwork ? (
            <img
              src={podcast.image || podcast.artwork}
              alt={podcast.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-indigo-400">
              <Radio size={48} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2 items-center sm:items-start">
          <h1 className="text-base sm:text-lg font-black text-slate-100 leading-tight">
            {podcast.title}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold max-w-full truncate">
            <User size={11} className="flex-shrink-0" />
            <span className="truncate">{podcast.author || 'Unknown Creator'}</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {/* Subscribe Action Button */}
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                subscribedLocally
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500'
              }`}
            >
              {subscribing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : subscribedLocally ? (
                <Check size={14} className="stroke-[3]" />
              ) : (
                <Plus size={14} className="stroke-[3]" />
              )}
              <span>{subscribedLocally ? 'In Your Library' : 'Subscribe & Add to Library'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {podcast.description && (
        <div className="my-3">
          <p className="text-xs leading-relaxed text-slate-300 glass-panel p-4 rounded-3xl border border-white/5 line-clamp-4">
            {podcast.description}
          </p>
        </div>
      )}

      {/* Episode Search Bar */}
      {episodes.length > 2 && (
        <div className="my-3.5 relative">
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
