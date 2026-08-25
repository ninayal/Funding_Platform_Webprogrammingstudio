"use strict";

const { randomUUID } = require("node:crypto");

const User = require("./schemas/User");

const {
  hashPassword,
  verifyPassword,
} = require("../utils/passwordUtils");

const DEFAULT_PREFERENCES = {
  emailUpdates: true,
  orderNotifications: true,
  communityReplies: false,
  promotionalUpdates: true,
  saveShippingInformation: true,
  internationalShippingDefault: false,
  productCareGuides: true,
};

const clean = (value) =>
  String(value || "").trim();

const normalise = (value) =>
  clean(value).toLowerCase();

const createInitials = (
  firstname,
  lastname,
  username
) => {
  const initials = [
    clean(firstname)[0],
    clean(lastname)[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    initials ||
    clean(username)
      .slice(0, 2)
      .toUpperCase()
  );
};

const isAdminRole = (role) =>
  normalise(role) === "admin";

const toPublicUser = (user) => {
  if (!user) return null;

  const data =
    typeof user.toObject === "function"
      ? user.toObject()
      : user;

  const name =
    `${data.firstname || ""} ${data.lastname || ""}`.trim() ||
    data.username ||
    "";

  return {
    id: String(data._id),

    firstname: data.firstname || "",
    lastname: data.lastname || "",
    name,

    username: data.username || "",
    email: data.email || "",

    initials: createInitials(
      data.firstname,
      data.lastname,
      data.username
    ),

    role: data.role || "user",
    status: data.status || "active",

    gender: data.gender || "",
    description: data.description || "",
    phone: data.phone || "",
    location: data.location || "",
    postalCode: data.postalCode || "",
    address: data.address || "",

    about:
      data.about ||
      data.description ||
      "",

    avatar:
      data.avatar ||
      "/images/profile.png",

    tier:
      data.tier ||
      "Craft Collector",

    preferences: {
      ...DEFAULT_PREFERENCES,
      ...(data.preferences || {}),
    },

    joinDate:
      data.joinDate ||
      data.createdAt ||
      "",

    requiresPasswordChange:
      Boolean(
        data.requiresPasswordChange
      ),

    createdAt:
      data.createdAt ||
      data.joinDate ||
      "",

    updatedAt:
      data.updatedAt ||
      data.createdAt ||
      "",
  };
};

const findUserById = async (id) => {
  if (!id) return null;

  return User.findById(
    String(id)
  ).lean();
};

const findUserByEmail = async (
  email
) => {
  const target =
    normalise(email);

  if (!target) return null;

  return User.findOne({
    email: target,
  }).lean();
};

const findById = async (id) =>
  toPublicUser(
    await findUserById(id)
  );

const getAllUsers = async () => {
  const users =
    await User.find()
      .sort({ createdAt: -1 })
      .lean();

  return users.map(
    toPublicUser
  );
};

const authenticate = async (
  email,
  password
) => {
  const user =
    await findUserByEmail(email);

  if (!user) {
    return {
      ok: false,
      reason:
        "invalid-credentials",
    };
  }

  if (
    user.status === "blocked"
  ) {
    return {
      ok: false,
      reason: "blocked",
    };
  }

  if (
    user.status ===
    "deactivated"
  ) {
    return {
      ok: false,
      reason: "deactivated",
    };
  }

  if (
    !verifyPassword(
      password,
      user.passwordHash
    )
  ) {
    return {
      ok: false,
      reason:
        "invalid-credentials",
    };
  }

  return {
    ok: true,
    user: toPublicUser(user),
  };
};

const createUser = async (
  values
) => {
  const email =
    normalise(values.email);

  const username =
    clean(values.username);

  const duplicate =
    await User.findOne({
      $or: [
        { email },
        { username },
      ],
    }).lean();

  if (duplicate) {
    return {
      ok: false,
      reason:
        duplicate.email === email
          ? "email-exists"
          : "username-exists",
    };
  }

  try {
    const user =
      await User.create({
        _id: randomUUID(),

        firstname:
          clean(values.firstname),

        lastname:
          clean(values.lastname),

        username,
        email,

        gender:
          clean(values.gender),

        description:
          clean(values.description),

        about:
          clean(values.description),

        passwordHash:
          hashPassword(
            values.password
          ),

        role: "user",
        status: "active",

        preferences: {
          ...DEFAULT_PREFERENCES,
        },

        requiresPasswordChange:
          false,

        joinDate: new Date(),
      });

    return {
      ok: true,
      user:
        toPublicUser(user),
    };
  } catch (error) {
    if (
      error?.code === 11000
    ) {
      return {
        ok: false,
        reason:
          error.keyPattern?.email
            ? "email-exists"
            : "username-exists",
      };
    }

    throw error;
  }
};

const updateAccount = async (
  userId,
  values
) => {
  const user =
    await findUserById(userId);

  if (!user) {
    return {
      ok: false,
      reason: "user-not-found",
    };
  }

  const email =
    normalise(values.email);

  const duplicateEmail =
    await User.exists({
      email,
      _id: {
        $ne: String(userId),
      },
    });

  if (duplicateEmail) {
    return {
      ok: false,
      reason: "email-exists",
    };
  }

  const changingPassword =
    Boolean(
      values.newPassword
    );

  if (
    changingPassword &&
    !verifyPassword(
      values.currentPassword,
      user.passwordHash
    )
  ) {
    return {
      ok: false,
      reason:
        "invalid-current-password",
    };
  }

  const updates = {
    firstname:
      clean(values.firstname),

    lastname:
      clean(values.lastname),

    email,

    phone:
      clean(values.phone),

    location:
      clean(values.location),

    postalCode:
      clean(values.postalCode),

    address:
      clean(values.address),

    about:
      clean(values.about),

    description:
      clean(values.about),
  };

  if (changingPassword) {
    updates.passwordHash =
      hashPassword(
        values.newPassword
      );

    updates.requiresPasswordChange =
      false;
  }

  const updatedUser =
    await User.findByIdAndUpdate(
      String(userId),
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

  return {
    ok: true,
    user:
      toPublicUser(updatedUser),
  };
};

const updateAvatar = async (
  userId,
  avatar
) => {
  const user =
    await User.findByIdAndUpdate(
      String(userId),
      {
        $set: {
          avatar:
            clean(avatar),
        },
      },
      { new: true }
    ).lean();

  if (!user) {
    return {
      ok: false,
      reason: "user-not-found",
    };
  }

  return {
    ok: true,
    user:
      toPublicUser(user),
  };
};

const updatePreferences =
  async (
    userId,
    preferences
  ) => {
    const user =
      await User.findByIdAndUpdate(
        String(userId),
        {
          $set: {
            preferences: {
              ...DEFAULT_PREFERENCES,
              ...preferences,
            },
          },
        },
        { new: true }
      ).lean();

    if (!user) {
      return {
        ok: false,
        reason:
          "user-not-found",
      };
    }

    return {
      ok: true,
      user:
        toPublicUser(user),
    };
  };

const deactivateUser = async (
  userId
) => {
  const user =
    await User.findByIdAndUpdate(
      String(userId),
      {
        $set: {
          status:
            "deactivated",
        },
      },
      { new: true }
    ).lean();

  if (!user) {
    return {
      ok: false,
      reason: "user-not-found",
    };
  }

  return {
    ok: true,
    user:
      toPublicUser(user),
  };
};

const updateUser = async (
  userId,
  updates
) =>
  User.findByIdAndUpdate(
    String(userId),
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

module.exports = {
  authenticate,
  createUser,
  findById,
  findUserByEmail,
  findUserById,
  getAllUsers,
  isAdminRole,
  toPublicUser,
  updateAccount,
  updateAvatar,
  updatePreferences,
  deactivateUser,
  updateUser,
};