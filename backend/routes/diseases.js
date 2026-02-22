const express = require("express");
const router = express.Router();
const Disease = require("../models/Disease");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/v1/diseases
// @desc    Get all diseases (with optional filters)
// @access  Public
router.get("/", async (req, res, next) => {
    try {
        const { search, severity, cropId } = req.query;
        const filter = {};

        if (search) filter.$text = { $search: search };
        if (severity) filter.severity = severity;
        if (cropId) filter.cropId = cropId;

        const diseases = await Disease.find(filter).populate("cropId", "name image");
        res.json({ success: true, count: diseases.length, data: diseases });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/diseases/:id
// @desc    Get single disease
// @access  Public
router.get("/:id", async (req, res, next) => {
    try {
        const disease = await Disease.findById(req.params.id).populate(
            "cropId",
            "name image"
        );

        if (!disease) {
            return res
                .status(404)
                .json({ success: false, message: "Disease not found" });
        }

        res.json({ success: true, data: disease });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/diseases/crop/:cropId
// @desc    Get diseases for a specific crop
// @access  Public
router.get("/crop/:cropId", async (req, res, next) => {
    try {
        const diseases = await Disease.find({ cropId: req.params.cropId });
        res.json({ success: true, count: diseases.length, data: diseases });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/diseases
// @desc    Add a new disease
// @access  Private (Admin only)
router.post("/", protect, authorize("admin"), async (req, res, next) => {
    try {
        const disease = await Disease.create(req.body);
        res.status(201).json({ success: true, data: disease });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
