"use strict";

const safeRedirectPath = (value, fallback = "/") => {
  const candidate = String(value || "").trim();

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    /[\r\n\\]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const baseUrl = "http://localhost";
    const parsedUrl = new URL(candidate, baseUrl);

    if (parsedUrl.origin !== baseUrl) {
      return fallback;
    }

    return (
      parsedUrl.pathname +
      parsedUrl.search +
      parsedUrl.hash
    );
  } catch {
    return fallback;
  }
};

const requestWantsJson = (req) =>
  req.xhr ||
  Boolean(req.headers.accept && req.headers.accept.includes("application/json"));

const attachCurrentUser = (req, res, next) => {
  const currentUser = req.session?.user || null;

  req.currentUser = currentUser;
  res.locals.currentUser = currentUser;
  res.locals.currentUserId = currentUser
    ? String(currentUser.id)
    : null;

  return next();
};

const requireAuth = (req, res, next) => {
  const currentUser =
    req.currentUser ||
    req.session?.user;

  if (currentUser) {
    return next();
  }

  const redirectPath = encodeURIComponent(
    req.originalUrl || "/"
  );

  return res.redirect(
    `/shared/login?redirect=${redirectPath}`
  );
};

module.exports = {
  attachCurrentUser,
  requireAuth,
  requestWantsJson,
  safeRedirectPath
};