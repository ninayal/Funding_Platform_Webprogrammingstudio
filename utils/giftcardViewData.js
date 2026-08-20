"use strict";

const {
  giftTypes,
  deliveryTypes,
  designs,
  causes,
  printFormats,
  paperSizes,
  giftcardDefaults,
  giftViewDemo,
} = require("../config/giftcardConfig");

const {
  toFormValues,
} = require("./giftcardMapper");

const formatUsd = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const findOption = (items, value) =>
  items.find((item) => item.value === value) ||
  items[0];

const buildGiftcardPageData = (
  formValues = {},
) => {
  const values = {
    ...giftcardDefaults,
    ...formValues,
  };

  const quantity =
    Number(values.quantity) || 1;

  const amountPerCard =
    Number(values.amountPerCard) || 0;

  return {
    pageTitle: "Làng & Co. — Impact Gifts",
    activePage: "giftcard",
    giftTypes,
    deliveryTypes,
    designs,
    causes,
    printFormats,
    paperSizes,
    defaults: values,

    selectedGiftType:
      findOption(giftTypes, values.giftType),

    selectedDelivery:
      findOption(deliveryTypes, values.deliveryType),

    selectedDesign:
      findOption(designs, values.designType),

    amountPerCardDisplay:
      formatUsd(amountPerCard),

    totalDisplay:
      formatUsd(quantity * amountPerCard),

    giftViewDemo: {
      ...giftViewDemo,
      amountDisplay:
        formatUsd(giftViewDemo.amount),
    },
  };
};

const formatSavedGift = (giftcard) => {
  const pageData =
    buildGiftcardPageData(
      toFormValues(giftcard),
    );

  return {
    ...giftcard,

    giftTypeLabel:
      pageData.selectedGiftType.title,

    deliveryLabel:
      pageData.selectedDelivery.title,

    designLabel:
      pageData.selectedDesign.title,

    amountDisplay:
      formatUsd(giftcard.amountPerCard),

    totalDisplay:
      formatUsd(giftcard.totalAmount),
  };
};

module.exports = {
  buildGiftcardPageData,
  formatSavedGift,
  formatUsd,
};