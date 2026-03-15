const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ─── Google OAuth Strategy ────────────────────────────────────────────────────
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL ||
                "http://localhost:5000/api/v1/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or create user
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    user = await User.create({
                        username: profile.displayName.replace(/\s+/g, "_").toLowerCase(),
                        email: profile.emails[0].value,
                        profilePicture: profile.photos?.[0]?.value || "",
                        password: Math.random().toString(36).slice(-10), // random password
                        provider: "google",
                    });
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// ─── Facebook OAuth Strategy ──────────────────────────────────────────────────
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL ||
                "http://localhost:5000/api/v1/auth/facebook/callback",
            profileFields: ["id", "displayName", "emails", "photos"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value ||
                    `fb_${profile.id}@facebook.placeholder`;

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        username: profile.displayName.replace(/\s+/g, "_").toLowerCase(),
                        email,
                        profilePicture: profile.photos?.[0]?.value || "",
                        password: Math.random().toString(36).slice(-10),
                        provider: "facebook",
                    });
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

/**
 * Generate a signed JWT after OAuth success.
 * Used in the callback routes as the result redirect token.
 */
passport.generateToken = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });

module.exports = passport;
