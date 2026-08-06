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

const DEFAULT_PREFERENCES = {
  emailUpdates:
    true,

  orderNotifications:
    true,

  communityReplies:
    false,

  promotionalUpdates:
    true,

  saveShippingInformation:
    true,

  internationalShippingDefault:
    false,

  productCareGuides:
    true
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

const verifyCurrentHash = (
  password,
  storedValue
) => {
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

  return (
    calculatedHash.length ===
      storedHash.length &&
    crypto.timingSafeEqual(
      calculatedHash,
      storedHash
    )
  );
};

const verifyLegacyHash = (
  password,
  storedValue
) => {
  const [
    saltValue,
    hashValue
  ] =
    String(
      storedValue || ""
    ).split(":");

  if (
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  const calculatedHash =
    crypto.scryptSync(
      String(password),
      saltValue,
      64
    );

  const storedHash =
    Buffer.from(
      hashValue,
      "hex"
    );

  return (
    calculatedHash.length ===
      storedHash.length &&
    crypto.timingSafeEqual(
      calculatedHash,
      storedHash
    )
  );
};

const verifyPassword = (
  password,
  storedValue
) => {
  try {
    return String(
      storedValue || ""
    ).startsWith(
      "scrypt$"
    )
      ? verifyCurrentHash(
          password,
          storedValue
        )
      : verifyLegacyHash(
          password,
          storedValue
        );
  } catch {
    return false;
  }
};

const createInitials = (
  firstname,
  lastname
) =>
  [
    clean(firstname)[0],
    clean(lastname)[0]
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

const toPublicUser = (
  user
) => {
  if (!user) {
    return null;
  }

  return {
    id:
      user.id,

    firstname:
      user.firstname || "",

    lastname:
      user.lastname || "",

    name:
      `${user.firstname || ""} ${user.lastname || ""}`
        .trim(),

    username:
      user.username || "",

    email:
      user.email || "",

    initials:
      createInitials(
        user.firstname,
        user.lastname
      ),

    role:
      user.role || "User",

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
      ...(
        user.preferences || {}
      )
    },

    createdAt:
      user.createdAt || "",

    updatedAt:
      user.updatedAt ||
      user.createdAt ||
      ""
  };
};

const findIndexById = (
  users,
  userId
) =>
  users.findIndex(
    (user) =>
      String(user.id) ===
      String(userId)
  );

const findById = (
  userId
) => {
  const users =
    readUsers();

  const index =
    findIndexById(
      users,
      userId
    );

  return index === -1
    ? null
    : toPublicUser(
        users[index]
      );
};

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
      ok:
        false,
      reason:
        "invalid-credentials"
    };
  }

  return {
    ok:
      true,
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
      ok:
        false,
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
      ok:
        false,
      reason:
        "username-exists"
    };
  }

  const now =
    new Date()
      .toISOString();

  const user = {
    id:
      crypto.randomUUID(),

    firstname:
      clean(
        values.firstname
      ),

    lastname:
      clean(
        values.lastname
      ),

    username:
      clean(
        values.username
      ),

    email,

    gender:
      clean(
        values.gender
      ),

    description:
      clean(
        values.description
      ),

    role:
      "User",

    phone:
      "",

    location:
      "",

    postalCode:
      "",

    address:
      "",

    about:
      clean(
        values.description
      ),

    avatar:
      "/images/profile.png",

    tier:
      "Craft Collector",

    preferences: {
      ...DEFAULT_PREFERENCES
    },

    passwordHash:
      hashPassword(
        values.password
      ),

    createdAt:
      now,

    updatedAt:
      now
  };

  users.push(user);
  writeUsers(users);

  return {
    ok:
      true,
    user:
      toPublicUser(user)
  };
};

const updateAccount = (
  userId,
  values
) => {
  const users =
    readUsers();

  const index =
    findIndexById(
      users,
      userId
    );

  if (
    index === -1
  ) {
    return {
      ok:
        false,
      reason:
        "user-not-found"
    };
  }

  const duplicateEmail =
    users.some(
      (user, userIndex) =>
        userIndex !== index &&
        normalise(
          user.email
        ) ===
        normalise(
          values.email
        )
    );

  if (
    duplicateEmail
  ) {
    return {
      ok:
        false,
      reason:
        "email-exists"
    };
  }

  const user =
    users[index];

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
      ok:
        false,
      reason:
        "invalid-current-password"
    };
  }

  const updatedUser = {
    ...user,

    firstname:
      clean(
        values.firstname
      ),

    lastname:
      clean(
        values.lastname
      ),

    email:
      normalise(
        values.email
      ),

    phone:
      clean(
        values.phone
      ),

    location:
      clean(
        values.location
      ),

    postalCode:
      clean(
        values.postalCode
      ),

    address:
      clean(
        values.address
      ),

    about:
      clean(
        values.about
      ),

    description:
      clean(
        values.about
      ),

    updatedAt:
      new Date()
        .toISOString()
  };

  if (
    changingPassword
  ) {
    updatedUser.passwordHash =
      hashPassword(
        values.newPassword
      );
  }

  users[index] =
    updatedUser;

  writeUsers(users);

  return {
    ok:
      true,
    user:
      toPublicUser(
        updatedUser
      )
  };
};

const updatePreferences = (
  userId,
  preferences
) => {
  const users =
    readUsers();

  const index =
    findIndexById(
      users,
      userId
    );

  if (
    index === -1
  ) {
    return {
      ok:
        false,
      reason:
        "user-not-found"
    };
  }

  users[index] = {
    ...users[index],

    preferences: {
      ...DEFAULT_PREFERENCES,
      ...preferences
    },

    updatedAt:
      new Date()
        .toISOString()
  };

  writeUsers(users);

  return {
    ok:
      true,
    user:
      toPublicUser(
        users[index]
      )
  };
};

module.exports = {
  authenticate,
  createUser,
  findById,
  updateAccount,
  updatePreferences
};
