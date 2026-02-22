# ML Models Directory

This directory stores **PyTorch pre-trained model files** (`.pt` or `.pth`).

## Naming Convention

| File | Description |
|---|---|
| `plant_disease_model.pt` | Primary production model (PyTorch `torch.save()` format) |
| `class_names.json` | JSON mapping of model output indices → disease labels |

## How to Add a Model

1. Place your `.pt` or `.pth` file in this directory
2. Update `class_names.json` to match the model's output classes
3. The `predict.py` script at `backend/ml_models/predict.py` will load it automatically

## Size Limit

Model files can be large (50–200 MB). They are `.gitignore`d by default.
Add them via Git LFS or copy them manually to deployment servers.
