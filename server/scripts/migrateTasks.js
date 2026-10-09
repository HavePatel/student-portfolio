/**
 * migrateTasks.js
 * One-time migration script to assign ownership for legacy tasks
 * that were created before the userId field was added to the Task model.
 *
 * Usage:
 *   node server/scripts/migrateTasks.js
 *
 * Behavior:
 *   - Finds all tasks where userId is missing/null
 *   - If exactly one user exists in the database, assigns all legacy tasks to that user
 *   - If multiple users exist, reports ambiguity and exits without making changes
 *   - Is idempotent: only updates tasks where userId is missing/null
 *   - Never deletes tasks
 */

import "../loadEnv.js";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_portfolio";

async function migrateTasks() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  try {
    // Find tasks without userId
    const legacyTasks = await Task.find({
      $or: [{ userId: { $exists: false } }, { userId: null }],
    });

    if (legacyTasks.length === 0) {
      console.log("No legacy tasks found. Nothing to migrate.");
      return;
    }

    console.log(`Found ${legacyTasks.length} task(s) without userId.`);

    // Check how many users exist
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} user(s) in the database.`);

    if (userCount === 0) {
      console.error(
        "\nERROR: No users exist in the database. Cannot determine task ownership."
      );
      console.error("Please create a user account first, then re-run this script.");
      process.exit(1);
    }

    if (userCount > 1) {
      console.error(
        "\nWARNING: Multiple users exist in the database."
      );
      console.error(
        "Cannot safely determine ownership of legacy tasks."
      );
      console.error(
        "\nTo resolve this, manually assign ownership using MongoDB shell or Compass:"
      );
      console.error('  db.tasks.updateMany({ userId: { $exists: false } }, { $set: { userId: ObjectId("...") } })');
      console.error(
        "\nAlternatively, set the ADMIN_EMAIL environment variable to assign all legacy tasks to a specific user:"
      );
      console.error("  ADMIN_EMAIL=user@example.com node server/scripts/migrateTasks.js");
      process.exit(1);
    }

    // Exactly one user — safe to assign all legacy tasks to them
    const soleUser = await User.findOne();
    console.log(
      `\nAssigning all legacy tasks to user: ${soleUser.email} (${soleUser._id})`
    );

    const result = await Task.updateMany(
      {
        $or: [{ userId: { $exists: false } }, { userId: null }],
      },
      { $set: { userId: soleUser._id } }
    );

    console.log(`\nMigration complete.`);
    console.log(`  Tasks updated: ${result.modifiedCount}`);
    console.log(`  Tasks matched: ${result.matchedCount}`);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

migrateTasks().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
