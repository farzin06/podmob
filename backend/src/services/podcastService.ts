import { PodcastModel, Podcast, CreatorSummary } from '../models/podcastModel.js';
import { EpisodeModel, Episode } from '../models/episodeModel.js';

export interface PodcastDetails extends Podcast {
  episodes: Episode[];
}

export class PodcastService {
  static async getAllPodcasts(creatorFilter?: string): Promise<Podcast[]> {
    return PodcastModel.findAll(creatorFilter);
  }

  static async getPodcastById(id: string): Promise<PodcastDetails | null> {
    const podcast = await PodcastModel.findById(id);
    if (!podcast) return null;

    const { episodes } = await EpisodeModel.findFiltered({ podcastId: id, limit: 200 });
    return {
      ...podcast,
      episodes,
    };
  }

  static async getCreators(): Promise<CreatorSummary[]> {
    return PodcastModel.getDistinctCreators();
  }

  static async deletePodcast(id: string): Promise<boolean> {
    await EpisodeModel.deleteByPodcastId(id);
    return PodcastModel.delete(id);
  }
}
