# PodMob 🎙️
### Full-Stack Podcast Mobile Application & RSS Ingestion System

PodMob is a podcast listening application featuring a **pure React Native frontend** (no Expo dependencies) and a decoupled **Node.js/Express layered backend** (Routes → Controllers → Services → Models with MySQL/SQLite).

---

## 🌟 Key Features

1. **Pasted RSS Feeds Manager & URL List**:
   - Dedicated feed management screen to paste any podcast RSS/Atom feed URL.
   - Live sync status indicators (`ACTIVE`, `SYNCING`, `ERROR`), episode count, last sync timestamp, and re-sync/delete controls.
   - One-tap preset importer for popular shows (Lex Fridman, NPR News Now, BBC Global News, Huberman Lab).

2. **Creator-Based Filtering & Organization**:
   - Shows and episodes are indexed by Creator/Author in the database.
   - Interactive creator filter chips (`All Creators`, `Lex Fridman`, `BBC World Service`, `NPR`, etc.) to filter your entire podcast library and episode feed by specific creators with a single tap.

3. **Audio Playback Engine & UI**:
   - **Floating Mini-Player**: Bottom docked player with live progress bar, play/pause toggle, and skip controls.
   - **Full-Screen Player Modal**: High-resolution artwork, scrubable progress slider, 15-second rewind, 30-second fast forward, variable playback speed selector (0.75x, 1.0x, 1.25x, 1.5x, 2.0x), and episode show notes.
   - **Progress Persistence**: Auto-syncs playback progress and resume bookmarks to the backend database.

4. **Modular Backend Architecture**:
   - Layered MVC + Service Pattern: `routes/`, `controllers/`, `services/`, `models/`, `config/`.
   - Robust RSS Parser extracting audio enclosures, iTunes durations, and show metadata.
   - MySQL database connection pooling with automated schema migration & SQLite fallback for zero-configuration startup.

---

## 📁 Project Structure

```
podmob/
├── backend/                       # Node.js & Express REST API
│   ├── src/
│   │   ├── config/               # DB connection (MySQL/SQLite pool & auto-migration)
│   │   ├── models/               # Data access layer (FeedSource, Podcast, Episode, Playback)
│   │   ├── services/             # RSS parser, Creator aggregator, Feed sync
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── routes/               # Express route definitions
│   │   ├── middleware/           # Centralized error handler & logger
│   │   ├── scripts/              # RSS feed integration tests
│   │   ├── app.ts                # Express application setup
│   │   └── server.ts             # Server entry point
│   ├── .env                      # Database & Port configuration
│   └── package.json
│
├── frontend/                      # Pure React Native Mobile Application
│   ├── src/
│   │   ├── api/                  # Axios API client
│   │   ├── context/              # Global Audio Player Context & Playback state
│   │   ├── theme/                # Color tokens & typography
│   │   ├── types/                # TypeScript models
│   │   ├── components/
│   │   │   ├── CreatorFilterBar.tsx  # Horizontal Creator filter chips
│   │   │   ├── FeedUrlList.tsx       # Pasted RSS feeds list with sync badges
│   │   │   ├── EpisodeCard.tsx       # Episode card with audio player trigger
│   │   │   ├── PodcastCard.tsx       # Podcast show card for grid view
│   │   │   ├── MiniPlayer.tsx        # Floating bottom mini-player
│   │   │   └── FullPlayerModal.tsx   # Expandable player modal with scrub & speeds
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx        # Library with Creator filter & Continue Listening
│   │   │   ├── FeedManagerScreen.tsx # Paste RSS feed URL & manage pasted feeds
│   │   │   ├── EpisodesScreen.tsx    # All episodes feed with search & creator filter
│   │   │   └── PodcastDetailScreen.tsx# Single show view & episode search
│   │   ├── App.tsx               # Main mobile layout & navigation tabs
│   │   └── main.tsx              # Web entry point
│   ├── vite.config.ts            # Bundler config with React Native Web support
│   └── package.json
│
└── package.json                  # Root workspace helper scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL (Optional: app automatically uses SQLite if MySQL is not running)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend will start at `http://localhost:5001`.

To test RSS ingestion with real-world feeds:
```bash
npm run test:rss
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:3000`.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/feed-sources` | List all pasted RSS feed URLs with sync status |
| `POST` | `/api/feed-sources` | Paste & sync a new RSS feed URL |
| `POST` | `/api/feed-sources/preview` | Preview feed metadata from URL without saving |
| `POST` | `/api/feed-sources/:id/sync` | Force re-sync of a pasted feed |
| `DELETE` | `/api/feed-sources/:id` | Remove a feed source and associated podcasts |
| `GET` | `/api/podcasts` | Get all podcasts (supports `?creator=...`) |
| `GET` | `/api/podcasts/creators` | Get all distinct creators with show/episode counts |
| `GET` | `/api/podcasts/:id` | Get podcast metadata with episode list |
| `GET` | `/api/episodes` | Filter episodes (`?creator=...&podcastId=...&search=...`) |
| `POST` | `/api/playback/progress` | Save current playback position |
| `GET` | `/api/playback/recent` | Get recently played episode bookmarks |
