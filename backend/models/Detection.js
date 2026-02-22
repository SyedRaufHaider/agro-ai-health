const mongoose = require("mongoose");

const DetectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },
        imageUrl: {
            type: String,
            required: [true, "Image URL is required"],
        },
        predictedDisease: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Disease",
            default: null,
        },
        predictedLabel: {
            type: String, // Raw label returned by the AI model
            default: "",
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0,
        },
        status: {
            type: String,
            enum: ["healthy", "infected", "unknown"],
            default: "unknown",
        },
        // Additional AI results (top-k predictions)
        predictions: [
            {
                label: String,
                confidence: Number,
            },
        ],
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            default: null,
        },
        notes: {
            type: String,
            default: "",
        },
        location: {
            latitude: { type: Number },
            longitude: { type: Number },
        },
        // Track which platform made the scan
        platform: {
            type: String,
            enum: ["web", "mobile"],
            default: "web",
        },
    },
    {
        timestamps: true, // createdAt acts as "detectedAt"
    }
);

// Index for fetching user history sorted by date
DetectionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Detection", DetectionSchema);
