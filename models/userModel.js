"use strict";

const crypto = require("crypto");

const users = [];

const clone = (value) =>
  JSON.parse(
    JSON.stringify(value),
  );

const clean = (value) =>
  String(value || "").trim();

const getInitials = (name) =>
  clean(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const hashPassword = (
  password,
) => {
  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const hash =
    crypto
      .scryptSync(
        String(password),
        salt,
        64,
      )
      .toString("hex");

  return `${salt}:${hash}`;
};

const verifyPasswordHash = (
  password,
  storedValue,
) => {
  try {
    const [
      salt,
      storedHash,
    ] = String(
      storedValue || "",
    ).split(":");

    if (
      !salt ||
      !storedHash
    ) {
      return false;
    }

    const calculatedHash =
      crypto.scryptSync(
        String(password),
        salt,
        64,
      );

    const storedBuffer =
      Buffer.from(
        storedHash,
        "hex",
      );

    if (
      calculatedHash.length !==
      storedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      calculatedHash,
      storedBuffer,
    );
  } catch (error) {
    return false;
  }
};

const toPublicUser = (
  user,
) => {
  if (!user) {
    return null;
  }

  const {
    passwordHash,
    ...safeUser
  } = user;

  return clone(safeUser);
};

const findMutableByEmail = (
  email,
) => {
  const normalised =
    clean(email).toLowerCase();

  return (
    users.find(
      (user) =>
        user.email ===
        normalised,
    ) || null
  );
};

const findMutableByUsername = (
  username,
) => {
  const normalised =
    clean(
      username,
    ).toLowerCase();

  return (
    users.find(
      (user) =>
        user.username.toLowerCase() ===
        normalised,
    ) || null
  );
};

const findById = (userId) => {
  const user =
    users.find(
      (item) =>
        item.id ===
        clean(userId),
    ) || null;

  return toPublicUser(user);
};

const findByEmail = (
  email,
) =>
  toPublicUser(
    findMutableByEmail(email),
  );

const createUser = (
  userData,
) => {
  const email =
    clean(
      userData.email,
    ).toLowerCase();

  const username =
    clean(
      userData.username,
    );

  if (
    findMutableByEmail(email)
  ) {
    return {
      ok: false,
      reason:
        "email-exists",
    };
  }

  if (
    findMutableByUsername(
      username,
    )
  ) {
    return {
      ok: false,
      reason:
        "username-exists",
    };
  }

  const firstname =
    clean(
      userData.firstname,
    );

  const lastname =
    clean(
      userData.lastname,
    );

  const name =
    `${firstname} ${lastname}`.trim();

  const now =
    new Date().toISOString();

  const user = {
    id: crypto.randomUUID(),

    firstname,
    lastname,
    name,

    username,
    email,

    gender:
      clean(
        userData.gender,
      ),

    description:
      clean(
        userData.description,
      ),

    initials:
      getInitials(name),

    role: "User",

    passwordHash:
      hashPassword(
        userData.password,
      ),

    createdAt: now,
    updatedAt: now,
  };

  users.push(user);

  return {
    ok: true,
    user:
      toPublicUser(user),
  };
};

const authenticate = (
  email,
  password,
) => {
  const user =
    findMutableByEmail(email);

  if (!user) {
    return {
      ok: false,
      reason:
        "invalid-credentials",
    };
  }

  const valid =
    verifyPasswordHash(
      password,
      user.passwordHash,
    );

  if (!valid) {
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

const getAllUsers = () =>
  users.map(toPublicUser);

/*
 * Assessment demonstration account.
 */
const seedDemoUser = () => {
  if (
    findMutableByEmail(
      "huy@example.com",
    )
  ) {
    return;
  }

  const now =
    new Date().toISOString();

  users.push({
    id: "user-huy-ba",
    firstname: "Huy",
    lastname: "Ba",
    name: "Huy Ba",
    username: "huyba",
    email:
      "huy@example.com",
    gender:
      "prefer_not",
    description:
      "Community contributor and Blog author.",
    initials: "HB",
    role: "Author",
    passwordHash:
      hashPassword(
        "Password123!",
      ),
    createdAt: now,
    updatedAt: now,
  });
};

seedDemoUser();

/*
 * Temporary forum-moderation test account.
 * NOTE: feature/admin branch is building its own admin/role infrastructure
 * (middlewares/requireAdmin.js checks role === "admin", lowercase). This seed
 * intentionally reuses that exact lowercase value so the two branches agree
 * on what an "admin" role looks like once merged.
 */
const seedForumAdmin = () => {
  if (findMutableByEmail("admin@langco.example")) {
    return;
  }

  const now = new Date().toISOString();

  users.push({
    id: "user-forum-admin",
    firstname: "Forum",
    lastname: "Admin",
    name: "Forum Admin",
    username: "forumadmin",
    email: "admin@langco.example",
    gender: "prefer_not",
    description: "Forum moderator account (seeded for testing).",
    initials: "FA",
    role: "admin",
    passwordHash: hashPassword("Password123!"),
    createdAt: now,
    updatedAt: now,
  });
};

seedForumAdmin();

const isAdminRole = (role) => String(role || "").trim().toLowerCase() === "admin";

module.exports = {
  authenticate,
  createUser,
  findByEmail,
  findById,
  getAllUsers,
  toPublicUser,
  isAdminRole,
};