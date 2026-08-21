"use strict";

const {
  giftTypes,
  deliveryTypes,
  designs,
  causes,
  printFormats,
  paperSizes,
  downloadFormats,
} = require("../config/giftcardConfig");

const allowedGiftTypes = new Set(
  giftTypes.map((item) => item.value),
);

const allowedDeliveryTypes = new Set(
  deliveryTypes.map((item) => item.value),
);

const allowedDesignTypes = new Set(
  designs.map((item) => item.value),
);

const allowedCauses = new Set(
  causes.map((item) => item.value),
);

const allowedPrintFormats = new Set(printFormats);
const allowedPaperSizes = new Set(paperSizes);
const allowedDownloadFormats = new Set(downloadFormats);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanText = (value) =>
  String(value || "").trim();

const todayIso = () =>
  new Date().toISOString().slice(0, 10);

const isValidIsoDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value);

const isTodayOrFuture = (value) =>
  isValidIsoDate(value) &&
  value >= todayIso();

const validateGiftcard = (body = {}) => {
  const values = {
    giftType: cleanText(body.giftType),
    deliveryType: cleanText(body.deliveryType),
    designType: cleanText(body.designType),
    quantity: Number(body.quantity),
    amountPerCard: Number(body.amountPerCard),
    recipientName: cleanText(body.recipientName),
    senderName: cleanText(body.senderName),
    message: cleanText(body.message),
    causeCategory: cleanText(body.causeCategory),
    causeNote: cleanText(body.causeNote),
    recipientEmail: cleanText(body.recipientEmail),
    printFormat: cleanText(body.printFormat),
    paperSize: cleanText(body.paperSize),
    downloadFormat: cleanText(body.downloadFormat),
    recipientPhone: cleanText(body.recipientPhone),
    physicalDeliveryDate: cleanText(
      body.physicalDeliveryDate,
    ),
    streetAddress: cleanText(body.streetAddress),
    district: cleanText(body.district),
    city: cleanText(body.city),
    postalCode: cleanText(body.postalCode),
  };

  const errors = {};

  if (!allowedGiftTypes.has(values.giftType)) {
    errors.giftType =
      "Choose a valid gift type.";
  }

  if (!allowedDeliveryTypes.has(values.deliveryType)) {
    errors.deliveryType =
      "Choose a valid delivery type.";
  }

  if (!allowedDesignTypes.has(values.designType)) {
    errors.designType =
      "Choose a valid design.";
  }

  if (
    !Number.isInteger(values.quantity) ||
    values.quantity < 1 ||
    values.quantity > 20
  ) {
    errors.quantity =
      "Quantity must be between 1 and 20.";
  }

  if (
    !Number.isFinite(values.amountPerCard) ||
    values.amountPerCard < 5 ||
    values.amountPerCard > 10000
  ) {
    errors.amountPerCard =
      "Amount must be between $5 and $10,000.";
  }

  if (
    values.recipientName.length < 2 ||
    values.recipientName.length > 60
  ) {
    errors.recipientName =
      "Recipient name must be 2–60 characters.";
  }

  if (
    values.senderName.length < 2 ||
    values.senderName.length > 60
  ) {
    errors.senderName =
      "Sender name must be 2–60 characters.";
  }

  if (
    values.message.length < 5 ||
    values.message.length > 280
  ) {
    errors.message =
      "Message must be 5–280 characters.";
  }

  if (values.giftType === "donation-in-honour") {
    if (!allowedCauses.has(values.causeCategory)) {
      errors.causeCategory =
        "Choose a valid donation cause.";
    }

    if (values.causeNote.length > 180) {
      errors.causeNote =
        "Cause note cannot exceed 180 characters.";
    }
  }


  if (values.deliveryType === "digital") {
    if (!EMAIL_PATTERN.test(values.recipientEmail)) {
      errors.recipientEmail =
        "Enter a valid recipient email.";
    }
  }

  if (values.deliveryType === "printable") {
    if (!allowedPrintFormats.has(values.printFormat)) {
      errors.printFormat =
        "Choose a valid print format.";
    }

    if (!allowedPaperSizes.has(values.paperSize)) {
      errors.paperSize =
        "Choose a valid paper size.";
    }

    if (
      !allowedDownloadFormats.has(
        values.downloadFormat,
      )
    ) {
      errors.downloadFormat =
        "Choose a valid download format.";
    }
  }

  if (values.deliveryType === "physical") {
    const phoneDigits =
      values.recipientPhone.replace(/\D/g, "");

    if (
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      errors.recipientPhone =
        "Enter a valid phone number.";
    }

    if (
      values.physicalDeliveryDate &&
      !isTodayOrFuture(
        values.physicalDeliveryDate,
      )
    ) {
      errors.physicalDeliveryDate =
        "Delivery date cannot be in the past.";
    }

    if (
      !values.streetAddress ||
      values.streetAddress.length > 120
    ) {
      errors.streetAddress =
        "Enter a valid street address.";
    }

    if (
      !values.district ||
      values.district.length > 80
    ) {
      errors.district =
        "Enter a valid district.";
    }

    if (
      !values.city ||
      values.city.length > 80
    ) {
      errors.city =
        "Enter a valid city or province.";
    }

    if (values.postalCode.length > 20) {
      errors.postalCode =
        "Postal code cannot exceed 20 characters.";
    }
  }

  return {
    values,
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

module.exports = {
  validateGiftcard,
};