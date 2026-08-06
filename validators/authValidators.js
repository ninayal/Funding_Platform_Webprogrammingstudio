"use strict";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const USERNAME_PATTERN =
  /^[A-Za-z0-9._-]{3,30}$/;

const NAME_PATTERN =
  /^[\p{L}\p{M}' -]{2,50}$/u;

const ALLOWED_GENDERS =
  new Set([
    "male",
    "female",
    "other",
    "prefer_not"
  ]);

const clean = (
  value
) =>
  String(value || "")
    .trim();

const validateLogin = (
  body = {}
) => {
  const values = {
    email:
      clean(
        body.email
      ).toLowerCase(),

    password:
      String(
        body.password || ""
      )
  };

  const errors = {};

  if (
    !EMAIL_PATTERN.test(
      values.email
    )
  ) {
    errors.email =
      "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password =
      "Enter your password.";
  }

  return {
    values,
    errors
  };
};

const validateRegistration = (
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

    username:
      clean(
        body.username
      ),

    email:
      clean(
        body.email
      ).toLowerCase(),

    gender:
      clean(
        body.gender
      ),

    description:
      clean(
        body.description
      ),

    password:
      String(
        body.password || ""
      ),

    confirmPassword:
      String(
        body.confirm_password ||
        body.confirmPassword ||
        ""
      ),

    terms:
      body.terms
  };

  const errors = {};

  if (
    !NAME_PATTERN.test(
      values.firstname
    )
  ) {
    errors.firstname =
      "First name must contain between 2 and 50 letters.";
  }

  if (
    !NAME_PATTERN.test(
      values.lastname
    )
  ) {
    errors.lastname =
      "Last name must contain between 2 and 50 letters.";
  }

  if (
    !USERNAME_PATTERN.test(
      values.username
    )
  ) {
    errors.username =
      "Username must contain 3–30 letters, numbers, dots, underscores, or hyphens.";
  }

  if (
    !EMAIL_PATTERN.test(
      values.email
    )
  ) {
    errors.email =
      "Enter a valid email address.";
  }

  if (
    !ALLOWED_GENDERS.has(
      values.gender
    )
  ) {
    errors.gender =
      "Select a gender option.";
  }

  if (
    values.description.length <
      10 ||
    values.description.length >
      200
  ) {
    errors.description =
      "Description must contain between 10 and 200 characters.";
  }

  const passwordValid =
    values.password.length >=
      8 &&
    values.password.length <=
      72 &&
    /[A-Z]/.test(
      values.password
    ) &&
    /[a-z]/.test(
      values.password
    ) &&
    /[0-9\W]/.test(
      values.password
    );

  if (!passwordValid) {
    errors.password =
      "Use 8–72 characters with uppercase, lowercase, and a number or special character.";
  }

  if (
    values.confirmPassword !==
    values.password
  ) {
    errors.confirm_password =
      "Passwords do not match.";
  }

  const termsAccepted = [
    true,
    "true",
    "on",
    "1",
    1
  ].includes(
    values.terms
  );

  if (!termsAccepted) {
    errors.terms =
      "You must accept the Terms of Service and Privacy Policy.";
  }

  return {
    values,
    errors
  };
};

module.exports = {
  validateLogin,
  validateRegistration
};
