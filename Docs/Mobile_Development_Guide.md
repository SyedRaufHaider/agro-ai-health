# 📱 Agro AI Health — Flutter Mobile Development Guide

> The backend and web app are **~95% complete**. The basic Flutter UI already exists. This guide explains how to wire up every feature, integrate the API, and produce a production-ready mobile app.

---

## 1 · Architecture & Tech Stack

### Recommended Packages

| Purpose | Package |
|---|---|
| State Management | `flutter_riverpod` (preferred) or `flutter_bloc` |
| Networking | `dio` (interceptors + multipart uploads) |
| Secure Local Storage | `flutter_secure_storage` (JWT token) |
| Preferences / Settings | `shared_preferences` |
| Navigation / Routing | `go_router` |
| Camera Capture | `camera` |
| Gallery Picker | `image_picker` |
| Image Compression | `flutter_image_compress` |
| SVG Icons | `flutter_svg` |
| Network Images | `cached_network_image` |
| Maps | `google_maps_flutter` or `flutter_map` |
| Charts | `fl_chart` |
| Calendar | `table_calendar` |
| Connectivity Check | `connectivity_plus` |
| Local Database (offline) | `isar` (fast, reactive, no-SQL) |
| Background Sync | `workmanager` |
| Offline Queue | Custom `SyncQueue` service using `isar` |
| **On-Device AI** | **`pytorch_lite`** (runs `.ptl` model directly in Flutter) |

### Folder Structure

```text
lib/
├── core/
│   ├── network/        # Dio client, interceptors, base URLs
│   ├── theme/          # Colors, typography, dark/light themes
│   └── constants/      # App-wide constants
├── data/
│   ├── models/         # JSON-serializable data classes
│   └── repositories/   # All API calls live here
├── ml/
│   ├── plant_model.dart      # ModelManager: load & run .ptl model
│   ├── class_names.dart      # 32 disease class label map
│   └── image_processor.dart  # Resize → normalize → tensor
├── presentation/
│   └── <feature>/
│       ├── screens/    # Full pages
│       ├── widgets/    # Local components for that feature
│       └── providers/  # Riverpod providers / Bloc cubits
└── main.dart
```

---

## 2 · Design System & UI Rules

The web app uses a premium **glassmorphism + deep green** palette. The Flutter app **must match** this feel.

- **Primary color:** Deep green (`#1A6B3C` approx.) with vibrant lime accent.
- **Typography:** Use `Inter` or `Poppins` via `google_fonts`.
- **Loading states:** Always use shimmer skeletons (`shimmer` package) — never a plain spinner.
- **Animations:** Hero transitions on image scans, slide-in result cards, fade-in on list items.
- **Responsiveness:** Wrap complex layouts in `LayoutBuilder` / `MediaQuery`.

> Since the base UI is done, focus on plugging in logic while keeping animations at **60+ FPS**.

---

## 3 · Offline-First Architecture

> **Goal:** Every core feature works with zero internet. When connectivity is restored, all pending actions auto-sync with the backend silently.

### 🤖 On-Device Scanning (PyTorch Mobile) — The Key Upgrade

The disease detection model (`.pt` format, **ResNet-50, 32 classes**) runs **directly inside the Flutter app** using the `pytorch_lite` package. No internet is needed to run a scan.

```
  User takes/picks photo
         │
         ▼
  Resize to 224×224 → Normalize (ImageNet mean/std)
         │
         ▼
  pytorch_lite runs plant_disease_model.ptl ON DEVICE
         │
         ▼
  Softmax → Top-3 predictions  (same logic as predict.py)
         │
         ├─► Save result to Isar (CachedDetection)
         │
         ├─► [Online?] ─YES─► POST /detect (image + result) for server history
         │
         └─► [Offline?] ──► Queue in SyncQueue → auto-sync later
```

#### Model Conversion (One-Time, Done by the Team)

Before bundling, convert the `.pt` file to **TorchScript Mobile (`.ptl`)** format:

```python
# run once on your dev machine — not in the app
import torch
from torchvision import models

num_classes = 32
model = models.resnet50(pretrained=False)
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(torch.load("plant_disease_model.pt", map_location="cpu"))
model.eval()

# Trace and save as .ptl (PyTorch Lite / Mobile format)
scripted = torch.jit.script(model)
scripted._save_for_lite_interpreter("plant_disease_model.ptl")
print("Model saved as plant_disease_model.ptl")
```

