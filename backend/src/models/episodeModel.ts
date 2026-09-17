import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface Episode {
  id: string;
  podcast_id: string;
  guid: string;
  title: string;
  description: string | null;
  author: string | null; // Creator
  audio_url: string;
  duration: string | null;
  duration_seconds: number;
  published_at: string | null;
  image_url: string | null;
  file_size: number;
  file_type: string | null;
  created_at: string;
  // Joined fields
  podcast_title?: string;
  podcast_image_url?: string;
  position_seconds?: number;
  is_completed?: number;
  last_played_at?: string;
}

export interface EpisodeFilterOptions {
  podcastId?: string;
  creator?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class EpisodeModel {
  static async findFiltered(options: EpisodeFilterOptions = {}): Promise<{ episodes: Episode[]; total: number }> {
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (options.podcastId) {
      whereClauses.push(`e.podcast_id = ?`);
      params.push(options.podcastId);
    }

    if (options.creator && options.creator.trim() !== '') {
      whereClauses.push(`(LOWER(e.author) = LOWER(?) OR LOWER(p.author) = LOWER(?))`);
      params.push(options.creator.trim(), options.creator.trim());
    }

    if (options.search && options.search.trim() !== '') {
      whereClauses.push(`(e.title LIKE ? OR e.description LIKE ?)`);
      const searchWildcard = `%${options.search.trim()}%`;
      params.push(searchWildcard, searchWildcard);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as count 
      FROM episodes e
      JOIN podcasts p ON p.id = e.podcast_id
      ${whereSql}
    `;
    const countResult = await db.query<{ count: number }>(countSql, params);
    const total = countResult[0]?.count || 0;

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const selectSql = `
      SELECT 
        e.*,
        p.title as podcast_title,
        p.author as podcast_author,
        COALESCE(e.image_url, p.image_url) as effective_image_url,
        COALESCE(pp.position_seconds, 0) as position_seconds,
        COALESCE(pp.is_completed, 0) as is_completed,
        pp.last_played_at
      FROM episodes e
      JOIN podcasts p ON p.id = e.podcast_id
      LEFT JOIN playback_progress pp ON pp.episode_id = e.id
      ${whereSql}
      ORDER BY e.published_at DESC, e.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const episodes = await db.query<Episode>(selectSql, [...params, limit, offset]);

    return { episodes, total };
  }

  static async findById(id: string): Promise<Episode | null> {
    const sql = `
      SELECT 
        e.*,
        p.title as podcast_title,
        p.author as podcast_author,
        p.image_url as podcast_image_url,
        COALESCE(e.image_url, p.image_url) as effective_image_url,
        COALESCE(pp.position_seconds, 0) as position_seconds,
        COALESCE(pp.is_completed, 0) as is_completed,
        pp.last_played_at
      FROM episodes e
      JOIN podcasts p ON p.id = e.podcast_id
      LEFT JOIN playback_progress pp ON pp.episode_id = e.id
      WHERE e.id = ?
    `;
    const rows = await db.query<Episode>(sql, [id]);
    return rows[0] || null;
  }

  static async findByGuid(podcastId: string, guid: string): Promise<Episode | null> {
    const sql = `SELECT * FROM episodes WHERE podcast_id = ? AND guid = ?`;
    const rows = await db.query<Episode>(sql, [podcastId, guid]);
    return rows[0] || null;
  }

  static async upsert(data: {
    podcast_id: string;
    guid: string;
    title: string;
    description?: string | null;
    author?: string | null;
    audio_url: string;
    duration?: string | null;
    duration_seconds?: number;
    published_at?: string | null;
    image_url?: string | null;
    file_size?: number;
    file_type?: string | null;
  }): Promise<{ isNew: boolean; id: string }> {
    const existing = await this.findByGuid(data.podcast_id, data.guid);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existing) {
      const sql = `
        UPDATE episodes
        SET title = ?,
            description = ?,
            author = ?,
            audio_url = ?,
            duration = ?,
            duration_seconds = ?,
            published_at = ?,
            image_url = ?,
            file_size = ?,
            file_type = ?
        WHERE id = ?
      `;
      await db.execute(sql, [
        data.title,
        data.description || null,
        data.author || null,
        data.audio_url,
        data.duration || null,
        data.duration_seconds || 0,
        data.published_at || null,
        data.image_url || null,
        data.file_size || 0,
        data.file_type || null,
        existing.id,
      ]);
      return { isNew: false, id: existing.id };
    } else {
      const id = uuidv4();
      const sql = `
        INSERT INTO episodes (
          id, podcast_id, guid, title, description, author, 
          audio_url, duration, duration_seconds, published_at, 
          image_url, file_size, file_type, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.execute(sql, [
        id,
        data.podcast_id,
        data.guid,
        data.title,
        data.description || null,
        data.author || null,
        data.audio_url,
        data.duration || null,
        data.duration_seconds || 0,
        data.published_at || null,
        data.image_url || null,
        data.file_size || 0,
        data.file_type || null,
        now,
      ]);
      return { isNew: true, id };
    }
  }

  static async deleteByPodcastId(podcastId: string): Promise<void> {
    const sql = `DELETE FROM episodes WHERE podcast_id = ?`;
    await db.execute(sql, [podcastId]);
  }
}
