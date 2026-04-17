const mongoose = require("mongoose");

const FieldSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Field name is required"],
            trim: true,
            default: "My Field",
        },
        color: {
            type: String,
            default: "#22c55e",
        },
        // Array of [lat, lng] coordinate pairs defining the boundary polygon
        latlngs: {
            type: [[Number]],
            required: true,
            validate: {
                validator: (v) => v.length >= 3,
                message: "A field must have at least 3 coordinate points.",
            },
        },
    },
    {
        timestamps: true,
    }
);

FieldSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Field", FieldSchema);
