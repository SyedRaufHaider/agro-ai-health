const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const multer = require("multer");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const sendEmail = require("../config/mailer");

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

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email address",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal whether the email exists (security best practice)
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a reset link has been sent",
            });
        }

        // Generate reset token
        const resetToken = user.generateResetToken();
        await user.save({ validateBeforeSave: false });

        // Build reset URL
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

        // Email HTML template
        const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #2d6a4f, #40916c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px;">🌿 Agro AI Health</h1>
                    <p style="color: #d8f3dc; margin: 8px 0 0;">Password Reset Request</p>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
                    <p>Hi <strong>${user.username}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #2d6a4f; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Or copy this link into your browser:</p>
                    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 6px; font-size: 13px;">
                        ${resetUrl}
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px;">
                        ⏰ This link expires in <strong>15 minutes</strong>.<br />
                        If you didn't request this, ignore this email — your password will remain unchanged.
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: "🔐 Password Reset — Agro AI Health",
            html,
        });

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a reset link has been sent",
        });
    } catch (error) {
        // If email fails, clean up the token
        if (error.code === "ECONNREFUSED" || error.responseCode) {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });
            }
        }
        next(error);
    }
});

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post("/reset-password", async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Hash the received token to compare with DB
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select("+resetPasswordToken +resetPasswordExpire +password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        // Set new password (the pre-save hook will hash it)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Generate new JWT so user is automatically logged in
        const jwtToken = user.generateToken();

        res.status(200).json({
            success: true,
            message: "Password reset successful",
            token: jwtToken,
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

module.exports = router;
