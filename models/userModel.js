"use strict";

const crypto = require("crypto");

const Users = require("./schemas/User");

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

const clean = (
  value
) =>
  String(value || "")
    .trim();

const normalise = (
  value
) =>
  clean(value)
    .toLowerCase();

const escapeRegex = (
  value
) =>
  String(value || "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createInitials = (
  firstname,
  lastname,
  username
) => {
  const initials =
    [
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

const isAdminRole = (
  role
) =>
  normalise(role) === "admin";

// Bridges the gap between Mongoose's `_id` and the `id` field every view/
// controller in this app already expects (mirrors toRuntimeProduct in
// adminProductModel.js).
const toRuntimeUser = (
  user
) => {
  if (!user) {
    return null;
  }

  const toIso = (value) =>
    value ? new Date(value).toISOString() : null;

  return {
    ...user,
    id: String(user._id),
    joinDate:
      user.joinDate
        ? toIso(user.joinDate).slice(0, 10)
        : "",
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  };
};

const toPublicUser = (
  user
) => {
  if (!user) {
    return null;
  }

  const name =
    `${user.firstname || ""} ${user.lastname || ""}`
      .trim() ||
    user.name ||
    user.username ||
    "";

  return {
    id: user.id,
    firstname:
      user.firstname || "",
    lastname:
      user.lastname || "",
    name,
    username:
      user.username || "",
    email:
      user.email || "",
    initials:
      createInitials(
        user.firstname,
        user.lastname,
        user.username
      ),
    role:
      user.role || "user",
    status:
      user.status || "active",
    gender:
      user.gender || "",
    description:
      user.description || "",
    phone:
      user.phone || "",
    location:
      user.location || "",
    postalCode:
      user.postalCode || "",
    address:
      user.address || "",
    about:
      user.about ||
      user.description ||
      "",
    avatar:
      user.avatar ||
      "/images/profile.png",
    tier:
      user.tier ||
      "Craft Collector",
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...(user.preferences || {}),
    },
    joinDate:
      user.joinDate ||
      user.createdAt ||
      "",
    requiresPasswordChange:
      Boolean(
        user.requiresPasswordChange
      ),
    createdAt:
      user.createdAt ||
      user.joinDate ||
      "",
    updatedAt:
      user.updatedAt ||
      user.createdAt ||
      user.joinDate ||
      "",
  };
};

const findUserById = async (
  id
) => {
  if (!id) {
    return null;
  }

  return toRuntimeUser(
    await Users.findById(String(id)).lean()
  );
};

const findUserByEmail = async (
  email
) =>
  toRuntimeUser(
    await Users.findOne({
      email: normalise(email),
    }).lean()
  );

const findById = async (
  id
) =>
  toPublicUser(
    await findUserById(id)
  );

const getAllUsers = async () => {
  const users =
    await Users.find().lean();

  return users
    .map(toRuntimeUser)
    .map(toPublicUser);
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
      reason:
        "blocked",
    };
  }

  if (
    user.status === "deactivated"
  ) {
    return {
      ok: false,
      reason:
        "deactivated",
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
    user:
      toPublicUser(user),
  };
};

const createUser = async (
  values
) => {
  const email =
    normalise(values.email);

  const username =
    clean(values.username);

  const emailTaken =
    await Users.exists({ email });

  if (emailTaken) {
    return {
      ok: false,
      reason:
        "email-exists",
    };
  }

  const usernameTaken =
    await Users.exists({
      username: new RegExp(
        `^${escapeRegex(username)}$`,
        "i"
      ),
    });

  if (usernameTaken) {
    return {
      ok: false,
      reason:
        "username-exists",
    };
  }

  const now = new Date();

  const user =
    await Users.create({
      _id:
        crypto.randomUUID(),
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
      role:
        "user",
      status:
        "active",
      about:
        clean(values.description),
      avatar:
        "/images/profile.png",
      tier:
        "Craft Collector",
      preferences:
      {
        ...DEFAULT_PREFERENCES,
      },
      passwordHash:
        hashPassword(
          values.password
        ),
      requiresPasswordChange:
        false,
      joinDate: now,
    });

  return {
    ok: true,
    user:
      toPublicUser(
        toRuntimeUser(
          user.toObject()
        )
      ),
  };
};

const updateAccount = async (
  userId,
  values
) => {
  const user =
    await Users.findById(
      String(userId)
    ).lean();

  if (!user) {
    return {
      ok: false,
      reason:
        "user-not-found",
    };
  }

  const email =
    normalise(values.email);

  const duplicateEmail =
    await Users.exists({
      email,
      _id: {
        $ne: String(userId),
      },
    });

  if (duplicateEmail) {
    return {
      ok: false,
      reason:
        "email-exists",
    };
  }

  const changingPassword =
    Boolean(values.newPassword);

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
    await Users.findByIdAndUpdate(
      String(userId),
      {
        $set: updates,
      },
      {
        new: true,
      }
    ).lean();

  return {
    ok: true,
    user:
      toPublicUser(
        toRuntimeUser(
          updatedUser
        )
      ),
  };
};

const updateAvatar = async (
  userId,
  avatar
) => {
  const updatedUser =
    await Users.findByIdAndUpdate(
      String(userId),
      {
        $set: {
          avatar,
        },
      },
      {
        new: true,
      }
    ).lean();

  if (!updatedUser) {
    return {
      ok: false,
      reason:
        "user-not-found",
    };
  }

  return {
    ok: true,
    user:
      toPublicUser(
        toRuntimeUser(
          updatedUser
        )
      ),
  };
};

const updatePreferences = async (
  userId,
  preferences
) => {
  const updatedUser =
    await Users.findByIdAndUpdate(
      String(userId),
      {
        $set: {
          preferences: {
            ...DEFAULT_PREFERENCES,
            ...preferences,
          },
        },
      },
      {
        new: true,
      }
    ).lean();

  if (!updatedUser) {
    return {
      ok: false,
      reason:
        "user-not-found",
    };
  }

  return {
    ok: true,
    user:
      toPublicUser(
        toRuntimeUser(
          updatedUser
        )
      ),
  };
};

const deactivateUser = async (
  userId
) => {
  const updatedUser =
    await Users.findByIdAndUpdate(
      String(userId),
      {
        $set: {
          status:
            "deactivated",
        },
      },
      {
        new: true,
      }
    ).lean();

  if (!updatedUser) {
    return {
      ok: false,
      reason:
        "user-not-found",
    };
  }

  return {
    ok: true,
    user:
      toPublicUser(
        toRuntimeUser(
          updatedUser
        )
      ),
  };
};

const updateUser = async (
  userId,
  updates
) => {
  const updatedUser =
    await Users.findByIdAndUpdate(
      String(userId),
      {
        $set: updates,
      },
      {
        new: true,
      }
    ).lean();

  return toRuntimeUser(
    updatedUser
  );
};

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