Then place `plant_disease_model.ptl` in `assets/ml/` and declare it in `pubspec.yaml`:

```yaml
flutter:
  assets:
    - assets/ml/plant_disease_model.ptl
    - assets/ml/class_names.json
```

#### Flutter On-Device Inference Code

```dart
// lib/ml/plant_model.dart
import 'package:pytorch_lite/pytorch_lite.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'dart:io';

class PlantModel {
  static ClassificationModel? _model;
  static Map<int, String>? _classNames;

  static Future<void> init() async {
    // Load model from assets
    _model = await PytorchLite.loadClassificationModel(
      'assets/ml/plant_disease_model.ptl',
      224, 224,  // input size
      32,        // number of classes
      labelPath: 'assets/ml/class_names.json',
    );
  }

  /// Returns [{label, confidence}, ...] sorted by confidence desc
  static Future<List<Map<String, dynamic>>> predict(File imageFile) async {
    final result = await _model!.getImagePrediction(
      await imageFile.readAsBytes(),
      mean: [0.485, 0.456, 0.406],  // ImageNet normalization (same as predict.py)
      std:  [0.229, 0.224, 0.225],
    );
    // result is a list of probabilities, one per class
    final indexed = result!.asMap().entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return indexed.take(3).map((e) => {
      'label': _classNames![e.key] ?? 'Unknown',
      'confidence': (e.value as double).toStringAsFixed(4),
    }).toList();
  }
}
```

> **Initialize once** in `main()` before `runApp()`: `await PlantModel.init();`

#### The 32 Supported Disease Classes

| # | Class | # | Class |
|---|---|---|---|
| 0 | Apple — Apple scab | 16 | Tomato — Early blight |
| 1 | Apple — Black rot | 17 | Tomato — Late blight |
| 2 | Apple — Cedar apple rust | 18 | Tomato — Leaf Mold |
| 3 | Apple — healthy | 19 | Tomato — Septoria leaf spot |
| 4 | Corn — Cercospora leaf spot | 20 | Tomato — Spider mites |
| 5 | Corn — Common rust | 21 | Tomato — Target Spot |
| 6 | Corn — Northern Leaf Blight | 22 | Tomato — Yellow Leaf Curl Virus |
| 7 | Corn — healthy | 23 | Tomato — Mosaic virus |
| 8 | Grape — Black rot | 24 | Tomato — healthy |
| 9 | Grape — Esca | 25 | Rice — Brown spot |
| 10 | Grape — Leaf blight | 26 | Rice — Hispa |
| 11 | Grape — healthy | 27 | Rice — Leaf Blast |
| 12 | Potato — Early blight | 28 | Rice — healthy |
| 13 | Potato — Late blight | 29 | Wheat — Brown Rust |
| 14 | Potato — healthy | 30 | Wheat — Yellow Rust |
| 15 | Tomato — Bacterial spot | 31 | Wheat — healthy |

### Strategy: Local-First with a Sync Queue

```
  User Action
      │
      ▼
  Save to Isar DB (local)   ◄── Always first, instant
      │
      ├── [Online?] ──YES──► POST/PUT to API immediately
      │                            │
      │                      ✅ Mark synced in Isar
      │
      └── [Offline?] ──────► Add to SyncQueue in Isar
                                   │
                          WorkManager wakes up
                          when internet returns
                                   │
                          Flush queue → POST/PUT
                                   │
                          ✅ Mark synced in Isar
```

### Local Database Schema (Isar)

| Collection | Fields | Purpose |
|---|---|---|
| `PendingScan` | imageLocalPath, status, createdAt, syncedAt | Stores offline scans waiting to upload |
| `CachedDetection` | id, disease, confidence, treatments, createdAt, isSynced | All scan results (local + server) |
| `CachedPost` | id, title, body, authorId, isSynced | Community posts cache |
| `SyncQueueItem` | endpoint, method, payload, retries, createdAt | Generic action queue |

### How Offline Scanning Works

