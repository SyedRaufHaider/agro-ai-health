const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// ─── Multer Memory Storage (stores buffer in memory, then we save base64 to MongoDB) ───
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res, next) => {
    try {
        const { username, name, email, password, role } = req.body;

        const user = await User.create({ username: username || name, email, password, role });
        const token = user.generateToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/auth/login
// @desc    Login user & return token
// @access  Public
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.matchPassword(password))) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const token = user.generateToken();

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get("/me", protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

// @route   PUT /api/v1/auth/profile
// @desc    Update profile
// @access  Private
router.put("/profile", protect, async (req, res, next) => {
    try {
        const allowedFields = [
            "username",
            "phone",
            "profilePicture",
            "location",
            "fcmToken",
        ];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/auth/profile-picture
// @desc    Upload profile picture
// @access  Private
router.put(
    "/profile-picture",
    protect,
    upload.single("profilePicture"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ success: false, message: "Please upload an image" });
            }

            let profilePicture;

            if (process.env.IMAGE_STORAGE === "s3") {
                const { uploadToS3 } = require("../config/s3");
                profilePicture = await uploadToS3(req.file.buffer, req.file.mimetype, "profiles");
            } else {
                // Fallback: store as base64 data URL in MongoDB
                profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { profilePicture },
                { new: true }
            );

            res.json({
                success: true,
                user,
                profilePicture,
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
