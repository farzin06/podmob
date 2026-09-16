import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface PodcastIndexConfig {
  baseUrl: string;
  userAgent: string;
  apiKey?: string;
  apiSecret?: string;
  timeoutMs: number;
}

export const podcastIndexConfig: PodcastIndexConfig = {
  baseUrl: process.env.PODCAST_INDEX_BASE_URL || 'https://api.podcastindex.org',
  userAgent: process.env.PODCAST_INDEX_USER_AGENT || 'PodMob/1.0',
  apiKey: process.env.PODCAST_INDEX_API_KEY,
  apiSecret: process.env.PODCAST_INDEX_API_SECRET,
  timeoutMs: 8000,
};

/**
 * Pre-configured Axios instance for Podcast Index API
 */
export const podcastIndexClient: AxiosInstance = axios.create({
  baseURL: podcastIndexConfig.baseUrl,
  timeout: podcastIndexConfig.timeoutMs,
  headers: {
    'User-Agent': podcastIndexConfig.userAgent,
    'Accept': 'application/json',
  },
});
