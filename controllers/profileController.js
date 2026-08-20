"use strict";

const userModel = require(
  "../models/userModel"
);

const orderModel = require(
  "../models/orderModel"
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

const formatOrderDate = (
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
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric"
    }
  ).format(date);
};

const formatMoney = (
  value
) =>
  `$${Number(
    value || 0
  ).toFixed(2)}`;

const buildOrderData = (
  userId
) => {
  const rawOrders =
    orderModel
      .getOrdersByUserId(
        String(userId)
      )
      .slice()
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      );

  const orders =
    rawOrders.map(
      (order) => {
        const items =
          Array.isArray(
            order.items
          )
            ? order.items
            : [];

        const itemCount =
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity || 0
              ),
            0
          );

        const status =
          String(
            order.status ||
            "confirmed"
          ).toLowerCase();

        return {
          id:
            order.id,

          status,

          statusLabel:
            status ===
              "confirmed"
              ? "Confirmed"
              : status
                .replace(
                  /-/g,
                  " "
                )
                .replace(
                  /\b\w/g,
                  (letter) =>
                    letter.toUpperCase()
                ),

          placedOn:
            formatOrderDate(
              order.createdAt
            ),

          total:
            Number(
              order.total || 0
            ),

          totalFormatted:
            formatMoney(
              order.total
            ),

          subtotal:
            Number(
              order.subtotal || 0
            ),

          subtotalFormatted:
            formatMoney(
              order.subtotal
            ),

          itemCount,

          items,

          delivery:
            order.delivery ||
            {},

          shipping:
            order.shipping ||
            {},

          payment:
            order.payment ||
            {},

          giftNote:
            order.giftNote ||
            "",

          detailsUrl:
            `/cart/order-confirmation?orderId=${encodeURIComponent(
              order.id
            )}`
        };
      }
    );

  const totalItems =
    orders.reduce(
      (
        total,
        order
      ) =>
        total +
        order.itemCount,
      0
    );

  const totalSpent =
    orders.reduce(
      (
        total,
        order
      ) =>
        total +
        order.total,
      0
    );

  const orderSummary = [
    {
      label:
        "Orders placed",

      value:
        String(
          orders.length
        ).padStart(
          2,
          "0"
        ),

      description:
        "Orders linked to this account."
    },

    {
      label:
        "Pieces ordered",

      value:
        String(
          totalItems
        ).padStart(
          2,
          "0"
        ),

      description:
        "Handcrafted pieces across your orders."
    },

    {
      label:
        "Total spent",

      value:
        formatMoney(
          totalSpent
        ),

      description:
        "Total value of confirmed orders."
    }
  ];

  return {
    orders,

    orderSummary,

    profileStats:
      orderSummary
  };
};

const buildNotifications = (
  orders,
  user
) => {
  const preferences =
    user.preferences ||
    {};

  if (
    preferences.orderNotifications ===
    false
  ) {
    return [];
  }

  return orders.map(
    (order) => {
      const firstItem =
        order.items?.[0];

      const itemName =
        firstItem?.product?.name ||
        "Your order";

      const orderId =
        order.id;

      if (
        order.status ===
        "confirmed"
      ) {
        return {
          type:
            "Order",

          title:
            `${itemName} has been confirmed.`,

          description:
            `Order ${orderId} is being prepared.`
        };
      }

      if (
        order.status ===
        "shipped"
      ) {
        return {
          type:
            "Order",

          title:
            `${itemName} is now in transit.`,

          description:
            `Order ${orderId} has been shipped and is on the way.`
        };
      }

      if (
        order.status ===
        "delivered"
      ) {
        return {
          type:
            "Order",

          title:
            `${itemName} has been delivered.`,

          description:
            `Order ${orderId} was successfully delivered.`
        };
      }

      return {
        type:
          "Order",

        title:
          `${itemName} order update.`,

        description:
          `Order ${orderId} has a new status: ${order.status}.`
      };
    }
  );
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
) => {
  const {
    orders,
    orderSummary,
    profileStats
  } =
    buildOrderData(
      user.id
    );

  const notifications =
    buildNotifications(
      orders,
      user
    );

  return {
    activePage:
      "profile",

    activeTab:
      getActiveTab(
        activeTab
      ),

    cartCount:
      Number(
        res.locals.cartCount ||
        0
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
      toFormValues(
        user
      )
  };
};

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
    getStoredUser(
      req
    );

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
      getStoredUser(
        req
      );

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
      Object.keys(
        errors
      ).length > 0
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
      (
        saveError
      ) => {
        if (
          saveError
        ) {
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
    return next(
      error
    );
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

const wantsJson = (req) =>
  req.xhr ||
  (req.get("Accept") || "").includes("application/json");

const updateAvatar = (req, res, next) => {
  try {
    const user = getStoredUser(req);

    if (!user) {
      if (wantsJson(req)) {
        return res.status(401).json({
          ok: false,
          message: "Your session has expired."
        });
      }

      return redirectStaleSession(req, res);
    }

    if (!req.file) {
      if (wantsJson(req)) {
        return res.status(400).json({
          ok: false,
          message: "Choose a new photo first."
        });
      }

      return res.redirect(
        "/shared/profile?tab=user&status=avatar-error"
      );
    }

    const result = userModel.updateAvatar(
      user.id,
      `/uploads/profile/${req.file.filename}`
    );

    if (!result.ok) {
      if (wantsJson(req)) {
        return res.status(409).json({
          ok: false,
          message: "Could not update your photo. Try again."
        });
      }

      return redirectStaleSession(req, res);
    }

    req.session.user = {
      ...req.session.user,
      avatar: result.user.avatar,
      initials: result.user.initials
    };

    return req.session.save(() => {
      if (wantsJson(req)) {
        return res.json({
          ok: true,
          avatar: result.user.avatar
        });
      }

      return res.redirect(
        "/shared/profile?tab=user&status=avatar-saved"
      );
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfilePage,
  updatePreferences,
  updateProfile,
  updateAvatar
};