import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface DBAdapter {
  isMySQL: boolean;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: number }>;
  init(): Promise<void>;
  close(): Promise<void>;
}

class DatabaseManager implements DBAdapter {
  public isMySQL: boolean = false;
  private mysqlPool: mysql.Pool | null = null;
  private sqliteDb: Database.Database | null = null;

  public async init(): Promise<void> {
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'podmob';

    // Try connecting to MySQL directly with database
    try {
      this.mysqlPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000,
      });

      try {
        const [rows] = await this.mysqlPool.query('SELECT 1');
      } catch (poolErr: any) {
        // If the database itself doesn't exist, try creating it with temp connection
        if (poolErr.code === 'ER_BAD_DB_ERROR' || poolErr.errno === 1049) {
          const tempConn = await mysql.createConnection({
            host,
            port,
            user,
            password,
            connectTimeout: 3000,
          });
          await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
          await tempConn.end();
        } else {
          throw poolErr;
        }
      }

      this.isMySQL = true;
      console.log(`[Database] Successfully connected to MySQL at ${host}:${port}/${database}`);
    } catch (err: any) {
      console.warn(`[Database] MySQL connection failed (${err.message}). Falling back to local SQLite database.`);
      this.isMySQL = false;
      const dbPath = path.resolve(process.cwd(), 'podmob.sqlite');
      this.sqliteDb = new Database(dbPath);
      // Enable WAL mode for better concurrency
      this.sqliteDb.pragma('journal_mode = WAL');
      console.log(`[Database] Initialized SQLite at ${dbPath}`);
    }

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (this.isMySQL && this.mysqlPool) {
      // Create MySQL tables
      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS feed_sources (
          id VARCHAR(36) PRIMARY KEY,
          url TEXT NOT NULL,
          title VARCHAR(255),
          status VARCHAR(32) DEFAULT 'active',
          last_synced_at DATETIME,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS podcasts (
          id VARCHAR(36) PRIMARY KEY,
          feed_source_id VARCHAR(36),
          feed_url TEXT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          author VARCHAR(255),
          image_url TEXT,
          link TEXT,
          language VARCHAR(32),
          categories TEXT,
          source VARCHAR(64) DEFAULT 'pasted',
          external_id VARCHAR(255) NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_author (author),
          INDEX idx_external_id (external_id),
          FOREIGN KEY (feed_source_id) REFERENCES feed_sources(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS discover_cache (
          id VARCHAR(36) PRIMARY KEY,
          cache_key VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(64) NULL,
          data_json LONGTEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS episodes (
          id VARCHAR(36) PRIMARY KEY,
          podcast_id VARCHAR(36) NOT NULL,
          guid VARCHAR(512) NOT NULL,
          title VARCHAR(512) NOT NULL,
          description LONGTEXT,
          author VARCHAR(255),
          audio_url TEXT NOT NULL,
          duration VARCHAR(64),
          duration_seconds INT DEFAULT 0,
          published_at DATETIME,
          image_url TEXT,
          file_size BIGINT DEFAULT 0,
          file_type VARCHAR(64),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_podcast_id (podcast_id),
          INDEX idx_ep_author (author),
          INDEX idx_published_at (published_at),
          FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS playback_progress (
          id VARCHAR(36) PRIMARY KEY,
          episode_id VARCHAR(36) NOT NULL UNIQUE,
          position_seconds DOUBLE NOT NULL DEFAULT 0,
          duration_seconds DOUBLE NOT NULL DEFAULT 0,
          is_completed TINYINT(1) DEFAULT 0,
          last_played_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } else if (this.sqliteDb) {
      // Create SQLite tables
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS feed_sources (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          title TEXT,
          status TEXT DEFAULT 'active',
          last_synced_at TEXT,
          error_message TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS podcasts (
          id TEXT PRIMARY KEY,
          feed_source_id TEXT,
          feed_url TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          author TEXT,
          image_url TEXT,
          link TEXT,
          language TEXT,
          categories TEXT,
          source TEXT DEFAULT 'pasted',
          external_id TEXT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (feed_source_id) REFERENCES feed_sources(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_podcasts_author ON podcasts(author);
        CREATE INDEX IF NOT EXISTS idx_podcasts_external_id ON podcasts(external_id);

        CREATE TABLE IF NOT EXISTS discover_cache (
          id TEXT PRIMARY KEY,
          cache_key TEXT NOT NULL UNIQUE,
          category TEXT NULL,
          data_json TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS episodes (
          id TEXT PRIMARY KEY,
          podcast_id TEXT NOT NULL,
          guid TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          author TEXT,
          audio_url TEXT NOT NULL,
          duration TEXT,
          duration_seconds INTEGER DEFAULT 0,
          published_at TEXT,
          image_url TEXT,
          file_size INTEGER DEFAULT 0,
          file_type TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
        CREATE INDEX IF NOT EXISTS idx_episodes_author ON episodes(author);
        CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON episodes(published_at);

        CREATE TABLE IF NOT EXISTS playback_progress (
          id TEXT PRIMARY KEY,
          episode_id TEXT NOT NULL UNIQUE,
          position_seconds REAL NOT NULL DEFAULT 0,
          duration_seconds REAL NOT NULL DEFAULT 0,
          is_completed INTEGER DEFAULT 0,
          last_played_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
        );
      `);
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.isMySQL && this.mysqlPool) {
      const [rows] = await this.mysqlPool.query(sql, params);
      return rows as T[];
    } else if (this.sqliteDb) {
      // Normalize parameterized query for sqlite
      const stmt = this.sqliteDb.prepare(sql);
      const rows = stmt.all(...params);
      return rows as T[];
    }
    throw new Error('Database not initialized');
  }

  public async execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number }> {
    if (this.isMySQL && this.mysqlPool) {
      const [result]: any = await this.mysqlPool.execute(sql, params);
      return {
        affectedRows: result.affectedRows || 0,
        insertId: result.insertId,
      };
    } else if (this.sqliteDb) {
      const stmt = this.sqliteDb.prepare(sql);
      const result = stmt.run(...params);
      return {
        affectedRows: result.changes,
        insertId: Number(result.lastInsertRowid),
      };
    }
    throw new Error('Database not initialized');
  }

  public async close(): Promise<void> {
    if (this.mysqlPool) {
      await this.mysqlPool.end();
    }
    if (this.sqliteDb) {
      this.sqliteDb.close();
    }
  }
}

export const db = new DatabaseManager();
