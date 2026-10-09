/**
 * server/middleware/auth.js
 * Authentication + inactivity-enforcement middleware.
 *
 * 1. Verifies the JWT (Bearer token) and attaches the decoded payload.
 * 2. Looks up the server-side Session record for the token's `jti` claim:
 *      - No session          → 401 (logged out elsewhere, or session expired)
 *      - Session idle longer than INACTIVITY_TIMEOUT_MS → delete + 401
 *
 * The session record is the server-side authority for the 30-second
 * inactivity timeout. The frontend mirrors the same window locally, but
 * the backend enforces it on every protected request — a valid JWT alone
 * is not sufficient.
 */

import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

export const INACTIVITY_TIMEOUT_MS =
  Number(process.env.INACTIVITY_TIMEOUT_MS) || 30 * 1000;

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        errors: ["Unauthorized access. Token missing or malformed."],
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        errors: ["Unauthorized access. Token missing."],
      });
    }

    const secret = process.env.JWT_SECRET || "fallback_jwt_secret";
    const decoded = jwt.verify(token, secret);

    // Server-side session enforcement: the JWT must map to an existing
    // session that is within the inactivity window.
    const session = decoded.jti
      ? await Session.findOne({ jti: decoded.jti })
      : null;

    if (!session) {
      return res.status(401).json({
        success: false,
        errors: ["Your session has expired. Please log in again."],
      });
    }

    if (Date.now() - session.lastActivityAt.getTime() > INACTIVITY_TIMEOUT_MS) {
      // Inactivity timeout reached server-side — kill the session so the
      // token is rejected everywhere, including other tabs sharing it.
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        success: false,
        errors: [
          "Your session has expired due to inactivity. Please log in again.",
        ],
      });
    }

    req.user = decoded;
    req.sessionId = session._id;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    const message =
      err.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Unauthorized access. Token invalid.";

    return res.status(401).json({
      success: false,
      errors: [message],
    });
  }
};

export default auth;
