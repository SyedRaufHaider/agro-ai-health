const express = require("express");
const router = express.Router();
const Field = require("../models/Field");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/fields
// @desc    Get all fields for the current user
// @access  Private
router.get("/", async (req, res, next) => {
    try {
        const fields = await Field.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: fields.length, data: fields });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/fields
// @desc    Create a new field boundary
// @access  Private
router.post("/", async (req, res, next) => {
    try {
        const { name, color, latlngs } = req.body;

        if (!latlngs || latlngs.length < 3) {
            return res.status(400).json({
                success: false,
                message: "A field boundary must have at least 3 coordinate points.",
            });
        }

        const field = await Field.create({
            userId: req.user._id,
            name: name || "My Field",
            color: color || "#22c55e",
            latlngs,
        });

        res.status(201).json({ success: true, data: field });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/fields/:id
// @desc    Update a field (rename or update boundary)
// @access  Private
router.put("/:id", async (req, res, next) => {
    try {
        let field = await Field.findById(req.params.id);

        if (!field) {
            return res.status(404).json({ success: false, message: "Field not found" });
        }

        if (field.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const { name, color, latlngs } = req.body;
        if (name !== undefined) field.name = name;
        if (color !== undefined) field.color = color;
        if (latlngs !== undefined) field.latlngs = latlngs;

        await field.save();
        res.json({ success: true, data: field });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/v1/fields/:id
// @desc    Delete a field
// @access  Private
router.delete("/:id", async (req, res, next) => {
    try {
        const field = await Field.findById(req.params.id);

        if (!field) {
            return res.status(404).json({ success: false, message: "Field not found" });
        }

        if (field.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await field.deleteOne();
        res.json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
