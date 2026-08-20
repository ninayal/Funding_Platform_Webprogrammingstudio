"use strict";

const {
  giftcardDefaults,
} = require("../config/giftcardConfig");

const toStoredFields = (values) => {
  const quantity = Number(values.quantity);
  const amountPerCard = Number(values.amountPerCard);

  return {
    giftType: values.giftType,
    deliveryType: values.deliveryType,
    designType: values.designType,
    quantity,
    amountPerCard,
    totalAmount: quantity * amountPerCard,
    recipientName: values.recipientName,
    senderName: values.senderName,
    message: values.message,

    causeCategory:
      values.giftType === "donation-in-honour"
        ? values.causeCategory
        : null,

    causeNote:
      values.giftType === "donation-in-honour"
        ? values.causeNote
        : "",

    digital:
  values.deliveryType === "digital"
    ? {
        recipientEmail: values.recipientEmail,
      }
    : null,

    printable:
      values.deliveryType === "printable"
        ? {
            printFormat: values.printFormat,
            paperSize: values.paperSize,
            downloadFormat: values.downloadFormat,
          }
        : null,

    physical:
      values.deliveryType === "physical"
        ? {
            recipientPhone: values.recipientPhone,
            physicalDeliveryDate:
              values.physicalDeliveryDate || null,
            streetAddress: values.streetAddress,
            district: values.district,
            city: values.city,
            postalCode: values.postalCode,
          }
        : null,
  };
};

const toFormValues = (giftcard = {}) => ({
  ...giftcardDefaults,

  giftType:
    giftcard.giftType ?? giftcardDefaults.giftType,

  deliveryType:
    giftcard.deliveryType ?? giftcardDefaults.deliveryType,

  designType:
    giftcard.designType ?? giftcardDefaults.designType,

  quantity:
    giftcard.quantity ?? giftcardDefaults.quantity,

  amountPerCard:
    giftcard.amountPerCard ?? giftcardDefaults.amountPerCard,

  recipientName: giftcard.recipientName ?? "",
  senderName: giftcard.senderName ?? "",
  message: giftcard.message ?? "",
  causeCategory: giftcard.causeCategory ?? "",
  causeNote: giftcard.causeNote ?? "",

  recipientEmail:
    giftcard.digital?.recipientEmail ?? "",

  printFormat:
    giftcard.printable?.printFormat ??
    giftcardDefaults.printFormat,

  paperSize:
    giftcard.printable?.paperSize ??
    giftcardDefaults.paperSize,

  downloadFormat:
    giftcard.printable?.downloadFormat ??
    giftcardDefaults.downloadFormat,

  recipientPhone:
    giftcard.physical?.recipientPhone ?? "",

  physicalDeliveryDate:
    giftcard.physical?.physicalDeliveryDate ?? "",

  streetAddress:
    giftcard.physical?.streetAddress ?? "",

  district:
    giftcard.physical?.district ?? "",

  city:
    giftcard.physical?.city ?? "",

  postalCode:
    giftcard.physical?.postalCode ?? "",
});

module.exports = {
  toStoredFields,
  toFormValues,
};