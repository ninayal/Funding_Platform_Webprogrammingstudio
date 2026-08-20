"use strict";

const valueOrEmpty = (
  value
) =>
  typeof value === "string"
    ? value
    : "";

const hasText = (
  value
) =>
  Boolean(
    valueOrEmpty(value).trim()
  );

const createMessageState = (
  error,
  defaultText = ""
) => {
  const hasError =
    hasText(error);

  return {
    text:
      hasError
        ? error
        : defaultText,

    className:
      hasError
        ? "form-message form-error"
        : defaultText
          ? "form-message form-help"
          : "form-message is-hidden",

    ariaInvalid:
      String(hasError)
  };
};

const buildLoginView = ({
  values = {},
  errors = {},
  redirect = "/"
} = {}) => {
  const formError =
    valueOrEmpty(
      errors.form
    );

  const emailState =
    createMessageState(
      errors.email,
      "Example: name@example.com"
    );

  const passwordState =
    createMessageState(
      errors.password
    );

  const safeRedirect =
    typeof redirect === "string" &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
      ? redirect
      : "/";

  const encodedRedirect =
    encodeURIComponent(
      safeRedirect
    );

  return {
    pageTitle:
      "Sign In",

    redirectValue:
      safeRedirect,

    emailValue:
      valueOrEmpty(
        values.email
      ),

    formErrorText:
      formError,

    formErrorClass:
      hasText(formError)
        ? "login-form-error"
        : "login-form-error is-hidden",

    formErrorAriaHidden:
      String(
        !hasText(formError)
      ),

    emailInputClass:
      emailState.ariaInvalid === "true"
        ? "form-input form-input--error"
        : "form-input",

    emailAriaInvalid:
      emailState.ariaInvalid,

    emailMessageText:
      emailState.text,

    emailMessageClass:
      emailState.className,

    passwordInputClass:
      passwordState.ariaInvalid === "true"
        ? "form-input form-input--error"
        : "form-input",

    passwordAriaInvalid:
      passwordState.ariaInvalid,

    passwordMessageText:
      passwordState.text,

    passwordMessageClass:
      passwordState.className,

    registerUrl:
      `/shared/register?redirect=${encodedRedirect}`,

    forgotPasswordUrl:
      `/shared/forgot-password?redirect=${encodedRedirect}`,

    guestUrl:
      safeRedirect
  };
};

module.exports = {
  buildLoginView
};
