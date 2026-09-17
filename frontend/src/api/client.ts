import axios from 'axios';
import {
  FeedSource,
  Podcast,
  Episode,
  CreatorSummary,
  PlaybackProgress,
  DiscoverPodcast,
  DiscoverCategory,
} from '../types/index.js';

// Determine the best API URL for web and Android
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if ((window as any).__API_BASE_URL__) {
      return (window as any).__API_BASE_URL__;
    }
    // If running on local computer browser
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    // If accessing via local network IP on phone browser
    if (window.location.hostname && !window.location.hostname.includes('localhost')) {
      return `http://${window.location.hostname}:5001/api`;
    }
  }
  // Default fallback for native Android apps
  return 'http://192.168.1.152:5001/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Feed Sources (Pasted RSS URLs)
  getFeedSources: async (): Promise<FeedSource[]> => {
    const res = await api.get('/feed-sources');
    return res.data.data;
  },

  addFeedSource: async (url: string, title?: string): Promise<{ feedSource: FeedSource; podcast: Podcast }> => {
    const res = await api.post('/feed-sources', { url, title });
    return res.data.data;
  },

  syncFeedSource: async (id: string): Promise<FeedSource> => {
    const res = await api.post(`/feed-sources/${id}/sync`);
    return res.data.data;
  },

  syncAllFeedSources: async (): Promise<{ totalSources: number; syncedCount: number; newEpisodes: number }> => {
    const res = await api.post('/feed-sources/sync-all');
    return res.data.data;
  },

  deleteFeedSource: async (id: string): Promise<void> => {
    await api.delete(`/feed-sources/${id}`);
  },

  previewFeed: async (url: string): Promise<any> => {
    const res = await api.post('/feed-sources/preview', { url });
    return res.data.data;
  },

  // Podcasts
  getPodcasts: async (creator?: string): Promise<Podcast[]> => {
    const params = creator ? { creator } : {};
    const res = await api.get('/podcasts', { params });
    return res.data.data;
  },

  getPodcastById: async (id: string): Promise<Podcast & { episodes: Episode[] }> => {
    const res = await api.get(`/podcasts/${id}`);
    return res.data.data;
  },

  getCreators: async (): Promise<CreatorSummary[]> => {
    const res = await api.get('/podcasts/creators');
    return res.data.data;
  },

  deletePodcast: async (id: string): Promise<void> => {
    await api.delete(`/podcasts/${id}`);
  },

  // Episodes
  getEpisodes: async (params: {
    creator?: string;
    podcastId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ episodes: Episode[]; total: number }> => {
    const res = await api.get('/episodes', { params });
    return { episodes: res.data.data, total: res.data.total };
  },

  getEpisodeById: async (id: string): Promise<Episode> => {
    const res = await api.get(`/episodes/${id}`);
    return res.data.data;
  },

  // Playback Progress
  saveProgress: async (
    episodeId: string,
    positionSeconds: number,
    durationSeconds: number,
    isCompleted?: boolean
  ): Promise<PlaybackProgress> => {
    const res = await api.post('/playback/progress', {
      episodeId,
      positionSeconds,
      durationSeconds,
      isCompleted,
    });
    return res.data.data;
  },

  getRecentlyPlayed: async (limit = 10): Promise<PlaybackProgress[]> => {
    const res = await api.get('/playback/recent', { params: { limit } });
    return res.data.data;
  },

  // Discover / Podcast Index API methods
  discover: {
    search: async (term?: string, category?: string): Promise<{ feeds: DiscoverPodcast[]; count: number }> => {
      const res = await api.get('/discover/search', { params: { term, category } });
      return { feeds: res.data.feeds || [], count: res.data.count || 0 };
    },

    getTrending: async (category?: string): Promise<{ feeds: DiscoverPodcast[]; count: number }> => {
      const res = await api.get('/discover/trending', { params: { category } });
      return { feeds: res.data.feeds || [], count: res.data.count || 0 };
    },

    getCategories: async (): Promise<DiscoverCategory[]> => {
      const res = await api.get('/discover/categories');
      return res.data.categories || [];
    },

    lookup: async (id: string | number): Promise<{ feed: DiscoverPodcast; episodes: any[] }> => {
      const res = await api.get(`/discover/lookup/${id}`);
      return { feed: res.data.feed, episodes: res.data.episodes || [] };
    },

    subscribe: async (data: { feedUrl: string; title?: string; externalId?: string | number }): Promise<{ feedSource: FeedSource; podcast: Podcast }> => {
      const res = await api.post('/discover/subscribe', data);
      return res.data.data;
    },
  },
};
