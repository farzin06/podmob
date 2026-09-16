import React from 'react';
import { CreatorSummary } from '../types/index.js';
import { Users, Check, Sparkles } from 'lucide-react';

interface Props {
  creators: CreatorSummary[];
  selectedCreator: string | null;
  onSelectCreator: (creator: string | null) => void;
}

export const CreatorFilterBar: React.FC<Props> = ({
  creators,
  selectedCreator,
  onSelectCreator,
}) => {
  const totalEpisodes = creators.reduce((acc, c) => acc + c.episode_count, 0);

  return (
    <div className="w-full my-3">
      {/* Header Label */}
      <div className="flex items-center justify-between px-0.5 mb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
          <Sparkles size={12} className="text-indigo-400 animate-pulse" />
          <span>Filter by Host / Creator</span>
        </div>
        {selectedCreator && (
          <button
            onClick={() => onSelectCreator(null)}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* Chips Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* "All Creators" button */}
        <button
          onClick={() => onSelectCreator(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 border ${
            !selectedCreator
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/30'
              : 'glass-panel text-slate-300 hover:text-white hover:border-slate-600/60'
          }`}
        >
          {!selectedCreator && <Check size={13} className="stroke-[3]" />}
          <span>All Creators</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              !selectedCreator
                ? 'bg-white/25 text-white shadow-inner'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {totalEpisodes}
          </span>
        </button>

        {/* Individual Creator pills */}
        {creators.map((c) => {
          const isSelected = selectedCreator === c.creator;
          return (
            <button
              key={c.creator}
              onClick={() => onSelectCreator(isSelected ? null : c.creator)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 border ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/30'
                  : 'glass-panel text-slate-300 hover:text-white hover:border-slate-600/60'
              }`}
            >
              {isSelected && <Check size={13} className="stroke-[3]" />}
              <span className="max-w-[140px] truncate">{c.creator}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected
                    ? 'bg-white/25 text-white shadow-inner'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {c.episode_count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
