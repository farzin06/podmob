import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface PlaybackProgress {
  id: string;
  episode_id: string;
  position_seconds: number;
  duration_seconds: number;
  is_completed: number;
  last_played_at: string;
  // Joined fields
  episode_title?: string;
  episode_audio_url?: string;
  episode_image_url?: string;
  podcast_id?: string;
  podcast_title?: string;
  podcast_author?: string;
  podcast_image_url?: string;
}

export class PlaybackModel {
  static async findByEpisodeId(episodeId: string): Promise<PlaybackProgress | null> {
    const sql = `SELECT * FROM playback_progress WHERE episode_id = ?`;
    const rows = await db.query<PlaybackProgress>(sql, [episodeId]);
    return rows[0] || null;
  }

  static async saveProgress(
    episodeId: string,
    positionSeconds: number,
    durationSeconds: number,
    isCompleted?: boolean
  ): Promise<PlaybackProgress | null> {
    try {
      // Check if episode exists in database first
      const episodeExists = await db.query(`SELECT id FROM episodes WHERE id = ? LIMIT 1`, [episodeId]);
      if (!episodeExists || episodeExists.length === 0) {
        // Episode is a live preview / not subscribed yet, skip saving progress
        return null;
      }

      const existing = await this.findByEpisodeId(episodeId);
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const completed = isCompleted ? 1 : positionSeconds / Math.max(durationSeconds, 1) > 0.95 ? 1 : 0;

      if (existing) {
        const sql = `
          UPDATE playback_progress
          SET position_seconds = ?,
              duration_seconds = ?,
              is_completed = ?,
              last_played_at = ?
          WHERE episode_id = ?
        `;
        await db.execute(sql, [positionSeconds, durationSeconds, completed, now, episodeId]);
      } else {
        const id = uuidv4();
        const sql = `
          INSERT INTO playback_progress (id, episode_id, position_seconds, duration_seconds, is_completed, last_played_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.execute(sql, [id, episodeId, positionSeconds, durationSeconds, completed, now]);
      }

      return await this.findByEpisodeId(episodeId);
    } catch (err: any) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
        return null;
      }
      throw err;
    }
  }

  static async getRecentlyPlayed(limit = 10): Promise<PlaybackProgress[]> {
    const sql = `
      SELECT 
        pp.*,
        e.title as episode_title,
        e.audio_url as episode_audio_url,
        e.image_url as episode_image_url,
        p.id as podcast_id,
        p.title as podcast_title,
        p.author as podcast_author,
        p.image_url as podcast_image_url
      FROM playback_progress pp
      JOIN episodes e ON e.id = pp.episode_id
      JOIN podcasts p ON p.id = e.podcast_id
      ORDER BY pp.last_played_at DESC
      LIMIT ?
    `;
    return db.query<PlaybackProgress>(sql, [limit]);
  }
}
