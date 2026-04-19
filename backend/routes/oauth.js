const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─── Helper: send token to frontend via redirect ──────────────────────────────
const redirectWithToken = (res, user) => {
    const token = passport.generateToken(user);
    const userJson = encodeURIComponent(JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "farmer",
        profilePicture: user.profilePicture || "",
    }));
    res.redirect(`${CLIENT_URL}/oauth-callback?token=${token}&user=${userJson}`);
};

// ─── Google ───────────────────────────────────────────────────────────────────
router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/login?error=google_failed` }),
    (req, res) => redirectWithToken(res, req.user)
);

// ─── Facebook ─────────────────────────────────────────────────────────────────
router.get("/facebook",
    passport.authenticate("facebook", { scope: ["email"], session: false })
);

router.get("/facebook/callback",
    passport.authenticate("facebook", { session: false, failureRedirect: `${CLIENT_URL}/login?error=facebook_failed` }),
    (req, res) => redirectWithToken(res, req.user)
);
// ─── Mobile Fallback Endpoints ────────────────────────────────────────────────
// Accepts raw idToken (Google) or accessToken (Facebook) from the native Flutter SDKs.

router.post("/google-mobile", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: "No ID Token provided" });

        // Verify the google token hitting their public JSON edge API
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const data = await googleRes.json();

        if (data.error || !data.email) {
            return res.status(401).json({ success: false, message: "Invalid Google Token" });
        }

        const User = require("../models/User");
        let user = await User.findOne({ email: data.email });

        if (!user) {
            user = await User.create({
                username: data.name?.replace(/\s+/g, "_").toLowerCase() || data.email.split("@")[0],
                email: data.email,
                profilePicture: data.picture || "",
                password: Math.random().toString(36).slice(-10),
                provider: "google",
            });
        }

        const token = passport.generateToken(user);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || "farmer",
                profilePicture: user.profilePicture || "",
            }
        });
    } catch (error) {
        console.error("Google Mobile Auth Error:", error);
        res.status(500).json({ success: false, message: "Server error during Google auth" });
    }
});

router.post("/facebook-mobile", async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ success: false, message: "No Access Token provided" });

        // Verify token via Facebook Graph API
        const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
        const data = await fbRes.json();

        if (data.error || !data.id) {
            return res.status(401).json({ success: false, message: "Invalid Facebook Token" });
        }

        const email = data.email || `fb_${data.id}@facebook.placeholder`;
        const profilePicture = data.picture?.data?.url || "";

        const User = require("../models/User");
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                username: data.name?.replace(/\s+/g, "_").toLowerCase() || `user_${data.id}`,
                email,
                profilePicture,
                password: Math.random().toString(36).slice(-10),
                provider: "facebook",
            });
        }

        const token = passport.generateToken(user);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || "farmer",
                profilePicture: user.profilePicture || "",
            }
        });
    } catch (error) {
        console.error("Facebook Mobile Auth Error:", error);
        res.status(500).json({ success: false, message: "Server error during Facebook auth" });
    }
});

module.exports = router;
