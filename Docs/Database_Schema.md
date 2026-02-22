# Database Schema Design (MongoDB)

This document outlines the MongoDB schema design for Agro AI Health. We will use Mongoose for object modeling.

## 1. Users Collection
Stores user information for both Web and Mobile apps.

```javascript
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['farmer', 'expert', 'admin'], default: 'farmer' },
  profilePicture: { type: String }, // URL
  location: {
    city: String,
    country: String,
    coordinates: [Number] // [longitude, latitude]
  },
  createdAt: { type: Date, default: Date.now }
});
```

## 2. Crops Collection
Stores detailed information about various crops.

```javascript
const CropSchema = new Schema({
  name: { type: String, required: true },
  scientificName: { type: String },
  season: { type: String }, // e.g., 'Kharif', 'Rabi'
  description: { type: String },
  image: { type: String }, // URL
  optimalConditions: {
    temperature: String,
    soil: String,
    water: String
  }
});
```

## 3. Diseases Collection
Stores information about plant diseases and their cures.

```javascript
const DiseaseSchema = new Schema({
  name: { type: String, required: true }, // e.g., 'Tomato Late Blight'
  cropId: { type: Schema.Types.ObjectId, ref: 'Crop' },
  symptoms: [String],
  prevention: [String],
  treatment: [String], // Chemical and Organic
  image: { type: String },
  confidenceThreshold: { type: Number, default: 0.7 }
});
```

## 4. Detections Collection (Scan History)
Stores user scan history.

```javascript
const DetectionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  predictedDiseaseId: { type: Schema.Types.ObjectId, ref: 'Disease' },
  confidence: { type: Number },
  status: { type: String, enum: ['healthy', 'infected', 'unknown'] },
  detectedAt: { type: Date, default: Date.now },
  location: {
    latitude: Number,
    longitude: Number
  }
});
```

## 5. Posts Collection (Community Forum)
Allows users to ask questions and share issues.

```javascript
const PostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [String],
  tags: [String], // e.g., 'Tomato', 'Pest'
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
```
