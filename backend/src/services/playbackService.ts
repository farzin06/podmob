import { PlaybackModel, PlaybackProgress } from '../models/playbackModel.js';

export class PlaybackService {
  static async saveProgress(
    episodeId: string,
    positionSeconds: number,
    durationSeconds: number,
    isCompleted?: boolean
  ): Promise<PlaybackProgress> {
    return PlaybackModel.saveProgress(episodeId, positionSeconds, durationSeconds, isCompleted);
  }

  static async getRecentlyPlayed(limit = 10): Promise<PlaybackProgress[]> {
    return PlaybackModel.getRecentlyPlayed(limit);
  }

  static async getProgressByEpisodeId(episodeId: string): Promise<PlaybackProgress | null> {
    return PlaybackModel.findByEpisodeId(episodeId);
  }
}
