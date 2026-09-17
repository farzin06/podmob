# PodMob 🎙️
### Full-Stack Podcast Mobile Application, RSS Ingestion Engine & Discovery Platform

PodMob is a modern, full-stack podcast streaming platform designed with a luxury mobile-first UI (React + TypeScript + Tailwind CSS + Capacitor for Native Android) and a high-performance Express/Node.js backend with automated feed sync, dual-engine database storage (MySQL with automatic SQLite fallback), and live podcast directory search.

---

## 🌟 Key Features

1. **Audiophile Studio UI & Mobile Design**:
   - **Option 4: Audiophile Studio Ribbon**: High-fidelity album artwork with realistic depth shadow and soft ambient glow backdrop.
   - **3-Column Metadata Ribbon Grid**: Displays show metrics (`EPISODES`, `LOCATION`, `LANGUAGE`) with country flag detection and formatted locale.
   - **High-Contrast 1-Tap Playback Bar**: Quick "START LISTENING" action with instant playback.
   - **Transparent Playing Indicators**: Soundwave pill on active episode cards that preserves artwork visibility.
   - **Silky Smooth Navigation Transitions**: Zero-jitter page animations with automatic scroll-to-top position reset.

2. **Discover & Podcast Index Directory**:
   - Live as-you-type autocomplete search with instant suggestions dropdown.
   - Quick topic discovery chips (`Tech & AI`, `News & Politics`, `Science`, `Business`, etc.).
   - 1-tap show preview and library subscription.

3. **Automated Background RSS Sync Engine**:
   - Background cron-like scheduler (`FeedSyncScheduler`) running every 20 minutes and 10s post-boot.
   - Automatically detects and ingests new creator episodes into the database without losing bookmarks or duplicating entries.
   - On-demand global and show-specific re-sync buttons across the app.

4. **Audio Playback Engine & Mini-Player**:
   - **Docked Floating Mini-Player**: Live progress bar, track info, play/pause toggle, and skip controls.
   - **Expandable Full Player Modal**: Glowing disc seekbar, 15s rewind, 30s fast-forward, variable speed selector (0.75x to 2.0x), and full show notes.
   - **Progress Synchronization**: Periodic sync to backend database every 5 seconds.

5. **Layered Backend Architecture**:
   - Clean MVC + Service Pattern: `routes/`, `controllers/`, `services/`, `models/`, `config/`.
   - Robust XML/RSS 2.0 & Atom parser extracting audio enclosures, iTunes durations, and show metadata.
   - Dual-engine storage: MySQL connection pool with automated zero-configuration SQLite fallback.

---

## 📁 Project Structure

```
podmob/
├── backend/                       # Node.js & Express REST API
│   ├── src/
│   │   ├── config/               # Database pool (MySQL / SQLite auto-fallback & schema)
│   │   ├── models/               # Data models (FeedSource, Podcast, Episode, Playback)
│   │   ├── services/             # RSS parser, Feed sync scheduler, Discover search
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── routes/               # Express REST route definitions
│   │   ├── middleware/           # Centralized error handler & logger
│   │   ├── scripts/              # RSS feed integration tests
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # Server entry point with scheduler lifecycle
│   ├── .env                      # Server configuration
│   └── package.json
│
├── frontend/                      # React 18 + Vite + Tailwind CSS + Capacitor
│   ├── src/
│   │   ├── api/                  # Axios API client
│   │   ├── context/              # Audio playback context & state machine
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/                # Formatters (language, location, date, duration)
│   │   ├── components/
│   │   │   ├── EpisodeCard.tsx       # Episode card with transparent soundwave indicator
│   │   │   ├── PodcastCard.tsx       # Grid card for subscribed podcasts
│   │   │   ├── CreatorFilterBar.tsx  # Horizontal Creator filter chips
│   │   │   ├── DiscoverCard.tsx      # Discovered channel card with 1-tap subscribe
│   │   │   ├── DiscoverDetailModal.tsx # Channel preview & episode stream
│   │   │   ├── MiniPlayer.tsx        # Floating bottom dock player
│   │   │   └── FullPlayerModal.tsx   # Expandable glowing disc player
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx        # Library with Creator filter & Continue Listening
│   │   │   ├── DiscoverScreen.tsx    # Live directory search & topic explorer
│   │   │   ├── EpisodesScreen.tsx    # Unified episode feed with live search
│   │   │   ├── PodcastDetailScreen.tsx# Show showcase (Audiophile Studio Ribbon)
│   │   │   └── FeedManagerScreen.tsx # Paste RSS feed URL & sync manager
│   │   ├── App.tsx               # Main mobile viewport shell & navigation tabs
│   │   └── index.css             # Glassmorphism utilities & page transitions
│   ├── android/                  # Native Android Studio / Gradle project
│   ├── capacitor.config.json     # Capacitor configuration
│   └── package.json
│
├── docs/                          # Detailed Technical Documentation
│   ├── ARCHITECTURE.md           # System architecture & component model
│   ├── API_REFERENCE.md          # REST API endpoints & JSON payloads
│   ├── FEED_SYNC_ENGINE.md       # Background cron scheduler & ingestion logic
│   └── ANDROID_BUILD_GUIDE.md    # Android APK compilation guide
│
└── package.json                  # Root workspace helper scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MySQL (Optional: automatically uses SQLite if MySQL is not running)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend will start at `http://localhost:5001`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend web app will run at `http://localhost:5173`.

---

## 📱 Android APK Build

```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
The debug APK is output at `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📚 Documentation Index

- [System Architecture](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API_REFERENCE.md)
- [Background Feed Sync Engine](docs/FEED_SYNC_ENGINE.md)
- [Android Build & Deployment Guide](docs/ANDROID_BUILD_GUIDE.md)

---

## 📄 License
MIT License
