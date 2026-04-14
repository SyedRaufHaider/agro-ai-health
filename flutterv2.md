# 📱 Agro AI Health — Flutter Integration Guide V2

> **Last Updated:** April 2026
> **Backend Status:** 🟢 LIVE on Render
> **Live Base URL:** `https://agro-ai-backend-3fxh.onrender.com`
> **API Version:** `v1.0.0`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Keys Reality for Flutter](#2-api-keys-reality-for-flutter)
3. [Flutter Project Setup](#3-flutter-project-setup)
4. [Connecting to the Backend (Base URL & Headers)](#4-connecting-to-the-backend)
5. [Authentication — Login, Register, Password Reset](#5-authentication)
6. [AI Disease Detection — Scanning a Leaf](#6-ai-disease-detection)
7. [Crops & Diseases — Real Seeded Data](#7-crops--diseases)
8. [Community Posts](#8-community-posts)
9. [User Profile & FCM Token](#9-user-profile--fcm-token)
10. [GPS Location Support](#10-gps-location-support)
11. [Error Handling](#11-error-handling)
12. [Final Checklist](#12-final-checklist)

---

## 1. Architecture Overview

As a Flutter developer, your app is a **smart HTTP client**. It never directly touches the database, the AI model, or any cloud storage.

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                           │
│                                                              │
│   [Flutter Mobile App]       [React Web App - Vercel]        │
│        (your job)            (already deployed)              │
└──────────────────┬───────────────────────────────────────────┘
                   │  HTTPS REST API
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              NODE.JS BACKEND — Render (LIVE)                 │
│     https://agro-ai-backend-3fxh.onrender.com                │
│                                                              │
│  /api/v1/auth        →  Register, Login, Forgot Password     │
│  /api/v1/detect      →  AI Scan, Scan History                │
│  /api/v1/crops       →  Crops Database                       │
│  /api/v1/diseases    →  Diseases Database                    │
│  /api/v1/posts       →  Community Forum                      │
└────┬──────────────┬──────────────┬───────────────────────────┘
     │              │              │
     ▼              ▼              ▼
[MongoDB Atlas] [AWS S3 /     [HuggingFace
 (Database)     Cloudinary]    FastAPI AI]
                (Images)       (ML Model)
```

### Rules for Flutter:
| ❌ NEVER Do This | ✅ Always Do This |
|---|---|
| Connect to MongoDB directly | Call REST endpoints |
| Call HuggingFace AI directly | Use `POST /api/v1/detect` |
| Store AWS/DB keys in Dart code | Only store the backend base URL |
| Upload to S3 directly | The backend handles all uploads |

---

## 2. API Keys Reality for Flutter

**Flutter requires ZERO secret API keys.** All secrets live on the server.

| Secret | Where It Lives | Flutter Needs It? |
|---|---|---|
| `MONGO_URI` | Render environment variable | ❌ No |
| `JWT_SECRET` | Render environment variable | ❌ No |
| `AWS_ACCESS_KEY_ID` | Render environment variable | ❌ No |
| `AWS_SECRET_ACCESS_KEY` | Render environment variable | ❌ No |
| `BREVO_API_KEY` (SMTP) | Render environment variable | ❌ No |
| `HF_MODEL_URL` (AI) | Render environment variable | ❌ No |

**The only thing Flutter needs:**
```
https://agro-ai-backend-3fxh.onrender.com/api/v1
```

---

## 3. Flutter Project Setup

### `pubspec.yaml` — Required Packages
```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP Requests
  http: ^1.2.0

  # Secure JWT storage (encrypted)
  flutter_secure_storage: ^9.0.0

  # Persistent simple data (user prefs, cached crops list)
  shared_preferences: ^2.2.0

  # Image picking (camera or gallery for disease scan)
  image_picker: ^1.0.7

  # GPS coordinates for scan location
  geolocator: ^11.0.0

  # Push notifications (Firebase Cloud Messaging)
  firebase_messaging: ^14.7.9

  # Local caching database (offline crops/diseases)
  sqflite: ^2.3.2   # OR use hive: ^2.2.3
```

### `lib/core/constants/api_constants.dart`
```dart
class ApiConstants {
  // ✅ Confirmed Live — April 2026
  static const String baseUrl =
      'https://agro-ai-backend-3fxh.onrender.com/api/v1';

  // Auth
  static const String register       = '/auth/register';
  static const String login          = '/auth/login';
  static const String me             = '/auth/me';
  static const String profile        = '/auth/profile';
  static const String profilePicture = '/auth/profile-picture';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword  = '/auth/reset-password';

  // AI Detection
  static const String detect        = '/detect';
  static const String detectHistory = '/detect/history';

  // Data
  static const String crops    = '/crops';
  static const String diseases = '/diseases';
  static const String posts    = '/posts';

  // JWT expiry: 30 days (set on backend)
  static const int jwtExpireDays = 30;
}
```

---

## 4. Connecting to the Backend

### `lib/core/services/api_service.dart`
This is the core service every other service in the app should use.

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_constants.dart';

class ApiService {
  static const _storage = FlutterSecureStorage();

  // ── Token Storage ────────────────────────────────────────────
  static Future<void> saveToken(String token) async =>
      await _storage.write(key: 'jwt_token', value: token);

  static Future<String?> getToken() async =>
      await _storage.read(key: 'jwt_token');

  static Future<void> deleteToken() async =>
      await _storage.delete(key: 'jwt_token');

  // ── Build Headers ────────────────────────────────────────────
  static Future<Map<String, String>> headers({bool auth = true}) async {
    final token = auth ? await getToken() : null;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ── GET ──────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, String>? queryParams,
    bool auth = true,
  }) async {
    var uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    if (queryParams != null) {
      uri = uri.replace(queryParameters: queryParams);
    }
    final response = await http.get(uri, headers: await headers(auth: auth));
    return _handleResponse(response);
  }

  // ── POST ─────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body, {
    bool auth = true,
  }) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final response = await http.post(
      uri,
      headers: await headers(auth: auth),
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  // ── PUT ──────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final response = await http.put(
      uri,
      headers: await headers(),
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  // ── Response Handler ─────────────────────────────────────────
  static Map<String, dynamic> _handleResponse(http.Response response) {
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json;
    }
    throw ApiException(
      message: json['message'] ?? 'Unknown error',
      statusCode: response.statusCode,
    );
  }
}

// Custom Exception
class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => 'ApiException [$statusCode]: $message';
}
```

---

## 5. Authentication

### Health Check (Confirmed Working ✅)
```
GET https://agro-ai-backend-3fxh.onrender.com/
→ {"success":true,"message":"🌿 Agro AI Health API is running","version":"1.0.0"}
```

### Register a New User
```dart
// POST /api/v1/auth/register
final result = await ApiService.post(
  ApiConstants.register,
  {
    'username': 'ali_farmer',
    'email': 'ali@example.com',
    'password': 'securePass123',
    'role': 'farmer', // optional, defaults to 'farmer'
  },
  auth: false,
);

// On success: save the token
await ApiService.saveToken(result['token']);
final user = result['user'];
// user = { id, username, email, role, profilePicture }
```

### Login
```dart
// POST /api/v1/auth/login
final result = await ApiService.post(
  ApiConstants.login,
  {
    'email': 'ali@example.com',
    'password': 'securePass123',
  },
  auth: false,
);

await ApiService.saveToken(result['token']);
// Token expires in 30 days
```

### Forgot Password (Sends Email via Brevo SMTP)
```dart
// POST /api/v1/auth/forgot-password
// No auth required. Backend sends reset link to email.
final result = await ApiService.post(
  ApiConstants.forgotPassword,
  {'email': 'ali@example.com'},
  auth: false,
);
// result['message'] → "If an account with that email exists, a reset link has been sent"
// The reset link in the email opens the WEB app (https://agro-ai-health.vercel.app/reset-password?token=...)
// For mobile: consider handling this with a deep link or in-app WebView
```

### Reset Password (with token from email)
```dart
// POST /api/v1/auth/reset-password
final result = await ApiService.post(
  ApiConstants.resetPassword,
  {
    'token': 'TOKEN_FROM_EMAIL_LINK',
    'password': 'newSecurePass456',
  },
  auth: false,
);
// On success: automatically returns a new JWT token — log user in directly
await ApiService.saveToken(result['token']);
```

### Logout
```dart
// No backend endpoint needed — just delete the local token
await ApiService.deleteToken();
```

---

## 6. AI Disease Detection

### How It Works:
```
Flutter uploads image → Node.js Backend → HuggingFace FastAPI AI
                                       ↓
                          Result saved to MongoDB (Detection collection)
                                       ↓
                          Response returned to Flutter with full details
```

### Scan a Leaf Image
```dart
import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';

Future<Map<String, dynamic>> scanLeaf() async {
  // 1. Pick image from camera or gallery
  final picker = ImagePicker();
  final picked = await picker.pickImage(source: ImageSource.camera);
  if (picked == null) throw Exception('No image selected');

  // 2. Get GPS location (optional but recommended)
  Position? position;
  try {
    position = await Geolocator.getCurrentPosition();
  } catch (_) {
    // Location not available — continue without it
  }

  // 3. Build multipart request
  final uri = Uri.parse('${ApiConstants.baseUrl}/detect');
  final request = http.MultipartRequest('POST', uri);

  // 4. Attach JWT auth token
  final token = await ApiService.getToken();
  request.headers['Authorization'] = 'Bearer $token';

  // 5. Set platform identifier
  request.fields['platform'] = 'mobile';

  // 6. Attach GPS if available
  if (position != null) {
    request.fields['latitude'] = position.latitude.toString();
    request.fields['longitude'] = position.longitude.toString();
  }

  // 7. Attach image — field name MUST be 'image'
  request.files.add(
    await http.MultipartFile.fromPath('image', picked.path),
  );

  // 8. Send and parse
  final streamed = await request.send();
  final response = await http.Response.fromStream(streamed);

  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['message'] ?? 'Scan failed');
  }
}
```

### Example Successful Response
```json
{
  "success": true,
  "disease": "Tomato___Late_blight",
  "confidence": 0.95,
  "status": "infected",
  "predictions": [
    { "label": "Tomato___Late_blight", "confidence": 0.95 },
    { "label": "Tomato___Early_blight", "confidence": 0.03 },
    { "label": "Tomato___healthy", "confidence": 0.02 }
  ],
  "recommendations": [
    "Use disease-resistant varieties",
    "Avoid overhead watering",
    "Ensure good air circulation"
  ],
  "medicines": [
    { "name": "Mancozeb spray", "type": "chemical" },
    { "name": "Chlorothalonil", "type": "chemical" },
    { "name": "Copper-based fungicide", "type": "organic" },
    { "name": "Neem oil spray", "type": "organic" }
  ],
  "severity": "High",
  "symptoms": [
    "Irregular greenish-black water-soaked patches on leaves",
    "White mold growth on undersides of leaves",
    "Brown spots on stems and fruit"
  ]
}
```

### Status Field Values
| Value | Meaning |
|---|---|
| `healthy` | Plant is healthy |
| `infected` | Disease detected |
| `unknown` | Could not determine |
| `unrecognized` | Plant not in training set / low confidence |

### Get Scan History (Paginated)
```dart
// GET /api/v1/detect/history?page=1&limit=10
final result = await ApiService.get(
  ApiConstants.detectHistory,
  queryParams: {'page': '1', 'limit': '10'},
);

final scans = result['data'] as List;
final total = result['total'];
final pages = result['pages'];
// imageUrl in history is a pre-signed S3 URL — cache locally if needed
```

---

## 7. Crops & Diseases

These endpoints are **public** — no JWT required. They return your **real seeded database data**.

### Get All Crops (Confirmed Live ✅)
```dart
// GET /api/v1/crops
final result = await ApiService.get(ApiConstants.crops, auth: false);
final crops = result['data'] as List;
// result['count'] == 5
```

**Real data currently in your database:**
| Crop | Scientific Name | Season | Category |
|---|---|---|---|
| Tomato | Solanum lycopersicum | Kharif | Vegetable |
| Potato | Solanum tuberosum | Rabi | Vegetable |
| Wheat | Triticum aestivum | Rabi | Grain |
| Rice | Oryza sativa | Kharif | Grain |
| Cotton | Gossypium | Kharif | Cash Crop |

### Filter Crops
```dart
// By season
await ApiService.get(ApiConstants.crops, queryParams: {'season': 'Kharif'}, auth: false);

// By category
await ApiService.get(ApiConstants.crops, queryParams: {'category': 'Vegetable'}, auth: false);

// By search text
await ApiService.get(ApiConstants.crops, queryParams: {'search': 'tomato'}, auth: false);
```

### Get All Diseases (Confirmed Live ✅)
```dart
// GET /api/v1/diseases
final result = await ApiService.get(ApiConstants.diseases, auth: false);
final diseases = result['data'] as List;
// result['count'] == 5
```

**Real disease data currently in your database:**
| Disease | Crop | Severity | AI Model Label |
|---|---|---|---|
| Tomato Late Blight | Tomato | High | `Tomato___Late_blight` |
| Tomato Early Blight | Tomato | Medium | `Tomato___Early_blight` |
| Potato Late Blight | Potato | Critical | `Potato___Late_blight` |
| Rice Blast | Rice | High | `Rice___Blast` |
| Wheat Leaf Rust | Wheat | Medium | `Wheat___Leaf_rust` |

### Get Single Crop (with full disease details)
```dart
// GET /api/v1/crops/:id
// Real Tomato ID from live DB:
final result = await ApiService.get(
  '/crops/69a357ffd42df8de82851e0e',
  auth: false,
);
```

### Get Diseases for a Specific Crop
```dart
// GET /api/v1/diseases/crop/:cropId
final result = await ApiService.get(
  '/diseases/crop/69a357ffd42df8de82851e0e', // Tomato
  auth: false,
);
```

---

## 8. Community Posts

### Get All Posts (Paginated, no auth)
```dart
// GET /api/v1/posts?page=1&limit=10
final result = await ApiService.get(
  ApiConstants.posts,
  queryParams: {'page': '1', 'limit': '10'},
  auth: false,
);
final posts = result['data'] as List;
```

### Create a Post (auth required)
```dart
// POST /api/v1/posts
final result = await ApiService.post(
  ApiConstants.posts,
  {
    'title': 'My tomato leaves have yellow spots',
    'content': 'I noticed yellow-brown spots on my tomato...',
    'tags': ['tomato', 'disease', 'help'],
    'images': [], // Optional: list of image URLs
  },
);
```

### Like / Unlike a Post (toggle)
```dart
// PUT /api/v1/posts/:id/like
final result = await ApiService.put('/posts/POST_ID/like', {});
// result['liked'] → true or false
// result['likeCount'] → updated count
```

### Add a Comment
```dart
// POST /api/v1/posts/:id/comment
final result = await ApiService.post(
  '/posts/POST_ID/comment',
  {'content': 'Try using copper-based fungicide!'},
);
```

---

## 9. User Profile & FCM Token

### Get Current User
```dart
// GET /api/v1/auth/me
final result = await ApiService.get(ApiConstants.me);
final user = result['user'];
```

### Update Profile
```dart
// PUT /api/v1/auth/profile
final result = await ApiService.put(
  ApiConstants.profile,
  {
    'username': 'new_username',         // optional
    'phone': '+923001234567',           // optional
    'location': {                       // optional
      'city': 'Lahore',
      'country': 'Pakistan',
    },
    'fcmToken': 'FIREBASE_DEVICE_TOKEN', // for push notifications
  },
);
```

### Register FCM Token (Push Notifications)
When the app starts and the user is logged in, always register the FCM token:
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> registerFcmToken() async {
  final token = await FirebaseMessaging.instance.getToken();
  if (token != null) {
    await ApiService.put(
      ApiConstants.profile,
      {'fcmToken': token},
    );
  }
}
```

### Upload Profile Picture
```dart
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

Future<void> uploadProfilePicture() async {
  final picker = ImagePicker();
  final picked = await picker.pickImage(source: ImageSource.gallery);
  if (picked == null) return;

  final uri = Uri.parse('${ApiConstants.baseUrl}/auth/profile-picture');
  final request = http.MultipartRequest('PUT', uri);

  final token = await ApiService.getToken();
  request.headers['Authorization'] = 'Bearer $token';

  // Field name MUST be 'profilePicture'. Max size: 5MB
  request.files.add(
    await http.MultipartFile.fromPath('profilePicture', picked.path),
  );

  final streamed = await request.send();
  final response = await http.Response.fromStream(streamed);
  // response body contains { success, user, profilePicture }
}
```

---

## 10. GPS Location Support

The backend `Detection` model stores `latitude` and `longitude` with every scan. Always try to attach location:

```dart
import 'package:geolocator/geolocator.dart';

Future<Position?> getLocation() async {
  bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) return null;

  LocationPermission permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) return null;
  }

  return await Geolocator.getCurrentPosition();
}
```

---

## 11. Error Handling

All API errors from the backend follow this structure:
```json
{
  "success": false,
  "message": "Error description here"
}
```

### Standard Error Codes

| HTTP Code | Meaning | Flutter Action |
|---|---|---|
| `400` | Bad request / validation error | Show error message to user |
| `401` | Unauthorized / JWT expired | Delete token, redirect to login |
| `403` | Forbidden (wrong role) | Show "access denied" |
| `404` | Resource not found | Show "not found" screen |
| `500` | Server error | Show "try again later" |

### Global Error Handler Wrapper
```dart
Future<void> safeApiCall(Future<void> Function() call) async {
  try {
    await call();
  } on ApiException catch (e) {
    if (e.statusCode == 401) {
      await ApiService.deleteToken();
      // Navigate to login screen
    } else {
      // Show snackbar or dialog with e.message
    }
  } catch (e) {
    // Network error, no internet, etc.
    // Show "Check your internet connection"
  }
}
```

---

## 12. Final Checklist

| Task | Status |
|---|---|
| Set `baseUrl` to `https://agro-ai-backend-3fxh.onrender.com/api/v1` | ☐ |
| Add `http`, `flutter_secure_storage`, `image_picker`, `geolocator` packages | ☐ |
| Implement `ApiService` with JWT header injection | ☐ |
| Save JWT token on login/register using `flutter_secure_storage` | ☐ |
| Delete JWT token on logout | ☐ |
| Use `multipart/form-data` for image upload (detect + profile picture) | ☐ |
| Always send `platform: 'mobile'` in scan requests | ☐ |
| Register FCM token after login for push notification support | ☐ |
| Add GPS coordinates to scan requests where possible | ☐ |
| Handle `401` response → auto logout | ☐ |
| **NEVER** store MongoDB/AWS/Brevo keys in Dart code | ☐ |

---

> 💡 **Note on Render Cold Starts:** Your backend is on Render's free tier. If it hasn't received traffic in ~15 minutes, the first request may take 30–60 seconds while the server wakes up. Show a loading indicator and set a longer timeout (e.g., 60 seconds) for the first API call after app launch.

```dart
// Set a generous timeout for the cold start scenario
final response = await http.get(uri, headers: hdrs)
    .timeout(const Duration(seconds: 60));
```
