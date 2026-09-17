# PodMob REST API Reference

Base URL: `http://<host>:5001/api`

All responses follow a standard JSON envelope:
```json
{
  "success": true,
  "message": "Optional status message",
  "data": { ... }
}
```

---

## 1. Feed Sources (`/api/feed-sources`)

### `GET /api/feed-sources`
Get all subscribed RSS feed sources with their sync status and episode counts.

### `POST /api/feed-sources`
Subscribe to a new RSS feed URL and immediately ingest its episodes.
- **Body**:
  ```json
  {
    "url": "https://lexfridman.com/feed/podcast/",
    "title": "Lex Fridman Podcast" // Optional
  }
  ```

### `POST /api/feed-sources/sync-all`
Trigger an on-demand synchronization of all registered feeds.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Sync complete: 4/4 feeds synced. Found 2 new episodes.",
    "data": {
      "totalSources": 4,
      "syncedCount": 4,
      "failedCount": 0,
      "newEpisodes": 2,
      "results": [ ... ]
    }
  }
  ```

### `POST /api/feed-sources/:id/sync`
Re-sync a specific feed source by ID.

### `DELETE /api/feed-sources/:id`
Delete a feed source, its podcast metadata, and associated episodes from the library.

### `POST /api/feed-sources/preview`
Inspect and parse an RSS feed URL without saving it to the database.

---

## 2. Podcasts (`/api/podcasts`)

### `GET /api/podcasts`
List all subscribed podcasts in the library.
- **Query Params**:
  - `creator` *(string, optional)*: Filter podcasts by author/creator.

### `GET /api/podcasts/creators`
Get a summary list of all unique creators and their respective show/episode counts.

### `GET /api/podcasts/:id`
Get full details for a podcast along with its complete list of episodes.

### `DELETE /api/podcasts/:id`
Remove a podcast and its episodes.

---

## 3. Episodes (`/api/episodes`)

### `GET /api/episodes`
Retrieve a paginated, unified list of episodes across all subscribed podcasts.
- **Query Params**:
  - `creator` *(string, optional)*: Filter by author name.
  - `podcastId` *(string, optional)*: Filter by podcast ID.
  - `search` *(string, optional)*: Text search matching episode title or description.
  - `limit` *(number, default 50)*: Maximum number of records to return.
  - `offset` *(number, default 0)*: Pagination offset.

### `GET /api/episodes/:id`
Retrieve a single episode by ID.

---

## 4. Playback Progress (`/api/playback`)

### `POST /api/playback/progress`
Update listening progress for an episode.
- **Body**:
  ```json
  {
    "episodeId": "uuid-v4",
    "positionSeconds": 1420,
    "durationSeconds": 3600,
    "isCompleted": false
  }
  ```

### `GET /api/playback/recent`
Get the user's recently played episodes with bookmarks for the "Continue Listening" row.
- **Query Params**:
  - `limit` *(number, default 10)*

---

## 5. Discover & Podcast Index (`/api/discover`)

### `GET /api/discover/search`
Search live global podcast directory.
- **Query Params**:
  - `term` *(string)*: Search keywords (show title, host, topic).
  - `category` *(string, optional)*: Category filter.

### `GET /api/discover/trending`
Retrieve trending podcast channels.
- **Query Params**:
  - `category` *(string, optional)*

### `GET /api/discover/categories`
Get list of available podcast categories.

### `GET /api/discover/lookup/:id`
Inspect a channel by its external Podcast Index ID to preview sample episodes.

### `POST /api/discover/subscribe`
1-tap subscribe to a channel found via Discover.
- **Body**:
  ```json
  {
    "feedUrl": "https://feeds.bbci.co.uk/podcasts/p02nq0gn/rss.xml",
    "title": "Global News Podcast",
    "externalId": "12345"
  }
  ```
