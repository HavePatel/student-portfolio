/**
 * server/middleware/auth.js
 * Authentication Middleware for Practical 7.
 *
 * Verifies JWT token supplied in Authorization header (Bearer <token>).
 * Attaches decoded payload (e.g. { id: user._id }) to req.user.
 * Returns 401 Unauthorized if token is missing, malformed, expired, or invalid.
 */

import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
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

    req.user = decoded;
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
