# Agro AI Health - Development Plan

## 1. Project Overview
Agro AI Health is a comprehensive system designed to help farmers and agricultural enthusiasts detect plant and crop diseases using Artificial Intelligence. The system consists of a Web Application (MERN Stack) and a Mobile Application (Flutter), both sharing a common backend and database.

## 2. Architecture
- **Frontend (Web)**: React.js (Vite, TypeScript, Tailwind CSS, Shadcn UI)
- **Mobile App**: Flutter (Dart)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **AI Engine**: Python (Flask/FastAPI) or TensorFlow.js for disease detection model serving.
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Cloudinary or AWS S3 (for image storage)

## 3. Key Features
- **User Authentication**: Sign up, Login, Profile Management.
- **Disease Detection**: Upload/Take photo of a leaf -> AI analyzes -> Returns disease name, confidence, and cure suggestions.
- **Crop Management**: Users can add their crops and track their health.
- **Community Forum**: Farmers can discuss issues and share knowledge.
- **Expert Consultation**: Option to connect with agriculture experts (Future Scope).
- **Weather Integration**: real-time weather updates for farming advice.

## 4. Tech Stack Considerations
- **Shared Backend**: The Node.js/Express API will serve both the React Web App and the Flutter Mobile App.
- **Database**: MongoDB is chosen for its flexibility with unstructured data (like varying disease info) and scalability.
- **State Management**: 
  - Web: TanStack Query (React Query) + Context API / Zustand
  - Mobile: Provider / Riverpod / Bloc

## 5. Development Roadmap

### Phase 1: Backend & Database Setup
- Initialize Node.js project.
- Setup MongoDB connection.
- Design and implement Mongoose schemas.
- Implement Authentication APIs (Signup, Login).
- Set up Image Upload functionality.

### Phase 2: AI Integration
- Train/Acquire a pre-trained model for plant disease detection.
- Create an API endpoint (Python or Node wrapper) to process images and return predictions.

### Phase 3: Web Application Development
- Build Dashboard.
- Implement Image Upload & Result display.
- Integrate Community Forum.
- User Profile settings.

### Phase 4: Mobile Application Development (Flutter)
- Setup Flutter project.
- Implement UI similar to Web.
- Integrate Camera & Gallery for image capture.
- Connect to Backend APIs.

### Phase 5: Testing & Deployment
- Unit and Integration testing.
- Deploy Backend (e.g., Render, Vercel, AWS).
- Deploy Web App (e.g., Vercel, Netlify).
- Release Mobile App (Play Store/App Store).

## 6. Directory Structure Recommendation
```
/agro-ai-health
  /backend       # Node.js/Express Server
  /frontend      # React Web App (Current 'src' root)
  /mobile        # Flutter App
  /ai-engine     # Python Model Server
  /Docs          # Documentation
```
