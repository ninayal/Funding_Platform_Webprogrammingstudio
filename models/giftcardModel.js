"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


/* =========================================
   STORAGE
========================================= */

const GIFTCARDS_FILE =
  path.join(
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
    JSON.stringify(
      createEmptyStore(),
      null,
      2,
    ),
    "utf8",
  );
};


const readGiftcards = () => {
  ensureGiftcardsFile();

  const raw =
    fs.readFileSync(
      GIFTCARDS_FILE,
      "utf8",
    );

  const data =
    JSON.parse(raw);

  if (
    !data ||
    !Array.isArray(data.giftcards)
  ) {
    throw new TypeError(
      "giftcards.json must contain a giftcards array.",
    );
  }

  return data;
};


const writeGiftcards = (
  store,
) => {
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


/* =========================================
   GIFT TYPES
========================================= */

const giftTypes = [
  {
    id: "gift-lang",
    value: "lang-impact",
    index: "A",
    title: "Làng Impact Gift",
    copy:
      "Create a meaningful gift while Làng & Co. directs the contribution " +
      "across verified organizations, approved individuals, and priority causes.",
    action: "Choose this option →",
  },

  {
    id: "gift-honour",
    value: "donation-in-honour",
    index: "B",
    title: "Donation in Honour",
    copy:
      "Choose a specific cause yourself, make the donation in someone special's " +
      "honour, and send them a meaningful note.",
    action: "Choose this option →",
  },
];


/* =========================================
   DELIVERY TYPES
========================================= */

const deliveryTypes = [
  {
    id: "delivery-digital",
    value: "digital",
    icon: "✉",
    title: "Digital eCard",
    copy:
      "Email delivery immediately or on a scheduled date.",
  },

  {
    id: "delivery-printable",
    value: "printable",
    icon: "⌑",
    title: "Printable",
    copy:
      "Download a print-ready card and prepare it at home.",
  },

  {
    id: "delivery-physical",
    value: "physical",
    icon: "✦",
    title: "Physical Card",
    copy:
      "A real card prepared for delivery to the recipient.",
  },
];


/* =========================================
   DESIGNS
========================================= */

const designs = [
  {
    id: "design-lotus",
    value: "ho-tay-lotus",
    cardClass: "design-card--lotus",
    previewClass: "preview-name--lotus",
    title: "Hồ Tây Lotus",
    meta: "Lotus · Summer · Hanoi",
  },

  {
    id: "design-battrang",
    value: "bat-trang-blue",
    cardClass: "design-card--ceramic",
    previewClass: "preview-name--battrang",
    title: "Bát Tràng Blue",
    meta: "Ceramic · Kiln · Heritage",
  },

  {
    id: "design-vanphuc",
    value: "van-phuc-silk",
    cardClass: "design-card--silk",
    previewClass: "preview-name--vanphuc",
    title: "Vạn Phúc Silk",
    meta: "Silk · Loom · Hà Đông",
  },

  {
    id: "design-hathai",
    value: "ha-thai-lacquer",
    cardClass: "design-card--lacquer",
    previewClass: "preview-name--hathai",
    title: "Hạ Thái Lacquer",
    meta: "Lacquer · Layers · Patience",
  },

  {
    id: "design-hoian",
    value: "hoi-an-glow",
    cardClass: "design-card--hoian",
    previewClass: "preview-name--hoian",
    title: "Hội An Glow",
    meta: "Lantern · River · Old Town",
  },

  {
    id: "design-phuvinh",
    value: "phu-vinh-bamboo",
    cardClass: "design-card--bamboo",
    previewClass: "preview-name--phuvinh",
    title: "Phú Vinh Bamboo",
    meta: "Rattan · Weave · Craft Village",
  },
];


/* =========================================
   CAUSES
========================================= */

const causes = [
  {
    value: "craft-preservation",
    label: "Vietnamese Craft Preservation",
  },

  {
    value: "education",
    label: "Education and Learning Access",
  },

  {
    value: "community-support",
    label: "Community and Family Support",
  },

  {
    value: "environment",
    label: "Environmental Protection",
  },

  {
    value: "artisan-support",
    label: "Artisan Livelihood Support",
  },
];


/* =========================================
   PRINT OPTIONS
========================================= */

const printFormats = [
  "Flat Card",
  "Folded Card",
  "Postcard Style",
];


const paperSizes = [
  "A4",
  "A5",
  "A6",
];


/* =========================================
   DEFAULT VALUES
========================================= */

const defaults = {
  giftType: "lang-impact",

  deliveryType: "digital",

  designType: "ho-tay-lotus",

  quantity: 1,

  amountPerCard: 50,

  recipientName: "Minh",

  senderName: "Huy",

  message:
    "Wishing you a meaningful birthday.",

  causeCategory:
    "craft-preservation",

  causeNote: "",

  recipientEmail: "",

  emailTiming:
    "Send immediately",

  emailDeliveryDate: "",

  printFormat:
    "Flat Card",

  paperSize: "A4",

  downloadFormat:
    "PDF — Print Ready",

  recipientPhone: "",

  physicalDeliveryDate: "",

  streetAddress: "",

  district: "",

  city: "",

  postalCode: "",
};


/* =========================================
   DEMO VIEW
========================================= */

const giftViewDemo = {
  code: "LANG-DEMO-2026",

  giftType:
    "Làng Impact Gift",

  amount: 50,

  senderName: "Huy",

  recipientName: "Minh",

  message:
    "Wishing you a meaningful birthday.",

  status:
    "Awaiting allocation",

  statusCopy:
    "Làng & Co. will direct this contribution to verified organizations, " +
    "approved individuals, or priority causes.",
};


/* =========================================
   FORMAT MONEY
========================================= */

const formatUsd = (
  value,
) =>
  new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(
    Number(value) || 0,
  );


/* =========================================
   GENERATE GIFT CODE
========================================= */

const generateCodeSegment = () =>
  crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();


const generateGiftCode = () =>
  `LANG-${generateCodeSegment()}-${generateCodeSegment()}`;


const getUniqueGiftCode = (
  giftcards,
) => {
  let code;

  do {
    code =
      generateGiftCode();
  } while (
    giftcards.some(
      (giftcard) =>
        giftcard.code === code,
    )
  );

  return code;
};


/* =========================================
   BUILD DELIVERY DATA
========================================= */

const buildDigitalData = (
  values,
) => {
  if (
    values.deliveryType !==
    "digital"
  ) {
    return null;
  }

  return {
    recipientEmail:
      values.recipientEmail,

    emailTiming:
      values.emailTiming,

    emailDeliveryDate:
      values.emailDeliveryDate ||
      null,
  };
};


const buildPrintableData = (
  values,
) => {
  if (
    values.deliveryType !==
    "printable"
  ) {
    return null;
  }

  return {
    printFormat:
      values.printFormat,

    paperSize:
      values.paperSize,

    downloadFormat:
      values.downloadFormat,
  };
};


const buildPhysicalData = (
  values,
) => {
  if (
    values.deliveryType !==
    "physical"
  ) {
    return null;
  }

  return {
    recipientPhone:
      values.recipientPhone,

    physicalDeliveryDate:
      values.physicalDeliveryDate ||
      null,

    streetAddress:
      values.streetAddress,

    district:
      values.district,

    city:
      values.city,

    postalCode:
      values.postalCode,
  };
};


/* =========================================
   CREATE GIFTCARD
========================================= */

const createGiftcard = (
  values,
  userId = null,
) => {
  const store =
    readGiftcards();

  const now =
    new Date().toISOString();

  const code =
    getUniqueGiftCode(
      store.giftcards,
    );

  const quantity =
    Number(values.quantity);

  const amountPerCard =
    Number(
      values.amountPerCard,
    );


  const giftcard = {
    id:
      crypto.randomUUID(),

    code,

    createdByUserId:
      userId
        ? String(userId)
        : null,

    giftType:
      values.giftType,

    deliveryType:
      values.deliveryType,

    designType:
      values.designType,

    quantity,

    amountPerCard,

    totalAmount:
      quantity *
      amountPerCard,

    recipientName:
      values.recipientName,

    senderName:
      values.senderName,

    message:
      values.message,

    causeCategory:
      values.giftType ===
        "donation-in-honour"
        ? values.causeCategory
        : null,

    causeNote:
      values.giftType ===
        "donation-in-honour"
        ? values.causeNote
        : "",

    digital:
      buildDigitalData(
        values,
      ),

    printable:
      buildPrintableData(
        values,
      ),

    physical:
      buildPhysicalData(
        values,
      ),

    status:
      values.giftType ===
        "lang-impact"
        ? "Awaiting allocation"
        : "Created",

    createdAt: now,

    updatedAt: now,
  };


  store.giftcards.push(
    giftcard,
  );

  writeGiftcards(
    store,
  );

  return {
    ...giftcard,
  };
};


/* =========================================
   GET GIFTCARD BY CODE
========================================= */

const getGiftcardByCode = (
  giftCode,
) => {
  const code =
    String(
      giftCode || "",
    )
      .trim()
      .toUpperCase();

  if (!code) {
    return null;
  }

  const store =
    readGiftcards();

  const giftcard =
    store.giftcards.find(
      (item) =>
        String(
          item.code,
        ).toUpperCase() ===
        code,
    );

  return giftcard
    ? {
      ...giftcard,
    }
    : null;
};


/* =========================================
   GET GIFTCARD BY ID
========================================= */

const getGiftcardById = (
  giftcardId,
) => {
  const id =
    String(
      giftcardId || "",
    ).trim();

  if (!id) {
    return null;
  }

  const store =
    readGiftcards();

  const giftcard =
    store.giftcards.find(
      (item) =>
        String(item.id) ===
        id,
    );

  return giftcard
    ? {
      ...giftcard,
    }
    : null;
};


/* =========================================
   GET GIFTCARDS BY USER
========================================= */

const getGiftcardsByUserId = (
  userId,
) => {
  const id =
    String(
      userId || "",
    ).trim();

  if (!id) {
    return [];
  }

  const store =
    readGiftcards();

  return store.giftcards
    .filter(
      (giftcard) =>
        String(
          giftcard
            .createdByUserId ||
          "",
        ) === id,
    )
    .map(
      (giftcard) => ({
        ...giftcard,
      }),
    );
};


/* =========================================
   UPDATE GIFTCARD
========================================= */

const updateGiftcard = (
  giftcardId,
  values,
  userId = null,
) => {
  const store =
    readGiftcards();

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


  /*
   * Only the account that created
   * the gift can update it.
   */
  if (
    giftcard.createdByUserId &&
    String(
      giftcard.createdByUserId,
    ) !==
    String(userId || "")
  ) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }


  const quantity =
    Number(values.quantity);

  const amountPerCard =
    Number(
      values.amountPerCard,
    );


  giftcard.giftType =
    values.giftType;

  giftcard.deliveryType =
    values.deliveryType;

  giftcard.designType =
    values.designType;

  giftcard.quantity =
    quantity;

  giftcard.amountPerCard =
    amountPerCard;

  giftcard.totalAmount =
    quantity *
    amountPerCard;

  giftcard.recipientName =
    values.recipientName;

  giftcard.senderName =
    values.senderName;

  giftcard.message =
    values.message;


  giftcard.causeCategory =
    values.giftType ===
      "donation-in-honour"
      ? values.causeCategory
      : null;


  giftcard.causeNote =
    values.giftType ===
      "donation-in-honour"
      ? values.causeNote
      : "";


  giftcard.digital =
    buildDigitalData(
      values,
    );


  giftcard.printable =
    buildPrintableData(
      values,
    );


  giftcard.physical =
    buildPhysicalData(
      values,
    );


  giftcard.status =
    values.giftType ===
      "lang-impact"
      ? "Awaiting allocation"
      : "Created";


  giftcard.updatedAt =
    new Date().toISOString();


  writeGiftcards(
    store,
  );


  return {
    ok: true,

    giftcard: {
      ...giftcard,
    },
  };
};


