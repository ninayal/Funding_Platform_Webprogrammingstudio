"use strict";

const clean = (
  value
) =>
  String(value || "")
    .trim();

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PHONE_PATTERN =
  /^[0-9+() -]{7,20}$/;

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,72}$/;

const validateTextLength = (
  errors,
  field,
  value,
  {
    label,
    minimum = 0,
    maximum
  }
) => {
  if (
    minimum > 0 &&
    value.length < minimum
  ) {
    errors[field] =
      `${label} must contain at least ${minimum} characters.`;
    return;
  }

  if (
    maximum &&
    value.length > maximum
  ) {
    errors[field] =
      `${label} must not exceed ${maximum} characters.`;
  }
};

const validateProfile = (
  body = {}
) => {
  const values = {
    firstname:
      clean(
        body.firstname
      ),

    lastname:
      clean(
        body.lastname
      ),

    email:
      clean(
        body.email
      ).toLowerCase(),

    phone:
      clean(
        body.phone
      ),

    location:
      clean(
        body.location
      ),

    postalCode:
      clean(
        body.postalCode
      ),

    address:
      clean(
        body.address
      ),

    about:
      clean(
        body.about
      ),

    currentPassword:
      String(
        body.currentPassword || ""
      ),

    newPassword:
      String(
        body.newPassword || ""
      ),

    confirmNewPassword:
      String(
        body.confirmNewPassword || ""
      )
  };

  const errors = {};

  validateTextLength(
    errors,
    "firstname",
    values.firstname,
    {
      label:
        "First name",
      minimum:
        2,
      maximum:
        50
    }
  );

  validateTextLength(
    errors,
    "lastname",
    values.lastname,
    {
      label:
        "Last name",
      minimum:
        2,
      maximum:
        50
    }
  );

  if (
    !EMAIL_PATTERN.test(
      values.email
    )
  ) {
    errors.email =
      "Enter a valid email address.";
  }

  if (
    values.phone &&
    !PHONE_PATTERN.test(
      values.phone
    )
  ) {
    errors.phone =
      "Enter a valid phone number.";
  }

  if (
    values.location
  ) {
    validateTextLength(
      errors,
      "location",
      values.location,
      {
        label:
          "Location",
        minimum:
          2,
        maximum:
          100
      }
    );
  }

  validateTextLength(
    errors,
    "postalCode",
    values.postalCode,
    {
      label:
        "Postal code",
      maximum:
        20
    }
  );

  validateTextLength(
    errors,
    "address",
    values.address,
    {
      label:
        "Address",
      maximum:
        180
    }
  );

  validateTextLength(
    errors,
    "about",
    values.about,
    {
      label:
        "About",
      maximum:
        500
    }
  );

  const changingPassword =
    Boolean(
      values.currentPassword ||
      values.newPassword ||
      values.confirmNewPassword
    );

  if (
    changingPassword
  ) {
    if (
      !values.currentPassword
    ) {
      errors.currentPassword =
        "Enter your current password.";
    }

    if (
      !PASSWORD_PATTERN.test(
        values.newPassword
      )
    ) {
      errors.newPassword =
        "Use 8–72 characters with uppercase, lowercase, number, and symbol.";
    }

    if (
      values.confirmNewPassword !==
      values.newPassword
    ) {
      errors.confirmNewPassword =
        "The new passwords do not match.";
    }
  }

  return {
    errors,
    values
  };
};

const validatePreferences = (
  body = {}
) => ({
  emailUpdates:
    body.emailUpdates === "on",

  orderNotifications:
    body.orderNotifications === "on",

  communityReplies:
    body.communityReplies === "on",

  promotionalUpdates:
    body.promotionalUpdates === "on",

  saveShippingInformation:
    body.saveShippingInformation === "on",

  internationalShippingDefault:
    body.internationalShippingDefault === "on",

  productCareGuides:
    body.productCareGuides === "on"
});

module.exports = {
  validatePreferences,
  validateProfile
};
