/**
 * downloadModel.js — Auto-download ONNX model from Cloudinary at startup
 * =======================================================================
 * Called by server.js before the API starts.
 * On Render, the disk is ephemeral — this ensures the model is always
 * available even after a server restart/redeploy.
 *
 * Required env variable (set in Render dashboard):
 *   MODEL_ONNX_URL=https://res.cloudinary.com/your_cloud/raw/upload/...
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const MODEL_PATH = path.join(__dirname, "..", "ml_models", "plant_disease_model.onnx");

/**
 * Download a file from a URL to a local path.
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const protocol = url.startsWith("https") ? https : http;

        protocol.get(url, (response) => {
            // Follow redirects (Cloudinary sometimes redirects)
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                return downloadFile(response.headers.location, destPath)
                    .then(resolve)
                    .catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(destPath);
                return reject(new Error(`Download failed: HTTP ${response.statusCode}`));
            }

            response.pipe(file);

            file.on("finish", () => {
                file.close();
                resolve();
            });
        }).on("error", (err) => {
            file.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

/**
 * Ensure the ONNX model is present on disk.
 * - If already downloaded → skip (fast path).
 * - If MODEL_ONNX_URL env is set → download from Cloudinary.
 * - Otherwise → log a warning and continue (model-less mode).
 */
async function ensureModel() {
    // Already on disk — nothing to do
    if (fs.existsSync(MODEL_PATH)) {
        const sizeMB = (fs.statSync(MODEL_PATH).size / 1024 / 1024).toFixed(1);
        console.log(`🧠 ONNX model ready (${sizeMB} MB): ${MODEL_PATH}`);
        return;
    }

    const modelUrl = process.env.MODEL_ONNX_URL;

    if (!modelUrl) {
        console.warn(
            "⚠️  MODEL_ONNX_URL not set and no local ONNX model found.\n" +
            "   AI predictions will be disabled.\n" +
            "   Set MODEL_ONNX_URL in your Render env to enable predictions."
        );
        return;
    }

    console.log("⬇️  Downloading ONNX model from Cloudinary...");
    console.log("   URL:", modelUrl);

    const start = Date.now();
    await downloadFile(modelUrl, MODEL_PATH);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const sizeMB = (fs.statSync(MODEL_PATH).size / 1024 / 1024).toFixed(1);

    console.log(`✅ Model downloaded (${sizeMB} MB) in ${elapsed}s → ${MODEL_PATH}`);
}

module.exports = { ensureModel };
