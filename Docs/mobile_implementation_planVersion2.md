# 📋 Mobile Implementation Plan — Version 2
**Project:** Agro AI Health | **Platform:** Flutter (Android / iOS)
**Status:** UI Foundation ✅ · Wiring & Logic 🚧

---

## Overview

This document breaks down every implementation task into concrete, developer-assignable subtasks. It is the **primary reference** for the mobile developer to track progress from UI wiring through to production release.

> **Key Architecture Decision:** The `plant_disease_model.pt` (ResNet-50, 32 classes) is **bundled inside the Flutter app** and runs on-device via `pytorch_lite`. Scanning works 100% without internet. When online, results sync to the backend for history.

---

## Phase 0 · Offline-First Infrastructure *(Do This Before Everything Else)*
**Goal:** Lay the local database and sync engine foundation that every other feature depends on.

| # | Task | Tool | Notes |
|---|---|---|---|
| 0.1 | Add `isar`, `isar_flutter_libs`, `workmanager`, `connectivity_plus`, `path_provider` packages | `isar` | Fast reactive NoSQL embedded DB |
| 0.2 | Define **Isar schemas**: `PendingScan`, `CachedDetection`, `CachedPost`, `SyncQueueItem` | Isar | Run `build_runner` to generate `.g.dart` files |
| 0.3 | Create `LocalDatabase` singleton to open and expose the Isar instance | — | Open once in `main()` |
| 0.4 | Create `SyncService` class with `flushQueue()` method | — | Reads all unsynced items, POSTs them, marks synced |
| 0.5 | Register `WorkManager` periodic task (`agro-sync-task`, every 15 min) | `workmanager` | Only runs when `NetworkType.connected` |
| 0.6 | Set up `connectivity_plus` stream in a global `NetworkStatusNotifier` | Riverpod | On reconnect → call `SyncService().flushQueue()` |
| 0.7 | Create `NetworkStatusBanner` widget (shows "Offline — changes will sync" when disconnected) | — | Display at the top of all screens |
| 0.8 | Write unit tests for `SyncService.flushQueue()` using mocked Dio | — | |
| **0.9** | **Convert `plant_disease_model.pt` → `plant_disease_model.ptl`** (TorchScript Mobile) | Python | Run `torch.jit.script(model)._save_for_lite_interpreter(...)` on dev machine |
| **0.10** | **Bundle `.ptl` + `class_names.json` into `assets/ml/`** and declare in `pubspec.yaml` | — | ~80–150 MB depending on model size |

---

## Phase 1 · Foundation & Authentication
**Goal:** App launches, tokens are persisted, and users can register / log in.

| # | Task | API | Notes |
|---|---|---|---|
| 1.1 | Create `DioClient` with base URL + headers | — | Support both localhost & production URL via `.env` |
| 1.2 | Add `AuthInterceptor` to attach JWT on every request | — | Read token from `flutter_secure_storage` |
| 1.3 | Add `ErrorInterceptor` to handle 401 auto-logout | — | Use `go_router` to redirect to `/login` |
| 1.4 | Define `UserModel` (id, name, email, avatar, createdAt) | — | Use `json_serializable` |
| 1.5 | Define `AuthRepository` (register, login, getMe) | `POST /auth/register` `POST /auth/login` `GET /auth/me` | Return typed models |
| 1.6 | Wire **Login Screen** with `AuthNotifier` (Riverpod) | `POST /auth/login` | Show loading + error states |
| 1.7 | Wire **Signup Screen** | `POST /auth/register` | Validate all fields before submit |
| 1.8 | Implement **Splash Screen** token check | `GET /auth/me` | Route to `/dashboard` or `/login` |
| 1.9 | Implement **Forgot Password** UI (show "contact support" message) | — | No backend endpoint yet |

---

## Phase 2 · AI Disease Detection *(100% Offline — On-Device Inference)*
**Goal:** User takes/picks a leaf photo and gets an instant AI diagnosis — no internet required.

