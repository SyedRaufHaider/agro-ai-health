const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't return password in queries by default
        },
        role: {
            type: String,
            enum: ["farmer", "expert", "admin"],
            default: "farmer",
        },
        profilePicture: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        location: {
            city: { type: String, default: "" },
            country: { type: String, default: "" },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: "2dsphere",
            },
        },
        // For Flutter / mobile push notifications
        fcmToken: {
            type: String,
            default: "",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        // ─── Password Reset ────────────────────────────────────────────
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpire: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// ─── Hash password before saving ───────────────────────────────────
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Compare entered password with hashed password ─────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Generate JWT token ────────────────────────────────────────────
UserSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};

// ─── Generate password reset token ────────────────────────────────
UserSchema.methods.generateResetToken = function () {
    // Generate a random 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash it and store in DB (never store raw tokens)
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set expiry to 15 minutes from now
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    // Return the UNHASHED token (sent via email)
    return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
