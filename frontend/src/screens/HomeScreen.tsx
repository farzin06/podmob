import React, { useState, useEffect } from 'react';
import { Podcast, CreatorSummary, PlaybackProgress } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { CreatorFilterBar } from '../components/CreatorFilterBar.js';
import { PodcastCard } from '../components/PodcastCard.js';
import { Plus, Radio, Play, Sparkles, Compass, RefreshCw, Loader2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext.js';

interface Props {
  onSelectPodcast: (podcastId: string) => void;
  onNavigateToFeeds: () => void;
  onNavigateToEpisodes: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onSelectPodcast,
  onNavigateToFeeds,
  onNavigateToEpisodes,
}) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [creators, setCreators] = useState<CreatorSummary[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [recentPlays, setRecentPlays] = useState<PlaybackProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { playEpisode } = useAudio();

  const loadData = async (creatorFilter = selectedCreator) => {
    try {
      setLoading(true);
      const [podcastsData, creatorsData, recentData] = await Promise.all([
        apiClient.getPodcasts(creatorFilter || undefined),
        apiClient.getCreators(),
        apiClient.getRecentlyPlayed(5),
      ]);
      setPodcasts(podcastsData);
      setCreators(creatorsData);
      setRecentPlays(recentData);
    } catch (err) {
      console.error('Failed to load library data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedCreator);
  }, [selectedCreator]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(selectedCreator);
  };

  return (
    <div className="w-full pb-36 overflow-y-auto px-4 sm:px-6">
      {/* Top Mobile Brand Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/80 backdrop-blur-xl border-b border-white/5 py-4 flex items-center justify-between -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Radio size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight leading-none">
              PodMob
            </h1>
            <span className="text-[10px] font-extrabold text-indigo-400 tracking-widest uppercase block mt-0.5">
              Audio Universe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 text-slate-400 hover:text-slate-200 glass-panel rounded-2xl transition-all transform active:scale-95"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
          </button>

          <button
            onClick={onNavigateToFeeds}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            <Plus size={15} />
            <span>Paste RSS</span>
          </button>
        </div>
      </div>

      {/* Creator Filter Chips Bar */}
      {creators.length > 0 && (
        <CreatorFilterBar
          creators={creators}
          selectedCreator={selectedCreator}
          onSelectCreator={(c) => setSelectedCreator(c)}
        />
      )}

      {/* Continue Listening Shelf */}
      {recentPlays.length > 0 && !selectedCreator && (
        <div className="my-5">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 uppercase mb-3">
            <Sparkles size={14} className="text-pink-400" />
            <span>Continue Listening</span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
            {recentPlays.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  playEpisode({
                    id: item.episode_id,
                    podcast_id: item.podcast_id || '',
                    guid: item.episode_id,
                    title: item.episode_title || 'Episode',
                    description: '',
                    author: item.podcast_author || null,
                    audio_url: item.episode_audio_url || '',
                    duration: null,
                    duration_seconds: item.duration_seconds || 0,
                    published_at: null,
                    image_url: item.episode_image_url || item.podcast_image_url || null,
                    file_size: 0,
                    file_type: 'audio/mpeg',
                    created_at: '',
                    position_seconds: item.position_seconds,
                  });
                }}
                className="group flex-shrink-0 w-72 glass-panel hover:glass-panel-elevated rounded-3xl p-3 flex items-center gap-3.5 cursor-pointer transition-all duration-300 shadow-md hover:border-indigo-500/40 active:scale-[0.98]"
              >
                {item.podcast_image_url ? (
                  <img
                    src={item.podcast_image_url}
                    alt={item.episode_title}
                    className="w-13 h-13 rounded-2xl object-cover ring-1 ring-white/10 shadow-sm"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-slate-900 flex items-center justify-center text-indigo-400">
                    <Radio size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                    {item.episode_title}
                  </h4>
                  <p className="text-[11px] font-bold text-pink-400 truncate mt-0.5">
                    {item.podcast_author || item.podcast_title}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Play size={13} className="fill-white ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribed Shows Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 uppercase">
            <Radio size={14} className="text-indigo-400" />
            <span>
              {selectedCreator
                ? `Shows by ${selectedCreator}`
                : 'Subscribed Podcasts'}
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-400/90 glass-panel px-2.5 py-0.5 rounded-full">
            {podcasts.length} shows
          </span>
        </div>

        {loading && !refreshing ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Radio size={18} className="absolute text-indigo-400 animate-pulse" />
            </div>
            <span className="text-xs text-slate-400 font-bold tracking-wide">Syncing podcast feeds...</span>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="my-8 p-10 glass-panel rounded-3xl flex flex-col items-center justify-center text-center gap-3.5 border-dashed border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Compass size={32} />
            </div>
            <h3 className="text-base font-black text-slate-100">
              {selectedCreator
                ? `No shows found for "${selectedCreator}"`
                : 'Your Library is Empty'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Paste any podcast RSS feed URL to import episodes and organize by creators.
            </p>
            <button
              onClick={onNavigateToFeeds}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
            >
              <Plus size={16} />
              <span>Paste RSS Feed URL</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                podcast={podcast}
                onPress={() => onSelectPodcast(podcast.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
