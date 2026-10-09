/**
 * makeAdmin.js
 * One-time script to promote an existing user to admin role.
 *
 * Usage:
 *   ADMIN_EMAIL=user@example.com node server/scripts/makeAdmin.js
 *
 * Or pass email as command-line argument:
 *   node server/scripts/makeAdmin.js user@example.com
 *
 * Behavior:
 *   - Finds user by email
 *   - If user does not exist, reports error and exits
 *   - If user is already admin, reports no change needed
 *   - Otherwise, promotes user to admin
 */

import "../loadEnv.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_portfolio";

async function makeAdmin() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];

  if (!email) {
    console.error("ERROR: No email provided.");
    console.error("\nUsage:");
    console.error("  ADMIN_EMAIL=user@example.com node server/scripts/makeAdmin.js");
    console.error("  node server/scripts/makeAdmin.js user@example.com");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.error(`ERROR: No user found with email "${normalizedEmail}".`);
      console.error("Please register the user first, then re-run this script.");
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`User "${normalizedEmail}" is already an admin. No change needed.`);
      return;
    }

    user.role = "admin";
    await user.save();

    console.log(`SUCCESS: User "${normalizedEmail}" has been promoted to admin.`);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

makeAdmin().catch((err) => {
  console.error("Promotion failed:", err);
  process.exit(1);
});
