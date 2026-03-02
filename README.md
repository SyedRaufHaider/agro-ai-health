
# 🌿 Agro AI Health

**AI-Powered Plant Disease Detection for Modern Agriculture**

An intelligent web platform that helps farmers and agronomists detect crop diseases instantly by analyzing leaf images using deep learning — delivering diagnoses, confidence scores, treatment recommendations, and full scan history in one place.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![PyTorch](https://img.shields.io/badge/PyTorch-ResNet--50-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org)
[![License](https://img.shields.io/badge/License-Educational-green?style=flat-square)](#license)

[🚀 Live Demo](#) · [📖 Documentation](#-documentation) · [🐛 Report a Bug](https://github.com/your-username/agro-ai-health/issues) · [✨ Request Feature](https://github.com/your-username/agro-ai-health/issues)

---

## 📸 Preview

> Upload a leaf image → Get instant AI diagnosis → View treatment plan

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Diagnosis** | PyTorch ResNet-50 model identifies 30+ plant diseases with confidence scores |
| 📊 **Scan History** | Full dashboard with past scans, statistics, and disease trend tracking |
| 💊 **Treatments** | Chemical and organic treatment options backed by agricultural research |
| 🌐 **Community Feed** | Share findings, post questions, and connect with fellow farmers |
| 👤 **User Profiles** | Profile management with picture upload |
| ☁️ **Dual Storage** | Seamlessly toggle between AWS S3 and Cloudinary for image storage |
| 🔒 **Secure Auth** | JWT-based authentication with bcrypt password hashing |
| 📱 **Responsive UI** | Glassmorphism design, mobile hamburger menu, dark/light themes |
| 🚀 **Flutter Ready** | Backend API designed for both web and Flutter mobile app |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Tailwind CSS + shadcn/ui | Styling & component library |
| React Router v6 | Client-side routing |
| Vite 5 | Build tool & dev server |
| Axios | HTTP client with JWT interceptor |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB Atlas + Mongoose | Database & ODM |
| JWT + bcrypt | Authentication & password security |
| Multer | File upload middleware |
| AWS S3 / Cloudinary | Image storage (configurable) |
| Python (PyTorch) | AI model inference via child process |

---

## 📁 Project Structure

```
agro-ai-health-main/
├── src/                            # React frontend (TypeScript)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── Navigation.tsx          # Smart navbar (logged-in/guest views)
│   │   ├── Hero.tsx                # Landing page hero section
│   │   ├── Footer.tsx              # Site footer
│   │   └── ProtectedRoute.tsx      # Route guard → redirects to /login
│   ├── pages/
│   │   ├── Index.tsx               # Landing page
│   │   ├── Dashboard.tsx           # Stats + scan history
│   │   ├── Scan.tsx                # Image upload + AI diagnosis
│   │   ├── Login.tsx               # Authentication
│   │   ├── Signup.tsx              # Registration
│   │   ├── Profile.tsx             # User profile management
│   │   ├── About.tsx               # About page
│   │   ├── FAQs.tsx                # Help & support
│   │   └── ...                     # Features, Demo, Privacy, Terms
│   ├── lib/
│   │   └── api.ts                  # Axios instance + JWT interceptor
│   ├── hooks/                      # Custom React hooks
│   ├── assets/                     # Images, logos
│   └── index.css                   # Design system (HSL CSS tokens)
│
├── backend/                        # Express API server
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── cloudinary.js           # Cloudinary upload config
│   │   └── s3.js                   # AWS S3 upload config
│   ├── models/
│   │   ├── User.js                 # User schema (auth, profile, FCM)
│   │   ├── Detection.js            # Scan results (AI predictions)
│   │   ├── Crop.js                 # Crop catalog
│   │   ├── Disease.js              # Disease data + treatments
│   │   └── Post.js                 # Community posts + comments
│   ├── routes/
│   │   ├── auth.js                 # Register, login, profile, profile picture
│   │   ├── detect.js               # Image upload + AI prediction
│   │   ├── crops.js                # CRUD for crops
│   │   ├── diseases.js             # CRUD for diseases
│   │   └── posts.js                # Community feed
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification middleware
│   │   └── errorHandler.js         # Global error handler
│   ├── ml_models/
│   │   ├── predict.py              # Python inference script
│   │   ├── class_names.json        # Model class → disease label mapping
│   │   └── README.md               # Model setup instructions
│   ├── seeder.js                   # Database seed script
│   ├── server.js                   # Express entry point
│   └── .env.example                # Environment variable template
│
├── db_docs/                        # Database documentation & scripts
│   ├── mongodb_schemas.md
│   ├── supabase_create_tables.sql
│   └── ...
│
└── docs/                           # Project documentation
    ├── development_plan.md
    ├── implementation_plan.md
    ├── mongodb_schema.md
    ├── aws_s3_config.md
    ├── AI_Implementation_Plan.md
    ├── flutter_mobile_app.md
    └── mobile_implementation_plan.md
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18+ and npm
- **Python** 3.8+ with pip
- **Git**
- A **MongoDB Atlas** account (free tier works)
- A **Cloudinary** or **AWS S3** account for image storage

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agro-ai-health.git
cd agro-ai-health-main
```

---

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
# → Runs at http://localhost:5173
```

---

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
# Then open .env and fill in your credentials (see below)

# Start the API server with hot-reload
npm run dev
# → API running at http://localhost:5000
```

---

### 4. Environment Variables

Open `backend/.env` and configure the following:

```env
# ── MongoDB ─────────────────────────────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agro-ai-health

# ── JWT ─────────────────────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d

# ── Image Storage (choose one: "cloudinary" or "s3") ────────────────────────
IMAGE_STORAGE=cloudinary

# ── Cloudinary (if IMAGE_STORAGE=cloudinary) ────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── AWS S3 (if IMAGE_STORAGE=s3) ────────────────────────────────────────────
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=agro-ai-health-images

# ── Python / AI ─────────────────────────────────────────────────────────────
PYTHON_PATH=python

# ── CORS ─────────────────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

---

### 5. AI Model Setup

```bash
# Install Python dependencies
pip install torch torchvision pillow

# Place your trained model file at:
# backend/ml_models/plant_disease_model.pt

# Update class label mapping if needed:
# backend/ml_models/class_names.json

# Test inference standalone:
python backend/ml_models/predict.py path/to/test_leaf_image.jpg
```

> 📌 The model is not included in this repository due to file size. See [AI Implementation Plan](docs/AI_Implementation_Plan.md) for training and export instructions.

---

### 6. Seed the Database

```bash
cd backend
npm run seed
```

This populates MongoDB with sample crops, diseases, and treatment data.

---

## 🧠 AI Model Pipeline

```
User uploads leaf image
        │
        ▼
Node.js receives file (Multer middleware)
        │
        ├──► Upload to S3 / Cloudinary  →  Permanent URL saved
        │
        ├──► Write image to temp file
        │
        ▼
spawn("python", ["predict.py", tempFilePath])
        │
        ▼
PyTorch ResNet-50 inference
        │
        ▼
JSON output: { disease, confidence, status, top_predictions[] }
        │
        ▼
Match disease label → Disease collection → fetch treatments
        │
        ▼
Save Detection record to MongoDB
        │
        ▼
Return full result to React frontend
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile | 🔒 JWT |
| `PUT` | `/api/v1/auth/profile` | Update profile fields | 🔒 JWT |
| `PUT` | `/api/v1/auth/profile-picture` | Upload profile picture | 🔒 JWT |

### 🔬 Plant Disease Detection

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/detect` | Upload leaf image for AI diagnosis | 🔒 JWT |
| `GET` | `/api/v1/detect/history` | Get user's full scan history | 🔒 JWT |
| `GET` | `/api/v1/detect/:id` | Get a specific scan result by ID | 🔒 JWT |

### 🌾 Crops & Diseases

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/crops` | List all crops in the catalog | Public |
| `GET` | `/api/v1/diseases` | List all diseases with treatments | Public |

### 🗣️ Community

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/posts` | List all community posts | Public |
| `POST` | `/api/v1/posts` | Create a new post | 🔒 JWT |

---

## 🔒 Security

- **Passwords** — Hashed with bcrypt (12 salt rounds), never stored in plain text
- **Authentication** — Stateless JWT Bearer tokens with configurable expiry
- **Route Protection** — Auth middleware on all private endpoints
- **File Validation** — Multer MIME-type filter + 10 MB size limit
- **CORS** — Configurable allowed origins via `CLIENT_URL` env variable
- **Input Validation** — `express-validator` on all auth routes

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Development Plan](docs/development_plan.md) | Architecture, tech stack decisions, and design rationale |
| [Implementation Plan](docs/implementation_plan.md) | Phase-by-phase development roadmap |
| [MongoDB Schema](docs/mongodb_schema.md) | All collections with field types, indexes, and ER diagram |
| [AWS S3 Config](docs/aws_s3_config.md) | Bucket setup, IAM policy, CORS, and migration guide |
| [AI Implementation](docs/AI_Implementation_Plan.md) | Model integration, predict.py walkthrough, testing checklist |
| [Flutter Mobile Plan](docs/flutter_mobile_app.md) | Mobile app architecture and offline-first design |
| [Mobile Implementation](docs/mobile_implementation_plan.md) | Flutter development phases and API integration guide |
| [Database Docs](db_docs/README.md) | MongoDB & Supabase schemas, runnable scripts, and storage toggles |

---

## 🧪 Available Scripts

```bash
# ── Frontend (run from project root) ────────────────────────────────────────
npm run dev          # Start Vite dev server  →  http://localhost:5173
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally

# ── Backend (run from /backend) ──────────────────────────────────────────────
npm run dev          # Start server with nodemon (auto-reload on changes)
npm start            # Start production server
npm run seed         # Seed MongoDB with sample crops, diseases, and users
```

---

## 🗺️ Roadmap

- [x] Frontend — React 18 + TypeScript + Tailwind CSS + shadcn/ui
- [x] Backend — Node.js + Express + MongoDB + JWT authentication
- [x] Image Storage — Cloudinary + AWS S3 dual support
- [x] AI Pipeline — Python predict.py + Node.js child process bridge
- [x] Dashboard — Scan history, statistics, skeleton loading states
- [x] Scan Page — Drag-and-drop upload, result card, confidence progress bar
- [x] Route Guards — Protected routes with automatic login redirect
- [x] Mobile Navigation — Hamburger menu with responsive layout
- [x] Profile Picture Upload — Avatar upload with cloud storage
- [x] Deployment — Backend on Render, Frontend on Vercel
- [ ] AI model .pt file deployment to production server
- [ ] Push notifications (FCM integration)
- [ ] End-to-end testing suite
- [ ] Flutter mobile app (Android + iOS)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a descriptive message
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** and describe your changes

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is developed for **educational and research purposes**.  
All rights reserved © 2026 Agro AI Team.

---

<div align="center">

Built with 💚 by the **Agro AI Team**

*Empowering farmers with the power of AI*

</div>