1. User takes a photo → image saved to **device storage** (`getApplicationDocumentsDirectory`).
2. A `PendingScan` record is written to **Isar** immediately.
3. The UI shows "Queued for analysis" state on the result card.
4. `connectivity_plus` stream detects connectivity → `WorkManager` triggers `SyncWorker`.
5. `SyncWorker` reads all unsynced `PendingScan` records, compresses & uploads each image.
6. On success, writes the `CachedDetection` result to Isar and marks sync complete.
7. UI reactively updates via Isar's **live queries** (no manual refresh needed).

### WorkManager Setup

```dart
// Register the sync task once at app start
await Workmanager().registerPeriodicTask(
  'agro-sync-task',
  'syncPendingScans',
  frequency: const Duration(minutes: 15),
  constraints: Constraints(networkType: NetworkType.connected),
  existingWorkPolicy: ExistingWorkPolicy.keep,
);

// Callback dispatcher (top-level function)
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    await SyncService().flushQueue();
    return Future.value(true);
  });
}
```

### Offline-Capable Features Summary

| Feature | Offline Behavior | Sync Behavior |
|---|---|---|
| **Disease Scan** | ✅ Full AI diagnosis on-device (PyTorch Mobile) | Result + image uploaded to server for history |
| **Scan History** | Reads from Isar cache | Refreshes from API on reconnect |
| **Crop Calendar** | Calendar events shown from cached history | Calendar events updated after sync |
| **Field Health Map** | Field boundaries stored locally in Isar | Boundaries synced to backend (future endpoint) |
| **Community Posts** | Drafts queued in SyncQueue | Posts submitted when online |
| **User Profile** | Profile edits queued | Profile update sent when online |
| **Weather** | Last-fetched data shown | Auto-refreshes when online |
| **Disease Trends** | Chart renders from Isar data | Re-aggregates after new synced scans |

### Connectivity Detection

```dart
// Listen for connectivity changes app-wide
final connectivityStream = Connectivity().onConnectivityChanged;
connectivityStream.listen((result) {
  if (result != ConnectivityResult.none) {
    // Trigger immediate sync when back online
    SyncService().flushQueue();
  }
});
```

---

## 4 · API Reference

**Production Base URL:** `https://<your-render-backend>.onrender.com/api/v1`
**Local Dev Base URL:** `http://192.168.x.x:5000/api/v1` *(use LAN IP, not `localhost`)*

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login → returns `{ token, user }` | Public |
| GET | `/auth/me` | Get current user profile | 🔒 |
| PUT | `/auth/profile` | Update profile fields | 🔒 |
| PUT | `/auth/profile-picture` | Upload profile picture | 🔒 |

### Detection (AI)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/detect` | Upload image for AI diagnosis | 🔒 |
| GET | `/detect/history` | Full scan history for user | 🔒 |
| GET | `/detect/:id` | Single scan result by ID | 🔒 |

### Crops & Diseases

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/crops` | List all crops | Public |
| GET | `/diseases` | List all diseases | Public |
| GET | `/diseases/crop/:cropId` | Diseases for a specific crop | Public |

### Community & Weather

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/posts` | All community posts (paginated) | Public |
| POST | `/posts` | Create a post | 🔒 |
| POST | `/posts/:id/comment` | Add a comment | 🔒 |
| PUT | `/posts/:id/like` | Like / unlike a post | 🔒 |
| GET | `/weather?lat=..&lon=..` | Weather for GPS coordinates | Public |

---

## 4 · Key Integration Snippets

### Auth Interceptor (Dio)
```dart
// core/network/dio_client.dart
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) async {
    final token = await secureStorage.read(key: 'token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  },
  onError: (error, handler) async {
    if (error.response?.statusCode == 401) {
      await secureStorage.delete(key: 'token');
      router.go('/login'); // redirect to login
    }
    return handler.next(error);
  },
));
```

### Image Upload for AI Detection
```dart
// data/repositories/detect_repository.dart
Future<DetectionResult> scanImage(File imageFile) async {
  // Compress before uploading
  final compressed = await FlutterImageCompress.compressAndGetFile(
    imageFile.path, '${imageFile.path}_compressed.jpg', quality: 80,
  );
  final formData = FormData.fromMap({
    'image': await MultipartFile.fromFile(compressed!.path, filename: 'upload.jpg'),
  });
  final response = await dio.post('/detect', data: formData);
  return DetectionResult.fromJson(response.data['data']);
}
```

