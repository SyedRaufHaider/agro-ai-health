# 🌿 Agro AI Health — Plant Disease Detection

An AI-powered web application that helps farmers and agriculturists detect plant diseases by analyzing leaf images using deep learning. Upload a photo, get an instant diagnosis with confidence scores, treatment recommendations, and medicine suggestions.

---

## 🎯 Features

- **AI-Powered Diagnosis** — PyTorch model analyzes plant images and identifies 30+ diseases
- **Instant Results** — Confidence scores, top-k predictions, and severity levels
- **Treatment Recommendations** — Chemical and organic treatment options backed by agricultural research
- **Scan History** — Full dashboard with past scans, stats, and trend tracking
- **Community Feed** — Share findings, ask questions, and help fellow farmers
- **User Profiles** — Profile management with picture upload
- **Multi-Platform Ready** — Backend designed for both web and future Flutter mobile app
- **Dual Storage** — Toggle between AWS S3 and Cloudinary for image storage
- **Responsive UI** — Glassmorphism navigation, mobile hamburger menu, dark/light themes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · TypeScript · Tailwind CSS · shadcn/ui · React Router |
| **Backend** | Node.js · Express.js · Mongoose ODM |
| **Database** | MongoDB Atlas |
| **Image Storage** | AWS S3 / Cloudinary (configurable) |
| **AI Model** | PyTorch (.pt / .pth) via Python child process |
| **Auth** | JWT (Bearer tokens) · bcrypt password hashing |
| **Build Tool** | Vite 5 |

---

## 📁 Project Structure

```
agro-ai-health-main/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── Navigation.tsx      # Smart navbar (logged-in/guest views)
│   │   ├── Hero.tsx            # Landing page hero section
│   │   ├── Footer.tsx          # Site footer
│   │   └── ProtectedRoute.tsx  # Route guard (redirects to /login)
│   ├── pages/                  # Route pages
│   │   ├── Index.tsx           # Landing page
│   │   ├── Dashboard.tsx       # Stats + scan history
│   │   ├── Scan.tsx            # Image upload + AI diagnosis
│   │   ├── Login.tsx           # Authentication
│   │   ├── Signup.tsx          # Registration
│   │   ├── Profile.tsx         # User profile management
│   │   ├── About.tsx           # About page (login-aware CTAs)
│   │   ├── FAQs.tsx            # Help & support
│   │   └── ...                 # Features, Demo, Privacy, Terms
│   ├── lib/
│   │   └── api.ts              # API service with JWT interceptor
│   ├── hooks/                  # Custom React hooks
│   ├── assets/                 # Images, logos
│   └── index.css               # Design system (HSL tokens)
│
├── backend/                    # Express API server
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary upload config
│   │   └── s3.js               # AWS S3 upload config
│   ├── models/
│   │   ├── User.js             # User schema (auth, profile, FCM)
│   │   ├── Detection.js        # Scan results (AI predictions)
│   │   ├── Crop.js             # Crop catalog
│   │   ├── Disease.js          # Disease data + treatments
│   │   └── Post.js             # Community posts + comments
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile, profile picture
│   │   ├── detect.js           # Image upload + AI prediction
│   │   ├── crops.js            # CRUD for crops
│   │   ├── diseases.js         # CRUD for diseases
│   │   └── posts.js            # Community feed
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── errorHandler.js     # Global error handler
│   ├── ml_models/
│   │   ├── predict.py          # Python inference script
│   │   ├── class_names.json    # Model class → label mapping
│   │   └── README.md           # Model setup instructions
│   ├── seeder.js               # Database seed script
│   ├── server.js               # Express entry point
│   └── .env.example            # Environment variable template
│
└── docs/                       # Project documentation
    ├── development_plan.md
    ├── implementation_plan.md
    ├── mongodb_schema.md
    ├── aws_s3_config.md
    └── AI_Implementation_Plan.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (Atlas cluster or local)
- **Python** 3.8+ with pip (for AI model)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agro-ai-health.git
cd agro-ai-health-main
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → opens at http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env

# Start the server
npm run dev
# → API running at http://localhost:5000
```

### 4. Environment Variables

Edit `backend/.env` with your credentials:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agro-ai-health

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d

