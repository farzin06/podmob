import React, { useState } from 'react';
import { FeedSource } from '../types/index.js';
import { Rss, RefreshCw, Trash2, CheckCircle2, AlertCircle, Clock, ChevronRight, User, Radio } from 'lucide-react';

interface Props {
  feedSources: FeedSource[];
  onSelectFeed: (feed: FeedSource) => void;
  onSyncFeed: (id: string) => Promise<void>;
  onDeleteFeed: (id: string) => Promise<void>;
}

export const FeedUrlList: React.FC<Props> = ({
  feedSources,
  onSelectFeed,
  onSyncFeed,
  onDeleteFeed,
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setSyncingId(id);
      await onSyncFeed(id);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string | null) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to remove "${title || 'this feed'}"?`);
    if (confirmed) {
      await onDeleteFeed(id);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (feedSources.length === 0) {
    return (
      <div className="mx-4 my-6 p-8 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
          <Rss size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-100">No Pasted RSS Feeds Yet</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Paste an RSS feed URL above or tap a sample preset to import your first podcast show.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Pasted RSS Feeds ({feedSources.length})
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {feedSources.map((feed) => {
          const isSyncing = syncingId === feed.id || feed.status === 'syncing';

          return (
            <div
              key={feed.id}
              onClick={() => onSelectFeed(feed)}
              className="group bg-slate-900/80 hover:bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Main Card Info */}
              <div className="p-3.5 flex items-center gap-3.5">
                {/* Artwork */}
                <div className="relative flex-shrink-0">
                  {feed.podcast_image_url ? (
                    <img
                      src={feed.podcast_image_url}
                      alt={feed.title || 'Podcast'}
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-700/50"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700/50">
                      <Radio size={24} />
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                    {feed.title || feed.podcast_title || 'Unnamed Feed'}
                  </h4>

                  {/* Creator */}
                  {feed.podcast_author && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400">
                      <User size={12} />
                      <span className="truncate">{feed.podcast_author}</span>
                    </div>
                  )}

                  {/* URL */}
                  <span className="text-[11px] text-slate-500 font-mono truncate">
                    {feed.url}
                  </span>

                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        feed.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : feed.status === 'syncing'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {feed.status === 'active' && <CheckCircle2 size={10} />}
                      {feed.status === 'syncing' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
                      {feed.status === 'error' && <AlertCircle size={10} />}
                      {feed.status.toUpperCase()}
                    </span>

                    {/* Episodes Count */}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {feed.episode_count || 0} episodes
                    </span>

                    {/* Last Sync */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock size={11} />
                      {formatDate(feed.last_synced_at)}
                    </span>
                  </div>

                  {/* Error detail */}
                  {feed.error_message && (
                    <p className="text-[11px] text-rose-400 mt-1 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                      {feed.error_message}
                    </p>
                  )}
                </div>

                <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center border-t border-slate-800/80 bg-slate-950/40">
                <button
                  onClick={(e) => handleSync(e, feed.id)}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Re-sync'}</span>
                </button>

                <div className="w-[1px] h-4 bg-slate-800" />

                <button
                  onClick={(e) => handleDelete(e, feed.id, feed.title)}
                  className="py-2.5 px-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
