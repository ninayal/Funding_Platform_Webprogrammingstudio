(() => {
  "use strict";

  const form =
    document.querySelector(
      "[data-login-form]"
    );

  if (!form) {
    return;
  }

  const emailInput =
    form.querySelector(
      "[data-login-email]"
    );

  const passwordInput =
    form.querySelector(
      "[data-login-password]"
    );

  const emailMessage =
    form.querySelector(
      "[data-email-message]"
    );

  const passwordMessage =
    form.querySelector(
      "[data-password-message]"
    );

  const submitButton =
    form.querySelector(
      "[data-login-submit]"
    );

  const submitLabel =
    form.querySelector(
      "[data-submit-label]"
    );

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const emailHelp =
    "Example: name@example.com";

  const clearFormError = () => {
    const formError =
      document.querySelector(
        "#login-form-error"
      );

    if (!formError) {
      return;
    }

    formError.textContent = "";
    formError.classList.add(
      "is-hidden"
    );

    formError.setAttribute(
      "aria-hidden",
      "true"
    );
  };

  const showFieldError = (
    input,
    messageElement,
    message
  ) => {
    input.classList.add(
      "form-input--error"
    );

    input.setAttribute(
      "aria-invalid",
      "true"
    );

    messageElement.textContent =
      message;

    messageElement.className =
      "form-message form-error";
  };

  const clearFieldError = (
    input,
    messageElement,
    defaultText = ""
  ) => {
    input.classList.remove(
      "form-input--error"
    );

    input.setAttribute(
      "aria-invalid",
      "false"
    );

    messageElement.textContent =
      defaultText;

    messageElement.className =
      defaultText
        ? "form-message form-help"
        : "form-message is-hidden";
  };

  const validateEmail = () => {
    const valid =
      emailPattern.test(
        emailInput.value.trim()
      );

    if (!valid) {
      showFieldError(
        emailInput,
        emailMessage,
        "Enter a valid email address."
      );

      return false;
    }

    clearFieldError(
      emailInput,
      emailMessage,
      emailHelp
    );

    return true;
  };

  const validatePassword = () => {
    if (!passwordInput.value) {
      showFieldError(
        passwordInput,
        passwordMessage,
        "Enter your password."
      );

      return false;
    }

    clearFieldError(
      passwordInput,
      passwordMessage
    );

    return true;
  };

  emailInput.addEventListener(
    "blur",
    validateEmail
  );

  passwordInput.addEventListener(
    "blur",
    validatePassword
  );

  emailInput.addEventListener(
    "input",
    () => {
      clearFormError();

      if (
        emailInput.getAttribute(
          "aria-invalid"
        ) === "true"
      ) {
        validateEmail();
      }
    }
  );

  passwordInput.addEventListener(
    "input",
    () => {
      clearFormError();

      if (
        passwordInput.getAttribute(
          "aria-invalid"
        ) === "true"
      ) {
        validatePassword();
      }
    }
  );

  form.addEventListener(
    "submit",
    (event) => {
      clearFormError();

      const emailValid =
        validateEmail();

      const passwordValid =
        validatePassword();

      if (
        !emailValid ||
        !passwordValid
      ) {
        event.preventDefault();

        (
          !emailValid
            ? emailInput
            : passwordInput
        ).focus();

        return;
      }

      submitButton.disabled =
        true;

      submitLabel.textContent =
        "Signing In...";
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      submitButton.disabled =
        false;

      submitLabel.textContent =
        "Sign In";
    }
  );
})();
