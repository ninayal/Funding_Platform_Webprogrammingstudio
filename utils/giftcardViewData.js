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

const { toFormValues } = require("./giftcardMapper");

const formatUsd = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-AU").format(new Date(value))
    : "";

const findOption = (items, value) =>
  items.find((item) => item.value === value) || items[0];

const getSelectionData = (values) => {
  const quantity = Number(values.quantity) || 1;
  const amountPerCard = Number(values.amountPerCard) || 0;

  return {
    selectedGiftType: findOption(giftTypes, values.giftType),
    selectedDelivery: findOption(deliveryTypes, values.deliveryType),
    selectedDesign: findOption(designs, values.designType),
    amountPerCardDisplay: formatUsd(amountPerCard),
    totalDisplay: formatUsd(quantity * amountPerCard),
  };
};

const formatSavedGift = (giftcard) => {
  const values = { ...giftcardDefaults, ...toFormValues(giftcard) };
  const { selectedGiftType, selectedDelivery, selectedDesign } =
    getSelectionData(values);

  return {
    ...giftcard,
    giftTypeLabel: selectedGiftType.title,
    deliveryLabel: selectedDelivery.title,
    designLabel: selectedDesign.title,
    amountDisplay: formatUsd(giftcard.amountPerCard),
    totalDisplay: formatUsd(giftcard.totalAmount),
    createdAtDisplay: formatDate(giftcard.createdAt),
  };
};

const buildGiftcardPageData = (
  formValues = {},
  {
    pageTitle = "Làng & Co. — Impact Gifts",
    errors = {},
    reviewMode = false,
    editGiftcard = null,
    savedGift = null,
    redeemError = "",
    deleted = false,
    currentUser = null,
    canManageSavedGift = false,
  } = {},
) => {
  const defaults = { ...giftcardDefaults, ...formValues };
  const selection = getSelectionData(defaults);
  const isEditing = Boolean(editGiftcard);
  const isSavedView = Boolean(savedGift);
  const isReviewMode = Boolean(reviewMode && !isEditing && !isSavedView);
  const isLoggedIn = Boolean(currentUser);

  const form = {
    action: isEditing
      ? `/giftcard/${editGiftcard.id}/update`
      : "/giftcard/review",
    mode: isEditing ? "edit" : "create",
    giftId: isEditing ? editGiftcard.id : "",
    submitLabel: isEditing
      ? "Save Changes"
      : isLoggedIn
        ? "Review Your Gift"
        : "Sign In & Review",
  };

  const giftView = savedGift
    ? {
      ...formatSavedGift(savedGift),
      canManage: canManageSavedGift,
      editUrl: canManageSavedGift ? `/giftcard/${savedGift.id}/edit` : "",
      deleteUrl: canManageSavedGift ? `/giftcard/${savedGift.id}/delete` : "",
    }
    : null;

  return {
    pageTitle,
    activePage: "giftcard",
    giftTypes,
    deliveryTypes,
    designs,
    causes,
    printFormats,
    paperSizes,
    defaults,
    errors,
    redeemError,
    form,
    giftView,
    ...selection,
    page: {
      isEditing,
      isSavedView,
      isReviewMode,
      hasServerErrors: Object.keys(errors).length > 0,
      wasDeleted: Boolean(deleted),
      showHero: !isSavedView,
      showReview: isReviewMode,
      showRedeem: !isSavedView,
      waveClass: isSavedView
        ? "giftcard-wave giftcard-wave--standalone"
        : "giftcard-wave",
    },
    giftViewDemo: {
      ...giftViewDemo,
      amountDisplay: formatUsd(giftViewDemo.amount),
    },
  };
};

module.exports = {
  buildGiftcardPageData,
  formatSavedGift,
  formatUsd,
};