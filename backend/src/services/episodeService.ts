import { EpisodeModel, Episode, EpisodeFilterOptions } from '../models/episodeModel.js';

export class EpisodeService {
  static async getEpisodes(options: EpisodeFilterOptions = {}): Promise<{ episodes: Episode[]; total: number }> {
    return EpisodeModel.findFiltered(options);
  }

  static async getEpisodeById(id: string): Promise<Episode | null> {
    return EpisodeModel.findById(id);
  }
}
