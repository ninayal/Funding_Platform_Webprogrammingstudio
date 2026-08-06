"use strict";

const userModel = require(
  "../models/userModel"
);

const {
  notifications,
  orders,
  orderSummary,
  profileStats
} = require(
  "../data/profilePageData"
);

const {
  validatePreferences,
  validateProfile
} = require(
  "../validators/profileValidators"
);

const ALLOWED_TABS =
  new Set([
    "user",
    "orders",
    "settings",
    "notifications"
  ]);

const getActiveTab = (
  value
) =>
  ALLOWED_TABS.has(
    String(value || "")
  )
    ? String(value)
    : "user";

const formatMemberSince = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month:
        "long",
      year:
        "numeric"
    }
  ).format(date);
};

const toFormValues = (
  user
) => ({
  firstname:
    user.firstname || "",

  lastname:
    user.lastname || "",

  email:
    user.email || "",

  phone:
    user.phone || "",

  location:
    user.location || "",

  postalCode:
    user.postalCode || "",

  address:
    user.address || "",

  about:
    user.about || ""
});

const getPageMessage = (
  status
) => {
  const messages = {
    "profile-saved":
      "Your account information has been saved.",

    "preferences-saved":
      "Your account preferences have been saved."
  };

  return messages[
    String(status || "")
  ] || "";
};

const buildViewData = (
  req,
  res,
  {
    user,
    values,
    errors = {},
    activeTab,
    pageMessage = ""
  }
) => ({
  activePage:
    "profile",

  activeTab:
    getActiveTab(
      activeTab
    ),

  cartCount:
    Number(
      res.locals.cartCount || 0
    ),

  currentUser:
    req.currentUser,

  errors,

  isAdmin:
    String(
      user.role || ""
    ).toLowerCase() ===
      "admin",

  memberSince:
    formatMemberSince(
      user.createdAt
    ),

  notifications,

  orders,

  orderSummary,

  pageMessage,

  preferences:
    user.preferences,

  profile:
    user,

  profileStats,

  tier:
    user.tier ||
    "Craft Collector",

  values:
    values ||
    toFormValues(user)
});

const getStoredUser = (
  req
) =>
  userModel.findById(
    req.currentUser?.id
  );

const redirectStaleSession = (
  req,
  res
) => {
  req.session.destroy(
    () => {
      res.redirect(
        "/shared/login?redirect=%2Fshared%2Fprofile"
      );
    }
  );
};

const getProfilePage = (
  req,
  res
) => {
  const user =
    getStoredUser(req);

  if (!user) {
    return redirectStaleSession(
      req,
      res
    );
  }

  return res.render(
    "shared/profile",
    buildViewData(
      req,
      res,
      {
        user,
        activeTab:
          req.query.tab,
        pageMessage:
          getPageMessage(
            req.query.status
          )
      }
    )
  );
};

const updateProfile = (
  req,
  res,
  next
) => {
  try {
    const user =
      getStoredUser(req);

    if (!user) {
      return redirectStaleSession(
        req,
        res
      );
    }

    const {
      errors,
      values
    } =
      validateProfile(
        req.body
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return res
        .status(422)
        .render(
          "shared/profile",
          buildViewData(
            req,
            res,
            {
              user,
              values,
              errors,
              activeTab:
                "user"
            }
          )
        );
    }

    const result =
      userModel.updateAccount(
        user.id,
        values
      );

    if (!result.ok) {
      if (
        result.reason ===
        "email-exists"
      ) {
        errors.email =
          "Another account already uses this email.";
      }

      if (
        result.reason ===
        "invalid-current-password"
      ) {
        errors.currentPassword =
          "The current password is incorrect.";
      }

      return res
        .status(409)
        .render(
          "shared/profile",
          buildViewData(
            req,
            res,
            {
              user,
              values,
              errors,
              activeTab:
                "user"
            }
          )
        );
    }

    req.session.user = {
      ...req.session.user,

      id:
        result.user.id,

      name:
        result.user.name,

      username:
        result.user.username,

      email:
        result.user.email,

      initials:
        result.user.initials,

      role:
        result.user.role
    };

    return req.session.save(
      (saveError) => {
        if (saveError) {
          return next(
            saveError
          );
        }

        return res.redirect(
          "/shared/profile?tab=user&status=profile-saved"
        );
      }
    );
  } catch (error) {
    return next(error);
  }
};

const updatePreferences = (
  req,
  res,
  next
) => {
  try {
    const result =
      userModel.updatePreferences(
        req.currentUser.id,
        validatePreferences(
          req.body
        )
      );

    if (!result.ok) {
      return redirectStaleSession(
        req,
        res
      );
    }

    return res.redirect(
      "/shared/profile?tab=settings&status=preferences-saved"
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfilePage,
  updatePreferences,
  updateProfile
};
