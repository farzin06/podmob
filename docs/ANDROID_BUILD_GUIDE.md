# PodMob Android Build & Deployment Guide

This guide walks through building the native Android APK for PodMob using Capacitor.

---

## 1. Prerequisites

- **Node.js**: v18 or newer
- **Java Development Kit (JDK)**: JDK 17 or JDK 21
- **Android SDK & Build Tools**: Android Studio / Command-line Tools
- **Gradle**: Included as a wrapper (`./gradlew`) in `frontend/android/`

---

## 2. Step-by-Step Build Workflow

### Step 1: Build the Web Distribution
```bash
cd frontend
npm run build
```
This runs TypeScript checking and Vite production bundling into `frontend/dist/`.

### Step 2: Sync Web Assets to Android Project
```bash
npx cap sync android
```
This copies the bundled assets into `frontend/android/app/src/main/assets/public/` and updates Capacitor plugins.

### Step 3: Compile the Android APK
```bash
cd android
./gradlew assembleDebug
```

The output APK will be generated at:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Connecting to the Backend from Android Devices

When running the APK on a physical Android phone or emulator:
1. Ensure your phone and development computer are connected to the same Wi-Fi network.
2. In `frontend/src/api/client.ts`, configure your local computer's IP address:
   ```ts
   return 'http://<your-lan-ip>:5001/api';
   ```
3. Start the backend server on `0.0.0.0`:
   ```bash
   cd backend
   npm run dev
   ```
4. Rebuild the frontend and sync:
   ```bash
   cd frontend
   npm run build && npx cap sync android
   cd android && ./gradlew assembleDebug
   ```
