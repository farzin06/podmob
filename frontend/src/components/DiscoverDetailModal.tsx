import React, { useState, useEffect } from 'react';
import { DiscoverPodcast, DiscoverEpisode } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { useAudio } from '../context/AudioContext.js';
import { MiniPlayer } from './MiniPlayer.js';
import {
  ChevronDown,
  User,
  Radio,
  Plus,
  Check,
  Loader2,
  Play,
  Pause,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface Props {
  podcast: DiscoverPodcast | null;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (podcast: DiscoverPodcast) => Promise<void>;
  isSubscribed?: boolean;
}

export const DiscoverDetailModal: React.FC<Props> = ({
  podcast,
  isOpen,
  onClose,
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
    if (!isOpen || !podcast) return;

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
  }, [isOpen, podcast]);

  if (!isOpen || !podcast) return null;

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
      image_url: ep.imageUrl || ep.image_url || podcast.image,
      file_size: 0,
      file_type: 'audio/mpeg',
      created_at: '',
      podcast_title: podcast.title,
      podcast_author: podcast.author,
      is_preview: true,
    });
    setIsExpanded(true);
  };

  const filteredEpisodes = episodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ep.description && ep.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#06070B]/95 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto animate-modal-slide">
      {/* Top Drag Handle for Mobile Gesture Look */}
      <div className="w-full flex justify-center pt-2.5 pb-1 sticky top-0 bg-[#06070B]/90 backdrop-blur-md z-20">
        <div className="w-12 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Top Header Bar */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/5 sticky top-4 bg-[#06070B]/90 backdrop-blur-md z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-2xl glass-panel text-slate-300 hover:text-white transition-all transform active:scale-95"
          title="Close"
        >
          <ChevronDown size={22} />
        </button>

        <div className="text-center max-w-[220px]">
          <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase block">
            Discover Podcast
          </span>
          <span className="text-xs font-black text-slate-200 truncate block">
            {podcast.title}
          </span>
        </div>

        <div className="w-9" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-3.5 sm:px-6 py-4 max-w-lg mx-auto w-full pb-32">
        {/* Hero Show Overview */}
        <div className="glass-panel-elevated rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left shadow-2xl">
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

          <div className="flex-1 flex flex-col gap-2 items-center sm:items-start">
            <h1 className="text-base sm:text-lg font-black text-slate-100 leading-tight">
              {podcast.title}
            </h1>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold">
              <User size={11} />
              <span>{podcast.author || 'Unknown Creator'}</span>
            </div>

            {/* Subscribe Action Button */}
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`mt-1.5 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${
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

        {/* Description */}
        {podcast.description && (
          <div className="my-4">
            <p className="text-xs leading-relaxed text-slate-300 glass-panel p-4 rounded-3xl border border-white/5 line-clamp-4">
              {podcast.description}
            </p>
          </div>
        )}

        {/* Episode Search Bar */}
        {episodes.length > 3 && (
          <div className="my-4 relative">
            <input
              type="text"
              placeholder="Search episodes in this show..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0E17] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>
        )}

        {/* Episode Stream List */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Episodes Stream
            </span>
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
            <div className="flex flex-col gap-3">
              {filteredEpisodes.map((ep, idx) => {
                const isCurrent = currentEpisode?.title === ep.title;
                const isCurrentlyPlaying = isCurrent && isPlaying;
                const isCurrentlyLoading = isCurrent && isLoading;

                return (
                  <div
                    key={ep.id || idx}
                    onClick={() => handlePlayEpisode(ep)}
                    className={`group relative rounded-3xl p-3.5 sm:p-4 transition-all duration-300 cursor-pointer overflow-hidden border active:scale-[0.98] ${
                      isCurrent
                        ? 'glass-panel-elevated border-indigo-500/60 shadow-xl shadow-indigo-600/15 ring-1 ring-indigo-500/30'
                        : 'glass-panel hover:bg-slate-900/90 border-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Play Button Overlay */}
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900 flex items-center justify-center shadow-md ring-1 ring-white/10">
                        {isCurrentlyLoading ? (
                          <Loader2 size={20} className="animate-spin text-indigo-400" />
                        ) : isCurrentlyPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 bg-indigo-400 rounded-full soundwave-1" />
                            <span className="w-1 bg-indigo-400 rounded-full soundwave-2" />
                            <span className="w-1 bg-indigo-400 rounded-full soundwave-3" />
                          </div>
                        ) : (
                          <Play size={18} className="fill-indigo-400 text-indigo-400 ml-0.5 group-hover:scale-110 transition-transform" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <h4 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${isCurrent ? 'text-indigo-400' : 'text-slate-100 group-hover:text-indigo-300'}`}>
                          {ep.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          {ep.duration && (
                            <div className="flex items-center gap-1 font-medium">
                              <Clock size={11} className="text-slate-500" />
                              <span>{ep.duration}</span>
                            </div>
                          )}
                          {ep.publishedAt && (
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar size={11} className="text-slate-500" />
                              <span>{ep.publishedAt}</span>
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

      {/* Floating Bottom Mini Player Dock for Discover */}
      <MiniPlayer />
    </div>
  );
};
