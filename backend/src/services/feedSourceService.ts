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

  static async addAndSyncFeedSource(url: string, customTitle?: string): Promise<{ feedSource: FeedSource; podcast: Podcast }> {
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

      // Upsert all parsed episodes
      for (const ep of parsedFeed.episodes) {
        await EpisodeModel.upsert({
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
      }

      // Mark feed as active
      await FeedSourceModel.updateStatus(feedSource.id, 'active', podcast.title, null);

      const updatedFeedSource = (await FeedSourceModel.findById(feedSource.id))!;
      return { feedSource: updatedFeedSource, podcast };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to parse RSS feed';
      await FeedSourceModel.updateStatus(feedSource.id, 'error', null, errorMsg);
      throw new Error(`Feed sync failed: ${errorMsg}`);
    }
  }

  static async syncFeedSource(id: string): Promise<FeedSource> {
    const feedSource = await FeedSourceModel.findById(id);
    if (!feedSource) {
      throw new Error('Feed source not found');
    }

    await this.addAndSyncFeedSource(feedSource.url, feedSource.title || undefined);
    return (await FeedSourceModel.findById(id))!;
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
