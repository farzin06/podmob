import React from 'react';
import { Podcast } from '../types/index.js';
import { User, Radio, Play } from 'lucide-react';

interface Props {
  podcast: Podcast;
  onPress: () => void;
}

export const PodcastCard: React.FC<Props> = ({ podcast, onPress }) => {
  return (
    <div
      onClick={onPress}
      className="group relative glass-panel hover:bg-slate-900/90 rounded-3xl border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 ease-out cursor-pointer flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.97]"
    >
      {/* Artwork Box */}
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
        {podcast.image_url ? (
          <img
            src={podcast.image_url}
            alt={podcast.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-400">
            <Radio size={40} />
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Episode count badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-slate-200 border border-white/10 shadow-md">
          {podcast.episode_count || 0} eps
        </div>

        {/* Floating Play Action Button */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Play size={16} className="fill-white ml-0.5" />
        </div>
      </div>

      {/* Info details */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between bg-gradient-to-b from-transparent to-slate-950/60">
        <div>
          <h4 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-200">
            {podcast.title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 mt-1">
            <User size={11} className="flex-shrink-0" />
            <span className="truncate">{podcast.author || 'Creator'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
