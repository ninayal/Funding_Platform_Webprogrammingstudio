"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const setFieldState = (
    field,
    message = ""
  ) => {
    const error =
      document.querySelector(
        `[data-field-error="${field.name}"]`
      );

    field.setAttribute(
      "aria-invalid",
      message ? "true" : "false"
    );

    if (error) {
      error.textContent = message;
    }

    return !message;
  };

  const validateProfileField = (field) => {
    const value =
      field.value.trim();

    let message = "";

    if (field.required && !value) {
      message = "This field is required.";
    }

    if (
      !message &&
      field.minLength > 0 &&
      value.length < field.minLength
    ) {
      message =
        `${field.labels?.[0]?.textContent || "Value"} must contain at least ${field.minLength} characters.`;
    }

    if (
      !message &&
      field.maxLength > 0 &&
      value.length > field.maxLength
    ) {
      message =
        `Maximum ${field.maxLength} characters allowed.`;
    }

    if (
      !message &&
      field.type === "email" &&
      value &&
      !field.validity.valid
    ) {
      message =
        "Enter a valid email address.";
    }

    if (
      !message &&
      field.type === "tel" &&
      value &&
      !field.validity.valid
    ) {
      message =
        "Enter a valid phone number.";
    }

    return setFieldState(
      field,
      message
    );
  };


  /* =========================================================
     PROFILE LIVE VALIDATION
  ========================================================= */

  const profileForm =
    document.querySelector(
      "[data-profile-form]"
    );

  const profileFields =
    profileForm
      ? [
        ...profileForm.querySelectorAll(
          "[data-profile-field]"
        )
      ]
      : [];

  const validateProfileForm = () =>
    profileFields.every(
      validateProfileField
    );

  profileFields.forEach((field) => {
    field.addEventListener(
      "input",
      () => validateProfileField(field)
    );

    field.addEventListener(
      "blur",
      () => validateProfileField(field)
    );
  });


  /* =========================================================
     PROFILE MESSAGE
  ========================================================= */

  const message =
    document.querySelector(
      "[data-profile-message]"
    );

  const dismissMessage =
    document.querySelector(
      "[data-dismiss-profile-message]"
    );

  if (
    dismissMessage &&
    message
  ) {
    dismissMessage.addEventListener(
      "click",
      () => message.remove()
    );
  }


  /* =========================================================
     ABOUT CHARACTER COUNTER
  ========================================================= */

  const aboutInput =
    document.querySelector(
      "[data-profile-about]"
    );

  const aboutCounter =
    document.querySelector(
      "[data-about-counter]"
    );

  const updateAboutCounter = () => {
    if (
      !aboutInput ||
      !aboutCounter
    ) {
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

  const newPassword =
    document.querySelector(
      "[data-new-password]"
    );

  const confirmPassword =
    document.querySelector(
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

    const mismatch =
      confirmPassword.value &&
      newPassword.value !==
      confirmPassword.value;

    confirmPasswordError.textContent =
      mismatch
        ? "Passwords do not match."
        : "";

    confirmPassword.setAttribute(
      "aria-invalid",
      mismatch
        ? "true"
        : "false"
    );

    return !mismatch;
  };

  newPassword?.addEventListener(
    "input",
    checkPasswords
  );

  confirmPassword?.addEventListener(
    "input",
    checkPasswords
  );


  /* =========================================================
     PROFILE SUBMIT
  ========================================================= */

  profileForm?.addEventListener(
    "submit",
    (event) => {
      const valid =
        validateProfileForm() &&
        checkPasswords();

      if (!valid) {
        event.preventDefault();

        const firstError =
          profileForm.querySelector(
            '[aria-invalid="true"]'
          );

        firstError?.focus();
      }
    }
  );


  /* =========================================================
     AVATAR UPLOAD
  ========================================================= */

  const avatarForm =
    document.querySelector(
      "[data-avatar-form]"
    );

  const avatarInput =
    document.querySelector(
      "[data-avatar-input]"
    );

  const avatarPreview =
    document.querySelector(
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
      avatarPreview.src;

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

    const showAvatarError =
      (text) => {
        if (avatarError) {
          avatarError.textContent =
            text;
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

        const allowed =
          [
            "image/jpeg",
            "image/png",
            "image/webp",
          ];

        if (
          !allowed.includes(
            file.type
          )
        ) {
          showAvatarError(
            "Please choose a JPG, PNG or WEBP image."
          );

          resetAvatar();
          return;
        }

        if (
          file.size >
          5 * 1024 * 1024
        ) {
          showAvatarError(
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

          avatarFileName.textContent =
            file.name;

          showAvatarError("");
        };

        reader.readAsDataURL(file);
      }
    );

    avatarUploadButton?.addEventListener(
      "click",
      () => avatarInput.click()
    );

    avatarCancelButton?.addEventListener(
      "click",
      resetAvatar
    );

    avatarSaveButton?.addEventListener(
      "click",
      async () => {
        const file =
          avatarInput.files?.[0];

        if (!file) {
          showAvatarError(
            "Choose a new photo first."
          );

          return;
        }

        avatarSaveButton.disabled =
          true;

        const formData =
          new FormData(
            avatarForm
          );

        try {
          const response =
            await fetch(
              avatarForm.action,
              {
                method: "POST",
                body: formData,
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.ok
          ) {
            throw new Error(
              data.message ||
              "Could not update photo."
            );
          }

          currentAvatar =
            data.avatar;

          resetAvatar();
        } catch (error) {
          showAvatarError(
            error.message
          );
        } finally {
          avatarSaveButton.disabled =
            false;
        }
      }
    );
  }


  /* =========================================================
     DEACTIVATE ACCOUNT
  ========================================================= */

  const deactivateConfirm =
    document.querySelector(
      "[data-deactivate-confirm]"
    );

  const deactivateButton =
    document.querySelector(
      "[data-deactivate-button]"
    );

  deactivateConfirm?.addEventListener(
    "change",
    () => {
      deactivateButton.disabled =
        !deactivateConfirm.checked;
    }
  );
});