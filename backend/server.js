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
        origin: [
            process.env.CLIENT_URL || "http://localhost:5173",
            "https://agro-ai-health.vercel.app",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:8081",
        ],
        credentials: true,
    })
);

// ─── API Routes ───────────────────────────────────────────────────
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/crops", require("./routes/crops"));
app.use("/api/v1/diseases", require("./routes/diseases"));
app.use("/api/v1/detect", require("./routes/detect"));
app.use("/api/v1/posts", require("./routes/posts"));

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
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
