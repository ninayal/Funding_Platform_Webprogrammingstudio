"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     PROFILE MESSAGE
  ========================================================= */

  const message = document.querySelector(
    "[data-profile-message]"
  );

  const dismissMessage = document.querySelector(
    "[data-dismiss-profile-message]"
  );

  if (dismissMessage && message) {
    dismissMessage.addEventListener("click", () => {
      message.remove();
    });
  }

  /* =========================================================
     ABOUT CHARACTER COUNTER
  ========================================================= */

  const aboutInput = document.querySelector(
    "[data-profile-about]"
  );

  const aboutCounter = document.querySelector(
    "[data-about-counter]"
  );

  const updateAboutCounter = () => {
    if (!aboutInput || !aboutCounter) {
      return;
    }

    aboutCounter.textContent =
      `${aboutInput.value.length}/500`;
  };

  if (aboutInput) {
    updateAboutCounter();

    aboutInput.addEventListener(
      "input",
      updateAboutCounter
    );
  }

  /* =========================================================
     PASSWORD CONFIRMATION
  ========================================================= */

  const newPassword = document.querySelector(
    "[data-new-password]"
  );

  const confirmPassword = document.querySelector(
    "[data-confirm-password]"
  );

  const confirmPasswordError =
    document.querySelector(
      "[data-confirm-password-error]"
    );

  const checkPasswords = () => {
    if (
      !newPassword ||
      !confirmPassword ||
      !confirmPasswordError
    ) {
      return true;
    }

    if (
      confirmPassword.value &&
      newPassword.value !==
      confirmPassword.value
    ) {
      confirmPasswordError.textContent =
        "Passwords do not match.";

      confirmPassword.setAttribute(
        "aria-invalid",
        "true"
      );

      return false;
    }

    confirmPasswordError.textContent = "";

    confirmPassword.setAttribute(
      "aria-invalid",
      "false"
    );

    return true;
  };

  if (newPassword) {
    newPassword.addEventListener(
      "input",
      checkPasswords
    );
  }

  if (confirmPassword) {
    confirmPassword.addEventListener(
      "input",
      checkPasswords
    );
  }

  /* =========================================================
     PROFILE FORM
  ========================================================= */

  const profileForm = document.querySelector(
    "[data-profile-form]"
  );

  if (profileForm) {
    profileForm.addEventListener(
      "submit",
      (event) => {
        if (!checkPasswords()) {
          event.preventDefault();

          confirmPassword?.focus();
        }
      }
    );
  }

  /* =========================================================
     AVATAR UPLOAD
  ========================================================= */

  const avatarForm = document.querySelector(
    "[data-avatar-form]"
  );

  const avatarInput = document.querySelector(
    "[data-avatar-input]"
  );

  const avatarPreview = document.querySelector(
    "[data-avatar-preview]"
  );

  const avatarUploadButton =
    document.querySelector(
      "[data-avatar-upload]"
    );

  const avatarSaveButton =
    document.querySelector(
      "[data-avatar-save]"
    );

  const avatarCancelButton =
    document.querySelector(
      "[data-avatar-cancel]"
    );

  const avatarFileName =
    document.querySelector(
      "[data-avatar-file-name]"
    );

  const avatarError =
    document.querySelector(
      "[data-avatar-error]"
    );

  if (
    avatarForm &&
    avatarInput &&
    avatarPreview
  ) {
    let currentAvatar =
      avatarPreview.getAttribute("src");

    const resetAvatar = () => {
      avatarInput.value = "";

      avatarPreview.src =
        currentAvatar;

      if (avatarFileName) {
        avatarFileName.textContent =
          "No new photo selected";
      }

      if (avatarError) {
        avatarError.textContent = "";
      }

      avatarForm.classList.remove(
        "has-preview"
      );
    };

    const showError = (message) => {
      if (avatarError) {
        avatarError.textContent =
          message;
      }
    };

    avatarInput.addEventListener(
      "change",
      () => {
        const file =
          avatarInput.files?.[0];

        if (!file) {
          resetAvatar();
          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (
          !allowedTypes.includes(
            file.type
          )
        ) {
          showError(
            "Please choose a JPG, PNG or WEBP image."
          );

          resetAvatar();
          return;
        }

        const maxSize =
          5 * 1024 * 1024;

        if (file.size > maxSize) {
          showError(
            "Image must be smaller than 5MB."
          );

          resetAvatar();
          return;
        }

        const reader =
          new FileReader();

        reader.onload = (event) => {
          avatarPreview.src =
            event.target.result;

          avatarForm.classList.add(
            "has-preview"
          );

          if (avatarFileName) {
            avatarFileName.textContent =
              file.name;
          }

          showError("");
        };

        reader.readAsDataURL(file);
      }
    );

    if (avatarUploadButton) {
      avatarUploadButton.addEventListener(
        "click",
        () => {
          avatarInput.click();
        }
      );
    }

    if (avatarCancelButton) {
      avatarCancelButton.addEventListener(
        "click",
        resetAvatar
      );
    }

    if (avatarSaveButton) {
      avatarSaveButton.addEventListener(
        "click",
        async () => {
          const file =
            avatarInput.files?.[0];

          if (!file) {
            showError(
              "Choose a new photo first."
            );

            return;
          }

          const formData =
            new FormData(avatarForm);

          avatarSaveButton.disabled = true;

          if (avatarCancelButton) {
            avatarCancelButton.disabled = true;
          }

          try {
            const response = await fetch(
              avatarForm.action,
              {
                method: "POST",
                body: formData,
                headers: {
                  Accept: "application/json"
                }
              }
            );

            const data =
              await response.json();

            if (!response.ok || !data.ok) {
              showError(
                data.message ||
                "Could not update your photo. Try again."
              );

              return;
            }

            currentAvatar = data.avatar;
            resetAvatar();
          } catch {
            showError(
              "Network error. Please try again."
            );
          } finally {
            avatarSaveButton.disabled = false;

            if (avatarCancelButton) {
              avatarCancelButton.disabled = false;
            }
          }
        }
      );
    }
  }
});