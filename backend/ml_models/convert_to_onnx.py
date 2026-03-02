"""
convert_to_onnx.py — Convert plant_disease_model.pt/.pth to ONNX format
==========================================================================

Run this ONCE on your local machine (needs Python 3.8-3.12 + torch).
The output plant_disease_model.onnx is tiny-dependency and runs on Render
free tier using onnxruntime-cpu (~20 MB) instead of PyTorch (~700 MB).

Usage:
    python convert_to_onnx.py

Output:
    backend/ml_models/plant_disease_model.onnx

Requirements (local only — NOT needed on Render after conversion):
    pip install torch torchvision onnx
"""

import os
import torch
import torch.nn.functional as F
from torchvision import models

# ─── Paths ───────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_IN    = os.path.join(SCRIPT_DIR, "plant_disease_model.pt")   # your .pt file
MODEL_OUT   = os.path.join(SCRIPT_DIR, "plant_disease_model.onnx") # output

NUM_CLASSES = 32   # must match your class_names.json count
IMAGE_SIZE  = 224

# ─── 1. Load model ───────────────────────────────────────────
print(f"Loading model from: {MODEL_IN}")

# First try as TorchScript
try:
    model = torch.jit.load(MODEL_IN, map_location="cpu")
    print("  ✓ Loaded as TorchScript model")
except Exception:
    # Fall back to ResNet-50 state_dict
    print("  Not TorchScript — loading as ResNet-50 state_dict...")
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, NUM_CLASSES)

    state_dict = torch.load(MODEL_IN, map_location="cpu")

    # Strip DataParallel prefix
    if any(k.startswith("module.") for k in state_dict.keys()):
        state_dict = {k.replace("module.", ""): v for k, v in state_dict.items()}

    model.load_state_dict(state_dict)
    print("  ✓ Loaded as ResNet-50 state_dict")

model.eval()

# ─── 2. Export to ONNX ───────────────────────────────────────
# Dummy input: batch of 1, RGB image of IMAGE_SIZE x IMAGE_SIZE
dummy_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE)

print(f"\nExporting to ONNX: {MODEL_OUT}")
torch.onnx.export(
    model,
    dummy_input,
    MODEL_OUT,
    export_params=True,          # store trained weights
    opset_version=17,            # ONNX opset (17 = widely supported)
    do_constant_folding=True,    # optimize constant operations
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input":  {0: "batch_size"},
        "output": {0: "batch_size"},
    },
)

size_mb = os.path.getsize(MODEL_OUT) / (1024 * 1024)
print(f"\n✅ Done! Saved to: {MODEL_OUT}")
print(f"   File size: {size_mb:.1f} MB")
print(f"\nNext steps:")
print(f"  1. Copy {MODEL_OUT} to your Render server / commit to repo")
print(f"  2. Install on Render: pip install onnxruntime pillow numpy")
print(f"  3. Use predict_onnx.py (not predict.py) on the server")
