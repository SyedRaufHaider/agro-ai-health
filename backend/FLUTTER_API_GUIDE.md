# 🌿 Agro AI Health — Backend API Guide for Flutter Developer

> **Last updated:** March 31, 2026  
> **Backend Stack:** Node.js + Express.js + MongoDB (Mongoose)  
> **Deployed on:** Render  
> **Frontend (Web):** Vercel — `https://agro-ai-health.vercel.app`

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Configuration](#base-url--configuration)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Auth](#1-auth--apiv1auth)
   - [Disease Detection (AI Scan)](#2-disease-detection-ai-scan--apiv1detect)
   - [Crops](#3-crops--apiv1crops)
   - [Diseases](#4-diseases--apiv1diseases)
   - [Community Posts](#5-community-posts--apiv1posts)
5. [Data Models (JSON Schemas)](#data-models-json-schemas)
6. [Error Handling](#error-handling)
7. [Flutter Integration Guide](#flutter-integration-guide)
8. [Important Notes](#important-notes)

---

## Overview

The Agro AI Health backend is a REST API that powers a plant disease detection system. It provides:

- **User authentication** (email/password + Google/Facebook OAuth)
- **AI-powered disease detection** — upload a leaf image → get disease name, confidence, treatments
- **Crop & Disease database** — browse crops, their optimal conditions, and common diseases
- **Community forum** — posts, comments, likes
- **Image storage** — via AWS S3 (primary) or Cloudinary (fallback)

---

## Base URL & Configuration

| Environment | Base URL |
|---|---|
| **Production** | `https://<your-render-app>.onrender.com` |
| **Local Dev** | `http://localhost:5000` |

### Content Types

| Request Type | Content-Type |
|---|---|
| JSON body | `application/json` |
| File upload | `multipart/form-data` |

### CORS Note

> **No CORS issues for Flutter!** CORS only applies to browser requests. Flutter's `http`/`dio` clients make native HTTP calls and bypass CORS entirely. No extra config needed.

---

## Authentication

The API uses **JWT Bearer Token** authentication.

### How It Works

1. Call `/api/v1/auth/login` or `/api/v1/auth/register` → receive a `token` in the response
2. Store the token securely (e.g., `flutter_secure_storage`)
3. Send it in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Token Details

| Property | Value |
|---|---|
| Format | JWT |
| Expiry | 30 days (configurable) |
| Payload | `{ id: "<user_id>", role: "farmer" | "expert" | "admin" }` |

### User Roles

| Role | Description |
|---|---|
| `farmer` | Default role for new users. Can scan, post, comment |
| `expert` | Same as farmer (reserved for future expert features) |
| `admin` | Can create/update crops and diseases |

---

## API Endpoints

### Standard Response Format

All endpoints return this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

On error:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

### 1. Auth — `/api/v1/auth`

#### `POST /api/v1/auth/register`

Register a new user.

- **Auth required:** ❌ No

**Request Body:**
```json
{
  "username": "john_farmer",
  "email": "john@example.com",
  "password": "mypassword123",
  "role": "farmer"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | String | ✅ | 3–30 chars, unique |
| `email` | String | ✅ | Must be valid email, unique |
| `password` | String | ✅ | Min 6 characters |
| `role` | String | ❌ | `farmer` (default), `expert`, `admin` |

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6618f2a1b3c4d5e6f7890123",
    "username": "john_farmer",
    "email": "john@example.com",
    "role": "farmer",
    "profilePicture": ""
  }
}
```

---

#### `POST /api/v1/auth/login`

Login with email and password.

- **Auth required:** ❌ No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6618f2a1b3c4d5e6f7890123",
    "username": "john_farmer",
    "email": "john@example.com",
    "role": "farmer",
    "profilePicture": "https://s3.amazonaws.com/..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

#### `GET /api/v1/auth/me`

Get the currently logged-in user's profile.

- **Auth required:** ✅ Bearer Token

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "6618f2a1b3c4d5e6f7890123",
    "username": "john_farmer",
    "email": "john@example.com",
    "role": "farmer",
    "profilePicture": "",
    "phone": "",
    "location": {
      "city": "",
      "country": "",
      "coordinates": []
    },
    "fcmToken": "",
    "isVerified": false,
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z"
  }
}
```

---

#### `PUT /api/v1/auth/profile`

Update user profile fields.

- **Auth required:** ✅ Bearer Token

**Request Body (all fields optional):**
```json
{
  "username": "new_username",
  "phone": "+923001234567",
  "location": {
    "city": "Lahore",
    "country": "Pakistan"
  },
  "fcmToken": "firebase_cloud_messaging_device_token_here"
}
```

| Field | Type | Notes |
|---|---|---|
| `username` | String | 3–30 chars |
| `phone` | String | Free format |
| `profilePicture` | String | URL or base64 data URI |
| `location` | Object | `{ city, country, coordinates }` |
| `fcmToken` | String | Firebase Cloud Messaging device token for push notifications |

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### `PUT /api/v1/auth/profile-picture`

Upload a profile picture.

- **Auth required:** ✅ Bearer Token
- **Content-Type:** `multipart/form-data`

**Request:**
| Field | Type | Notes |
|---|---|---|
| `profilePicture` | File | JPG, PNG, or WebP. Max 5 MB |

**Response (200):**
```json
{
  "success": true,
  "user": { ... },
  "profilePicture": "https://s3.amazonaws.com/agro-ai/profiles/abc123.jpg"
}
```

---

#### `GET /api/v1/auth/google`

Initiate Google OAuth login (browser redirect flow).

> **For Flutter:** Use `google_sign_in` package on the client, then send the user's Google ID token to your own backend for verification — or directly use the email/password register+login flow. The OAuth redirect endpoints are designed for the web app.

---

### 2. Disease Detection (AI Scan) — `/api/v1/detect`

#### `POST /api/v1/detect`

Upload a plant leaf image for AI disease detection.

- **Auth required:** ✅ Bearer Token
- **Content-Type:** `multipart/form-data`

**Request:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | File | ✅ | Image file (JPG, PNG, etc.). Max 10 MB |
| `platform` | String | ❌ | Set to `"mobile"` from Flutter app |
| `latitude` | Number | ❌ | Device GPS latitude |
| `longitude` | Number | ❌ | Device GPS longitude |

**Response (201) — Successful Detection:**
```json
{
  "success": true,
  "data": {
    "_id": "661a1234abcd5678ef901234",
    "userId": "6618f2a1b3c4d5e6f7890123",
    "imageUrl": "https://s3.amazonaws.com/agro-ai/scans/scan_12345.jpg",
    "predictedLabel": "Tomato___Late_blight",
    "predictedDisease": "661b0000aaaa1111bbbb2222",
    "confidence": 0.95,
    "status": "infected",
    "predictions": [
      { "label": "Tomato___Late_blight", "confidence": 0.95 },
      { "label": "Tomato___Early_blight", "confidence": 0.03 },
      { "label": "Tomato___healthy", "confidence": 0.02 }
    ],
    "platform": "mobile",
    "location": { "latitude": 31.5204, "longitude": 74.3587 },
    "createdAt": "2026-03-15T14:30:00.000Z"
  },
  "disease": "Tomato___Late_blight",
  "confidence": 0.95,
  "status": "infected",
  "predictions": [
    { "label": "Tomato___Late_blight", "confidence": 0.95 },
    { "label": "Tomato___Early_blight", "confidence": 0.03 },
    { "label": "Tomato___healthy", "confidence": 0.02 }
  ],
  "recommendations": [
    "Remove infected plant debris",
    "Use resistant varieties",
    "Apply copper-based fungicide preventively"
  ],
  "medicines": [
    { "name": "Mancozeb", "type": "chemical" },
    { "name": "Chlorothalonil", "type": "chemical" },
    { "name": "Neem oil spray", "type": "organic" },
    { "name": "Baking soda solution", "type": "organic" }
  ],
  "severity": "High",
  "symptoms": [
    "Dark brown spots on leaves",
    "White fungal growth under leaves",
    "Rapid wilting"
  ]
}
```

**Response fields explained:**

| Field | Type | Description |
|---|---|---|
| `disease` | String | AI model's predicted disease label |
| `confidence` | Number | 0.0 – 1.0 confidence score |
| `status` | String | `"healthy"`, `"infected"`, `"unknown"`, or `"unrecognized"` |
| `predictions` | Array | Top-k predictions with labels and confidences |
| `recommendations` | Array | Prevention tips (from disease database) |
| `medicines` | Array | Treatment options with `name` and `type` (`chemical`/`organic`) |
| `severity` | String | `"Low"`, `"Medium"`, `"High"`, or `"Critical"` |
| `symptoms` | Array | Known symptoms for this disease |

---

#### `GET /api/v1/detect/history`

Get current user's scan history (paginated).

- **Auth required:** ✅ Bearer Token

**Query Parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 10 | Results per page |

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 47,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "661a1234abcd5678ef901234",
      "imageUrl": "https://presigned-s3-url...",
      "predictedLabel": "Tomato___Late_blight",
      "predictedDisease": {
        "_id": "661b0000aaaa1111bbbb2222",
        "name": "Late Blight",
        "severity": "High"
      },
      "confidence": 0.95,
      "status": "infected",
      "platform": "mobile",
      "createdAt": "2026-03-15T14:30:00.000Z"
    }
  ]
}
```

> **Note:** When using S3 storage, the `imageUrl` in history responses is a **pre-signed URL** that expires. Cache images locally if needed.

---

#### `GET /api/v1/detect/:id`

Get a specific detection result by ID.

- **Auth required:** ✅ Bearer Token (must be the owner)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "661a1234abcd5678ef901234",
    "imageUrl": "https://presigned-s3-url...",
    "predictedLabel": "Tomato___Late_blight",
    "predictedDisease": {
      "_id": "661b0000aaaa1111bbbb2222",
      "name": "Late Blight",
      "severity": "High",
      "symptoms": ["..."],
      "treatment": { "chemical": ["..."], "organic": ["..."] },
      "prevention": ["..."]
    },
    "confidence": 0.95,
    "status": "infected",
    "predictions": [...],
    "location": { "latitude": 31.52, "longitude": 74.35 },
    "platform": "mobile",
    "createdAt": "2026-03-15T14:30:00.000Z"
  }
}
```

---

### 3. Crops — `/api/v1/crops`

#### `GET /api/v1/crops`

Get all crops with optional filters.

- **Auth required:** ❌ No

**Query Parameters:**

| Param | Type | Notes |
|---|---|---|
| `search` | String | Full-text search on name, scientific name |
| `season` | String | `Kharif`, `Rabi`, `Zaid`, `All Season` |
| `category` | String | `Fruit`, `Vegetable`, `Grain`, `Cash Crop`, `Pulse`, `Other` |

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "661c0000aaaa1111bbbb3333",
      "name": "Tomato",
      "scientificName": "Solanum lycopersicum",
      "season": "Kharif",
      "category": "Vegetable",
      "description": "A widely cultivated crop...",
      "image": "https://cloudinary.com/...",
      "optimalConditions": {
        "temperature": "20-30°C",
        "humidity": "60-80%",
        "soil": "Loamy",
        "water": "Moderate",
        "ph": "6.0-7.0"
      },
      "commonDiseases": [
        { "_id": "661b0000...", "name": "Late Blight", "severity": "High" },
        { "_id": "661b1111...", "name": "Early Blight", "severity": "Medium" }
      ]
    }
  ]
}
```

---

#### `GET /api/v1/crops/:id`

Get a single crop with full disease details.

- **Auth required:** ❌ No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "661c0000aaaa1111bbbb3333",
    "name": "Tomato",
    "scientificName": "Solanum lycopersicum",
    "season": "Kharif",
    "category": "Vegetable",
    "optimalConditions": { ... },
    "commonDiseases": [
      {
        "_id": "...",
        "name": "Late Blight",
        "symptoms": ["Dark spots on leaves", "..."],
        "treatment": {
          "chemical": ["Mancozeb", "Chlorothalonil"],
          "organic": ["Neem oil spray"]
        },
        "prevention": ["Remove debris", "Use resistant varieties"],
        "severity": "High"
      }
    ]
  }
}
```

---

### 4. Diseases — `/api/v1/diseases`

#### `GET /api/v1/diseases`

Get all diseases with optional filters.

- **Auth required:** ❌ No

**Query Parameters:**

| Param | Type | Notes |
|---|---|---|
| `search` | String | Full-text search on name, symptoms |
| `severity` | String | `Low`, `Medium`, `High`, `Critical` |
| `cropId` | String | MongoDB ObjectId of a crop |

**Response (200):**
```json
{
  "success": true,
  "count": 38,
  "data": [
    {
      "_id": "661b0000aaaa1111bbbb2222",
      "name": "Late Blight",
      "cropId": {
        "_id": "661c0000...",
        "name": "Tomato",
        "image": "https://..."
      },
      "symptoms": ["Dark brown spots on leaves", "White fungal growth under leaves"],
      "causes": ["Phytophthora infestans fungus", "Cool and wet weather"],
      "prevention": ["Remove infected debris", "Use resistant varieties"],
      "treatment": {
        "chemical": ["Mancozeb", "Chlorothalonil"],
        "organic": ["Neem oil spray", "Baking soda solution"]
      },
      "severity": "High",
      "image": "",
      "modelLabel": "Tomato___Late_blight",
      "confidenceThreshold": 0.7
    }
  ]
}
```

---

#### `GET /api/v1/diseases/:id`

Get a single disease by ID.

- **Auth required:** ❌ No

**Response:** Same structure as above, single object in `data`.

---

#### `GET /api/v1/diseases/crop/:cropId`

Get all diseases for a specific crop.

- **Auth required:** ❌ No

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

---

### 5. Community Posts — `/api/v1/posts`

#### `GET /api/v1/posts`

Get all community posts (paginated).

- **Auth required:** ❌ No

**Query Parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 10 | Results per page |
| `search` | String | — | Full-text search on title, content, tags |
| `tag` | String | — | Filter by tag |

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 42,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "661d0000aaaa1111bbbb4444",
      "userId": {
        "_id": "6618f2a1...",
        "username": "john_farmer",
        "profilePicture": "https://..."
      },
      "title": "Tomato leaves turning yellow",
      "content": "My tomato plants have started showing yellow spots...",
      "images": ["https://cloudinary.com/img1.jpg"],
      "tags": ["tomato", "disease", "help"],
      "likes": ["userId1", "userId2"],
      "comments": [],
      "isFlagged": false,
      "likeCount": 2,
      "commentCount": 0,
      "createdAt": "2026-03-10T08:00:00.000Z",
      "updatedAt": "2026-03-10T08:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/v1/posts`

Create a new community post.

- **Auth required:** ✅ Bearer Token

**Request Body:**
```json
{
  "title": "Help with rice blast disease",
  "content": "I noticed dark spots on my rice plants...",
  "images": ["https://cloudinary.com/uploaded_img.jpg"],
  "tags": ["rice", "disease", "help"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | String | ✅ | Max 200 chars |
| `content` | String | ✅ | Post body content |
| `images` | Array[String] | ❌ | Image URLs |
| `tags` | Array[String] | ❌ | Searchable tags |

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `GET /api/v1/posts/:id`

Get a single post with all comments.

- **Auth required:** ❌ No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "661d0000...",
    "title": "...",
    "content": "...",
    "userId": { "_id": "...", "username": "...", "profilePicture": "..." },
    "comments": [
      {
        "_id": "...",
        "userId": { "_id": "...", "username": "expert_ali", "profilePicture": "..." },
        "content": "This looks like rice blast. Try applying...",
        "createdAt": "2026-03-10T09:30:00.000Z"
      }
    ],
    "likes": ["userId1", "userId2"],
    "likeCount": 2,
    "commentCount": 1,
    "tags": ["rice", "disease"]
  }
}
```

---

#### `POST /api/v1/posts/:id/comment`

Add a comment to a post.

- **Auth required:** ✅ Bearer Token

**Request Body:**
```json
{
  "content": "I had the same issue. Try using neem oil spray."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `content` | String | ✅ | Max 1000 chars |

**Response (201):** Returns the full post with all comments populated.

---

#### `PUT /api/v1/posts/:id/like`

Like or unlike a post (toggle).

- **Auth required:** ✅ Bearer Token

**Request Body:** None required.

**Response (200):**
```json
{
  "success": true,
  "liked": true,
  "likeCount": 15
}
```

---

## Data Models (JSON Schemas)

### User

```
{
  _id:             ObjectId
  username:        String (3-30 chars, unique)
  email:           String (unique, lowercase)
  password:        String (hashed, never returned in API)
  role:            "farmer" | "expert" | "admin"
  profilePicture:  String (URL or base64 data URI)
  phone:           String
  location: {
    city:          String
    country:       String
    coordinates:   [Number] (longitude, latitude)
  }
  fcmToken:        String (Firebase Cloud Messaging token)
  isVerified:      Boolean
  createdAt:       DateTime
  updatedAt:       DateTime
}
```

### Detection

```
{
  _id:              ObjectId
  userId:           ObjectId → User
  imageUrl:         String (S3 or Cloudinary URL)
  predictedLabel:   String (raw AI model label, e.g. "Tomato___Late_blight")
  predictedDisease: ObjectId → Disease (or null)
  confidence:       Number (0.0 – 1.0)
  status:           "healthy" | "infected" | "unknown" | "unrecognized"
  predictions:      [{ label: String, confidence: Number }]
  cropId:           ObjectId → Crop (or null)
  notes:            String
  location: {
    latitude:       Number
    longitude:      Number
  }
  platform:         "web" | "mobile"
  createdAt:        DateTime
  updatedAt:        DateTime
}
```

### Crop

```
{
  _id:              ObjectId
  name:             String
  scientificName:   String
  season:           "Kharif" | "Rabi" | "Zaid" | "All Season"
  category:         "Fruit" | "Vegetable" | "Grain" | "Cash Crop" | "Pulse" | "Other"
  description:      String
  image:            String (URL)
  optimalConditions: {
    temperature:    String (e.g. "20-30°C")
    humidity:       String (e.g. "60-80%")
    soil:           String (e.g. "Loamy")
    water:          String (e.g. "Moderate")
    ph:             String (e.g. "6.0-7.0")
  }
  commonDiseases:   [ObjectId → Disease]
  createdAt:        DateTime
  updatedAt:        DateTime
}
```

### Disease

```
{
  _id:                  ObjectId
  name:                 String
  cropId:               ObjectId → Crop
  symptoms:             [String]
  causes:               [String]
  prevention:           [String]
  treatment: {
    chemical:           [String]
    organic:            [String]
  }
  severity:             "Low" | "Medium" | "High" | "Critical"
  image:                String (URL)
  modelLabel:           String (exact label from AI model, e.g. "Tomato___Late_blight")
  confidenceThreshold:  Number (0.0 – 1.0, default 0.7)
  createdAt:            DateTime
  updatedAt:            DateTime
}
```

### Post

```
{
  _id:           ObjectId
  userId:        ObjectId → User
  title:         String (max 200 chars)
  content:       String
  images:        [String] (URLs)
  tags:          [String]
  likes:         [ObjectId → User]
  comments: [{
    _id:         ObjectId
    userId:      ObjectId → User
    content:     String (max 1000 chars)
    createdAt:   DateTime
  }]
  isFlagged:     Boolean
  likeCount:     Number (virtual)
  commentCount:  Number (virtual)
  createdAt:     DateTime
  updatedAt:     DateTime
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|---|---|---|
| `200` | OK | Successful GET/PUT |
| `201` | Created | Successful POST |
| `400` | Bad Request | Missing required fields, invalid data |
| `401` | Unauthorized | Missing/invalid/expired JWT token |
| `403` | Forbidden | User doesn't have permission (wrong role, not owner) |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Internal server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### Common Auth Errors

| Scenario | Status | Message |
|---|---|---|
| No token provided | 401 | `"Not authorized"` |
| Invalid/expired token | 401 | `"Token is invalid or expired"` |
| User account deleted | 401 | `"User not found"` |
| Wrong role | 403 | `"Role 'farmer' is not authorized to access this route"` |
| Wrong email/password | 401 | `"Invalid credentials"` |

---

## Flutter Integration Guide

### Recommended Packages

```yaml
# pubspec.yaml
dependencies:
  dio: ^5.4.0                          # HTTP client
  flutter_secure_storage: ^9.0.0       # Secure JWT storage
  image_picker: ^1.0.0                 # Camera/gallery for scan
  google_sign_in: ^6.2.0               # Google OAuth (optional)
  geolocator: ^10.0.0                  # GPS location for scans
  firebase_messaging: ^14.0.0          # Push notifications (FCM)
  cached_network_image: ^3.3.0         # Image caching
```

### API Service Setup (Dio Example)

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'https://your-render-app.onrender.com/api/v1';

  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    // Automatically attach JWT token to every request
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired → redirect to login
        }
        handler.next(error);
      },
    ));
  }

  // ─── Auth ────────────────────────────────────────────
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final token = response.data['token'];
    await _storage.write(key: 'jwt_token', value: token);
    return response.data;
  }

  Future<Map<String, dynamic>> register(String username, String email, String password) async {
    final response = await _dio.post('/auth/register', data: {
      'username': username,
      'email': email,
      'password': password,
    });
    final token = response.data['token'];
    await _storage.write(key: 'jwt_token', value: token);
    return response.data;
  }

  Future<Map<String, dynamic>> getMe() async {
    final response = await _dio.get('/auth/me');
    return response.data;
  }

  // ─── Disease Detection ──────────────────────────────
  Future<Map<String, dynamic>> scanImage(String imagePath, {double? lat, double? lng}) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(imagePath, filename: 'scan.jpg'),
      'platform': 'mobile',
      if (lat != null) 'latitude': lat,
      if (lng != null) 'longitude': lng,
    });
    final response = await _dio.post('/detect', data: formData);
    return response.data;
  }

  Future<Map<String, dynamic>> getScanHistory({int page = 1, int limit = 10}) async {
    final response = await _dio.get('/detect/history', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return response.data;
  }

  // ─── Crops & Diseases ───────────────────────────────
  Future<Map<String, dynamic>> getCrops({String? season, String? category}) async {
    final response = await _dio.get('/crops', queryParameters: {
      if (season != null) 'season': season,
      if (category != null) 'category': category,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getDiseases({String? severity, String? cropId}) async {
    final response = await _dio.get('/diseases', queryParameters: {
      if (severity != null) 'severity': severity,
      if (cropId != null) 'cropId': cropId,
    });
    return response.data;
  }

  // ─── Community Posts ────────────────────────────────
  Future<Map<String, dynamic>> getPosts({int page = 1, String? tag}) async {
    final response = await _dio.get('/posts', queryParameters: {
      'page': page,
      if (tag != null) 'tag': tag,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> createPost(String title, String content, {List<String>? tags}) async {
    final response = await _dio.post('/posts', data: {
      'title': title,
      'content': content,
      if (tags != null) 'tags': tags,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> likePost(String postId) async {
    final response = await _dio.put('/posts/$postId/like');
    return response.data;
  }

  Future<Map<String, dynamic>> addComment(String postId, String content) async {
    final response = await _dio.post('/posts/$postId/comment', data: {
      'content': content,
    });
    return response.data;
  }

  // ─── Profile ────────────────────────────────────────
  Future<Map<String, dynamic>> updateFcmToken(String fcmToken) async {
    final response = await _dio.put('/auth/profile', data: {
      'fcmToken': fcmToken,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> uploadProfilePicture(String imagePath) async {
    final formData = FormData.fromMap({
      'profilePicture': await MultipartFile.fromFile(imagePath, filename: 'profile.jpg'),
    });
    final response = await _dio.put('/auth/profile-picture', data: formData);
    return response.data;
  }
}
```

---

## Important Notes

### 1. Image URL Handling (S3 Pre-signed URLs)

When the backend uses **AWS S3** storage (production), image URLs in scan history are **pre-signed** and **expire after a limited time**. You should:

- Cache images locally in Flutter using `cached_network_image`
- Re-fetch history if images fail to load (expired URLs)
- Don't store pre-signed URLs long-term; the ID-based `GET /detect/:id` endpoint always returns a fresh URL

### 2. OAuth for Mobile

The OAuth routes (`/auth/google`, `/auth/facebook`) use **browser redirect flow** designed for the web app. For Flutter:

- Use `google_sign_in` / `flutter_facebook_auth` packages natively
- Then call `/auth/register` or `/auth/login` with the user's email
- Or implement a separate `/auth/google-mobile` endpoint that accepts Google's ID token

### 3. Push Notifications (FCM)

The `fcmToken` field is already in the User model. To enable push notifications:

1. Initialize Firebase Messaging in Flutter
2. Get the device token: `FirebaseMessaging.instance.getToken()`
3. Send it to backend: `PUT /api/v1/auth/profile` with `{ "fcmToken": "..." }`
4. Backend will need a notification-sending service (not yet implemented)

### 4. Platform Field

Always send `platform: "mobile"` when making detection requests from Flutter. This helps distinguish web vs mobile scans in analytics.

### 5. File Upload Size Limits

| Endpoint | Max Size |
|---|---|
| Profile Picture | 5 MB |
| Disease Scan Image | 10 MB |

### 6. Pagination Pattern

All paginated endpoints return this structure:
```json
{
  "count": 10,     // items on this page
  "total": 47,     // total items
  "page": 1,       // current page
  "pages": 5       // total pages
}
```

Use `page` and `limit` query params for infinite scroll in Flutter.

---

> **Questions?** Contact the backend developer or raise an issue in the repository.