# Image Storage (choose one)
IMAGE_STORAGE=cloudinary   # or "s3"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 (if IMAGE_STORAGE=s3)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=agro-ai-health-images

# Python (for AI)
PYTHON_PATH=python

# CORS
CLIENT_URL=http://localhost:5173
```

### 5. AI Model Setup (Optional)

```bash
# Install Python dependencies
pip install torch torchvision pillow

# Place your trained model
# → backend/ml_models/plant_disease_model.pt

# Update class mapping if needed
# → backend/ml_models/class_names.json

# Test standalone
python backend/ml_models/predict.py path/to/test_image.jpg
```

### 6. Seed the Database

```bash
cd backend
npm run seed
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Login & get JWT token | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile | 🔒 |
| `PUT` | `/api/v1/auth/profile` | Update profile fields | 🔒 |
| `PUT` | `/api/v1/auth/profile-picture` | Upload profile picture | 🔒 |

### Plant Disease Detection

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/detect` | Upload image for diagnosis | 🔒 |
| `GET` | `/api/v1/detect/history` | Get user's scan history | 🔒 |
| `GET` | `/api/v1/detect/:id` | Get specific scan result | 🔒 |

### Crops & Diseases

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/crops` | List all crops | Public |
| `GET` | `/api/v1/diseases` | List all diseases | Public |

### Community

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/posts` | List community posts | Public |
| `POST` | `/api/v1/posts` | Create a new post | 🔒 |

---

## 🧠 AI Model Pipeline

```
User uploads image
       │
       ▼
Node.js receives file via multer
       │
       ├──► Upload to S3/Cloudinary → permanent URL
       │
       ├──► Write to temp file
       │
       ▼
spawn("python", ["predict.py", tempPath])
       │
       ▼
PyTorch model inference (ResNet-50)
       │
       ▼
JSON output: { disease, confidence, status, predictions[] }
       │
       ▼
Match disease label → Disease collection → treatments
       │
       ▼
Save Detection record → return full result to client
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Development Plan](docs/development_plan.md) | Architecture, tech stack, and design decisions |
| [Implementation Plan](docs/implementation_plan.md) | Phase-by-phase development roadmap |
| [MongoDB Schema](docs/mongodb_schema.md) | All collections with field types, indexes, and ER diagram |
| [AWS S3 Config](docs/aws_s3_config.md) | Bucket setup, IAM policy, CORS, and migration guide |
| [AI Implementation](docs/AI_Implementation_Plan.md) | Model integration, predict.py, and testing checklist |
| [Flutter Mobile Plan](docs/flutter_mobile_app.md) | Future mobile app architecture |
| [Mobile Implementation](docs/mobile_implementation_plan.md) | Flutter development phases |

---

## 🧪 Scripts

```bash
# Frontend
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build

# Backend
cd backend
npm run dev          # Start with nodemon (hot-reload)
npm start            # Start production server
npm run seed         # Seed database with sample data
```

---

## 🔒 Security

- **Passwords** — Hashed with bcrypt (salt rounds: 12)
- **Authentication** — JWT Bearer tokens with configurable expiry
- **Route Protection** — Middleware on all private endpoints
- **File Validation** — Multer filters for image types + size limits (10 MB)
- **CORS** — Configurable allowed origins
- **Input Validation** — express-validator on auth routes

---

## 🗺️ Roadmap

- [x] Frontend — React + TypeScript + Tailwind + shadcn/ui
- [x] Backend — Express + MongoDB + JWT auth
- [x] Image Storage — Cloudinary + AWS S3 (dual support)
- [x] AI Pipeline — Python predict.py + Node.js spawn bridge
- [x] Dashboard — Stats, scan history, skeleton loading
- [x] Scan Page — Drag-and-drop upload, result card, confidence bar
- [x] Route Guards — Protected routes with login redirect
- [x] Mobile Navigation — Hamburger menu for small screens
- [ ] Deploy AI model (.pt file)
- [ ] Seed disease database with treatments
- [ ] End-to-end testing
- [ ] Production deployment (Vercel + Railway/Render)
- [ ] Flutter mobile app

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational and research purposes.

---

<p align="center">
  Built with 💚 by the Agro AI Team
</p>
#   a g r o - a i - h e a l t h  
 