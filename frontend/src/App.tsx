import React, { useState } from 'react';
import { AudioProvider } from './context/AudioContext.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { DiscoverScreen } from './screens/DiscoverScreen.js';
import { FeedManagerScreen } from './screens/FeedManagerScreen.js';
import { EpisodesScreen } from './screens/EpisodesScreen.js';
import { PodcastDetailScreen } from './screens/PodcastDetailScreen.js';
import { MiniPlayer } from './components/MiniPlayer.js';
import { FullPlayerModal } from './components/FullPlayerModal.js';
import { Library, Compass, Rss, ListMusic } from 'lucide-react';

type Tab = 'library' | 'discover' | 'feeds' | 'episodes';

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
      <div className="w-full h-[100dvh] flex justify-center items-center bg-[#040508] font-sans select-none overflow-hidden sm:p-3 md:p-6">
        {/* Mobile Device Viewport Shell */}
        <div className="w-full max-w-lg h-full sm:h-[96dvh] flex flex-col bg-[#07090E] sm:rounded-[36px] sm:border sm:border-white/10 relative shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-hidden">
          
          {/* Main Active Screen Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto relative no-scrollbar transition-all duration-300">
            {selectedPodcastId ? (
              <div key={`podcast-${selectedPodcastId}`} className="animate-modal-fade">
                <PodcastDetailScreen
                  podcastId={selectedPodcastId}
                  onBack={handleBackToLibrary}
                />
              </div>
            ) : (
              <div key={`tab-${currentTab}`} className="animate-modal-fade">
                {currentTab === 'library' && (
                  <HomeScreen
                    onSelectPodcast={handleSelectPodcast}
                    onNavigateToFeeds={() => handleTabChange('feeds')}
                    onNavigateToEpisodes={() => handleTabChange('episodes')}
                  />
                )}
                {currentTab === 'discover' && (
                  <DiscoverScreen />
                )}
                {currentTab === 'feeds' && (
                  <FeedManagerScreen onSelectPodcast={handleSelectPodcast} />
                )}
                {currentTab === 'episodes' && <EpisodesScreen />}
              </div>
            )}
          </main>

          {/* Floating Bottom Docked Mini Player */}
          <MiniPlayer />

          {/* Bottom Luxury Mobile Navigation Bar */}
          <nav className="w-full glass-nav pt-2 pb-safe px-3 sm:px-6 flex items-center justify-around z-30 flex-shrink-0">
            {/* Library Tab */}
            <button
              onClick={() => handleTabChange('library')}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'library' && !selectedPodcastId
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-300 ${
                  currentTab === 'library' && !selectedPodcastId
                    ? 'bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 shadow-sm border border-indigo-500/30 text-indigo-400 scale-105'
                    : 'text-slate-400'
                }`}
              >
                <Library size={19} className={currentTab === 'library' && !selectedPodcastId ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[10px] tracking-tight font-bold">Library</span>
            </button>

            {/* Discover Tab */}
            <button
              onClick={() => handleTabChange('discover')}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'discover' && !selectedPodcastId
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-300 ${
                  currentTab === 'discover' && !selectedPodcastId
                    ? 'bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 shadow-sm border border-indigo-500/30 text-indigo-400 scale-105'
                    : 'text-slate-400'
                }`}
              >
                <Compass size={19} className={currentTab === 'discover' && !selectedPodcastId ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[10px] tracking-tight font-bold">Discover</span>
            </button>

            {/* Pasted Feeds Tab */}
            <button
              onClick={() => handleTabChange('feeds')}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'feeds' && !selectedPodcastId
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-300 ${
                  currentTab === 'feeds' && !selectedPodcastId
                    ? 'bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 shadow-sm border border-indigo-500/30 text-indigo-400 scale-105'
                    : 'text-slate-400'
                }`}
              >
                <Rss size={19} className={currentTab === 'feeds' && !selectedPodcastId ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[10px] tracking-tight font-bold">Pasted Feeds</span>
            </button>

            {/* All Episodes Tab */}
            <button
              onClick={() => handleTabChange('episodes')}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                currentTab === 'episodes' && !selectedPodcastId
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-300 ${
                  currentTab === 'episodes' && !selectedPodcastId
                    ? 'bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 shadow-sm border border-indigo-500/30 text-indigo-400 scale-105'
                    : 'text-slate-400'
                }`}
              >
                <ListMusic size={19} className={currentTab === 'episodes' && !selectedPodcastId ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[10px] tracking-tight font-bold">Episodes</span>
            </button>
          </nav>

          {/* Expandable Full-Screen Mobile Player Modal */}
          <FullPlayerModal />
        </div>
      </div>
    </AudioProvider>
  );
};
