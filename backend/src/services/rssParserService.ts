import Parser from 'rss-parser';
import axios from 'axios';

export interface ParsedEpisode {
  guid: string;
  title: string;
  description: string;
  author: string | null;
  audioUrl: string;
  duration: string | null;
  durationSeconds: number;
  publishedAt: string | null;
  imageUrl: string | null;
  fileSize: number;
  fileType: string | null;
}

export interface ParsedPodcast {
  title: string;
  description: string;
  author: string;
  imageUrl: string | null;
  link: string | null;
  language: string | null;
  categories: string[];
  episodes: ParsedEpisode[];
}

export class RssParserService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        feed: ['itunes:author', 'itunes:image', 'itunes:category', 'language', 'dc:creator', 'copyright'],
        item: [
          'itunes:author',
          'itunes:duration',
          'itunes:image',
          'itunes:summary',
          'itunes:subtitle',
          'itunes:episodeType',
          'dc:creator',
          'enclosure',
          'media:content',
        ],
      },
      headers: {
        'User-Agent': 'PodMob/1.0 (Mobile Podcast Player)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
  }

  public async parseUrl(url: string): Promise<ParsedPodcast> {
    let feed: any;
    try {
      feed = await this.parser.parseURL(url);
    } catch (urlErr) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          responseType: 'text',
          maxRedirects: 5,
        });
        feed = await this.parser.parseString(response.data);
      } catch (axiosErr: any) {
        throw new Error(axiosErr.message || (urlErr as any).message || 'Failed to parse RSS feed');
      }
    }

    // Extract podcast level metadata
    const feedAuthor =
      (feed as any)['itunes:author'] ||
      (feed as any)['dc:creator'] ||
      (feed as any).creator ||
      (feed as any).author ||
      feed.title ||
      'Unknown Creator';

    const feedImage =
      (feed as any)['itunes:image']?.['$']?.href ||
      (feed as any)['itunes:image']?.href ||
      (feed as any).image?.url ||
      (typeof (feed as any).image === 'string' ? (feed as any).image : null) ||
      null;

    const categories: string[] = [];
    if ((feed as any)['itunes:category']) {
      const cat = (feed as any)['itunes:category'];
      if (Array.isArray(cat)) {
        cat.forEach((c) => {
          if (c?.['$']?.text) categories.push(c['$'].text);
          else if (typeof c === 'string') categories.push(c);
        });
      } else if (cat?.['$']?.text) {
        categories.push(cat['$'].text);
      }
    }

    const episodes: ParsedEpisode[] = [];

    for (const item of feed.items || []) {
      const enclosure = item.enclosure;
      const mediaContent = (item as any)['media:content']?.['$'];

      const audioUrl =
        enclosure?.url ||
        mediaContent?.url ||
        (item.link && item.link.endsWith('.mp3') ? item.link : null);

      if (!audioUrl) {
        // Skip items without audio enclosure
        continue;
      }

      const guid = item.guid || item.id || audioUrl;
      const itemTitle = item.title || 'Untitled Episode';
      const itemDescription =
        (item as any)['itunes:summary'] ||
        (item as any)['itunes:subtitle'] ||
        item.contentSnippet ||
        item.content ||
        item.summary ||
        '';

      const itemAuthor =
        (item as any)['itunes:author'] ||
        (item as any)['dc:creator'] ||
        item.creator ||
        feedAuthor;

      const itemImage =
        (item as any)['itunes:image']?.['$']?.href ||
        (item as any)['itunes:image']?.href ||
        feedImage;

      const rawDuration = (item as any)['itunes:duration'];
      const durationSeconds = this.parseDurationSeconds(rawDuration);
      const formattedDuration = this.formatDuration(durationSeconds);

      const publishedAt = item.pubDate || item.isoDate || new Date().toISOString();

      const fileSize = Number(enclosure?.length) || 0;
      const fileType = enclosure?.type || 'audio/mpeg';

      episodes.push({
        guid,
        title: itemTitle,
        description: this.stripHtml(itemDescription),
        author: itemAuthor,
        audioUrl,
        duration: formattedDuration,
        durationSeconds,
        publishedAt: new Date(publishedAt).toISOString().slice(0, 19).replace('T', ' '),
        imageUrl: itemImage,
        fileSize,
        fileType,
      });
    }

    return {
      title: feed.title || 'Untitled Podcast',
      description: this.stripHtml(feed.description || feed.contentSnippet || ''),
      author: feedAuthor,
      imageUrl: feedImage,
      link: feed.link || null,
      language: (feed as any).language || null,
      categories,
      episodes,
    };
  }

  private parseDurationSeconds(rawDuration: any): number {
    if (!rawDuration) return 0;
    if (typeof rawDuration === 'number') return rawDuration;

    const str = String(rawDuration).trim();
    if (/^\d+$/.test(str)) {
      return parseInt(str, 10);
    }

    const parts = str.split(':').map((p) => parseInt(p, 10));
    if (parts.some(isNaN)) return 0;

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  private formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n: number) => (n < 10 ? '0' + n : String(n));

    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const rssParserService = new RssParserService();
