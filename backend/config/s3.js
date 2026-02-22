const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// ─── S3 Client ──────────────────────────────────────────
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_S3_BUCKET;

// ─── Multer: store in memory, then upload to S3 ────────
const s3Upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".webp"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    },
});

// ─── Helper: get file extension from mimetype ──────────
function getExtension(mimetype) {
    const map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    };
    return map[mimetype] || ".jpg";
}

// ─── Upload buffer to S3 ───────────────────────────────
async function uploadToS3(fileBuffer, mimetype, folder = "scans") {
    const key = `${folder}/${crypto.randomUUID()}${getExtension(mimetype)}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: mimetype,
        })
    );

    return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// ─── Delete file from S3 ───────────────────────────────
async function deleteFromS3(fileUrl) {
    try {
        const url = new URL(fileUrl);
        const key = url.pathname.slice(1); // remove leading /

        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: key,
            })
        );
    } catch (error) {
        console.error("S3 delete error:", error.message);
    }
}

module.exports = { s3Client, s3Upload, uploadToS3, deleteFromS3 };
