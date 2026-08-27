"use strict";

const userModel = require("../models/userModel");

const safeRedirectPath = (
  value,
  fallback = "/"
) => {
  const candidate =
    String(value || "")
      .trim();

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    /[\r\n\\]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const baseUrl =
      "http://localhost";

    const parsedUrl =
      new URL(
        candidate,
        baseUrl
      );

    if (
      parsedUrl.origin !==
      baseUrl
    ) {
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

const clearCurrentUser = (
  req,
  res
) => {
  req.currentUser = null;
  res.locals.currentUser = null;
  res.locals.currentUserId = null;
  res.locals.currentUrl =
    req.originalUrl || "/";
};

const setCurrentUser = (
  req,
  res,
  user
) => {
  req.currentUser = user;
  res.locals.currentUser = user;
  res.locals.currentUserId =
    String(user.id);
  res.locals.currentUrl =
    req.originalUrl || "/";
};

const kickBlockedUser = (
  req,
  res,
  next
) =>
  req.session.destroy(
    (destroyError) => {
      if (destroyError) {
        return next(destroyError);
      }

      clearCurrentUser(req, res);

      const loginUrl =
        `/shared/login?blocked=1&redirect=${encodeURIComponent(
          req.originalUrl || "/"
        )}`;

      if (requestWantsJson(req)) {
        return res.status(401).json({
          success: false,
          requiresAuth: true,
          blocked: true,
          redirect: loginUrl,
          message:
            "This account has been blocked.",
        });
      }

      return res.redirect(loginUrl);
    }
  );

const attachCurrentUser = async (
  req,
  res,
  next
) => {
  const sessionUser =
    req.session?.user ||
    null;

  if (!sessionUser) {
    clearCurrentUser(req, res);
    return next();
  }

  let liveUser;

  try {
    liveUser =
      await userModel.findById(
        sessionUser.id
      );
  } catch (error) {
    return next(error);
  }

  if (
    !liveUser ||
    liveUser.status === "blocked"
  ) {
    return kickBlockedUser(
      req,
      res,
      next
    );
  }

  setCurrentUser(
    req,
    res,
    sessionUser
  );

  return next();
};

const requireAuth = (req, res, next) => {
  const currentUser =
    req.currentUser ||
    req.session?.user;

  if (currentUser) {
    return next();
  }

  const returnTo =
    req.get("referer") ||
    req.originalUrl ||
    "/";

  const loginUrl =
    `/shared/login?redirect=${encodeURIComponent(returnTo)}`;

  if (requestWantsJson(req)) {
    return res.status(401).json({
      success: false,
      requiresAuth: true,
      redirect: loginUrl,
      message: "Please sign in to add items to your cart."
    });
  }

  return res.redirect(loginUrl);
};

const requestWantsJson = (req) => {
  const acceptHeader =
    req.get("accept") || "";

  return (
    req.xhr ||
    acceptHeader.includes(
      "application/json"
    )
  );
};

module.exports = {
  safeRedirectPath,
  attachCurrentUser,
  requireAuth,
  requestWantsJson
};
