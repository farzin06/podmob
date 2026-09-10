import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

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
  podcast_author?: string;
  podcast_image_url?: string;
}

export class FeedSourceModel {
  static async findAll(): Promise<FeedSource[]> {
    const sql = `
      SELECT 
        fs.*,
        p.id as podcast_id,
        p.title as podcast_title,
        p.author as podcast_author,
        p.image_url as podcast_image_url,
        (SELECT COUNT(*) FROM episodes e WHERE e.podcast_id = p.id) as episode_count
      FROM feed_sources fs
      LEFT JOIN podcasts p ON p.feed_source_id = fs.id
      ORDER BY fs.created_at DESC
    `;
    return db.query<FeedSource>(sql);
  }

  static async findById(id: string): Promise<FeedSource | null> {
    const sql = `
      SELECT 
        fs.*,
        p.id as podcast_id,
        p.title as podcast_title,
        p.author as podcast_author,
        p.image_url as podcast_image_url,
        (SELECT COUNT(*) FROM episodes e WHERE e.podcast_id = p.id) as episode_count
      FROM feed_sources fs
      LEFT JOIN podcasts p ON p.feed_source_id = fs.id
      WHERE fs.id = ?
    `;
    const rows = await db.query<FeedSource>(sql, [id]);
    return rows[0] || null;
  }

  static async findByUrl(url: string): Promise<FeedSource | null> {
    const sql = `SELECT * FROM feed_sources WHERE url = ?`;
    const rows = await db.query<FeedSource>(sql, [url]);
    return rows[0] || null;
  }

  static async create(url: string, title?: string): Promise<FeedSource> {
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = `
      INSERT INTO feed_sources (id, url, title, status, created_at, updated_at)
      VALUES (?, ?, ?, 'syncing', ?, ?)
    `;
    await db.execute(sql, [id, url, title || null, now, now]);
    const created = await this.findById(id);
    return created!;
  }

  static async updateStatus(
    id: string,
    status: 'active' | 'syncing' | 'error',
    title?: string | null,
    errorMessage?: string | null
  ): Promise<void> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = `
      UPDATE feed_sources
      SET status = ?, 
          title = COALESCE(?, title),
          error_message = ?,
          last_synced_at = ?,
          updated_at = ?
      WHERE id = ?
    `;
    await db.execute(sql, [status, title ?? null, errorMessage ?? null, now, now, id]);
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM feed_sources WHERE id = ?`;
    const result = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}
