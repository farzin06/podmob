import { Request, Response, NextFunction } from 'express';
import { PodcastService } from '../services/podcastService.js';

export class PodcastController {
  static async getPodcasts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creator = req.query.creator as string | undefined;
      const podcasts = await PodcastService.getAllPodcasts(creator);
      res.json({
        success: true,
        data: podcasts,
        count: podcasts.length,
        filter: { creator: creator || null },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPodcastById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const podcast = await PodcastService.getPodcastById(id);
      if (!podcast) {
        res.status(404).json({ success: false, message: 'Podcast not found' });
        return;
      }
      res.json({ success: true, data: podcast });
    } catch (err) {
      next(err);
    }
  }

  static async getCreators(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creators = await PodcastService.getCreators();
      res.json({
        success: true,
        data: creators,
        count: creators.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deletePodcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await PodcastService.deletePodcast(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Podcast not found' });
        return;
      }
      res.json({ success: true, message: 'Podcast deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
