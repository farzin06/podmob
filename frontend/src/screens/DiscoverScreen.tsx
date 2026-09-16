import React, { useState, useEffect } from 'react';
import { DiscoverPodcast } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { DiscoverCard } from '../components/DiscoverCard.js';
import { DiscoverDetailModal } from '../components/DiscoverDetailModal.js';
import {
  Compass,
  Search,
  Sparkles,
  X,
  Radio,
  Loader2,
  CheckCircle,
  Flame,
} from 'lucide-react';

const TOPIC_PRESETS = [
  'Tech & AI',
  'News & Politics',
  'Business',
  'Science',
  'True Crime',
  'Comedy',
  'Health & Fitness',
  'Design',
];

export const DiscoverScreen: React.FC = () => {
  const [podcasts, setPodcasts] = useState<DiscoverPodcast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal inspection state
  const [selectedPodcast, setSelectedPodcast] = useState<DiscoverPodcast | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Subscribed tracker
  const [subscribedUrls, setSubscribedUrls] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load subscribed feed URLs on mount so we can show "Added" badges
  useEffect(() => {
    apiClient
      .getFeedSources()
      .then((feeds) => {
        setSubscribedUrls(new Set(feeds.map((f: any) => f.url)));
      })
      .catch((err) => console.error('Failed to load feed sources:', err));
  }, []);

  const handleSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setPodcasts([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const res = await apiClient.discover.search(trimmed);
      setPodcasts(res.feeds || []);
    } catch (err) {
      console.error('Failed to search podcasts:', err);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTopic(null);
    handleSearch(searchQuery);
  };

  const handleSelectTopic = (topic: string) => {
    if (activeTopic === topic) {
      setActiveTopic(null);
      setSearchQuery('');
      setPodcasts([]);
      setHasSearched(false);
    } else {
      setActiveTopic(topic);
      setSearchQuery(topic);
      handleSearch(topic);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveTopic(null);
    setPodcasts([]);
    setHasSearched(false);
  };

  const handleSubscribe = async (podcast: DiscoverPodcast) => {
    try {
      await apiClient.discover.subscribe({
        feedUrl: podcast.url,
        title: podcast.title,
        externalId: podcast.id,
      });

      setSubscribedUrls((prev) => new Set(prev).add(podcast.url));
      setToastMessage(`Subscribed to "${podcast.title}"! Added to your Library.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(`Subscription error: ${err.message || 'Failed to subscribe'}`);
    }
  };

  const handleOpenDetail = (podcast: DiscoverPodcast) => {
    setSelectedPodcast(podcast);
    setModalOpen(true);
  };

  return (
    <div className="w-full pb-32 overflow-y-auto px-3.5 sm:px-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 border border-emerald-400/30 max-w-[90vw]">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/85 backdrop-blur-xl border-b border-white/5 py-3.5 flex items-center justify-between -mx-3.5 sm:-mx-6 px-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Compass size={19} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-none">
              Explore & Discover
            </h1>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-indigo-400 tracking-widest uppercase block mt-0.5">
              Live Podcast Search
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="my-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search show, host, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0E17] border border-white/10 rounded-2xl pl-10 pr-20 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1">
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Clear"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : 'Find'}
            </button>
          </div>
        </form>

        {/* Topic Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5 mt-1">
          {TOPIC_PRESETS.map((topic) => {
            const isSelected = activeTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => handleSelectTopic(topic)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all transform active:scale-95 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'glass-panel text-slate-400 hover:text-slate-200 border-white/5'
                }`}
              >
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovered Shows Grid or Initial Prompt */}
      <div className="mt-2">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Compass size={18} className="absolute text-indigo-400 animate-pulse" />
            </div>
            <span className="text-xs text-slate-400 font-bold tracking-wide">Searching live podcast directory...</span>
          </div>
        ) : !hasSearched ? (
          /* Initial State before search */
          <div className="my-8 p-8 glass-panel rounded-3xl flex flex-col items-center justify-center text-center gap-3.5 border border-white/5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-600/10">
              <Search size={26} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">Search millions of podcasts</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Tap any category above or type keywords in the search bar to preview and subscribe.
              </p>
            </div>
          </div>
        ) : podcasts.length === 0 ? (
          /* No Results State */
          <div className="my-8 p-8 glass-panel rounded-3xl flex flex-col items-center justify-center text-center gap-3 border-dashed border-slate-800">
            <Radio size={32} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-200">No podcasts found for "{searchQuery}"</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Try searching with different keywords or topics.
            </p>
          </div>
        ) : (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                <Sparkles size={13} className="text-pink-400" />
                <span>Results for "{searchQuery}"</span>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-400 glass-panel px-2.5 py-0.5 rounded-full">
                {podcasts.length} shows
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {podcasts.map((show) => (
                <DiscoverCard
                  key={show.id}
                  podcast={show}
                  isSubscribed={subscribedUrls.has(show.url)}
                  onSelect={handleOpenDetail}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Show Details & Episode Stream Modal */}
      <DiscoverDetailModal
        podcast={selectedPodcast}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubscribe={handleSubscribe}
        isSubscribed={selectedPodcast ? subscribedUrls.has(selectedPodcast.url) : false}
      />
    </div>
  );
};

