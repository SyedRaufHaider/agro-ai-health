# API Specification (REST)

Base URL: `/api/v1`

## 1. Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user and return JWT
- `GET /auth/me` - Get current user profile (Protected)
- `PUT /auth/profile` - Update profile (Protected)

## 2. Crops
- `GET /crops` - List all crops
- `GET /crops/:id` - Get crop details
- `POST /crops` - Add a new crop (Admin only)

## 3. Diseases
- `GET /diseases` - List all diseases
- `GET /diseases/:id` - Get disease details
- `GET /diseases/crop/:cropId` - Get diseases for a specific crop

## 4. Detection (AI)
- `POST /detect` - Upload image for disease detection
    - **Header**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
    - **Body**: `image` (file)
    - **Response**: `{ disease: "...", confidence: 0.95, cure: "...", detectionId: "..." }`
- `GET /detect/history` - Get user's scan history
- `GET /detect/:id` - Get specific detection result

## 5. Community Forum
- `GET /posts` - Get all community posts (with pagination)
- `POST /posts` - Create a new post
- `GET /posts/:id` - Get single post
- `POST /posts/:id/comment` - Add comment to a post
- `PUT /posts/:id/like` - Like/Unlike a post

## 6. Weather (External Proxy)
- `GET /weather?lat=...&lon=...` - Get weather data for specific location
