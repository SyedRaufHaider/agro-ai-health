const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ─── Core Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Serve uploaded files (profile pictures, etc.) ────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (Android/iOS apps, curl, Postman)
            if (!origin) return callback(null, true);

            const allowed = [
                // Production web app
                "https://agro-ai-health.vercel.app",
                // Local web dev
                "http://localhost:5173",
                "http://localhost:3000",
                // Flutter web uses a random high port — allow ALL localhost origins
                /^http:\/\/localhost(:\d+)?$/,
                /^http:\/\/127\.0\.0\.1(:\d+)?$/,
                // Optional: CLIENT_URL from .env
                process.env.CLIENT_URL?.replace(/\/+$/, ""),
            ].filter(Boolean);

            const isAllowed = allowed.some((p) =>
                p instanceof RegExp ? p.test(origin) : p === origin
            );

            if (isAllowed) {
                callback(null, true);
            } else {
                console.warn(`[CORS] blocked: ${origin}`);
                callback(new Error("CORS: origin not allowed"));
            }
        },
        credentials: true,
    })
);

// ─── API Routes ───────────────────────────────────────────────────
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/auth", require("./routes/oauth"));   // Google + Facebook OAuth
app.use("/api/v1/crops", require("./routes/crops"));
app.use("/api/v1/diseases", require("./routes/diseases"));
app.use("/api/v1/detect", require("./routes/detect"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/fields", require("./routes/fields"));

// ─── Health Check ─────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🌿 Agro AI Health API is running",
        version: "1.0.0",
    });
});

// ─── Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

start();
