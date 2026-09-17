import { Request, Response, NextFunction } from 'express';
import { FeedSourceService } from '../services/feedSourceService.js';
import { rssParserService } from '../services/rssParserService.js';

export class FeedSourceController {
  static async getFeedSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedSources = await FeedSourceService.getAllFeedSources();
      res.json({
        success: true,
        data: feedSources,
        count: feedSources.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getFeedSourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const feedSource = await FeedSourceService.getFeedSourceById(id);
      if (!feedSource) {
        res.status(404).json({ success: false, message: 'Feed source not found' });
        return;
      }
      res.json({ success: true, data: feedSource });
    } catch (err) {
      next(err);
    }
  }

  static async addFeedSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, title } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, message: 'RSS feed URL is required' });
        return;
      }

      const result = await FeedSourceService.addAndSyncFeedSource(url, title);
      res.status(201).json({
        success: true,
        message: 'RSS Feed URL saved and synced successfully',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to add RSS feed URL',
      });
    }
  }

  static async syncFeedSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await FeedSourceService.syncFeedSource(id);
      res.json({
        success: true,
        message: `Feed re-synced successfully (${result.newEpisodesCount} new episodes)`,
        data: result.feedSource,
        newEpisodesCount: result.newEpisodesCount,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to re-sync feed',
      });
    }
  }

  static async syncAllFeedSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await FeedSourceService.syncAllFeedSources();
      res.json({
        success: true,
        message: `Sync complete: ${summary.syncedCount}/${summary.totalSources} feeds synced. Found ${summary.newEpisodes} new episodes.`,
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to sync all feeds',
      });
    }
  }

  static async deleteFeedSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await FeedSourceService.deleteFeedSource(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Feed source not found' });
        return;
      }
      res.json({
        success: true,
        message: 'Feed source and associated podcast removed successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  static async previewFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, message: 'URL is required' });
        return;
      }

      const parsed = await rssParserService.parseUrl(url);
      res.json({
        success: true,
        data: {
          title: parsed.title,
          description: parsed.description,
          author: parsed.author,
          imageUrl: parsed.imageUrl,
          episodeCount: parsed.episodes.length,
          sampleEpisodes: parsed.episodes.slice(0, 5),
        },
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: `Failed to parse RSS feed preview: ${err.message}`,
      });
    }
  }
}
