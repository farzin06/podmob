import { Request, Response, NextFunction } from 'express';
import { DiscoverService } from '../services/discoverService.js';

export class DiscoverController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { term } = req.query;
      const result = await DiscoverService.searchPodcasts(
        term ? String(term) : undefined
      );

      res.json({
        status: 'true',
        feeds: result.feeds,
        count: result.count,
        query: result.query,
        description: `Found ${result.count} podcasts`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DiscoverService.getTrending();

      res.json({
        status: 'true',
        feeds: result.feeds,
        count: result.count,
        description: 'Trending podcasts',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = DiscoverService.getCategories();
      res.json({
        status: 'true',
        categories,
        count: categories.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async lookup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.query.id || req.params.id;
      if (!id) {
        res.status(400).json({ status: 'false', message: 'Podcast ID is required' });
        return;
      }

      const result = await DiscoverService.lookupPodcast(String(id));
      res.json({
        status: 'true',
        feed: result.feed,
        episodes: result.episodes,
        count: result.episodes.length,
      });
    } catch (err: any) {
      res.status(404).json({
        status: 'false',
        message: err.message || 'Podcast lookup failed',
      });
    }
  }

  static async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { feedUrl, title, externalId } = req.body;
      if (!feedUrl) {
        res.status(400).json({ success: false, message: 'feedUrl is required' });
        return;
      }

      const result = await DiscoverService.subscribe({
        feedUrl,
        title,
        externalId,
      });

      res.status(201).json({
        success: true,
        message: `Subscribed to "${result.podcast.title}" successfully`,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to subscribe to podcast',
      });
    }
  }
}
