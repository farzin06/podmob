import { Request, Response, NextFunction } from 'express';
import { PlaybackService } from '../services/playbackService.js';

export class PlaybackController {
  static async saveProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { episodeId, positionSeconds, durationSeconds, isCompleted } = req.body;

      if (!episodeId) {
        res.status(400).json({ success: false, message: 'episodeId is required' });
        return;
      }

      const progress = await PlaybackService.saveProgress(
        episodeId,
        Number(positionSeconds) || 0,
        Number(durationSeconds) || 0,
        Boolean(isCompleted)
      );

      res.json({
        success: true,
        data: progress,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRecentlyPlayed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const recent = await PlaybackService.getRecentlyPlayed(limit);
      res.json({
        success: true,
        data: recent,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const episodeId = String(req.params.episodeId);
      const progress = await PlaybackService.getProgressByEpisodeId(episodeId);
      res.json({
        success: true,
        data: progress,
      });
    } catch (err) {
      next(err);
    }
  }
}