/* =========================================
   UPDATE STATUS
========================================= */

const updateGiftcardStatus = (
  giftCode,
  status,
) => {
  const code =
    String(
      giftCode || "",
    )
      .trim()
      .toUpperCase();

  const nextStatus =
    String(
      status || "",
    ).trim();


  if (
    !code ||
    !nextStatus
  ) {
    return {
      ok: false,
      reason: "invalid-input",
    };
  }


  const store =
    readGiftcards();


  const giftcard =
    store.giftcards.find(
      (item) =>
        String(
          item.code,
        ).toUpperCase() ===
        code,
    );


  if (!giftcard) {
    return {
      ok: false,
      reason: "not-found",
    };
  }


  giftcard.status =
    nextStatus;

  giftcard.updatedAt =
    new Date().toISOString();


  writeGiftcards(
    store,
  );


  return {
    ok: true,

    giftcard: {
      ...giftcard,
    },
  };
};


/* =========================================
   PAGE DATA
========================================= */

const getGiftcardPageData = (
  formValues = {},
) => {
  const currentDefaults = {
    ...defaults,
    ...formValues,
  };


  const selectedGiftType =
    giftTypes.find(
      (item) =>
        item.value ===
        currentDefaults.giftType,
    ) ||
    giftTypes[0];


  const selectedDelivery =
    deliveryTypes.find(
      (item) =>
        item.value ===
        currentDefaults.deliveryType,
    ) ||
    deliveryTypes[0];


  const selectedDesign =
    designs.find(
      (item) =>
        item.value ===
        currentDefaults.designType,
    ) ||
    designs[0];


  const quantity =
    Number(
      currentDefaults.quantity,
    ) || 1;


  const amountPerCard =
    Number(
      currentDefaults.amountPerCard,
    ) || 0;


  const total =
    quantity *
    amountPerCard;


  return {
    pageTitle:
      "Làng & Co. — Impact Gifts",

    activePage:
      "giftcard",

    giftTypes,

    deliveryTypes,

    designs,

    causes,

    printFormats,

    paperSizes,

    defaults:
      currentDefaults,

    selectedGiftType,

    selectedDelivery,

    selectedDesign,

    amountPerCardDisplay:
      formatUsd(
        amountPerCard,
      ),

    totalDisplay:
      formatUsd(
        total,
      ),

    giftViewDemo: {
      ...giftViewDemo,

      amountDisplay:
        formatUsd(
          giftViewDemo.amount,
        ),
    },
  };
};


/* =========================================
   EXPORTS
========================================= */

module.exports = {
  createGiftcard,

  formatUsd,

  getGiftcardByCode,

  getGiftcardById,

  getGiftcardsByUserId,

  getGiftcardPageData,

  updateGiftcard,

  updateGiftcardStatus,
};