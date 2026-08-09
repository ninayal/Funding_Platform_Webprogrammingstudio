"use strict";

const express = require(
  "express"
);

const homeController = require(
  "../controllers/homeController"
);

const router =
  express.Router();

const getQuerySuffix = (
  req
) => {
  const originalUrl =
    String(
      req.originalUrl || ""
    );

  const queryIndex =
    originalUrl.indexOf("?");

  return queryIndex === -1
    ? ""
    : originalUrl.slice(
        queryIndex
      );
};

router.get(
  "/",
  homeController.getHomePage
);

/*
 * Compatibility redirects.
 * These prevent old merged links such as /login and /profile
 * from falling through to the global 404 middleware.
 */
router.get(
  "/login",
  (req, res) => {
    return res.redirect(
      302,
      `/shared/login${getQuerySuffix(req)}`
    );
  }
);

router.get(
  "/profile",
  (req, res) => {
    return res.redirect(
      302,
      `/shared/profile${getQuerySuffix(req)}`
    );
  }
);

module.exports = router;
