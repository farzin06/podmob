import React, { useState } from 'react';
import { AudioProvider } from './context/AudioContext.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { FeedManagerScreen } from './screens/FeedManagerScreen.js';
import { EpisodesScreen } from './screens/EpisodesScreen.js';
import { PodcastDetailScreen } from './screens/PodcastDetailScreen.js';
import { MiniPlayer } from './components/MiniPlayer.js';
import { FullPlayerModal } from './components/FullPlayerModal.js';
import { Library, Rss, ListMusic } from 'lucide-react';

type Tab = 'library' | 'feeds' | 'episodes';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('library');
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);

  const handleSelectPodcast = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
  };

  const handleBackToLibrary = () => {
    setSelectedPodcastId(null);
  };

  const handleTabChange = (tab: Tab) => {
    setSelectedPodcastId(null);
    setCurrentTab(tab);
  };

  return (
    <AudioProvider>
      <div className="w-full h-full flex justify-center items-center bg-[#040508] font-sans select-none overflow-hidden sm:p-4">
        {/* Centered Mobile Device Viewport */}
        <div className="w-full max-w-lg h-full sm:h-[96vh] flex flex-col bg-[#07090E] sm:rounded-[36px] sm:border sm:border-white/10 relative shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Main Active Screen Content */}
          <main className="flex-1 overflow-y-auto relative no-scrollbar">
            {selectedPodcastId ? (
              <PodcastDetailScreen
                podcastId={selectedPodcastId}
                onBack={handleBackToLibrary}
              />
            ) : (
              <>
                {currentTab === 'library' && (
                  <HomeScreen
                    onSelectPodcast={handleSelectPodcast}
                    onNavigateToFeeds={() => handleTabChange('feeds')}
                    onNavigateToEpisodes={() => handleTabChange('episodes')}
                  />
                )}
                {currentTab === 'feeds' && (
                  <FeedManagerScreen onSelectPodcast={handleSelectPodcast} />
                )}
                {currentTab === 'episodes' && <EpisodesScreen />}
              </>
            )}
          </main>

          {/* Floating Bottom Docked Mini Player */}
          <MiniPlayer />

          {/* Bottom Luxury Mobile Navigation Bar */}
          <nav className="w-full bg-[#080B12]/90 backdrop-blur-2xl border-t border-white/5 py-3 px-8 flex items-center justify-around z-30">
            <button
              onClick={() => handleTabChange('library')}
              className={`flex flex-col items-center gap-1.5 py-1 px-4 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'library' && !selectedPodcastId
                  ? 'text-indigo-400 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-300 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'library' && !selectedPodcastId ? 'bg-indigo-500/15 shadow-sm' : ''}`}>
                <Library size={21} className={currentTab === 'library' && !selectedPodcastId ? 'stroke-[2.5]' : ''} />
              </div>
              <span className="text-[11px] tracking-wide">Library</span>
            </button>

            <button
              onClick={() => handleTabChange('feeds')}
              className={`flex flex-col items-center gap-1.5 py-1 px-4 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'feeds' && !selectedPodcastId
                  ? 'text-indigo-400 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-300 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'feeds' && !selectedPodcastId ? 'bg-indigo-500/15 shadow-sm' : ''}`}>
                <Rss size={21} className={currentTab === 'feeds' && !selectedPodcastId ? 'stroke-[2.5]' : ''} />
              </div>
              <span className="text-[11px] tracking-wide">Pasted Feeds</span>
            </button>

            <button
              onClick={() => handleTabChange('episodes')}
              className={`flex flex-col items-center gap-1.5 py-1 px-4 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'episodes' && !selectedPodcastId
                  ? 'text-indigo-400 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-300 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'episodes' && !selectedPodcastId ? 'bg-indigo-500/15 shadow-sm' : ''}`}>
                <ListMusic size={21} className={currentTab === 'episodes' && !selectedPodcastId ? 'stroke-[2.5]' : ''} />
              </div>
              <span className="text-[11px] tracking-wide">All Episodes</span>
            </button>
          </nav>

          {/* Expandable Full-Screen Mobile Player Modal */}
          <FullPlayerModal />
        </div>
      </div>
    </AudioProvider>
  );
};
