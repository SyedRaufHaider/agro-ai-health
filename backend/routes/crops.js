const express = require("express");
const router = express.Router();
const Crop = require("../models/Crop");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/v1/crops
// @desc    Get all crops
// @access  Public
router.get("/", async (req, res, next) => {
    try {
        const { search, season, category } = req.query;
        const filter = {};

        if (search) filter.$text = { $search: search };
        if (season) filter.season = season;
        if (category) filter.category = category;

        const crops = await Crop.find(filter).populate("commonDiseases", "name severity");
        res.json({ success: true, count: crops.length, data: crops });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/crops/:id
// @desc    Get single crop
// @access  Public
router.get("/:id", async (req, res, next) => {
    try {
        const crop = await Crop.findById(req.params.id).populate("commonDiseases");

        if (!crop) {
            return res
                .status(404)
                .json({ success: false, message: "Crop not found" });
        }

        res.json({ success: true, data: crop });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/crops
// @desc    Add a new crop
// @access  Private (Admin only)
router.post("/", protect, authorize("admin"), async (req, res, next) => {
    try {
        const crop = await Crop.create(req.body);
        res.status(201).json({ success: true, data: crop });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/crops/:id
// @desc    Update a crop
// @access  Private (Admin only)
router.put("/:id", protect, authorize("admin"), async (req, res, next) => {
    try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!crop) {
            return res
                .status(404)
                .json({ success: false, message: "Crop not found" });
        }

        res.json({ success: true, data: crop });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
