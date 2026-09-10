import { Request, Response, NextFunction } from 'express';
import { EpisodeService } from '../services/episodeService.js';

export class EpisodeController {
  static async getEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { creator, podcastId, search, limit, offset } = req.query;

      const result = await EpisodeService.getEpisodes({
        creator: creator as string | undefined,
        podcastId: podcastId as string | undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      res.json({
        success: true,
        data: result.episodes,
        total: result.total,
        count: result.episodes.length,
        filters: {
          creator: creator || null,
          podcastId: podcastId || null,
          search: search || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getEpisodeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const episode = await EpisodeService.getEpisodeById(id);
      if (!episode) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }
      res.json({ success: true, data: episode });
    } catch (err) {
      next(err);
    }
  }
}
