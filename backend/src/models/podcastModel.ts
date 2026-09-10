import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

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
}

export interface CreatorSummary {
  creator: string;
  podcast_count: number;
  episode_count: number;
  latest_image_url: string | null;
}

export class PodcastModel {
  static async findAll(creatorFilter?: string): Promise<Podcast[]> {
    let sql = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM episodes e WHERE e.podcast_id = p.id) as episode_count
      FROM podcasts p
    `;
    const params: any[] = [];

    if (creatorFilter && creatorFilter.trim() !== '') {
      sql += ` WHERE LOWER(p.author) = LOWER(?)`;
      params.push(creatorFilter.trim());
    }

    sql += ` ORDER BY p.title ASC`;
    return db.query<Podcast>(sql, params);
  }

  static async findById(id: string): Promise<Podcast | null> {
    const sql = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM episodes e WHERE e.podcast_id = p.id) as episode_count
      FROM podcasts p
      WHERE p.id = ?
    `;
    const rows = await db.query<Podcast>(sql, [id]);
    return rows[0] || null;
  }

  static async findByFeedSourceId(feedSourceId: string): Promise<Podcast | null> {
    const sql = `SELECT * FROM podcasts WHERE feed_source_id = ?`;
    const rows = await db.query<Podcast>(sql, [feedSourceId]);
    return rows[0] || null;
  }

  static async findByFeedUrl(feedUrl: string): Promise<Podcast | null> {
    const sql = `SELECT * FROM podcasts WHERE feed_url = ?`;
    const rows = await db.query<Podcast>(sql, [feedUrl]);
    return rows[0] || null;
  }

  static async upsert(data: {
    id?: string;
    feed_source_id: string;
    feed_url: string;
    title: string;
    description?: string | null;
    author?: string | null;
    image_url?: string | null;
    link?: string | null;
    language?: string | null;
    categories?: string | null;
  }): Promise<Podcast> {
    const existing = await this.findByFeedUrl(data.feed_url);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existing) {
      const sql = `
        UPDATE podcasts
        SET feed_source_id = ?,
            title = ?,
            description = ?,
            author = ?,
            image_url = ?,
            link = ?,
            language = ?,
            categories = ?,
            updated_at = ?
        WHERE id = ?
      `;
      await db.execute(sql, [
        data.feed_source_id,
        data.title,
        data.description || null,
        data.author || 'Unknown Creator',
        data.image_url || null,
        data.link || null,
        data.language || null,
        data.categories || null,
        now,
        existing.id,
      ]);
      return (await this.findById(existing.id))!;
    } else {
      const id = data.id || uuidv4();
      const sql = `
        INSERT INTO podcasts (id, feed_source_id, feed_url, title, description, author, image_url, link, language, categories, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.execute(sql, [
        id,
        data.feed_source_id,
        data.feed_url,
        data.title,
        data.description || null,
        data.author || 'Unknown Creator',
        data.image_url || null,
        data.link || null,
        data.language || null,
        data.categories || null,
        now,
        now,
      ]);
      return (await this.findById(id))!;
    }
  }

  static async getDistinctCreators(): Promise<CreatorSummary[]> {
    const sql = `
      SELECT 
        COALESCE(p.author, 'Unknown Creator') as creator,
        COUNT(DISTINCT p.id) as podcast_count,
        COUNT(e.id) as episode_count,
        MAX(p.image_url) as latest_image_url
      FROM podcasts p
      LEFT JOIN episodes e ON e.podcast_id = p.id
      WHERE p.author IS NOT NULL AND TRIM(p.author) != ''
      GROUP BY p.author
      ORDER BY episode_count DESC, creator ASC
    `;
    return db.query<CreatorSummary>(sql);
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM podcasts WHERE id = ?`;
    const result = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}
