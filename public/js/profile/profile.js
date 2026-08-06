(() => {
  "use strict";

  const tabInputs =
    document.querySelectorAll(
      ".profile-state"
    );

  const setTabInUrl = (
    tab
  ) => {
    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "tab",
      tab
    );

    url.searchParams.delete(
      "status"
    );

    window.history.replaceState(
      {},
      "",
      url
    );
  };

  tabInputs.forEach(
    (input) => {
      input.addEventListener(
        "change",
        () => {
          if (
            input.checked
          ) {
            setTabInUrl(
              input.value
            );
          }
        }
      );
    }
  );

  const pageMessage =
    document.querySelector(
      "[data-profile-message]"
    );

  document
    .querySelector(
      "[data-dismiss-profile-message]"
    )
    ?.addEventListener(
      "click",
      () => {
        pageMessage?.remove();
      }
    );

  const aboutInput =
    document.querySelector(
      "[data-profile-about]"
    );

  const aboutCounter =
    document.querySelector(
      "[data-about-counter]"
    );

  const updateAboutCounter =
    () => {
      if (
        !aboutInput ||
        !aboutCounter
      ) {
        return;
      }

      aboutCounter.textContent =
        `${aboutInput.value.length}/500`;
    };

  aboutInput?.addEventListener(
    "input",
    updateAboutCounter
  );

  updateAboutCounter();

  const profileForm =
    document.querySelector(
      "[data-profile-form]"
    );

  const newPassword =
    document.querySelector(
      "[data-new-password]"
    );

  const confirmPassword =
    document.querySelector(
      "[data-confirm-password]"
    );

  const confirmError =
    document.querySelector(
      "[data-confirm-password-error]"
    );

  const validatePasswordMatch =
    () => {
      if (
        !newPassword ||
        !confirmPassword
      ) {
        return true;
      }

      const matches =
        !confirmPassword.value ||
        confirmPassword.value ===
          newPassword.value;

      confirmPassword.setCustomValidity(
        matches
          ? ""
          : "The new passwords do not match."
      );

      if (
        confirmError
      ) {
        confirmError.textContent =
          matches
            ? ""
            : "The new passwords do not match.";
      }

      return matches;
    };

  newPassword?.addEventListener(
    "input",
    validatePasswordMatch
  );

  confirmPassword?.addEventListener(
    "input",
    validatePasswordMatch
  );

  profileForm?.addEventListener(
    "submit",
    (event) => {
      const passwordsMatch =
        validatePasswordMatch();

      if (
        !passwordsMatch ||
        !profileForm.checkValidity()
      ) {
        event.preventDefault();
        profileForm.reportValidity();
        return;
      }

      const submitButton =
        profileForm.querySelector(
          "[data-profile-submit]"
        );

      const submitLabel =
        profileForm.querySelector(
          "[data-profile-submit-label]"
        );

      if (
        submitButton &&
        submitLabel
      ) {
        submitButton.disabled =
          true;

        submitLabel.textContent =
          "Saving...";
      }
    }
  );

  const deactivateConfirm =
    document.querySelector(
      "[data-deactivate-confirm]"
    );

  const deactivateButton =
    document.querySelector(
      "[data-deactivate-button]"
    );

  const deactivateStatus =
    document.querySelector(
      "[data-deactivate-status]"
    );

  deactivateConfirm?.addEventListener(
    "change",
    () => {
      if (
        deactivateButton
      ) {
        deactivateButton.disabled =
          !deactivateConfirm.checked;
      }
    }
  );

  deactivateButton?.addEventListener(
    "click",
    () => {
      if (
        deactivateStatus
      ) {
        deactivateStatus.textContent =
          "Account deactivation is not enabled in this demonstration.";
      }
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      const submitButton =
        document.querySelector(
          "[data-profile-submit]"
        );

      const submitLabel =
        document.querySelector(
          "[data-profile-submit-label]"
        );

      if (
        submitButton &&
        submitLabel
      ) {
        submitButton.disabled =
          false;

        submitLabel.textContent =
          "Save Changes";
      }
    }
  );
})();
