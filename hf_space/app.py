"""
Agro AI - Plant Disease Detection API
FastAPI app using Keras (.keras) model directly
"""
import json
import io
import os
import os
os.environ["KERAS_BACKEND"] = "tensorflow"
import numpy as np
import tensorflow as tf
import keras
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Agro AI - Plant Disease Detection API")

# Allow all origins (Render backend / Flutter app will call this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load model + class names once at startup ─────────────────────
SCRIPT_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH       = os.path.join(SCRIPT_DIR, "plant_disease_model_patched.keras")
CLASS_NAMES_PATH = os.path.join(SCRIPT_DIR, "class_names.json")

print("Loading Keras model...")
model = keras.models.load_model(MODEL_PATH, compile=False)
print("✅ Model loaded!")
print(f"   Input  shape : {model.input_shape}")
print(f"   Output shape : {model.output_shape}")

with open(CLASS_NAMES_PATH) as f:
    CLASS_NAMES = json.load(f)   # { "0": "Apple___Apple_scab", ... }

# ─── Image preprocessing ──────────────────────────────────────────
# Matches training pipeline exactly:
#   image_dataset_from_directory(image_size=(128,128)) → raw float32 [0–255]
#   No Rescaling / Normalization layer found in model → pass raw pixels

def preprocess(image_bytes: bytes) -> np.ndarray:
    """Resize to 128x128, pass raw pixels [0-255]. Returns (1, 128, 128, 3)."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((128, 128))
    arr = np.array(img, dtype=np.float32)   # raw pixels - matches training
    return np.expand_dims(arr, axis=0)      # → (1, 128, 128, 3)


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
    image_bytes = await image.read()

    try:
        input_tensor  = preprocess(image_bytes)
        probabilities = model.predict(input_tensor, verbose=0)[0]   # already softmax output
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

    # Confidence threshold: reject predictions below 60% to avoid wrong
    # results for plants not in the training data (Peach, Cherry, Mango, etc.)
    CONFIDENCE_THRESHOLD = 0.60
    SUPPORTED_PLANTS = "Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato"

    if predictions[0]["confidence"] < CONFIDENCE_THRESHOLD:
        return {
            "disease":     "Unrecognized Plant",
            "confidence":  predictions[0]["confidence"],
            "status":      "unrecognized",
            "message":     f"Plant not recognized or image quality too low. "
                           f"Supported plants: {SUPPORTED_PLANTS}.",
            "predictions": predictions,
        }

    return {
        "disease":     top_label,
        "confidence":  predictions[0]["confidence"],
        "status":      "healthy" if "healthy" in top_label.lower() else "infected",
        "predictions": predictions,
    }
