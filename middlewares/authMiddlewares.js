"use strict";

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const normaliseSessionUser = (
  sessionUser,
) => {
  if (!sessionUser) {
    return null;
  }

  const id = String(
    sessionUser.id ||
      sessionUser.userId ||
      sessionUser._id ||
      "",
  ).trim();

  if (!id) {
    return null;
  }

  const name = String(
    sessionUser.name ||
      sessionUser.fullName ||
      sessionUser.username ||
      "Current user",
  ).trim();

  return {
    ...sessionUser,
    id,
    name,
    email: String(
      sessionUser.email || "",
    ).trim(),
    initials: String(
      sessionUser.initials ||
        getInitials(name),
    ).trim(),
    role: String(
      sessionUser.role || "User",
    ).trim(),
  };
};

const attachCurrentUser = (
  req,
  res,
  next,
) => {
  const currentUser =
    normaliseSessionUser(
      req.session?.user,
    );

  req.currentUser = currentUser;

  res.locals.currentUser =
    currentUser;

  res.locals.currentUserId =
    currentUser?.id || null;

  next();
};

const safeRedirectPath = (
  value,
  fallback = "/",
) => {
  const path = String(
    value || "",
  ).trim();

  /*
   * Only allow internal paths.
   * Prevent redirecting users to an external website.
   */
  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return fallback;
  }

  return path;
};

const requestWantsJson = (req) => {
  const accept =
    req.get("accept") || "";

  return (
    req.xhr ||
    accept.includes(
      "application/json",
    )
  );
};

const requireAuth = (
  req,
  res,
  next,
) => {
  const currentUser =
    req.currentUser ||
    normaliseSessionUser(
      req.session?.user,
    );

  if (currentUser) {
    req.currentUser =
      currentUser;

    return next();
  }

  const redirectTarget =
    safeRedirectPath(
      req.originalUrl,
      "/",
    );

  const loginUrl =
    `/shared/login?redirect=${encodeURIComponent(
      redirectTarget,
    )}`;

  if (requestWantsJson(req)) {
    return res.status(401).json({
      ok: false,
      reason:
        "authentication-required",
      message:
        "Sign in to continue.",
      loginUrl,
    });
  }

  return res.redirect(loginUrl);
};

const requireOwner = (
  getOwnerId,
) => {
  return (
    req,
    res,
    next,
  ) => {
    if (!req.currentUser) {
      return requireAuth(
        req,
        res,
        next,
      );
    }

    const ownerId = String(
      getOwnerId(req) || "",
    );

    if (
      ownerId !==
      req.currentUser.id
    ) {
      return res
        .status(403)
        .send(
          "You do not have permission to modify this content.",
        );
    }

    return next();
  };
};

module.exports = {
  attachCurrentUser,
  normaliseSessionUser,
  requestWantsJson,
  requireAuth,
  requireOwner,
  safeRedirectPath,
};