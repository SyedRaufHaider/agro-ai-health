const mongoose = require("mongoose");

const CropSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Crop name is required"],
            trim: true,
        },
        scientificName: {
            type: String,
            trim: true,
            default: "",
        },
        season: {
            type: String,
            enum: ["Kharif", "Rabi", "Zaid", "All Season"],
            default: "All Season",
        },
        category: {
            type: String,
            enum: ["Fruit", "Vegetable", "Grain", "Cash Crop", "Pulse", "Other"],
            default: "Other",
        },
        description: {
            type: String,
            default: "",
        },
        image: {
            type: String, // Cloudinary URL
            default: "",
        },
        optimalConditions: {
            temperature: { type: String, default: "" }, // e.g. "20-30°C"
            humidity: { type: String, default: "" },     // e.g. "60-80%"
            soil: { type: String, default: "" },         // e.g. "Loamy"
            water: { type: String, default: "" },        // e.g. "Moderate"
            ph: { type: String, default: "" },           // e.g. "6.0-7.0"
        },
        commonDiseases: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Disease",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Text index for search
CropSchema.index({ name: "text", scientificName: "text" });

module.exports = mongoose.model("Crop", CropSchema);
