const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const Detection = require("../models/Detection");
const Disease = require("../models/Disease");
const { protect } = require("../middleware/auth");

// ─── Storage provider toggle ──────────────────────────────────
const useS3 = process.env.IMAGE_STORAGE === "s3";

let uploadMiddleware;
let getImageUrl;

if (useS3) {
    const { s3Upload, uploadToS3 } = require("../config/s3");
    uploadMiddleware = s3Upload.single("image");
    getImageUrl = async (file) => await uploadToS3(file.buffer, file.mimetype, "scans");
} else {
    // Use memory storage so req.file.buffer is always available for AI inference.
    // We upload the buffer manually to Cloudinary after.
    const multer = require("multer");
    const { cloudinary } = require("../config/cloudinary");

    uploadMiddleware = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) cb(null, true);
            else cb(new Error("Only image files are allowed"), false);
        },
    }).single("image");

    getImageUrl = (file) =>
        new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "agro-ai-health", resource_type: "image" },
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.secure_url);
                }
            );
            stream.end(file.buffer);
        });
}

// ─── Helper: run Python prediction script ─────────────────────
const ML_DIR = path.join(__dirname, "..", "ml_models");
const MODEL_FILE_PRIMARY = path.join(ML_DIR, "plant_disease_model.pt");
const MODEL_FILE_MOBILE = path.join(ML_DIR, "agroai_mobile.pt");
const MODEL_FILE_ONNX = path.join(ML_DIR, "plant_disease_model.onnx");
const PYTHON_BIN = process.env.PYTHON_PATH || "python";

/** Returns true if at least one model file is present */
const modelExists = () =>
    fs.existsSync(MODEL_FILE_ONNX) ||
    fs.existsSync(MODEL_FILE_PRIMARY) ||
    fs.existsSync(MODEL_FILE_MOBILE);

/**
 * Auto-select the best predict script:
 *   predict_onnx.py  — when .onnx model exists (Render-safe, lightweight)
 *   predict.py       — fallback for local dev with PyTorch
 */
const getPredictScript = () =>
    fs.existsSync(MODEL_FILE_ONNX)
        ? path.join(ML_DIR, "predict_onnx.py")
        : path.join(ML_DIR, "predict.py");

function runPrediction(imagePath) {
    return new Promise((resolve, reject) => {
        const proc = spawn(PYTHON_BIN, [getPredictScript(), imagePath]);

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => (stdout += data.toString()));
        proc.stderr.on("data", (data) => (stderr += data.toString()));

        proc.on("close", (code) => {
            // Filter out known ORT noise from stderr so the real error is visible
            const realErrors = stderr
                .split("\n")
                .filter((line) => {
                    const l = line.trim();
                    return (
                        l.length > 0 &&
                        !l.startsWith("[W:") &&     // ORT warnings
                        !l.startsWith("[I:") &&     // ORT info
                        !l.includes("GPU device discovery") &&
                        !l.includes("DiscoverDevices") &&
                        !l.includes("ReadFileContents")
                    );
                })
                .join("\n")
                .trim();

            if (code !== 0) {
                const errMsg = realErrors || stderr.trim() || `predict script exited with code ${code}`;
                console.error("[AI] predict script error:\n", stderr);
                return reject(new Error(errMsg));
            }

            try {
                const result = JSON.parse(stdout);
                if (result.error) return reject(new Error(result.error));
                resolve(result);
            } catch (e) {
                reject(new Error(`Failed to parse prediction output: ${stdout}`));
            }
        });

        proc.on("error", (err) => reject(err));
    });
}

// @route   POST /api/v1/detect
// @desc    Upload image for disease detection
// @access  Private
router.post("/", protect, uploadMiddleware, async (req, res, next) => {
    let tempPath = null;

    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "Please upload an image" });
        }

        // 1. Upload image to storage (S3 or Cloudinary)
        const imageUrl = await getImageUrl(req.file);

        // 2. Get the image buffer (always available via memory storage)
        const imageBuffer = req.file.buffer;

        // 3. Write to temp file for Python script
        tempPath = path.join(os.tmpdir(), `agro_scan_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, imageBuffer);

        // 4. Run AI prediction (if model file exists)
        let aiResult = null;
        let diseaseInfo = null;

        if (modelExists()) {
            aiResult = await runPrediction(tempPath);

            // 5. Match to Disease collection for treatments
            if (aiResult.disease) {
                diseaseInfo = await Disease.findOne({
                    modelLabel: aiResult.disease,
                });
            }
        }

        // 6. Save detection record
        const detection = await Detection.create({
            userId: req.user._id,
            imageUrl,
            predictedLabel: aiResult?.disease || "",
            predictedDisease: diseaseInfo?._id || null,
            confidence: aiResult?.confidence || 0,
            status: aiResult?.status || "unknown",
            predictions: aiResult?.predictions || [],
            platform: req.body.platform || "web",
            location: req.body.latitude
                ? { latitude: req.body.latitude, longitude: req.body.longitude }
                : undefined,
        });

        // 7. Build response
        const response = {
            success: true,
            data: detection,
            disease: aiResult?.disease || "Pending analysis",
            confidence: aiResult?.confidence || 0,
            status: aiResult?.status || "unknown",
            predictions: aiResult?.predictions || [],
        };

        if (diseaseInfo) {
            response.recommendations = diseaseInfo.prevention || [];
            response.medicines = [
                ...(diseaseInfo.treatment?.chemical || []).map((m) => ({ name: m, type: "chemical" })),
                ...(diseaseInfo.treatment?.organic || []).map((m) => ({ name: m, type: "organic" })),
            ];
            response.severity = diseaseInfo.severity;
            response.symptoms = diseaseInfo.symptoms;
        }

        if (!modelExists()) {
            response.message = "AI model not loaded. Place plant_disease_model.onnx (recommended) or plant_disease_model.pt / agroai_mobile.pt in backend/ml_models/ to enable predictions.";
        }

        res.status(201).json(response);
    } catch (error) {
        next(error);
    } finally {
        // Clean up temp file
        if (tempPath && fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    }
});



// @route   GET /api/v1/detect/history
// @desc    Get current user's scan history
// @access  Private
router.get("/history", protect, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const detections = await Detection.find({ userId: req.user._id })
            .populate("predictedDisease", "name severity")
            .populate("cropId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Detection.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            count: detections.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: detections,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/detect/:id
// @desc    Get a specific detection result
// @access  Private
router.get("/:id", protect, async (req, res, next) => {
    try {
        const detection = await Detection.findById(req.params.id)
            .populate("predictedDisease")
            .populate("cropId", "name image");

        if (!detection) {
            return res
                .status(404)
                .json({ success: false, message: "Detection not found" });
        }

        // Ensure user can only view their own detections
        if (detection.userId.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }

        res.json({ success: true, data: detection });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
