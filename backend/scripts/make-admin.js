/**
 * make-admin.js
 * Promotes a user to the "admin" role by email.
 *
 * Usage:
 *   node scripts/make-admin.js sraufhaider@gmail.com
 *
 * Requires the .env file in the backend root (for MONGO_URI / JWT_SECRET).
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2] || "sraufhaider@gmail.com";

async function main() {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌  MONGO_URI not found in .env");
        process.exit(1);
    }

    console.log(`🔗  Connecting to MongoDB…`);
    await mongoose.connect(uri);
    console.log(`✅  Connected.\n`);

    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { role: "admin" },
        { new: true }
    );

    if (!user) {
        console.error(`❌  No user found with email: ${email}`);
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log(`✅  Success! User promoted to admin:`);
    console.log(`    Username : ${user.username}`);
    console.log(`    Email    : ${user.email}`);
    console.log(`    Role     : ${user.role}`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("❌  Error:", err.message);
    process.exit(1);
});
