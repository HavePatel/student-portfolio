/**
 * admin.js
 * Admin authorization middleware.
 *
 * Must be used AFTER the auth middleware (which populates req.user).
 * Returns 403 Forbidden for authenticated users who are not admins.
 * Returns 401 Unauthorized if no user is attached (should not happen if auth runs first).
 */

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      errors: ["Unauthorized access. Authentication required."],
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      errors: ["Admin access required."],
    });
  }

  next();
};

export default requireAdmin;
