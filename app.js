"use strict";

const express =
  require("express");

const path =
  require("path");

const session =
  require("express-session");

const crypto =
  require("crypto");


/* =========================================
   CONFIG
========================================= */

const routeConfig =
  require(
    "./config/routeConfig"
  );

const sessionConfig =
  require(
    "./config/sessionConfig"
  );

const footerConfig =
  require(
    "./config/footerConfig"
  );


/* =========================================
   MODELS
========================================= */

const cartModel =
  require(
    "./models/cartModel"
  );


/* =========================================
   MIDDLEWARE
========================================= */

const {
  attachCurrentUser,
} = require(
  "./middlewares/authMiddleware"
);

const notFound =
  require(
    "./middlewares/notFound"
  );

const errorHandler =
  require(
    "./middlewares/errorHandler"
  );


/* =========================================
   EXPRESS APP
========================================= */

const app =
  express();


/* =========================================
   EJS SETUP
========================================= */

app.set(
  "view engine",
  "ejs"
);

app.set(
  "views",
  path.join(
    __dirname,
    "views"
  )
);


/* =========================================
   GLOBAL EJS VARIABLES
========================================= */

/*
 * Available automatically inside
 * every EJS page and partial.
 *
 * footer.ejs can use:
 *
 * footer.navigation
 * footer.socials
 * etc.
 */
app.locals.footer =
  footerConfig;


/*
 * footer.ejs can use:
 *
 * currentYear
 */
app.locals.currentYear =
  new Date()
    .getFullYear();


/* =========================================
   REQUEST PARSING
========================================= */

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  express.json()
);


/* =========================================
   STATIC FILES
========================================= */

/*
 * Put static files before session-related
 * middleware so CSS, JS, and images do not
 * unnecessarily create guest sessions.
 */
app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


/* =========================================
   SESSION
========================================= */

/*
 * Login/register stores the currently
 * logged-in account in:
 *
 * req.session.user
 */
app.use(
  session(
    sessionConfig
  )
);


/* =========================================
   CURRENT LOGGED-IN USER
========================================= */

/*
 * Must come AFTER session.
 *
 * This converts:
 *
 * req.session.user
 *
 * into:
 *
 * req.currentUser
 * res.locals.currentUser
 *
 * Therefore Blog, Review, Cart, Header,
 * etc. can all use the same registered
 * account.
 */
app.use(
  attachCurrentUser
);


/* =========================================
   CURRENT URL
========================================= */

/*
 * Makes currentUrl available to every
 * EJS page.
 *
 * Useful for login redirects.
 */
app.use(
  (
    req,
    res,
    next
  ) => {
    res.locals.currentUrl =
      req.originalUrl;

    next();
  }
);


/* =========================================
   GLOBAL CART USER + CART COUNT
========================================= */

/*
 * header_v2.ejs uses:
 *
 * cartCount
 *
 * Therefore we make cartCount available
 * globally instead of passing it manually
 * from every controller.
 */
app.use(
  (
    req,
    res,
    next
  ) => {
    try {
      let cartUserId;


      /* ---------------------------------
         LOGGED-IN USER
      --------------------------------- */

      if (
        req.currentUser?.id
      ) {
        /*
         * Registered account:
         *
         * Cart belongs to the same
         * account ID used by Blog,
         * Reviews, Profile, etc.
         */
        cartUserId =
          String(
            req.currentUser.id
          );
      }


      /* ---------------------------------
         GUEST USER
      --------------------------------- */

      else {
        /*
         * Do NOT use one hardcoded value
         * such as:
         *
         * "demo-user"
         *
         * because all guests would then
         * share the same cart.
         */

        if (
          !req.session
            .guestCartId
        ) {
          req.session
            .guestCartId =
            crypto.randomUUID();
        }

        cartUserId =
          `guest-${req.session.guestCartId}`;
      }


      /*
       * Controllers can also use:
       *
       * req.cartUserId
       */
      req.cartUserId =
        cartUserId;


      /* ---------------------------------
         CART SUMMARY
      --------------------------------- */

      const cartSummary =
        cartModel
          .getCartSummary(
            cartUserId
          );


      /*
       * GLOBAL EJS VARIABLE
       *
       * header_v2.ejs can safely use:
       *
       * <%= cartCount %>
       */
      res.locals.cartCount =
        Number(
          cartSummary
            ?.totalQuantity
        ) || 0;


      next();
    } catch (error) {
      next(error);
    }
  }
);


/* =========================================
   APPLICATION ROUTES
========================================= */

/*
 * Your project uses:
 *
 * config/routeConfig.js
 *
 * Do NOT replace this with:
 *
 * require("./routes")
 *
 * because your project routing structure
 * is based on routeConfig.
 */
app.use(
  "/",
  routeConfig
);


/* =========================================
   404 HANDLER
========================================= */

app.use(
  notFound
);


/* =========================================
   ERROR HANDLER
========================================= */

app.use(
  errorHandler
);


/* =========================================
   EXPORT
========================================= */

module.exports =
  app;