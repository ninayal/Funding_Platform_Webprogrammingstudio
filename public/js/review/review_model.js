(() => {
  "use strict";

  const root = document.querySelector(
    ".product-review"
  );

  const modal = document.querySelector(
    "#review-composer-panel"
  );

  const form = document.querySelector(
    "#review-form"
  );

  if (!root || !modal || !form) {
    return;
  }

  const closeButton =
    form.querySelector(
      "#close-review-composer"
    );

  const backdrop =
    modal.querySelector(
      "[data-close-review-modal]"
    );

  const ratingInputs = [
    ...form.querySelectorAll(
      'input[name="rating"]'
    )
  ];
  const ratingLabels = [
    ...form.querySelectorAll(
      ".pr-rating-label"
    )
  ];


  ratingLabels.forEach(
    (label) => {
      label.addEventListener(
        "mouseenter",
        () => {
          paintFormRating(
            getLabelRating(label)
          );
        }
      );
    }
  );

  form
    .querySelector(
      ".pr-form__rating"
    )
    ?.addEventListener(
      "mouseleave",
      () => {
        paintFormRating(
          getCheckedFormRating()
        );
      }
    );

  ratingInputs.forEach(
    (input) => {
      input.addEventListener(
        "change",
        () => {
          paintFormRating(
            Number(input.value)
          );
        }
      );
    }
  );

  paintFormRating(
    getCheckedFormRating()
  );

  const launchStars = [
    ...document.querySelectorAll(
      "button[data-open-review]"
    )
  ];

  const imageInput =
    form.querySelector(
      "#review-images"
    );

  const dropzone =
    form.querySelector(
      ".pr-multi-upload__dropzone"
    );

  const newPreviewContainer =
    form.querySelector(
      "#review-new-image-previews"
    );

  const emptyState =
    form.querySelector(
      "#review-image-empty"
    );

  const imageCount =
    form.querySelector(
      "#review-image-count"
    );

  const imageError =
    form.querySelector(
      "#review-images-error"
    );

  const clearDraftButton =
    form.querySelector(
      "#clear-review-draft"
    );

  const MAX_IMAGE_COUNT = 3;
  const MAX_IMAGE_SIZE =
    1024 * 1024;

  const allowedTypes =
    new Set([
      "image/jpeg",
      "image/png",
      "image/webp"
    ]);

  let selectedFiles = [];
  let previewUrls = [];
  let lastTrigger = null;

  const successfulStatuses =
    new Set([
      "created",
      "updated",
      "deleted"
    ]);

  const pageStatus =
    new URLSearchParams(
      window.location.search
    ).get("status") ||
    root.dataset.pageStatus ||
    "";

  const getExistingItems = () => [
    ...form.querySelectorAll(
      "[data-existing-image]"
    )
  ];

  const getExistingCount = () =>
    getExistingItems().length;

  const totalImageCount = () =>
    getExistingCount() +
    selectedFiles.length;

  const setImageError = (
    message = ""
  ) => {
    if (imageError) {
      imageError.textContent =
        message;
    }

    imageInput?.setAttribute(
      "aria-invalid",
      message ? "true" : "false"
    );
  };

  const updateImageStatus = () => {
    const total =
      totalImageCount();

    if (imageCount) {
      imageCount.textContent =
        `${total}/3 photos`;
    }

    if (emptyState) {
      emptyState.hidden =
        total > 0;
    }

    /*
     * Never disable the file input.
     * Disabled controls are omitted from
     * multipart/form-data submission.
     */
    if (imageInput) {
      imageInput.disabled = false;
    }

    const isFull =
      total >= MAX_IMAGE_COUNT;

    dropzone?.classList.toggle(
      "is-full",
      isFull
    );

    dropzone?.setAttribute(
      "aria-disabled",
      String(isFull)
    );
  };

  const syncInputFiles = () => {
    if (
      !imageInput ||
      typeof DataTransfer ===
        "undefined"
    ) {
      return;
    }

    const transfer =
      new DataTransfer();

    selectedFiles.forEach(
      (file) => {
        transfer.items.add(file);
      }
    );

    imageInput.files =
      transfer.files;
  };

  const revokePreviewUrls = () => {
    previewUrls.forEach(
      (url) => {
        URL.revokeObjectURL(url);
      }
    );

    previewUrls = [];
  };

  const renderNewPreviews = () => {
    if (!newPreviewContainer) {
      return;
    }

    revokePreviewUrls();
    newPreviewContainer.innerHTML =
      "";

    selectedFiles.forEach(
      (file, index) => {
        const objectUrl =
          URL.createObjectURL(file);

        previewUrls.push(
          objectUrl
        );

        const item =
          document.createElement(
            "article"
          );

        item.className =
          "pr-multi-upload__item " +
          "pr-multi-upload__item--new";

        const image =
          document.createElement(
            "img"
          );

        image.src = objectUrl;
        image.alt =
          `New review photo ${index + 1}`;

        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.textContent = "×";

        button.setAttribute(
          "aria-label",
          `Remove new photo ${index + 1}`
        );

        button.dataset
          .removeNewImage =
          String(index);

        item.append(
          image,
          button
        );

        newPreviewContainer
          .append(item);
      }
    );

    updateImageStatus();
  };

  const fileKey = (
    file
  ) =>
    [
      file.name,
      file.size,
      file.lastModified
    ].join(":");

  const addSelectedFiles = (
    files
  ) => {
    setImageError("");

    for (const file of [
      ...files
    ]) {
      if (
        !allowedTypes.has(
          file.type
        )
      ) {
        setImageError(
          "Upload JPG, PNG, or WEBP images."
        );

        continue;
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        setImageError(
          "Each image must be 1 MB or smaller."
        );

        continue;
      }

      const duplicate =
        selectedFiles.some(
          (selectedFile) =>
            fileKey(selectedFile) ===
            fileKey(file)
        );

      if (duplicate) {
        continue;
      }

      if (
        totalImageCount() >=
        MAX_IMAGE_COUNT
      ) {
        setImageError(
          "Upload no more than 3 images."
        );

        break;
      }

      selectedFiles.push(file);
    }

    syncInputFiles();
    renderNewPreviews();
  };

  imageInput?.addEventListener(
    "change",
    () => {
      const files =
        imageInput.files;

      if (!files?.length) {
        return;
      }

      addSelectedFiles(files);
    }
  );

  dropzone?.addEventListener(
    "click",
    (event) => {
      if (
        totalImageCount() <
        MAX_IMAGE_COUNT
      ) {
        return;
      }

      event.preventDefault();

      setImageError(
        "Upload no more than 3 images."
      );
    }
  );

  form.addEventListener(
    "click",
    (event) => {
      const removeNewButton =
        event.target.closest(
          "[data-remove-new-image]"
        );

      if (removeNewButton) {
        const index = Number(
          removeNewButton.dataset
            .removeNewImage
        );

        if (
          Number.isInteger(index)
        ) {
          selectedFiles.splice(
            index,
            1
          );

          syncInputFiles();
          renderNewPreviews();
          setImageError("");
        }

        return;
      }

      const removeExistingButton =
        event.target.closest(
          "[data-remove-existing-image]"
        );

      if (
        removeExistingButton
      ) {
        removeExistingButton
          .closest(
            "[data-existing-image]"
          )
          ?.remove();

        updateImageStatus();
        setImageError("");
      }
    }
  );

  clearDraftButton?.addEventListener(
    "click",
    () => {
      window.setTimeout(
        () => {
          selectedFiles = [];
          syncInputFiles();
          renderNewPreviews();
          setImageError("");
        },
        0
      );
    }
  );

  /*
   * Ensure the browser sends the exact selectedFiles array.
   * The formdata event runs when native multipart data
   * is created for submission.
   */
  form.addEventListener(
    "formdata",
    (event) => {
      event.formData.delete(
        "reviewImages"
      );

      selectedFiles.forEach(
        (file) => {
          event.formData.append(
            "reviewImages",
            file,
            file.name
          );
        }
      );
    }
  );

  form.addEventListener(
    "submit",
    (event) => {
      syncInputFiles();

      const total =
        getExistingCount() +
        selectedFiles.length;

      if (total < 1) {
        event.preventDefault();

        setImageError(
          "Upload at least one product photo."
        );

        return;
      }

      if (
        total >
        MAX_IMAGE_COUNT
      ) {
        event.preventDefault();

        setImageError(
          "Upload no more than 3 images."
        );

        return;
      }

      setImageError("");
    }
  );

  const getSelectedRating = () => {
    const selected =
      ratingInputs.find(
        (input) =>
          input.checked
      );

    return selected
      ? Number(selected.value)
      : 0;
  };

  const paintLaunchStars = (
    selectedValue
  ) => {
    launchStars.forEach(
      (star) => {
        const value = Number(
          star.dataset.ratingValue
        );

        star.classList.toggle(
          "is-selected",
          value <= selectedValue
        );

        star.setAttribute(
          "aria-expanded",
          modal.hidden
            ? "false"
            : "true"
        );
      }
    );
  };

  const getFocusableElements = () => [
    ...modal.querySelectorAll(
      [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled])",
        "textarea:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])'
      ].join(",")
    )
  ].filter(
    (element) =>
      !element.hidden &&
      element.offsetParent !== null
  );

  const openModal = (
    trigger,
    ratingValue = 0
  ) => {
    lastTrigger =
      trigger || lastTrigger;

    if (ratingValue) {
      const ratingInput =
        ratingInputs.find(
          (input) =>
            Number(input.value) ===
            Number(ratingValue)
        );

      if (ratingInput) {
        ratingInput.checked =
          true;

        ratingInput.dispatchEvent(
          new Event(
            "change",
            {
              bubbles: true
            }
          )
        );
      }
    }

    modal.hidden = false;

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "pr-modal-open"
    );

    paintLaunchStars(
      ratingValue ||
      getSelectedRating()
    );

    updateImageStatus();

    window.setTimeout(
      () => {
        (
          closeButton ||
          form.querySelector(
            "#review-title"
          ) ||
          getFocusableElements()[0]
        )?.focus();
      },
      30
    );
  };

  const closeModal = () => {
    modal.hidden = true;

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "pr-modal-open"
    );

    paintLaunchStars(
      getSelectedRating()
    );

    lastTrigger?.focus();
  };

  document.addEventListener(
    "click",
    (event) => {
      const trigger =
        event.target.closest(
          "button[data-open-review]"
        );

      if (!trigger) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      openModal(
        trigger,
        Number(
          trigger.dataset.ratingValue
        )
      );
    },
    true
  );

  closeButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeModal();
    },
    true
  );

  backdrop?.addEventListener(
    "click",
    closeModal
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (modal.hidden) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable =
        getFocusableElements();

      if (!focusable.length) {
        return;
      }

      const first =
        focusable[0];

      const last =
        focusable[
          focusable.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement ===
          last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  );

  ratingInputs.forEach(
    (input) => {
      input.addEventListener(
        "change",
        () => {
          paintLaunchStars(
            Number(input.value)
          );
        }
      );
    }
  );

  updateImageStatus();

  /*
   * A successful create/update/delete redirect must show
   * the Review tab but must not reopen the composer modal.
   */
  if (
    successfulStatuses.has(
      pageStatus
    )
  ) {
    closeModal();

    /*
    * Sau khi xử lý thông báo thành công,
    * xóa status khỏi URL để user có thể
    * mở modal review mới bình thường.
    */
    const cleanUrl =
      new URL(
        window.location.href
      );

    cleanUrl.searchParams.delete(
      "status"
    );

    window.history.replaceState(
      {},
      "",
      `${cleanUrl.pathname}` +
      `${cleanUrl.search}` +
      "#customer-reviews"
    );

    /*
    * Khi review đã bị xóa,
    * reset rating cũ về trạng thái chưa chọn.
    */
    if (
      pageStatus === "deleted"
    ) {
      ratingInputs.forEach(
        (input) => {
          input.checked = false;
        }
      );

      paintLaunchStars(0);
    }
  } else if (!modal.hidden) {
    document.body.classList.add(
      "pr-modal-open"
    );

    paintLaunchStars(
      getSelectedRating()
    );
  } else {
    modal.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  window.addEventListener(
    "beforeunload",
    revokePreviewUrls
  );
})();
