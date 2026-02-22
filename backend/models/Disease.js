const mongoose = require("mongoose");

const DiseaseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Disease name is required"],
            trim: true,
        },
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            required: [true, "Associated crop is required"],
        },
        symptoms: {
            type: [String],
            default: [],
        },
        causes: {
            type: [String],
            default: [],
        },
        prevention: {
            type: [String],
            default: [],
        },
        treatment: {
            chemical: { type: [String], default: [] },
            organic: { type: [String], default: [] },
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
        },
        image: {
            type: String,
            default: "",
        },
        // AI model label — the exact class name used during model training
        modelLabel: {
            type: String,
            default: "",
        },
        confidenceThreshold: {
            type: Number,
            default: 0.7,
            min: 0,
            max: 1,
        },
    },
    {
        timestamps: true,
    }
);

DiseaseSchema.index({ name: "text", symptoms: "text" });

module.exports = mongoose.model("Disease", DiseaseSchema);