| # | Task | Tool / API | Notes |
|---|---|---|---|
| 2.1 | Add `pytorch_lite` package | `pytorch_lite` | Enables `.ptl` model inference in Flutter |
| 2.2 | Create `lib/ml/plant_model.dart` with `PlantModel.init()` and `PlantModel.predict(File)` | `pytorch_lite` | Init once in `main()` before `runApp()` |
| 2.3 | Create `lib/ml/image_processor.dart` — resize 224×224, normalize ImageNet mean/std | — | Mirror `predict.py` transforms exactly |
| 2.4 | Add `image_picker` + `camera` and handle permissions | — | Handle denial gracefully with a dialog |
| 2.5 | Add `flutter_image_compress` (compress for upload only, not for local inference) | — | Target < 1 MB for sync |
| **2.6** | **Wire scan button: pick/capture image → run `PlantModel.predict()` → show result instantly** | On-device | No network call needed |
| 2.7 | Save result to `CachedDetection` Isar collection immediately | Isar | id, disease, confidence, predictions[], localImagePath, isSynced=false |
| 2.8 | Show **scan overlay animation** while model runs (≈ 1–3 sec on device) | — | Pulse / shimmer on leaf image |
| 2.9 | Build **Result Screen**: disease label, confidence bar, top-3 predictions | — | Read from Isar, fully offline |
| 2.10 | Display treatment recommendations (from hardcoded `disease_treatments.dart` map or Isar) | — | Same data as backend `Disease` collection |
| **2.11** | **When online: POST image + local result to `/detect`** for server-side history record | `POST /detect` | Mark `isSynced=true` in Isar after success |
| 2.12 | If offline: add to `SyncQueueItem` → auto-syncs via WorkManager | Isar SyncQueue | |
| 2.13 | "Share Result" button (export card as image) | `screenshot` + `share_plus` | |

---

## Phase 3 · Dashboard & Scan History
**Goal:** A rich dashboard showing stats and easy access to all past scans.

| # | Task | API | Notes |
|---|---|---|---|
| 3.1 | Fetch scan history | `GET /detect/history` | With pagination support |
| 3.2 | **Write all fetched results to `CachedDetection` Isar collection** | — | **Read from Isar first, API second** |
| 3.3 | Dashboard stat widgets: Total Scans, Most Common Disease, Last Scan | — | Derivations from Isar query |
| 3.4 | Recent scans horizontal scroll list on Dashboard | — | Pull-to-refresh triggers API sync |
| 3.5 | **Scan History Screen** — full list with filters (date, disease type) | `GET /detect/history` | Data from Isar (instant load) |
| 3.6 | Tap scan → navigate to Result Screen | `GET /detect/:id` | Served from `CachedDetection` if available |

---

## Phase 4 · Crop Calendar
**Goal:** Seasonal sowing/harvest schedule overlaid with the user's scan activity.

| # | Task | Notes |
|---|---|---|
| 4.1 | Add `table_calendar` dependency | |
| 4.2 | Hardcode Pakistan crop schedule (Rabi / Kharif seasons) | Cover: Wheat, Rice, Cotton, Sugarcane, Maize |
| 4.3 | Load scan history and map `createdAt` dates to calendar events | |
| 4.4 | Calendar markers: 🟢 healthy scan, 🔴 disease detected | |
| 4.5 | Tap day → show bottom sheet of scans on that day | |
| 4.6 | Season banner on calendar header (current season name + dates) | |

---

## Phase 5 · Field Health Map
**Goal:** Farmers can mark their fields on a map and see disease heatmaps.

| # | Task | Notes |
|---|---|---|
| 5.1 | Add `flutter_map` (or `google_maps_flutter`) + `geolocator` | |
| 5.2 | Request location permission on first open | |
| 5.3 | Center map on user's current GPS location | |
| 5.4 | Allow users to tap/draw polygon boundaries for fields | Use `flutter_map_marker_popup` or custom painter |
| 5.5 | Save field boundaries locally (`hive`) — backend endpoint TBD | |
| 5.6 | Place disease markers from scan history on the map | Color-code by severity |
| 5.7 | Tap marker → show scan result mini card | |

---

## Phase 6 · Disease Trends
**Goal:** Visual analytics of detected diseases over time.

| # | Task | Notes |
|---|---|---|
| 6.1 | Add `fl_chart` dependency | |
| 6.2 | Aggregate scan history: count per disease | |
| 6.3 | **Bar chart:** Top 5 most detected diseases | |
| 6.4 | **Line chart:** Weekly scan frequency (scans per week) | |
| 6.5 | "Most at-risk crop this month" badge on Dashboard | |
| 6.6 | Tap chart bar → show all scans of that disease type | |

