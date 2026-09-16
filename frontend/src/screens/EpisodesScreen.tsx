import React, { useState, useEffect } from 'react';
import { Episode, CreatorSummary } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { CreatorFilterBar } from '../components/CreatorFilterBar.js';
import { EpisodeCard } from '../components/EpisodeCard.js';
import { Search, Radio, X, ListMusic, Loader2 } from 'lucide-react';

export const EpisodesScreen: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [creators, setCreators] = useState<CreatorSummary[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async (creatorFilter = selectedCreator, search = searchQuery) => {
    try {
      setLoading(true);
      const [episodesRes, creatorsRes] = await Promise.all([
        apiClient.getEpisodes({
          creator: creatorFilter || undefined,
          search: search || undefined,
          limit: 100,
        }),
        apiClient.getCreators(),
      ]);
      setEpisodes(episodesRes.episodes);
      setTotalCount(episodesRes.total);
      setCreators(creatorsRes);
    } catch (err) {
      console.error('Failed to load episodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCreator, searchQuery);
  }, [selectedCreator]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(selectedCreator, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadData(selectedCreator, '');
  };

  return (
    <div className="w-full pb-32 overflow-y-auto px-3.5 sm:px-6">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/85 backdrop-blur-xl border-b border-white/5 py-3.5 flex items-center justify-between -mx-3.5 sm:-mx-6 px-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl glass-panel flex items-center justify-center text-indigo-400 shadow-md">
            <ListMusic size={19} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-none">
              All Episodes
            </h1>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-indigo-400 tracking-widest uppercase block mt-0.5">
              Unified Audio Stream
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Bar with Glow */}
      <div className="my-3.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search episodes by title or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0E17] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </form>
      </div>

      {/* Creator Filter Chips Bar */}
      {creators.length > 0 && (
        <CreatorFilterBar
          creators={creators}
          selectedCreator={selectedCreator}
          onSelectCreator={(c) => setSelectedCreator(c)}
        />
      )}

      {/* Filter Status Badge */}
      <div className="flex items-center justify-between my-3 px-0.5 text-xs">
        <span className="font-bold text-slate-400 text-[11px]">
          {selectedCreator ? `Episodes by ${selectedCreator}` : 'Latest Episodes'}
        </span>
        <span className="font-extrabold text-indigo-400 glass-panel px-2.5 py-0.5 rounded-full text-[10px]">
          {totalCount} found
        </span>
      </div>

      {/* Episodes List */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <ListMusic size={18} className="absolute text-indigo-400 animate-pulse" />
            </div>
            <span className="text-xs text-slate-400 font-bold tracking-wide">Filtering episode stream...</span>
          </div>
        ) : episodes.length === 0 ? (
          <div className="my-8 p-8 glass-panel rounded-3xl flex flex-col items-center justify-center text-center gap-3 border-dashed border-slate-800">
            <Radio size={32} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-200">No episodes found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? `No results for "${searchQuery}"` : 'Subscribe to feeds to see episodes here.'}
            </p>
          </div>
        ) : (
          episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} showPodcastName={true} />
          ))
        )}
      </div>
    </div>
  );
};
