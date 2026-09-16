import { podcastIndexClient } from '../config/podcastIndex.js';
import { FeedSourceService } from './feedSourceService.js';
import { rssParserService } from './rssParserService.js';

export interface ApiPodcastFeed {
  id: number | string;
  title: string;
  url: string; // RSS feed URL
  originalUrl?: string;
  link?: string;
  description: string;
  author: string;
  image: string;
  artwork: string;
  language: string;
  episodeCount: number;
  categories: string[];
  trendingRank?: number;
  sampleEpisodes?: Array<{
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    duration: string;
    publishedAt: string;
  }>;
}

export interface ApiCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export class DiscoverService {
  /**
   * Live search podcasts matching search term using public directory API
   */
  static async searchPodcasts(term?: string): Promise<{ feeds: ApiPodcastFeed[]; count: number; query: string }> {
    const q = (term || '').trim();

    if (!q) {
      return {
        feeds: [],
        count: 0,
        query: '',
      };
    }

    try {
      const res = await podcastIndexClient.get(`/search`, {
        params: {
          term: q,
        },
      });

      if (res.data?.results && res.data.results.length > 0) {
        const liveFeeds: ApiPodcastFeed[] = res.data.results
          .filter((item: any) => item.feedUrl)
          .map((item: any, idx: number) => ({
            id: item.collectionId || `pindex-${idx}`,
            title: item.collectionName || item.trackName || 'Podcast',
            url: item.feedUrl,
            link: item.collectionViewUrl || null,
            description: `Podcast by ${item.artistName || 'Unknown'}. Genre: ${item.primaryGenreName || 'General'}`,
            author: item.artistName || 'Unknown Creator',
            image: item.artworkUrl600 || item.artworkUrl100 || '',
            artwork: item.artworkUrl600 || item.artworkUrl100 || '',
            language: 'en',
            episodeCount: item.trackCount || 0,
            categories: item.primaryGenreName ? [item.primaryGenreName] : ['Podcasts'],
            trendingRank: idx + 1,
          }));

        return {
          feeds: liveFeeds,
          count: liveFeeds.length,
          query: q,
        };
      }
    } catch (err: any) {
      console.error('[DiscoverService] Podcast Index search error:', err.message);
    }

    return {
      feeds: [],
      count: 0,
      query: q,
    };
  }

  /**
   * Get trending podcasts (empty if no query / live search only)
   */
  static async getTrending(): Promise<{ feeds: ApiPodcastFeed[]; count: number }> {
    return {
      feeds: [],
      count: 0,
    };
  }

  /**
   * Get categories list
   */
  static getCategories(): Array<{ id: string; name: string }> {
    return [];
  }

  /**
   * Lookup podcast by ID (fetches feed details and parses live episodes from RSS)
   */
  static async lookupPodcast(id: string | number): Promise<{ feed: ApiPodcastFeed; episodes: any[] }> {
    try {
      const res = await podcastIndexClient.get(`/lookup`, {
        params: { id },
      });

      const item = res.data?.results?.[0];
      if (item && item.feedUrl) {
        const parsed = await rssParserService.parseUrl(item.feedUrl);
        const feed: ApiPodcastFeed = {
          id: item.collectionId,
          title: item.collectionName || parsed.title,
          url: item.feedUrl,
          link: item.collectionViewUrl || parsed.link,
          description: parsed.description || `Podcast by ${item.artistName}`,
          author: item.artistName || parsed.author || 'Unknown Creator',
          image: item.artworkUrl600 || parsed.imageUrl || '',
          artwork: item.artworkUrl600 || parsed.imageUrl || '',
          language: parsed.language || 'en',
          episodeCount: parsed.episodes.length,
          categories: item.primaryGenreName ? [item.primaryGenreName] : ['Podcasts'],
        };

        return {
          feed,
          episodes: parsed.episodes,
        };
      }
    } catch (err: any) {
      console.warn('[DiscoverService] Podcast Index lookup failed:', err.message);
    }

    throw new Error(`Podcast with ID ${id} could not be loaded`);
  }

  /**
   * One-tap subscribe: Ingests an external podcast into the user's personal library
   */
  static async subscribe(data: { feedUrl: string; title?: string; externalId?: string | number }): Promise<any> {
    return FeedSourceService.addAndSyncFeedSource(data.feedUrl, data.title);
  }
}
