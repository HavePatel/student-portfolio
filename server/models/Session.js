/**
 * server/models/Session.js
 * Server-side session records for JWT inactivity enforcement.
 *
 * Each login creates one Session document linked to the JWT's `jti` claim.
 * The auth middleware checks `lastActivityAt` on every protected request;
 * sessions idle for longer than the inactivity window (30s) are rejected
 * with 401 and deleted. A TTL index garbage-collects abandoned sessions.
 *
 * This is the server-side source of truth for the inactivity timeout —
 * a valid JWT alone is not enough to access protected routes.
 */

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now,
      // TTL index: MongoDB removes the document 24h after its last activity.
      // Dead sessions are already deleted by the auth middleware on their next
      // request; this is a garbage-collection safety net, not a session rule.
      expires: 24 * 60 * 60,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
