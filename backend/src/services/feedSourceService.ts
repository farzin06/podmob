import { FeedSourceModel, FeedSource } from '../models/feedSourceModel.js';
import { PodcastModel, Podcast } from '../models/podcastModel.js';
import { EpisodeModel } from '../models/episodeModel.js';
import { rssParserService } from './rssParserService.js';

export interface FeedSourceWithPodcast extends FeedSource {
  podcast?: Podcast | null;
}

export class FeedSourceService {
  static async getAllFeedSources(): Promise<FeedSource[]> {
    return FeedSourceModel.findAll();
  }

  static async getFeedSourceById(id: string): Promise<FeedSource | null> {
    return FeedSourceModel.findById(id);
  }

  static async addAndSyncFeedSource(url: string, customTitle?: string): Promise<{ feedSource: FeedSource; podcast: Podcast; newEpisodesCount: number }> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      throw new Error('Invalid URL. Must start with http:// or https://');
    }

    // Check if feed source already exists
    let feedSource = await FeedSourceModel.findByUrl(trimmedUrl);
    if (!feedSource) {
      feedSource = await FeedSourceModel.create(trimmedUrl, customTitle);
    } else {
      await FeedSourceModel.updateStatus(feedSource.id, 'syncing');
    }

    try {
      // Parse RSS feed
      const parsedFeed = await rssParserService.parseUrl(trimmedUrl);

      // Save/Upsert Podcast
      const podcast = await PodcastModel.upsert({
        feed_source_id: feedSource.id,
        feed_url: trimmedUrl,
        title: customTitle || parsedFeed.title,
        description: parsedFeed.description,
        author: parsedFeed.author,
        image_url: parsedFeed.imageUrl,
        link: parsedFeed.link,
        language: parsedFeed.language,
        categories: JSON.stringify(parsedFeed.categories),
      });

      // Upsert all parsed episodes and count new additions
      let newEpisodesCount = 0;
      for (const ep of parsedFeed.episodes) {
        const result = await EpisodeModel.upsert({
          podcast_id: podcast.id,
          guid: ep.guid,
          title: ep.title,
          description: ep.description,
          author: ep.author || podcast.author,
          audio_url: ep.audioUrl,
          duration: ep.duration,
          duration_seconds: ep.durationSeconds,
          published_at: ep.publishedAt,
          image_url: ep.imageUrl || podcast.image_url,
          file_size: ep.fileSize,
          file_type: ep.fileType,
        });

        if (result.isNew) {
          newEpisodesCount++;
        }
      }

      // Mark feed as active
      await FeedSourceModel.updateStatus(feedSource.id, 'active', podcast.title, null);

      const updatedFeedSource = (await FeedSourceModel.findById(feedSource.id))!;
      return { feedSource: updatedFeedSource, podcast, newEpisodesCount };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to parse RSS feed';
      await FeedSourceModel.updateStatus(feedSource.id, 'error', null, errorMsg);
      throw new Error(`Feed sync failed: ${errorMsg}`);
    }
  }

  static async syncFeedSource(id: string): Promise<{ feedSource: FeedSource; newEpisodesCount: number }> {
    const feedSource = await FeedSourceModel.findById(id);
    if (!feedSource) {
      throw new Error('Feed source not found');
    }

    const res = await this.addAndSyncFeedSource(feedSource.url, feedSource.title || undefined);
    return {
      feedSource: res.feedSource,
      newEpisodesCount: res.newEpisodesCount,
    };
  }

  /**
   * Syncs all active feed sources in the database and returns summary stats
   */
  static async syncAllFeedSources(): Promise<{
    totalSources: number;
    syncedCount: number;
    failedCount: number;
    newEpisodes: number;
    results: Array<{ id: string; title: string | null; newEpisodes: number; success: boolean; error?: string }>;
  }> {
    const feedSources = await FeedSourceModel.findAll();
    let syncedCount = 0;
    let failedCount = 0;
    let totalNewEpisodes = 0;
    const results: Array<{ id: string; title: string | null; newEpisodes: number; success: boolean; error?: string }> = [];

    for (const feed of feedSources) {
      try {
        const syncResult = await this.addAndSyncFeedSource(feed.url, feed.title || undefined);
        syncedCount++;
        totalNewEpisodes += syncResult.newEpisodesCount;
        results.push({
          id: feed.id,
          title: feed.title,
          newEpisodes: syncResult.newEpisodesCount,
          success: true,
        });
      } catch (err: any) {
        failedCount++;
        results.push({
          id: feed.id,
          title: feed.title,
          newEpisodes: 0,
          success: false,
          error: err.message,
        });
      }
    }

    return {
      totalSources: feedSources.length,
      syncedCount,
      failedCount,
      newEpisodes: totalNewEpisodes,
      results,
    };
  }

  static async deleteFeedSource(id: string): Promise<boolean> {
    const feedSource = await FeedSourceModel.findById(id);
    if (!feedSource) {
      return false;
    }

    const podcast = await PodcastModel.findByFeedSourceId(id);
    if (podcast) {
      await EpisodeModel.deleteByPodcastId(podcast.id);
      await PodcastModel.delete(podcast.id);
    }

    return FeedSourceModel.delete(id);
  }
}