### Profile Picture Upload
```dart
final formData = FormData.fromMap({
  'image': await MultipartFile.fromFile(pickedFile.path, filename: 'profile.jpg'),
});
await dio.put('/auth/profile-picture', data: formData);
```

---

## 5 · Implementation Phases

### Phase 1 — Foundation & Auth
- [ ] Setup Dio client + Auth interceptor
- [ ] `User`, `LoginResponse`, `DetectionResult` data models
- [ ] Auth repository (`register`, `login`, `me`)
- [ ] Wire Login/Signup screens with Riverpod
- [ ] Splash screen: check stored token → auto-route to Dashboard or Login

### Phase 2 — AI Disease Detection *(Core — Works 100% Offline)*
> The model is **bundled inside the app** and runs on-device. No internet is needed to get a diagnosis.
- [ ] Convert `plant_disease_model.pt` → `plant_disease_model.ptl` (one-time, see conversion script above)
- [ ] Place `.ptl` + `class_names.json` in `assets/ml/`
- [ ] Add `pytorch_lite` package
- [ ] Build `PlantModel` class (load model in `main()`, `predict(imageFile)` method)
- [ ] Build `ImageProcessor` (resize 224×224, normalize ImageNet mean/std)
- [ ] Connect Camera/Gallery to `image_picker` & `camera`
- [ ] Compress image with `flutter_image_compress` (for display & sync — not for local inference)
- [ ] Run `PlantModel.predict()` → show result instantly (no loading from server)
- [ ] Result screen: disease label, confidence bar, top-3 predictions, treatment info
- [ ] **When online**: also POST to `/detect` to save result to server history
- [ ] "Share Result" action (`screenshot` + `share_plus`)

### Phase 3 — Dashboard & Scan History
- [ ] Call `GET /detect/history`, map to history list
- [ ] Dashboard widgets: total scans, last scan date, top disease
- [ ] History screen: searchable, filterable card list

### Phase 4 — Crop Calendar
- [ ] Use `table_calendar` to render monthly calendar
- [ ] Overlay scan events from `GET /detect/history` on their scan dates
- [ ] Display Pakistan seasonal sowing & harvest schedule per crop

### Phase 5 — Field Health Map
- [ ] Integrate `google_maps_flutter` or `flutter_map`
- [ ] Let users draw/pin field boundaries using map gestures
- [ ] Show scan markers on the map pins indicating disease severity

### Phase 6 — Disease Trends
- [ ] Call `GET /detect/history` and aggregate by disease label
- [ ] Render bar/line charts with `fl_chart`
- [ ] Show top 5 detected diseases and frequency timeline

### Phase 7 — User Profile
- [ ] Fetch and display profile (`GET /auth/me`)
- [ ] Edit profile form (`PUT /auth/profile`)
- [ ] Profile picture upload (`PUT /auth/profile-picture`)

### Phase 8 — Community Forum
- [ ] Post list screen (`GET /posts`)
- [ ] Create post form (`POST /posts`)
- [ ] Post detail: comments + like button

### Phase 9 — Weather Integration
- [ ] Request GPS permission with `geolocator`
- [ ] Call `GET /weather?lat=..&lon=..`
- [ ] Show weather card on Dashboard (temperature, humidity, wind)

---

## 6 · Error Handling & Edge Cases

| Scenario | Solution |
|---|---|
| No internet | Save to Isar `SyncQueue` → auto-retry on reconnect via `WorkManager` |
| Image too large | Compress with `flutter_image_compress` before upload (target < 1 MB) |
| Token expired (401) | Dio interceptor auto-logs out + shows "Session expired" snackbar |
| Sync fails repeatedly | Increment `retries` counter; after 5 retries mark as "failed" and notify user |
| App killed mid-sync | `WorkManager` resumes sync automatically on next launch |
| Empty history (first use) | Show a friendly CTA illustration: "Take your first scan" |
| GPS permission denied | Fall back to a manual city input for weather |

---

*Built with 💚 for farmers — Let's make this app flawless.* 🌿
