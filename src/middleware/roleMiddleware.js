

// src/middleware/roleMiddleware.js

/**
 * Role-based authorization middleware
 * Usage:
 *   authorize("admin")
 *   authorize("admin", "teacher")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: user not found" });

    // ✅ Block deleted/disabled users
    if (req.user.isDeleted)
      return res.status(403).json({ message: "Account disabled. Contact admin." });

    // ✅ Only allowed roles
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
      });

    next();
  };
};

export default authorize;
