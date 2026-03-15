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

module.exports = router;
