"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  hashPassword,
  verifyPassword,
} = require("../utils/passwordUtils");

const USERS_FILE = path.join(
  __dirname,
  "../data/users.json",
);

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

const ensureUsersFile = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(
      USERS_FILE,
      "[]\n",
      "utf8",
    );
  }
};

const readUsers = () => {
  ensureUsersFile();

  try {
    const data = JSON.parse(
      fs.readFileSync(USERS_FILE, "utf8"),
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  const tempFile = `${USERS_FILE}.tmp`;

  fs.writeFileSync(
    tempFile,
    `${JSON.stringify(users, null, 2)}\n`,
    "utf8",
  );

  fs.renameSync(tempFile, USERS_FILE);
};

const createInitials = (
  firstname,
  lastname,
  username,
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
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    name,
    username: user.username || "",
    email: user.email || "",
    initials: createInitials(
      user.firstname,
      user.lastname,
      user.username,
    ),
    role: user.role || "user",
    status: user.status || "active",
    gender: user.gender || "",
    description: user.description || "",
    phone: user.phone || "",
    location: user.location || "",
    postalCode: user.postalCode || "",
    address: user.address || "",
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
      Boolean(user.requiresPasswordChange),
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

const findUserById = (id) =>
  readUsers().find(
    (user) =>
      String(user.id) === String(id),
  ) || null;

const findUserByEmail = (email) => {
  const target = normalise(email);

  return (
    readUsers().find(
      (user) =>
        normalise(user.email) === target,
    ) || null
  );
};

const findById = (id) =>
  toPublicUser(
    findUserById(id),
  );

const getAllUsers = () =>
  readUsers().map(toPublicUser);

const authenticate = (
  email,
  password,
) => {
  const user = findUserByEmail(email);

  if (
    !user ||
    user.status === "blocked" ||
    !verifyPassword(
      password,
      user.passwordHash,
    )
  ) {
    return {
      ok: false,
      reason: "invalid-credentials",
    };
  }

  return {
    ok: true,
    user: toPublicUser(user),
  };
};

const createUser = (values) => {
  const users = readUsers();

  const email =
    normalise(values.email);

  const username =
    clean(values.username);

  if (
    users.some(
      (user) =>
        normalise(user.email) === email,
    )
  ) {
    return {
      ok: false,
      reason: "email-exists",
    };
  }

  if (
    users.some(
      (user) =>
        normalise(user.username) ===
        normalise(username),
    )
  ) {
    return {
      ok: false,
      reason: "username-exists",
    };
  }

  const now =
    new Date().toISOString();

  const user = {
    id: crypto.randomUUID(),
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
    role: "user",
    status: "active",
    phone: "",
    location: "",
    postalCode: "",
    address: "",
    about:
      clean(values.description),
    avatar: "/images/profile.png",
    tier: "Craft Collector",
    preferences: {
      ...DEFAULT_PREFERENCES,
    },
    passwordHash:
      hashPassword(values.password),
    requiresPasswordChange: false,
    joinDate:
      now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  writeUsers(users);

  return {
    ok: true,
    user: toPublicUser(user),
  };
};

const updateAccount = (
  userId,
  values,
) => {
  const users = readUsers();

  const index = users.findIndex(
    (user) =>
      String(user.id) ===
      String(userId),
  );

  if (index === -1) {
    return {
      ok: false,
      reason: "user-not-found",
    };
  }

  const duplicateEmail =
    users.some(
      (user, userIndex) =>
        userIndex !== index &&
        normalise(user.email) ===
        normalise(values.email),
    );

  if (duplicateEmail) {
    return {
      ok: false,
      reason: "email-exists",
    };
  }

  const user = users[index];
  const changingPassword =
    Boolean(values.newPassword);

  if (
    changingPassword &&
    !verifyPassword(
      values.currentPassword,
      user.passwordHash,
    )
  ) {
    return {
      ok: false,
      reason:
        "invalid-current-password",
    };
  }

  const updatedUser = {
    ...user,
    firstname:
      clean(values.firstname),
    lastname:
      clean(values.lastname),
    email:
      normalise(values.email),
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
    updatedAt:
      new Date().toISOString(),
  };

  if (changingPassword) {
    updatedUser.passwordHash =
      hashPassword(
        values.newPassword,
      );

    updatedUser.requiresPasswordChange =
      false;
  }

  users[index] = updatedUser;
  writeUsers(users);

  return {
    ok: true,
    user: toPublicUser(updatedUser),
  };
};

const updatePreferences = (
  userId,
  preferences,
) => {
  const users = readUsers();

  const index = users.findIndex(
    (user) =>
      String(user.id) ===
      String(userId),
  );

  if (index === -1) {
    return {
      ok: false,
      reason: "user-not-found",
    };
  }

  users[index] = {
    ...users[index],
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...preferences,
    },
    updatedAt:
      new Date().toISOString(),
  };

  writeUsers(users);

  return {
    ok: true,
    user: toPublicUser(users[index]),
  };
};

const updateUser = (
  userId,
  updates,
) => {
  const users = readUsers();

  const index = users.findIndex(
    (user) =>
      String(user.id) ===
      String(userId),
  );

  if (index === -1) {
    return null;
  }

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt:
      new Date().toISOString(),
  };

  writeUsers(users);

  return users[index];
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
  updatePreferences,
  updateUser,
};