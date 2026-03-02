/**
 * upload_model.js — Upload ONNX model to Cloudinary (run once locally)
 * =====================================================================
 * Usage (run from project root):
 *   node backend/scripts/upload_model.js
 */

const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Load .env from backend/
const envPath = path.join(__dirname, "..", ".env");
console.log("📄 Loading env from:", envPath);
require("dotenv").config({ path: envPath });

// ── Validate credentials ──────────────────────────────────────────
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("\n❌ Missing Cloudinary credentials in backend/.env");
    console.error("   CLOUDINARY_CLOUD_NAME =", CLOUDINARY_CLOUD_NAME || "(missing)");
    console.error("   CLOUDINARY_API_KEY    =", CLOUDINARY_API_KEY ? "(set)" : "(missing)");
    console.error("   CLOUDINARY_API_SECRET =", CLOUDINARY_API_SECRET ? "(set)" : "(missing)");
    process.exit(1);
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const MODEL_PATH = path.join(__dirname, "..", "ml_models", "plant_disease_model.onnx");

if (!fs.existsSync(MODEL_PATH)) {
    console.error("❌ Model file not found at:", MODEL_PATH);
    process.exit(1);
}

const sizeMB = (fs.statSync(MODEL_PATH).size / 1024 / 1024).toFixed(1);
console.log(`\n⬆️  Uploading plant_disease_model.onnx (${sizeMB} MB) to Cloudinary...`);
console.log("    Source:", MODEL_PATH);

async function uploadModel() {
    try {
        const result = await cloudinary.uploader.upload(MODEL_PATH, {
            resource_type: "raw",
            folder: "agro-ai-models",
            public_id: "plant_disease_model",
            overwrite: true,
        });

        console.log("\n✅ Upload successful!");
        console.log("   Secure URL:", result.secure_url);
        console.log("\n👉 Add this to your Render environment variables:");
        console.log(`   MODEL_ONNX_URL=${result.secure_url}`);

    } catch (err) {
        console.error("\n❌ Upload failed!");
        console.error("   Message :", err.message);
        console.error("   HTTP    :", err.http_code);
        console.error("   Details :", JSON.stringify(err, null, 2));
        process.exit(1);
    }
}

uploadModel();
