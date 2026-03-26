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
    const { s3Upload, uploadToS3, getSignedS3Url } = require("../config/s3");
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

// ─── Helper: run prediction via FastAPI ───────────────────────
const PYTHON_BIN = process.env.PYTHON_PATH || "python";
const HF_MODEL_URL = process.env.HF_MODEL_URL; // FastAPI URL: http://127.0.0.1:8000 or https://your-space.hf.space
console.log(`[AI] HF_MODEL_URL from env: "${HF_MODEL_URL}"`);

/** Returns true if the FastAPI AI server is configured */
const modelExists = () => !!HF_MODEL_URL;

/**
 * Run prediction via FastAPI (local or Hugging Face Space).
 * Requires HF_MODEL_URL to be set in .env
 */
async function runPrediction(imagePath) {
    // ── Mode 1: Call Hugging Face Space API ──────────────────────
    if (HF_MODEL_URL) {
        const FormData = require("form-data");
        const form = new FormData();
        form.append("image", fs.createReadStream(imagePath), {
            filename: "scan.jpg",
            contentType: "image/jpeg",
        });

        // Use built-in https (avoids node-fetch ESM issues in CommonJS)
        return new Promise((resolve, reject) => {
            const url = new URL(`${HF_MODEL_URL.replace(/\/$/, "")}/predict`);
            const lib = url.protocol === "https:" ? require("https") : require("http");

            const req = lib.request(
                {
                    hostname: url.hostname,
                    port: url.port || (url.protocol === "https:" ? 443 : 80),
                    path: url.pathname,
                    method: "POST",
                    headers: form.getHeaders(),
                },
                (res) => {
                    let data = "";
                    res.on("data", (chunk) => (data += chunk));
                    res.on("end", () => {
                        try {
                            const json = JSON.parse(data);
                            if (res.statusCode !== 200)
                                return reject(new Error(json.detail || `HF API error: HTTP ${res.statusCode}`));
                            resolve(json);
                        } catch (e) {
                            reject(new Error(`Invalid JSON from HF API: ${data}`));
                        }
                    });
                }
            );
            req.on("error", reject);
            form.pipe(req);
        });
    }

    // ── Mode 2: Local Python script (dev only) ───────────────────
    const script = fs.existsSync(MODEL_FILE_ONNX)
        ? path.join(ML_DIR, "predict_onnx.py")
        : path.join(ML_DIR, "predict.py");

    return new Promise((resolve, reject) => {
        const proc = spawn(PYTHON_BIN, [script, imagePath], {
            env: { ...process.env, CUDA_VISIBLE_DEVICES: "-1" },
        });

        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (d) => (stdout += d.toString()));
        proc.stderr.on("data", (d) => (stderr += d.toString()));

        proc.on("close", (code) => {
            // Try stdout JSON first (Python may print error there even on non-zero exit)
            try {
                const result = JSON.parse(stdout);
                if (result.error) return reject(new Error(result.error));
                return resolve(result);
            } catch (_) { }

            if (code !== 0) {
                const clean = stderr.split("\n")
                    .filter((l) => l.trim() && !l.startsWith("[W:") && !l.startsWith("[I:"))
                    .join("\n").trim();
                console.error("[AI] predict error:\n", stderr);
                return reject(new Error(clean || `predict script exited with code ${code}`));
            }

            reject(new Error(`Empty output from predict script`));
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
            response.message = "AI API not configured. Please set HF_MODEL_URL in .env to point to your FastAPI server.";
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

        // Sign the image URLs if using S3
        const processImageUrl = useS3 ? require("../config/s3").getSignedS3Url : async (url) => url;
        const signedDetections = await Promise.all(detections.map(async (d) => {
            const doc = d.toObject();
            if (doc.imageUrl) {
                doc.imageUrl = await processImageUrl(doc.imageUrl);
            }
            return doc;
        }));

        res.json({
            success: true,
            count: signedDetections.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: signedDetections,
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

        const processImageUrl = useS3 ? require("../config/s3").getSignedS3Url : async (url) => url;
        const doc = detection.toObject();
        if (doc.imageUrl) {
            doc.imageUrl = await processImageUrl(doc.imageUrl);
        }

        res.json({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
