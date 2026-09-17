# PodMob Architecture & System Design

PodMob is a full-stack, mobile-first podcast streaming application designed for cross-platform delivery (Web & Native Android via Capacitor).

---

## 1. System Overview

```
+--------------------------------------------------------------------------------+
|                                 PodMob Client                                  |
|  (React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Capacitor 7)   |
+------------------------------------+-------------------------------------------+
                                     |
                                     | HTTP / REST (Axios)
                                     v
+--------------------------------------------------------------------------------+
|                             Express Backend Server                             |
|                   (Node.js + TypeScript + tsx / esbuild)                       |
+------------------------------------+-------------------------------------------+
| • Routes (`/api/feed-sources`, `/api/podcasts`, `/api/episodes`, etc.)         |
| • Controllers (Request handling & validation)                                  |
| • Services (RSS Parser, Feed Sync Scheduler, Discover Search)                  |
| • Models (Data access abstraction)                                            |
+------------------------------------+-------------------------------------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
      +--------------------+                   +--------------------+
      |    MySQL Server    |  (Auto-Fallback)  | SQLite Database    |
      |   (Production/Dev) | ----------------> |  (Local Zero-Conf) |
      +--------------------+                   +--------------------+
```

---

## 2. Backend Layer Architecture

The backend follows the **Layered MVC + Service** architectural pattern:

### 1. Database Access Layer (`src/config/db.ts` & `src/models/`)
- **Dual-Engine Auto Fallback**: PodMob attempts connection to MySQL with connection pooling. If MySQL is unreachable, it seamlessly switches to local SQLite (`podmob.sqlite`) without requiring developer intervention.
- **Auto-Migration**: Tables (`feed_sources`, `podcasts`, `episodes`, `playback_progress`) and schema indexes are automatically created on server boot.
- **Models**:
  - `FeedSourceModel`: Manages user-subscribed RSS feed URLs, statuses, and sync timestamps.
  - `PodcastModel`: Manages show metadata, creators/authors, images, and category tags.
  - `EpisodeModel`: Handles episode records, audio enclosure URLs, durations, and idempotent upserts keyed by `(podcast_id, guid)`.
  - `PlaybackModel`: Tracks playback position, total duration, and completed status per episode.

### 2. Services Layer (`src/services/`)
- **`rssParserService.ts`**: High-performance XML/RSS 2.0 & Atom feed parser extracting enclosures, iTunes tags (`itunes:image`, `itunes:duration`, `itunes:author`), and timestamps.
- **`feedSourceService.ts`**: Coordinates feed validation, parsing, show upsertion, and episode synchronization.
- **`feedSyncScheduler.ts`**: Background cron-like scheduler running every 20 minutes (and 10s post-boot) to check all subscribed feeds for new creator episodes without duplicating or disrupting playback state.
- **`discoverService.ts`**: Interfaces with the Podcast Index API for real-time channel search, trending discovery, category lookups, and direct feed previewing.

### 3. Controller & Routing Layer (`src/controllers/` & `src/routes/`)
- Pure asynchronous controllers with centralized error handling.
- RESTful routes mapped under `/api/`.

---

## 3. Frontend Architecture

### 1. State & Audio Engine (`src/context/AudioContext.tsx`)
- Centralized audio playback engine managing:
  - HTML5 Audio instance lifecycle.
  - Current playing track, duration, position, buffering state, and playback rates (0.75x to 2.0x).
  - Continuous background progress synchronization to backend (`/api/playback/progress`) every 5 seconds.
  - Fullscreen player and floating mini-player coordination.

### 2. Screen & Component Hierarchy
- **`HomeScreen.tsx`**: Library overview, horizontal creator filter chips, continue listening row, and subscribed shows grid.
- **`DiscoverScreen.tsx`**: Live search with as-you-type autocomplete dropdown, topic presets, and category explorer.
- **`EpisodesScreen.tsx`**: Unified global episodes feed with live search and creator filtering.
- **`PodcastDetailScreen.tsx`**: Show view featuring **Option 4: Audiophile Studio Ribbon**, metadata grid (Episodes, Location, Language), full-width Start Listening button, and show episode stream.
- **`DiscoverDetailModal.tsx`**: Instant preview and 1-tap subscription for newly discovered channels.
- **`MiniPlayer.tsx` & `FullPlayerModal.tsx`**: Ergonomic audio controls with glowing seekbar and speed presets.

---

## 4. Mobile Native Bridge (Capacitor)

- Uses `@capacitor/core` and `@capacitor/android` to package the Vite single-page web app into a native Android APK.
- Dynamic network detection (`src/api/client.ts`) automatically resolves `localhost:5001` for desktop browser testing and local network IP (e.g. `http://192.168.1.152:5001/api`) for physical mobile hardware and Android emulators.
