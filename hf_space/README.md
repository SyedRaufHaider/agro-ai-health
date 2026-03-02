---
title: Agro AI Plant Disease Detection
emoji: 🌿
colorFrom: green
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# 🌿 Agro AI — Plant Disease Detection API

FastAPI + ONNX Runtime inference API for plant disease detection.

## Endpoint

### `POST /predict`
Upload a plant leaf image and get disease prediction.

**Request:** `multipart/form-data` with field `image`

**Response:**
```json
{
  "disease": "Tomato___Late_blight",
  "confidence": 0.9432,
  "status": "infected",
  "predictions": [
    {"label": "Tomato___Late_blight", "confidence": 0.9432},
    {"label": "Tomato___Early_blight", "confidence": 0.0321},
    {"label": "Tomato___Leaf_Mold", "confidence": 0.0112}
  ]
}
```

### `GET /`
Health check.
