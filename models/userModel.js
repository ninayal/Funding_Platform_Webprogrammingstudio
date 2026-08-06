"use strict";

const crypto = require(
  "crypto"
);

const fs = require(
  "fs"
);

const path = require(
  "path"
);

const USERS_FILE =
  path.join(
    __dirname,
    "../data/users.json"
  );

const normalise = (
  value
) =>
  String(value || "")
    .trim()
    .toLowerCase();

const ensureUsersFile = () => {
  fs.mkdirSync(
    path.dirname(
      USERS_FILE
    ),
    {
      recursive: true
    }
  );

  if (
    !fs.existsSync(
      USERS_FILE
    )
  ) {
    fs.writeFileSync(
      USERS_FILE,
      "[]\n",
      "utf8"
    );
  }
};

const readUsers = () => {
  ensureUsersFile();

  try {
    const users =
      JSON.parse(
        fs.readFileSync(
          USERS_FILE,
          "utf8"
        )
      );

    return Array.isArray(users)
      ? users
      : [];
  } catch {
    return [];
  }
};

const writeUsers = (
  users
) => {
  ensureUsersFile();

  const temporaryFile =
    `${USERS_FILE}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    `${JSON.stringify(
      users,
      null,
      2
    )}\n`,
    "utf8"
  );

  fs.renameSync(
    temporaryFile,
    USERS_FILE
  );
};

const hashPassword = (
  password
) => {
  const salt =
    crypto.randomBytes(16);

  const hash =
    crypto.scryptSync(
      String(password),
      salt,
      64
    );

  return [
    "scrypt",
    salt.toString("hex"),
    hash.toString("hex")
  ].join("$");
};

const verifyPassword = (
  password,
  storedValue
) => {
  try {
    const [
      algorithm,
      saltValue,
      hashValue
    ] =
      String(
        storedValue || ""
      ).split("$");

    if (
      algorithm !== "scrypt" ||
      !saltValue ||
      !hashValue
    ) {
      return false;
    }

    const calculatedHash =
      crypto.scryptSync(
        String(password),
        Buffer.from(
          saltValue,
          "hex"
        ),
        64
      );

    const storedHash =
      Buffer.from(
        hashValue,
        "hex"
      );

    if (
      calculatedHash.length !==
      storedHash.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      calculatedHash,
      storedHash
    );
  } catch {
    return false;
  }
};

const toPublicUser = (
  user
) => ({
  id:
    user.id,

  name:
    `${user.firstname} ${user.lastname}`
      .trim(),

  firstname:
    user.firstname,

  lastname:
    user.lastname,

  username:
    user.username,

  email:
    user.email,

  initials:
    [
      user.firstname?.[0],
      user.lastname?.[0]
    ]
      .filter(Boolean)
      .join("")
      .toUpperCase(),

  role:
    user.role || "User",

  gender:
    user.gender || "",

  description:
    user.description || ""
});

const authenticate = (
  email,
  password
) => {
  const user =
    readUsers().find(
      (candidate) =>
        normalise(
          candidate.email
        ) ===
        normalise(email)
    );

  if (
    !user ||
    !verifyPassword(
      password,
      user.passwordHash
    )
  ) {
    return {
      ok: false,
      reason:
        "invalid-credentials"
    };
  }

  return {
    ok: true,
    user:
      toPublicUser(user)
  };
};

const createUser = (
  values
) => {
  const users =
    readUsers();

  const email =
    normalise(
      values.email
    );

  const username =
    normalise(
      values.username
    );

  if (
    users.some(
      (user) =>
        normalise(
          user.email
        ) === email
    )
  ) {
    return {
      ok: false,
      reason:
        "email-exists"
    };
  }

  if (
    users.some(
      (user) =>
        normalise(
          user.username
        ) === username
    )
  ) {
    return {
      ok: false,
      reason:
        "username-exists"
    };
  }

  const user = {
    id:
      crypto.randomUUID(),

    firstname:
      String(
        values.firstname
      ).trim(),

    lastname:
      String(
        values.lastname
      ).trim(),

    username:
      String(
        values.username
      ).trim(),

    email,

    gender:
      values.gender,

    description:
      values.description,

    role:
      "User",

    passwordHash:
      hashPassword(
        values.password
      ),

    createdAt:
      new Date()
        .toISOString()
  };

  users.push(user);
  writeUsers(users);

  return {
    ok: true,
    user:
      toPublicUser(user)
  };
};

module.exports = {
  authenticate,
  createUser
};
