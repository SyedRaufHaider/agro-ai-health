"""
predict_onnx.py — Plant Disease Prediction (ONNX Runtime, Render-compatible)
==============================================================================
Called by the Node.js backend via child_process.spawn.
Uses onnxruntime-cpu (~20 MB) instead of PyTorch (~700 MB).

Usage:
    python predict_onnx.py <image_path>

Output (stdout):
    {
        "disease": "Tomato___Late_blight",
        "confidence": 0.9432,
        "status": "infected",
        "predictions": [
            {"label": "Tomato___Late_blight", "confidence": 0.9432},
            {"label": "Tomato___Early_blight", "confidence": 0.0321},
            {"label": "Tomato___Leaf_Mold",    "confidence": 0.0112}
        ]
    }

Requirements (Render-safe, small footprint):
    pip install onnxruntime pillow numpy
"""

import sys
import json
import os

import numpy as np
import onnxruntime as ort
from PIL import Image


# ─── Configuration ──────────────────────────────────────────
SCRIPT_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH       = os.path.join(SCRIPT_DIR, "plant_disease_model.onnx")
CLASS_NAMES_PATH = os.path.join(SCRIPT_DIR, "class_names.json")
IMAGE_SIZE       = 224
TOP_K            = 3

# ImageNet normalization constants
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)


# ─── Load class names ──────────────────────────────────────
def load_class_names():
    with open(CLASS_NAMES_PATH, "r") as f:
        mapping = json.load(f)
    return {int(k): v for k, v in mapping.items()}


# ─── Preprocess image ──────────────────────────────────────
def preprocess(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((IMAGE_SIZE, IMAGE_SIZE), Image.BILINEAR)

    # HWC → float32 → normalize → CHW → batch dim
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = arr.transpose(2, 0, 1)          # HWC → CHW
    arr = np.expand_dims(arr, axis=0)     # → [1, 3, H, W]
    return arr


# ─── Softmax ────────────────────────────────────────────────
def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()


# ─── Predict ────────────────────────────────────────────────
def predict(image_path):
    class_names = load_class_names()

    # Load ONNX model (cached after first load by ort internally)
    session = ort.InferenceSession(
        MODEL_PATH,
        providers=["CPUExecutionProvider"],
    )

    input_name  = session.get_inputs()[0].name
    input_tensor = preprocess(image_path)

    # Run inference
    outputs      = session.run(None, {input_name: input_tensor})
    logits       = outputs[0][0]          # shape: [num_classes]
    probabilities = softmax(logits)

    # Top-K predictions
    top_k_indices = np.argsort(probabilities)[::-1][:TOP_K]
    predictions = [
        {
            "label":      class_names.get(int(i), f"class_{i}"),
            "confidence": round(float(probabilities[i]), 4),
        }
        for i in top_k_indices
    ]

    top_label      = predictions[0]["label"]
    top_confidence = predictions[0]["confidence"]
    status         = "healthy" if "healthy" in top_label.lower() else "infected"

    return {
        "disease":     top_label,
        "confidence":  top_confidence,
        "status":      status,
        "predictions": predictions,
        "model_type":  "onnx",
    }


# ─── Main ───────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python predict_onnx.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.isfile(image_path):
        print(json.dumps({"error": f"File not found: {image_path}"}))
        sys.exit(1)

    try:
        result = predict(image_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
