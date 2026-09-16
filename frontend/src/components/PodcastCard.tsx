import React from 'react';
import { Podcast } from '../types/index.js';
import { useAudio } from '../context/AudioContext.js';
import { User, Radio, Play, Pause } from 'lucide-react';

interface Props {
  podcast: Podcast;
  onPress: () => void;
}

export const PodcastCard: React.FC<Props> = ({ podcast, onPress }) => {
  const { currentEpisode, isPlaying } = useAudio();

  const isCurrentShow = Boolean(
    currentEpisode &&
      (String(currentEpisode.podcast_id) === String(podcast.id) ||
        currentEpisode.podcast_title?.toLowerCase() === podcast.title.toLowerCase())
  );

  return (
    <div
      onClick={onPress}
      className={`group relative rounded-3xl transition-all duration-300 ease-out cursor-pointer flex flex-col overflow-hidden shadow-lg hover:shadow-2xl active:scale-[0.97] border ${
        isCurrentShow
          ? 'glass-panel-elevated border-indigo-500/70 shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-500/40'
          : 'glass-panel hover:glass-panel-elevated border-white/5 hover:border-indigo-500/40'
      }`}
    >
      {/* Artwork Box */}
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
        {podcast.image_url ? (
          <img
            src={podcast.image_url}
            alt={podcast.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-400">
            <Radio size={36} />
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-transparent to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Episode count badge */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-slate-300 border border-white/10 shadow-md">
          {podcast.episode_count || 0} eps
        </div>

        {/* Soundwave or Play Action Button */}
        {isCurrentShow && isPlaying ? (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-indigo-500/40 flex items-center gap-0.5 shadow-md">
            <span className="w-0.5 bg-indigo-400 rounded-full soundwave-1" />
            <span className="w-0.5 bg-indigo-400 rounded-full soundwave-2" />
            <span className="w-0.5 bg-indigo-400 rounded-full soundwave-3" />
          </div>
        ) : (
          <div className="absolute bottom-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
            <Play size={14} className="fill-white ml-0.5" />
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="p-3 flex flex-col gap-1 flex-1 justify-between bg-gradient-to-b from-transparent to-slate-950/60">
        <div>
          <h4
            className={`text-xs sm:text-sm font-bold line-clamp-1 transition-colors duration-200 ${
              isCurrentShow ? 'text-indigo-300 font-extrabold' : 'text-slate-100 group-hover:text-indigo-400'
            }`}
          >
            {podcast.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-400 mt-0.5">
            <User size={10} className="flex-shrink-0" />
            <span className="truncate">{podcast.author || 'Creator'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
