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

  const passwordToggle =
    form.querySelector(
      "[data-password-toggle]"
    );

  const submitButton =
    form.querySelector(
      "[data-login-submit]"
    );

  const submitLabel =
    form.querySelector(
      "[data-submit-label]"
    );

  const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const EMAIL_HELP =
    "Example: name@example.com";

  const removeFormError = () => {
    document
      .querySelector(
        "#login-form-error"
      )
      ?.remove();
  };

  const setFieldError = (
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
    helpText = ""
  ) => {
    input.classList.remove(
      "form-input--error"
    );

    input.setAttribute(
      "aria-invalid",
      "false"
    );

    messageElement.textContent =
      helpText;

    messageElement.className =
      helpText
        ? "form-message form-help"
        : "form-message is-hidden";
  };

  const validateEmail = () => {
    const email =
      emailInput.value
        .trim()
        .toLowerCase();

    if (
      !EMAIL_PATTERN.test(email)
    ) {
      setFieldError(
        emailInput,
        emailMessage,
        "Enter a valid email address."
      );

      return false;
    }

    clearFieldError(
      emailInput,
      emailMessage,
      EMAIL_HELP
    );

    return true;
  };

  const validatePassword = () => {
    if (!passwordInput.value) {
      setFieldError(
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
    "input",
    () => {
      removeFormError();

      if (
        emailInput.getAttribute(
          "aria-invalid"
        ) === "true"
      ) {
        validateEmail();
      }
    }
  );

  emailInput.addEventListener(
    "blur",
    validateEmail
  );

  passwordInput.addEventListener(
    "input",
    () => {
      removeFormError();

      if (
        passwordInput.getAttribute(
          "aria-invalid"
        ) === "true"
      ) {
        validatePassword();
      }
    }
  );

  passwordInput.addEventListener(
    "blur",
    validatePassword
  );

  passwordToggle.addEventListener(
    "click",
    () => {
      const isVisible =
        passwordInput.type ===
        "text";

      passwordInput.type =
        isVisible
          ? "password"
          : "text";

      passwordToggle.textContent =
        isVisible
          ? "Show"
          : "Hide";

      passwordToggle.setAttribute(
        "aria-label",
        isVisible
          ? "Show password"
          : "Hide password"
      );

      passwordToggle.setAttribute(
        "aria-pressed",
        String(!isVisible)
      );

      passwordInput.focus();
    }
  );

  form.addEventListener(
    "submit",
    (event) => {
      removeFormError();

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

      submitButton.classList.add(
        "is-loading"
      );

      submitLabel.textContent =
        "Signing In...";
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      submitButton.disabled =
        false;

      submitButton.classList.remove(
        "is-loading"
      );

      submitLabel.textContent =
        "Sign In";
    }
  );
})();
