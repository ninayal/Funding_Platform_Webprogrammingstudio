"use strict";

const fs =
  require("fs");

const path =
  require("path");

const GIFTCARDS_FILE =
  path.join(
    __dirname,
    "../data/giftcards.json",
  );

const readStore = () => {
  if (
    !fs.existsSync(
      GIFTCARDS_FILE,
    )
  ) {
    return {
      giftcards: [],
    };
  }

  const data =
    JSON.parse(
      fs.readFileSync(
        GIFTCARDS_FILE,
        "utf8",
      ),
    );

  if (
    !data ||
    !Array.isArray(
      data.giftcards,
    )
  ) {
    throw new TypeError(
      "giftcards.json must contain a giftcards array.",
    );
  }

  return data;
};

const writeStore = (store) => {
  const temporaryFile =
    `${GIFTCARDS_FILE}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(
      store,
      null,
      2,
    ),
    "utf8",
  );

  fs.renameSync(
    temporaryFile,
    GIFTCARDS_FILE,
  );
};

const deleteGiftcard = (
  giftcardId,
  userId,
) => {
  const id =
    String(
      giftcardId || "",
    ).trim();

  const ownerId =
    String(
      userId || "",
    ).trim();

  if (!id || !ownerId) {
    return {
      ok: false,
      reason:
        "invalid-input",
    };
  }

  const store =
    readStore();

  const index =
    store.giftcards.findIndex(
      (giftcard) =>
        String(
          giftcard.id,
        ) === id,
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
    !giftcard
      .createdByUserId ||
    String(
      giftcard
        .createdByUserId,
    ) !== ownerId
  ) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }

  const [deletedGiftcard] =
    store.giftcards.splice(
      index,
      1,
    );

  writeStore(store);

  return {
    ok: true,
    giftcard:
      deletedGiftcard,
  };
};

module.exports = {
  deleteGiftcard,
};
