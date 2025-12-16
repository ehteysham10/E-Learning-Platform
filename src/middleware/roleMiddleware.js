// src/middlewares/roleMiddleware.js

/**
 * Role-based authorization middleware
 * Usage:
 *   authorize("admin")
 *   authorize("admin", "teacher")
 */

const authorize = (...allowedRoles) => {                                                                                                                                                                                                                                                                                                                                                                        
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

export default authorize;
