/**
 * upload_model_s3.js — Upload ONNX model to AWS S3
 * ==================================================
 * Uses multipart upload for reliability with large files.
 * Usage (run from backend/ directory):
 *   node scripts/upload_model_s3.js
 */

const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, "..", ".env");
require("dotenv").config({ path: envPath });

const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_S3_BUCKET,
} = process.env;

// ── Validate ──────────────────────────────────────────────────────
const missing = [];
if (!AWS_ACCESS_KEY_ID) missing.push("AWS_ACCESS_KEY_ID");
if (!AWS_SECRET_ACCESS_KEY) missing.push("AWS_SECRET_ACCESS_KEY");
if (!AWS_REGION) missing.push("AWS_REGION");
if (!AWS_S3_BUCKET) missing.push("AWS_S3_BUCKET");

if (missing.length) {
    console.error("❌ Missing in backend/.env:", missing.join(", "));
    process.exit(1);
}

console.log("✅ Credentials loaded");
console.log("   Bucket:", AWS_S3_BUCKET);
console.log("   Region:", AWS_REGION);

const {
    S3Client,
    CreateBucketCommand,
    HeadBucketCommand,
    PutObjectCommand,
    HeadObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

const MODEL_PATH = path.join(__dirname, "..", "ml_models", "plant_disease_model.onnx");
const S3_KEY = "models/plant_disease_model.onnx";

if (!fs.existsSync(MODEL_PATH)) {
    console.error("❌ Model not found:", MODEL_PATH);
    process.exit(1);
}

const sizeMB = (fs.statSync(MODEL_PATH).size / 1024 / 1024).toFixed(1);

async function ensureBucket() {
    try {
        await s3.send(new HeadBucketCommand({ Bucket: AWS_S3_BUCKET }));
        console.log(`✅ Bucket "${AWS_S3_BUCKET}" exists`);
    } catch (err) {
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            console.log(`⚠️  Bucket not found — creating "${AWS_S3_BUCKET}"...`);
            const createParams = { Bucket: AWS_S3_BUCKET };
            // LocationConstraint required for all regions except us-east-1
            if (AWS_REGION !== "us-east-1") {
                createParams.CreateBucketConfiguration = {
                    LocationConstraint: AWS_REGION,
                };
            }
            await s3.send(new CreateBucketCommand(createParams));
            console.log("✅ Bucket created!");
        } else {
            throw err;
        }
    }
}

async function uploadModel() {
    try {
        // Step 1: Ensure bucket exists
        await ensureBucket();

        // Step 2: Upload
        console.log(`\n⬆️  Uploading plant_disease_model.onnx (${sizeMB} MB)...`);
        const fileBuffer = fs.readFileSync(MODEL_PATH);

        await s3.send(new PutObjectCommand({
            Bucket: AWS_S3_BUCKET,
            Key: S3_KEY,
            Body: fileBuffer,
            ContentType: "application/octet-stream",
        }));

        const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${S3_KEY}`;

        console.log("\n✅ Upload successful!");
        console.log("   URL:", url);
        console.log("\n👉 Add to Render environment variables:");
        console.log(`   MODEL_ONNX_URL=${url}`);

    } catch (err) {
        console.error("\n❌ Failed!");
        console.error("   Name   :", err.name);
        console.error("   Code   :", err.Code || err.code);
        console.error("   Message:", err.message);
        if (err.$metadata) {
            console.error("   HTTP   :", err.$metadata.httpStatusCode);
        }
        process.exit(1);
    }
}

uploadModel();
