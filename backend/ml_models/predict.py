"""
predict.py — Plant Disease Prediction Script
=============================================
Called by the Node.js backend via child_process.spawn.

Usage:
    python predict.py <image_path>

Output (stdout):
    JSON string with prediction results:
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

Requirements:
    pip install torch torchvision pillow
"""

import sys
import json
import os

import torch
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image


# ─── Configuration ──────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "plant_disease_model.pt")
CLASS_NAMES_PATH = os.path.join(SCRIPT_DIR, "class_names.json")
IMAGE_SIZE = 224
TOP_K = 3  # Number of top predictions to return


# ─── Load class names ──────────────────────────────────────
def load_class_names():
    with open(CLASS_NAMES_PATH, "r") as f:
        mapping = json.load(f)
    # Convert string keys to int and sort
    return {int(k): v for k, v in mapping.items()}


# ─── Load model ─────────────────────────────────────────────
def load_model(num_classes):
    """
    Load the pre-trained PyTorch model.
    Adjust this function to match your model architecture.

    Common architectures:
    - models.resnet50(pretrained=False)
    - models.efficientnet_b0(pretrained=False)
    - models.mobilenet_v2(pretrained=False)
    """
    model = models.resnet50(pretrained=False)
    # Replace final FC layer to match number of disease classes
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

    # Load saved weights
    state_dict = torch.load(MODEL_PATH, map_location=torch.device("cpu"))

    # Handle case where model was saved with DataParallel wrapper
    if any(k.startswith("module.") for k in state_dict.keys()):
        state_dict = {k.replace("module.", ""): v for k, v in state_dict.items()}

    model.load_state_dict(state_dict)
    model.eval()
    return model


# ─── Image preprocessing ───────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet defaults
        std=[0.229, 0.224, 0.225],
    ),
])


# ─── Predict ────────────────────────────────────────────────
def predict(image_path):
    class_names = load_class_names()
    num_classes = len(class_names)

    model = load_model(num_classes)

    # Load and preprocess image
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)  # Add batch dimension

    # Run inference
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = F.softmax(output, dim=1)[0]

    # Get top-k predictions
    top_k_probs, top_k_indices = torch.topk(probabilities, min(TOP_K, num_classes))

    predictions = []
    for prob, idx in zip(top_k_probs, top_k_indices):
        predictions.append({
            "label": class_names.get(idx.item(), f"class_{idx.item()}"),
            "confidence": round(prob.item(), 4),
        })

    # Top prediction
    top_label = predictions[0]["label"]
    top_confidence = predictions[0]["confidence"]
    status = "healthy" if "healthy" in top_label.lower() else "infected"

    result = {
        "disease": top_label,
        "confidence": top_confidence,
        "status": status,
        "predictions": predictions,
    }

    return result


# ─── Main ───────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python predict.py <image_path>"}))
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
