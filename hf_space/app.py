"""
Agro AI - Plant Disease Detection API
FastAPI app for Hugging Face Spaces
"""
import json
import io
import os
import numpy as np
import onnxruntime as ort
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Agro AI - Plant Disease Detection API")

# Allow all origins (Render backend will call this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load model + class names once at startup ─────────────────────
SCRIPT_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH       = os.path.join(SCRIPT_DIR, "plant_disease_model.onnx")
CLASS_NAMES_PATH = os.path.join(SCRIPT_DIR, "class_names.json")

print("Loading ONNX model...")
session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
input_name = session.get_inputs()[0].name
print("✅ Model loaded!")

with open(CLASS_NAMES_PATH) as f:
    CLASS_NAMES = json.load(f)   # { "0": "Apple___Apple_scab", ... }

# ─── Image preprocessing ──────────────────────────────────────────
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

def preprocess(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = arr.transpose(2, 0, 1)           # HWC → CHW
    return np.expand_dims(arr, axis=0)     # → [1, 3, 224, 224]

def softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x))
    return e / e.sum()


# ─── Routes ───────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "message": "Agro AI Model API is running 🌿"}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    """
    Upload a plant leaf image and get disease prediction.
    Returns: disease label, confidence, status, top-3 predictions.
    """
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await image.read()

    try:
        input_tensor  = preprocess(image_bytes)
        logits        = session.run(None, {input_name: input_tensor})[0][0]
        probabilities = softmax(logits)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    top3_indices = np.argsort(probabilities)[::-1][:3]

    predictions = [
        {
            "label":      CLASS_NAMES.get(str(int(i)), f"class_{i}"),
            "confidence": round(float(probabilities[i]), 4),
        }
        for i in top3_indices
    ]

    top_label = predictions[0]["label"]

    return {
        "disease":     top_label,
        "confidence":  predictions[0]["confidence"],
        "status":      "healthy" if "healthy" in top_label.lower() else "infected",
        "predictions": predictions,
    }
