"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  toStoredFields,
} = require("../utils/giftcardMapper");

const GIFTCARDS_FILE = path.join(
  __dirname,
  "../data/giftcards.json",
);

const createEmptyStore = () => ({
  giftcards: [],
});

const ensureGiftcardsFile = () => {
  if (fs.existsSync(GIFTCARDS_FILE)) {
    return;
  }

  fs.writeFileSync(
    GIFTCARDS_FILE,
    JSON.stringify(createEmptyStore(), null, 2),
    "utf8",
  );
};

const readGiftcards = () => {
  ensureGiftcardsFile();

  const data = JSON.parse(
    fs.readFileSync(GIFTCARDS_FILE, "utf8"),
  );

  if (!data || !Array.isArray(data.giftcards)) {
    throw new TypeError(
      "giftcards.json must contain a giftcards array.",
    );
  }

  return data;
};

const writeGiftcards = (store) => {
  const temporaryFile =
    `${GIFTCARDS_FILE}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(store, null, 2),
    "utf8",
  );

  fs.renameSync(
    temporaryFile,
    GIFTCARDS_FILE,
  );
};

const generateCodeSegment = () =>
  crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();

const generateGiftCode = () =>
  `LANG-${generateCodeSegment()}-${generateCodeSegment()}`;

const getUniqueGiftCode = (giftcards) => {
  let code;

  do {
    code = generateGiftCode();
  } while (
    giftcards.some(
      (giftcard) => giftcard.code === code,
    )
  );

  return code;
};

const createGiftcard = (
  values,
  userId = null,
) => {
  const store = readGiftcards();
  const now = new Date().toISOString();

  const giftcard = {
    id: crypto.randomUUID(),
    code: getUniqueGiftCode(store.giftcards),

    createdByUserId:
      userId ? String(userId) : null,

    ...toStoredFields(values),

    status:
      values.giftType === "lang-impact"
        ? "Awaiting allocation"
        : "Created",

    createdAt: now,
    updatedAt: now,
  };

  store.giftcards.push(giftcard);
  writeGiftcards(store);

  return { ...giftcard };
};

const getGiftcardByCode = (giftCode) => {
  const code = String(giftCode || "")
    .trim()
    .toUpperCase();

  if (!code) {
    return null;
  }

  const giftcard =
    readGiftcards().giftcards.find(
      (item) =>
        String(item.code).toUpperCase() === code,
    );

  return giftcard
    ? { ...giftcard }
    : null;
};

const getGiftcardById = (giftcardId) => {
  const id = String(giftcardId || "").trim();

  if (!id) {
    return null;
  }

  const giftcard =
    readGiftcards().giftcards.find(
      (item) =>
        String(item.id) === id,
    );

  return giftcard
    ? { ...giftcard }
    : null;
};

const getGiftcardsByUserId = (userId) => {
  const id = String(userId || "").trim();

  if (!id) {
    return [];
  }

  return readGiftcards()
    .giftcards
    .filter(
      (giftcard) =>
        String(
          giftcard.createdByUserId || "",
        ) === id,
    )
    .map(
      (giftcard) => ({
        ...giftcard,
      }),
    );
};

const updateGiftcard = (
  giftcardId,
  values,
  userId,
) => {
  const store = readGiftcards();

  const giftcard =
    store.giftcards.find(
      (item) =>
        String(item.id) ===
        String(giftcardId),
    );

  if (!giftcard) {
    return {
      ok: false,
      reason: "not-found",
    };
  }

  if (
    !giftcard.createdByUserId ||
    String(giftcard.createdByUserId) !==
      String(userId || "")
  ) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }

  Object.assign(
    giftcard,
    toStoredFields(values),
    {
      updatedAt: new Date().toISOString(),
    },
  );

  writeGiftcards(store);

  return {
    ok: true,
    giftcard: { ...giftcard },
  };
};

const updateGiftcardStatus = (
  giftCode,
  status,
) => {
  const code = String(giftCode || "")
    .trim()
    .toUpperCase();

  const nextStatus =
    String(status || "").trim();

  if (!code || !nextStatus) {
    return {
      ok: false,
      reason: "invalid-input",
    };
  }

  const store = readGiftcards();

  const giftcard =
    store.giftcards.find(
      (item) =>
        String(item.code).toUpperCase() ===
        code,
    );

  if (!giftcard) {
    return {
      ok: false,
      reason: "not-found",
    };
  }

  giftcard.status = nextStatus;
  giftcard.updatedAt =
    new Date().toISOString();

  writeGiftcards(store);

  return {
    ok: true,
    giftcard: { ...giftcard },
  };
};

const deleteGiftcard = (
  giftcardId,
  userId,
) => {
  const id =
    String(giftcardId || "").trim();

  const ownerId =
    String(userId || "").trim();

  if (!id || !ownerId) {
    return {
      ok: false,
      reason: "invalid-input",
    };
  }

  const store = readGiftcards();

  const index =
    store.giftcards.findIndex(
      (giftcard) =>
        String(giftcard.id) === id,
    );

  if (index < 0) {
    return {
      ok: false,
      reason: "not-found",
    };
  }

  const giftcard =
    store.giftcards[index];

  if (
    !giftcard.createdByUserId ||
    String(giftcard.createdByUserId) !==
      ownerId
  ) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }

  const [deletedGiftcard] =
    store.giftcards.splice(index, 1);

  writeGiftcards(store);

  return {
    ok: true,
    giftcard: deletedGiftcard,
  };
};

module.exports = {
  createGiftcard,
  getGiftcardByCode,
  getGiftcardById,
  getGiftcardsByUserId,
  updateGiftcard,
  updateGiftcardStatus,
  deleteGiftcard,
};