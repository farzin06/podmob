export interface FeedSource {
  id: string;
  url: string;
  title: string | null;
  status: 'active' | 'syncing' | 'error';
  last_synced_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  episode_count?: number;
  podcast_id?: string;
  podcast_title?: string;
  podcast_author?: string;
  podcast_image_url?: string;
}

export interface Podcast {
  id: string;
  feed_source_id: string;
  feed_url: string;
  title: string;
  description: string | null;
  author: string | null; // Creator
  image_url: string | null;
  link: string | null;
  language: string | null;
  categories: string | null;
  created_at: string;
  updated_at: string;
  episode_count?: number;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  podcast_id: string;
  guid: string;
  title: string;
  description: string | null;
  author: string | null;
  audio_url: string;
  duration: string | null;
  duration_seconds: number;
  published_at: string | null;
  image_url: string | null;
  file_size: number;
  file_type: string | null;
  created_at: string;
  // Augmented
  podcast_title?: string;
  podcast_author?: string;
  effective_image_url?: string;
  position_seconds?: number;
  is_completed?: number;
  last_played_at?: string;
}

export interface CreatorSummary {
  creator: string;
  podcast_count: number;
  episode_count: number;
  latest_image_url: string | null;
}

export interface PlaybackProgress {
  id: string;
  episode_id: string;
  position_seconds: number;
  duration_seconds: number;
  is_completed: number;
  last_played_at: string;
  episode_title?: string;
  episode_audio_url?: string;
  episode_image_url?: string;
  podcast_id?: string;
  podcast_title?: string;
  podcast_author?: string;
  podcast_image_url?: string;
}
