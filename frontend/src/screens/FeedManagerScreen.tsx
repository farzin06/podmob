import React, { useState, useEffect } from 'react';
import { FeedSource } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { FeedUrlList } from '../components/FeedUrlList.js';
import {
  Rss,
  Plus,
  Search,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface Props {
  onSelectPodcast: (podcastId: string) => void;
}

const PRESET_FEEDS = [
  {
    name: 'Lex Fridman Podcast',
    creator: 'Lex Fridman',
    url: 'https://lexfridman.com/feed/podcast/',
  },
  {
    name: 'NPR News Now',
    creator: 'NPR',
    url: 'https://feeds.npr.org/500005/podcast.xml',
  },
  {
    name: 'BBC Global News Podcast',
    creator: 'BBC World Service',
    url: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss',
  },
  {
    name: 'Huberman Lab',
    creator: 'Andrew Huberman',
    url: 'https://hubermanlab.libsyn.com/rss',
  },
];

export const FeedManagerScreen: React.FC<Props> = ({ onSelectPodcast }) => {
  const [feedSources, setFeedSources] = useState<FeedSource[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeedSources = async () => {
    try {
      const data = await apiClient.getFeedSources();
      setFeedSources(data);
    } catch (err) {
      console.error('Failed to load feed sources:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeedSources();
  }, []);

  const handleAddFeed = async (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || inputUrl).trim();
    if (!targetUrl) {
      setStatusMessage({ type: 'error', text: 'Please paste a valid RSS feed URL' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      const result = await apiClient.addFeedSource(targetUrl);
      setInputUrl('');
      setPreviewData(null);
      setStatusMessage({
        type: 'success',
        text: `Successfully added and synced "${result.podcast.title}"!`,
      });
      await loadFeedSources();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to add feed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    const targetUrl = inputUrl.trim();
    if (!targetUrl) {
      setStatusMessage({ type: 'error', text: 'Please enter a URL to preview' });
      return;
    }

    try {
      setIsPreviewLoading(true);
      setStatusMessage(null);
      const data = await apiClient.previewFeed(targetUrl);
      setPreviewData(data);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Preview failed',
      });
      setPreviewData(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSyncFeed = async (id: string) => {
    await apiClient.syncFeedSource(id);
    await loadFeedSources();
  };

  const handleDeleteFeed = async (id: string) => {
    await apiClient.deleteFeedSource(id);
    await loadFeedSources();
  };

  const handleSelectFeed = (feed: FeedSource) => {
    if (feed.podcast_id) {
      onSelectPodcast(feed.podcast_id);
    }
  };

  return (
    <div className="w-full pb-36 overflow-y-auto px-4 sm:px-6">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-[#06070B]/80 backdrop-blur-xl border-b border-white/5 py-4 flex items-center justify-between -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-indigo-400 shadow-md">
            <Rss size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight leading-none">
              Feed Manager
            </h1>
            <span className="text-[10px] font-extrabold text-indigo-400 tracking-widest uppercase block mt-0.5">
              Pasted RSS Sources
            </span>
          </div>
        </div>

        <button
          onClick={() => { setRefreshing(true); loadFeedSources(); }}
          className="p-2.5 text-slate-400 hover:text-slate-200 glass-panel rounded-2xl transition-all transform active:scale-95"
          title="Refresh feeds"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
        </button>
      </div>

      {/* Input Box Card with Glow */}
      <div className="my-5 p-5 glass-panel rounded-3xl border border-white/10 shadow-xl flex flex-col gap-3.5">
        <label className="text-xs font-black tracking-widest text-slate-300 uppercase flex items-center gap-2">
          <Sparkles size={13} className="text-pink-400" />
          <span>Paste RSS Feed URL</span>
        </label>

        <div className="relative">
          <input
            type="url"
            placeholder="https://example.com/podcast.rss"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setStatusMessage(null);
            }}
            className="w-full bg-[#0B0E17] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-600 font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={handlePreview}
            disabled={isPreviewLoading || isSubmitting}
            className="px-4 py-3 rounded-2xl glass-panel hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isPreviewLoading ? (
              <Loader2 size={15} className="animate-spin text-indigo-400" />
            ) : (
              <Search size={15} className="text-indigo-400" />
            )}
            <span>Preview</span>
          </button>

          <button
            onClick={() => handleAddFeed()}
            disabled={isSubmitting || isPreviewLoading}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            <span>{isSubmitting ? 'Syncing Feed...' : 'Add & Ingest Feed'}</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-md'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Feed Preview Box */}
      {previewData && (
        <div className="my-4 p-4.5 glass-panel-elevated rounded-3xl border border-indigo-500/50 shadow-2xl flex flex-col gap-3.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
            <Sparkles size={14} className="text-pink-400" />
            <span>Feed Preview Detected</span>
          </div>

          <div className="flex items-center gap-3.5">
            {previewData.imageUrl && (
              <img
                src={previewData.imageUrl}
                alt={previewData.title}
                className="w-16 h-16 rounded-2xl object-cover ring-1 ring-white/10 shadow-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate">
                {previewData.title}
              </h4>
              <p className="text-xs font-bold text-pink-400 truncate mt-0.5">
                Creator: {previewData.author}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {previewData.episodeCount} episodes ready to sync
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAddFeed()}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
          >
            <CheckCircle size={15} />
            <span>Confirm & Add to Library</span>
          </button>
        </div>
      )}

      {/* Popular Sample Feeds */}
      <div className="my-5">
        <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 uppercase mb-3 px-1">
          <Sparkles size={13} className="text-pink-400" />
          <span>One-Tap Sample Presets</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PRESET_FEEDS.map((preset) => (
            <button
              key={preset.url}
              onClick={() => handleAddFeed(preset.url)}
              className="p-3.5 glass-panel hover:glass-panel-elevated rounded-3xl text-left transition-all duration-300 group flex flex-col justify-between gap-1 shadow-sm active:scale-95"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                  {preset.name}
                </span>
                <Plus size={14} className="text-indigo-400 flex-shrink-0" />
              </div>
              <span className="text-[11px] font-bold text-pink-400 truncate">
                {preset.creator}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pasted Feeds History List */}
      <FeedUrlList
        feedSources={feedSources}
        onSelectFeed={handleSelectFeed}
        onSyncFeed={handleSyncFeed}
        onDeleteFeed={handleDeleteFeed}
      />
    </div>
  );
};
