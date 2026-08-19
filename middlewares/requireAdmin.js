"use strict";

/*
 * Kept intentionally simple and standalone (not merged into authMiddleware.js)
 * to match the shape of feature/admin's own middlewares/requireAdmin.js, which
 * checks req.session.user.role !== "admin" (lowercase). This version accepts
 * either req.currentUser (set by attachCurrentUser) or req.session.user, and
 * compares the role case-insensitively so it tolerates either branch's data.
 */
const requireAdmin = (req, res, next) => {
  const currentUser = req.currentUser || req.session?.user;

  if (!currentUser) {
    const redirectPath = encodeURIComponent(req.originalUrl || "/");
    return res.redirect(`/shared/login?redirect=${redirectPath}`);
  }

  if (String(currentUser.role || "").trim().toLowerCase() !== "admin") {
    return res.status(403).send("403 - Forbidden");
  }

  return next();
};

module.exports = requireAdmin;
