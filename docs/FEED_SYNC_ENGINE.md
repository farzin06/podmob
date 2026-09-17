# Background Feed Sync Engine

PodMob includes an automated background synchronization scheduler that periodically checks creator RSS feeds for newly published episodes and ingests them into the library.

---

## 1. How It Works

1. **Scheduler Lifecycle (`FeedSyncScheduler.ts`)**:
   - Initialized when the Express server starts (`FeedSyncScheduler.init(20)` in `server.ts`).
   - Runs an immediate startup check **10 seconds after server launch**.
   - Schedules periodic sync cycles every **20 minutes** (configurable).
   - Gracefully clears intervals upon server termination (`SIGINT` / `SIGTERM`).

2. **Concurrency Protection**:
   - Uses an atomic `isRunning` guard. If a scheduled sync is in progress or a user manually triggers an on-demand sync, overlapping jobs are skipped to prevent database lockups or duplicate network requests.

3. **Idempotent Ingestion (`EpisodeModel.upsert()`)**:
   - Each episode in an RSS feed has a unique GUID.
   - If the episode already exists for the show, its metadata and enclosure URL are updated while preserving the existing database ID and user's playback progress.
   - If the episode is newly published, a new UUID is generated and the scheduler logs the addition.

---

## 2. On-Demand Sync

In addition to background cron runs, users can trigger on-demand sync from the UI:
- **`HomeScreen.tsx`**: Tapping the top-bar Refresh button re-syncs all feeds before reloading the library.
- **`EpisodesScreen.tsx`**: Header refresh button syncs all feeds and updates the unified stream.
- **`PodcastDetailScreen.tsx`**: Show-specific refresh button syncs the selected podcast's RSS feed.

---

## 3. Configuration

In `backend/.env` or when initializing:
```ts
// Set sync interval in minutes (default is 20)
FeedSyncScheduler.init(20);
```
