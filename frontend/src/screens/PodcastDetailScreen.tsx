import React, { useState, useEffect } from 'react';
import { Podcast, Episode } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { EpisodeCard } from '../components/EpisodeCard.js';
import { ArrowLeft, User, Radio, Search, X, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPodcastById(podcastId);
        setPodcast(data);
      } catch (err) {
        console.error('Failed to load podcast details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [podcastId]);

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
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black rounded-2xl shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const filteredEpisodes = (podcast.episodes || []).filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ep.description && ep.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full pb-36 overflow-y-auto px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/80 backdrop-blur-xl border-b border-white/5 py-3 flex items-center justify-between -mx-4 sm:-mx-6 px-4 sm:px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-extrabold text-slate-200 hover:text-white glass-panel px-3.5 py-1.5 rounded-2xl transition-all transform active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Library</span>
        </button>
      </div>

      {/* Hero Podcast Banner */}
      <div className="my-5 p-5 glass-panel-elevated rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left shadow-2xl">
        {/* Cover Art with Glow */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-slate-950 flex-shrink-0 shadow-2xl ring-1 ring-white/15">
          {podcast.image_url ? (
            <img
              src={podcast.image_url}
              alt={podcast.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-indigo-400">
              <Radio size={54} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-2.5 items-center sm:items-start">
          <h1 className="text-lg sm:text-2xl font-black text-slate-100 leading-tight">
            {podcast.title}
          </h1>

          {/* Creator Chip */}
          <div
            onClick={() => podcast.author && onSelectCreator?.(podcast.author)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
          >
            <User size={12} />
            <span>{podcast.author || 'Unknown Creator'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
            <span className="glass-panel px-2.5 py-0.5 rounded-full text-indigo-400">
              {podcast.episodes?.length || 0} Episodes
            </span>
            {podcast.language && <span>•</span>}
            {podcast.language && <span>{podcast.language.toUpperCase()}</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      {podcast.description && (
        <div className="my-3">
          <p className="text-xs leading-relaxed text-slate-300 glass-panel p-4 rounded-3xl border border-white/5">
            {podcast.description}
          </p>
        </div>
      )}

      {/* Search Episodes Bar */}
      <div className="my-4 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
          <Search size={15} />
        </div>
        <input
          type="text"
          placeholder="Search episodes in this show..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0B0E17] border border-white/10 rounded-2xl pl-11 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
        />
        {searchQuery.length > 0 && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Episodes List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs px-1 my-1">
          <span className="font-extrabold uppercase tracking-widest text-slate-500">Episodes</span>
          <span className="font-extrabold text-indigo-400">{filteredEpisodes.length} available</span>
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