---

## Phase 7 · User Profile
**Goal:** Users can view and manage their account details and profile picture.

| # | Task | API | Notes |
|---|---|---|---|
| 7.1 | Profile screen fetches and displays user info | `GET /auth/me` | |
| 7.2 | Edit Profile form (name, email) | `PUT /auth/profile` | Field-level validation |
| 7.3 | Profile picture — pick from gallery | — | `image_picker` |
| 7.4 | Upload profile picture | `PUT /auth/profile-picture` | `multipart/form-data` |
| 7.5 | Show scan count & member since date on profile | — | Derived from history / user model |
| 7.6 | Logout button (clears secure storage + redirects to login) | — | |

---

## Phase 8 · Community Forum
**Goal:** A social space for farmers to share findings, ask questions, and help each other.

| # | Task | API | Notes |
|---|---|---|---|
| 8.1 | Post list screen (feed) | `GET /posts` | Infinite scroll pagination; cache in `CachedPost` Isar |
| 8.2 | Create post screen (title + body + optional image) | `POST /posts` | **If offline: queue in `SyncQueueItem`** |
| 8.3 | Single post detail screen | `GET /posts/:id` | |
| 8.4 | Add comment | `POST /posts/:id/comment` | Queue offline if necessary |
| 8.5 | Like / unlike button | `PUT /posts/:id/like` | Optimistic UI update; sync on reconnect |
| 8.6 | "Share to Community" shortcut from Result Screen | — | Pre-fill post with scan result data |

---

## Phase 9 · Weather Integration
**Goal:** Show local weather on the Dashboard to help farmers plan field activities.

| # | Task | API | Notes |
|---|---|---|---|
| 9.1 | Request GPS permission | — | `geolocator` |
| 9.2 | Fetch weather for user's location | `GET /weather?lat=..&lon=..` | |
| 9.3 | Weather card on Dashboard: temp, humidity, wind, condition icon | — | |
| 9.4 | Tap card → full weather detail screen | — | |
| 9.5 | Fallback if GPS denied: manual city input | — | |

---

## Phase 10 · Polish, Testing & Release
**Goal:** App is stable, performant, and ready for store submission.

| # | Task | Notes |
|---|---|---|
| 10.1 | Golden-widget tests for all screens | |
| 10.2 | Integration test: full **offline** scan flow (airplane mode → camera → queued → sync) | |
| 10.3 | Integration test: online scan flow (open → camera → result) | |
| 10.4 | Test `SyncService` with 10+ queued items (stress test) | |
| 10.5 | Performance audit (check for jank with Flutter DevTools) | |
| 10.6 | App icon + splash screen (match branding) | Use `flutter_launcher_icons` |
| 10.7 | Configure `flavor` environments: `dev` vs `production` | Different base URLs, API keys |
| 10.8 | Android `build.gradle` / iOS `Info.plist` permissions review | Camera, Gallery, GPS, Internet, Background Tasks |
| 10.9 | Sign Android APK / AAB for Play Store | |
| 10.10 | Archive iOS build for App Store | Requires macOS + Xcode |

---

## Package Reference Sheet

```yaml
dependencies:
  flutter_riverpod: ^2.5.1
  go_router: ^13.2.0
  dio: ^5.4.3
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.3
  camera: ^0.11.0
  image_picker: ^1.1.1
  flutter_image_compress: ^2.2.0
  cached_network_image: ^3.3.1
  flutter_svg: ^2.0.10
  table_calendar: ^3.1.1
  flutter_map: ^6.1.0
  geolocator: ^11.0.0
  fl_chart: ^0.67.0
  connectivity_plus: ^6.0.3
  shimmer: ^3.0.0
  google_fonts: ^6.2.1
  share_plus: ^9.0.0
  screenshot: ^2.3.0
  # Offline-first packages
  isar: ^3.1.0
  isar_flutter_libs: ^3.1.0
  workmanager: ^0.5.2
  path_provider: ^2.1.3
  # On-device AI inference
  pytorch_lite: ^4.0.0
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.9
  isar_generator: ^3.1.0
  json_serializable: ^6.8.0
  flutter_launcher_icons: ^0.13.1
  mockito: ^5.4.4
  flutter_test:
    sdk: flutter
```

---

*Version 2 — March 2026 | Agro AI Health Mobile Team* 🌿
