(() => {
  "use strict";

  const root = document.querySelector(".product-review");
  if (!root) return;

  const modal = document.querySelector("#review-composer-panel");
  const form = document.querySelector("#review-form");
  const launchStars = [...document.querySelectorAll(".pr-rating-launch__star")];

  const successStatuses = new Set(["created", "updated", "deleted"]);
  const pageStatus = new URLSearchParams(window.location.search).get("status") || root.dataset.pageStatus || "";
  const formMode = root.dataset.formMode || "create";
  const editingReviewId = root.dataset.editingReviewId || "new";
  const productId = root.dataset.productId || "unknown";

  let lastTrigger = null;

  const paintLaunchStars = (value) => {
    launchStars.forEach((star) => {
      star.classList.toggle("is-active", Number(star.dataset.ratingValue) <= value);
    });
  };

  const setModalExpandedState = (expanded) => {
    launchStars.forEach((star) => star.setAttribute("aria-expanded", String(expanded)));
  };

  launchStars.forEach((star) => {
    star.addEventListener("mouseenter", () => paintLaunchStars(Number(star.dataset.ratingValue)));
  });

  document.querySelector(".pr-rating-launch")?.addEventListener("mouseleave", () => {
    const checkedRating = form?.querySelector('input[name="rating"]:checked')?.value;
    paintLaunchStars(Number(checkedRating || 0));
  });

  /* ---------- Review composer modal ---------- */
  if (modal && form) {
    const closeButton = form.querySelector("#close-review-composer");
    const backdrop = modal.querySelector("[data-close-review-modal]");
    const titleInput = form.querySelector("#review-title");
    const reviewInput = form.querySelector("#review-content");
    const titleCounter = form.querySelector("#review-title-counter");
    const reviewCounter = form.querySelector("#review-content-counter");
    const titleError = form.querySelector("#review-title-error");
    const reviewError = form.querySelector("#review-content-error");
    const ratingError = form.querySelector("#rating-error");
    const ratingInputs = [...form.querySelectorAll('input[name="rating"]')];
    const ratingLabels = [...form.querySelectorAll("[data-form-rating]")];
    const imageInput = form.querySelector("#review-images");
    const imageDropzone = form.querySelector(".pr-multi-upload__dropzone");
    const imagePreviewContainer = form.querySelector("#review-new-image-previews");
    const imageEmptyState = form.querySelector("#review-image-empty");
    const imageCounter = form.querySelector("#review-image-count");
    const imageError = form.querySelector("#review-images-error");
    const clearDraftButton = form.querySelector("#clear-review-draft");
    const draftStatus = form.querySelector("#review-draft-status");

    const MAX_IMAGE_COUNT = 3;
    const MAX_IMAGE_SIZE = 1024 * 1024;
    const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const draftKey = `reviewDraft:${productId}:${formMode}:${editingReviewId}`;

    const initialValues = {
      title: titleInput?.value || "",
      review: reviewInput?.value || "",
      rating: ratingInputs.find((input) => input.checked)?.value || ""
    };

    let selectedFiles = [];
    let previewUrls = [];

    const getCheckedRating = () => Number(ratingInputs.find((input) => input.checked)?.value || 0);

    const paintFormStars = (value) => {
      ratingLabels.forEach((label) => {
        label.classList.toggle("is-active", Number(label.dataset.formRating) <= value);
      });
    };

    const getExistingItems = () => [...form.querySelectorAll("[data-existing-image]")];
    const getImageTotal = () => getExistingItems().length + selectedFiles.length;

    const updateCounters = () => {
      if (titleCounter) titleCounter.textContent = `${titleInput?.value.length || 0}/80`;
      if (reviewCounter) reviewCounter.textContent = `${reviewInput?.value.length || 0}/600`;
    };

    const setFieldError = (element, message) => {
      if (element) element.textContent = message;
    };

    const normaliseSingleLine = (value) => String(value || "").replace(/\s+/g, " ").trim();

    const validateTextFields = () => {
      const errors = {};
      const title = normaliseSingleLine(titleInput?.value);
      const review = String(reviewInput?.value || "").trim();
      const wordCount = review.split(/\s+/).filter(Boolean).length;

      if (!getCheckedRating()) errors.rating = "Choose a rating from 1 to 5 stars.";

      if (title.length < 4 || title.length > 80) {
        errors.title = "Use between 4 and 80 characters.";
      } else if (!/[\p{L}\p{N}]/u.test(title)) {
        errors.title = "Include at least one letter or number.";
      }

      if (review.length < 10 || review.length > 600) {
        errors.review = "Use between 10 and 600 characters.";
      } else if (wordCount < 3) {
        errors.review = "Write at least three words.";
      }

      return errors;
    };

    const showValidation = () => {
      const errors = validateTextFields();

      setFieldError(ratingError, errors.rating || "");
      setFieldError(titleError, errors.title || "");
      setFieldError(reviewError, errors.review || "");

      titleInput?.setAttribute("aria-invalid", errors.title ? "true" : "false");
      reviewInput?.setAttribute("aria-invalid", errors.review ? "true" : "false");

      return errors;
    };

    const setImageError = (message = "") => {
      setFieldError(imageError, message);
      imageInput?.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const updateImageStatus = () => {
      const total = getImageTotal();

      if (imageCounter) imageCounter.textContent = `${total}/3 photos`;
      if (imageEmptyState) imageEmptyState.hidden = total > 0;

      imageDropzone?.classList.toggle("is-full", total >= MAX_IMAGE_COUNT);
      imageDropzone?.setAttribute("aria-disabled", String(total >= MAX_IMAGE_COUNT));

      /* Never disable the input: disabled file inputs are excluded from multipart requests. */
      if (imageInput) imageInput.disabled = false;
    };

    const syncInputFiles = () => {
      if (!imageInput || typeof DataTransfer === "undefined") return;

      const transfer = new DataTransfer();
      selectedFiles.forEach((file) => transfer.items.add(file));
      imageInput.files = transfer.files;
    };

    const clearPreviewUrls = () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls = [];
    };

    const renderNewImagePreviews = () => {
      if (!imagePreviewContainer) return;

      clearPreviewUrls();
      imagePreviewContainer.replaceChildren();

      selectedFiles.forEach((file, index) => {
        const item = document.createElement("article");
        item.className = "pr-multi-upload__item";

        const image = document.createElement("img");
        const objectUrl = URL.createObjectURL(file);
        previewUrls.push(objectUrl);
        image.src = objectUrl;
        image.alt = `New review photo ${index + 1}`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.dataset.removeNewImage = String(index);
        removeButton.setAttribute("aria-label", `Remove new photo ${index + 1}`);

        item.append(image, removeButton);
        imagePreviewContainer.append(item);
      });

      updateImageStatus();
    };

    const fileKey = (file) => [file.name, file.size, file.lastModified].join(":");

    const addFiles = (files) => {
      setImageError("");

      for (const file of [...files]) {
        if (!allowedImageTypes.has(file.type)) {
          setImageError("Upload JPG, PNG, or WEBP images.");
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          setImageError("Each image must be 1 MB or smaller.");
          continue;
        }
        if (selectedFiles.some((selectedFile) => fileKey(selectedFile) === fileKey(file))) continue;
        if (getImageTotal() >= MAX_IMAGE_COUNT) {
          setImageError("Upload no more than 3 images.");
          break;
        }
        selectedFiles.push(file);
      }

      syncInputFiles();
      renderNewImagePreviews();
    };

    const getFocusableElements = () =>
      [...modal.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((element) => !element.hidden && element.offsetParent !== null);

    const openModal = (trigger, rating = 0) => {
      lastTrigger = trigger || lastTrigger;

      if (rating) {
        const input = ratingInputs.find((item) => Number(item.value) === Number(rating));
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("pr-modal-open");
      setModalExpandedState(true);
      paintLaunchStars(rating || getCheckedRating());
      updateCounters();
      updateImageStatus();

      window.setTimeout(() => {
        (closeButton || titleInput || getFocusableElements()[0])?.focus();
      }, 20);
    };

    const closeModal = ({ restoreFocus = true } = {}) => {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("pr-modal-open");
      setModalExpandedState(false);
      paintLaunchStars(getCheckedRating());
      if (restoreFocus) lastTrigger?.focus();
    };

    const saveDraft = () => {
      if (formMode !== "create") return;

      localStorage.setItem(draftKey, JSON.stringify({
        rating: getCheckedRating(),
        title: titleInput?.value || "",
        review: reviewInput?.value || ""
      }));

      if (draftStatus) draftStatus.textContent = "Text draft saved in this browser. Images are not stored.";
    };

    const clearStoredDraft = () => localStorage.removeItem(draftKey);

    const restoreDraft = () => {
      if (formMode !== "create" || successStatuses.has(pageStatus)) {
        clearStoredDraft();
        return;
      }

      const raw = localStorage.getItem(draftKey);
      if (!raw) return;

      try {
        const draft = JSON.parse(raw);

        if (draft.title && titleInput) titleInput.value = draft.title;
        if (draft.review && reviewInput) reviewInput.value = draft.review;

        if (draft.rating) {
          const input = ratingInputs.find((item) => Number(item.value) === Number(draft.rating));
          if (input) input.checked = true;
        }

        if (draftStatus) draftStatus.textContent = "Text draft restored. Select photos before publishing.";
      } catch {
        clearStoredDraft();
      }
    };

    launchStars
      .filter((star) => star.hasAttribute("data-open-review"))
      .forEach((star) => {
        star.addEventListener("click", (event) => {
          event.preventDefault();
          openModal(star, Number(star.dataset.ratingValue));
        });
      });

    ratingLabels.forEach((label) => {
      label.addEventListener("mouseenter", () => paintFormStars(Number(label.dataset.formRating)));
    });

    form.querySelector(".pr-form__rating")?.addEventListener("mouseleave", () => paintFormStars(getCheckedRating()));

    ratingInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const rating = Number(input.value);
        paintFormStars(rating);
        paintLaunchStars(rating);
        showValidation();
        saveDraft();
      });
    });

    [titleInput, reviewInput].filter(Boolean).forEach((input) => {
      input.addEventListener("input", () => {
        updateCounters();
        showValidation();
        saveDraft();
      });
      input.addEventListener("blur", showValidation);
    });

    imageInput?.addEventListener("change", () => {
      if (imageInput.files?.length) addFiles(imageInput.files);
    });

    imageDropzone?.addEventListener("click", (event) => {
      if (getImageTotal() < MAX_IMAGE_COUNT) return;
      event.preventDefault();
      setImageError("Upload no more than 3 images.");
    });

    form.addEventListener("click", (event) => {
      const newImageButton = event.target.closest("[data-remove-new-image]");
      if (newImageButton) {
        const index = Number(newImageButton.dataset.removeNewImage);
        if (Number.isInteger(index)) {
          selectedFiles.splice(index, 1);
          syncInputFiles();
          renderNewImagePreviews();
          setImageError("");
        }
        return;
      }

      const existingImageButton = event.target.closest("[data-remove-existing-image]");
      if (existingImageButton) {
        existingImageButton.closest("[data-existing-image]")?.remove();
        updateImageStatus();
        setImageError("");
      }
    });

    /* Explicitly append the current selectedFiles collection to the native multipart request. */
    form.addEventListener("formdata", (event) => {
      event.formData.delete("reviewImages");
      selectedFiles.forEach((file) => event.formData.append("reviewImages", file, file.name));
    });

    form.addEventListener("submit", (event) => {
      syncInputFiles();

      const errors = showValidation();
      const imageTotal = getImageTotal();

      if (imageTotal < 1) {
        setImageError("Upload at least one product photo.");
      } else if (imageTotal > MAX_IMAGE_COUNT) {
        setImageError("Upload no more than 3 images.");
      } else {
        setImageError("");
      }

      if (Object.keys(errors).length || imageTotal < 1 || imageTotal > MAX_IMAGE_COUNT) {
        event.preventDefault();
        form.querySelector('[aria-invalid="true"], input[name="rating"]')?.focus();
        return;
      }

      if (titleInput) titleInput.value = normaliseSingleLine(titleInput.value);
      if (reviewInput) reviewInput.value = reviewInput.value.trim();
    });

    clearDraftButton?.addEventListener("click", () => {
      clearStoredDraft();

      if (titleInput) titleInput.value = initialValues.title;
      if (reviewInput) reviewInput.value = initialValues.review;

      ratingInputs.forEach((input) => {
        input.checked = input.value === initialValues.rating;
      });

      selectedFiles = [];
      syncInputFiles();
      renderNewImagePreviews();
      paintFormStars(getCheckedRating());
      paintLaunchStars(getCheckedRating());
      updateCounters();
      showValidation();
      setImageError("");

      if (draftStatus) draftStatus.textContent = "Saved text draft cleared.";
    });

    closeButton?.addEventListener("click", () => closeModal());
    backdrop?.addEventListener("click", () => closeModal());

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    restoreDraft();
    updateCounters();
    updateImageStatus();
    paintFormStars(getCheckedRating());
    paintLaunchStars(getCheckedRating());

    if (successStatuses.has(pageStatus)) {
      clearStoredDraft();

      if (pageStatus === "deleted") {
        ratingInputs.forEach((input) => (input.checked = false));
        paintFormStars(0);
        paintLaunchStars(0);
      }

      closeModal({ restoreFocus: false });

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("status");
      window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}#customer-reviews`);
    } else if (!modal.hidden) {
      document.body.classList.add("pr-modal-open");
      setModalExpandedState(true);
    } else {
      modal.setAttribute("aria-hidden", "true");
      setModalExpandedState(false);
    }

    window.addEventListener("beforeunload", clearPreviewUrls);
  }

  /* ---------- Custom dropdowns (giftcard style) ---------- */
  document.querySelectorAll("[data-dropdown]").forEach((wrapper) => {
    const trigger = wrapper.querySelector(".pr-dropdown__trigger");
    const list = wrapper.querySelector(".pr-dropdown__list");
    const valueLabel = wrapper.querySelector(".pr-dropdown__value");
    const select = wrapper.querySelector(".pr-dropdown__native");
    const options = [...wrapper.querySelectorAll(".pr-dropdown__option")];

    if (!trigger || !list || !select) return;

    const close = () => {
      list.hidden = true;
      wrapper.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      list.hidden = false;
      wrapper.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };

    const selectOption = (option) => {
      const value = option.dataset.value;

      select.value = value;
      valueLabel.textContent = option.querySelector("span").textContent;

      options.forEach((item) => {
        const isSelected = item === option;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });

      select.dispatchEvent(new Event("change", { bubbles: true }));
    };

    trigger.addEventListener("click", () => (list.hidden ? open() : close()));

    options.forEach((option) => {
      option.addEventListener("click", () => {
        selectOption(option);
        close();
      });
    });

    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !list.hidden) close();
    });
  });

  /* ---------- Search, sort, filter and pagination ---------- */
  const searchForm = document.querySelector("#review-search-form");
  const searchInput = document.querySelector("#review-search-query");
  const searchField = document.querySelector("#review-search-field");
  const sortSelect = document.querySelector("#review-sort");
  const filterButtons = [...document.querySelectorAll("[data-rating-filter]")];
  const cardsContainer = document.querySelector("#review-card-list");
  const cards = [...document.querySelectorAll(".pr-card")];
  const resultSummary = document.querySelector("#review-results-summary");
  const listEmptyState = document.querySelector("#review-empty-state");
  const pagination = document.querySelector("#review-pagination");

  const REVIEWS_PER_PAGE = 5;
  let activeRating = "all";
  let currentPage = 1;

  const normaliseSearch = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

  const getCardSearchValue = (card, field) => {
    if (field === "title") return card.dataset.title || "";
    if (field === "reviewer") return card.dataset.reviewer || "";
    if (field === "date") return card.dataset.date || "";
    if (field === "description") return card.dataset.description || "";

    return [card.dataset.title, card.dataset.reviewer, card.dataset.date, card.dataset.description]
      .filter(Boolean)
      .join(" ");
  };

  const cardMatchesSearch = (card) => {
    const query = normaliseSearch(searchInput?.value);
    if (!query) return true;

    return normaliseSearch(getCardSearchValue(card, searchField?.value || "all")).includes(query);
  };

  const compareCards = (first, second) => {
    const mode = sortSelect?.value || "newest";
    const firstDate = new Date(first.dataset.date).getTime();
    const secondDate = new Date(second.dataset.date).getTime();
    const firstRating = Number(first.dataset.rating);
    const secondRating = Number(second.dataset.rating);

    if (mode === "oldest") return firstDate - secondDate;
    if (mode === "rating-high") return secondRating - firstRating || secondDate - firstDate;
    if (mode === "rating-low") return firstRating - secondRating || secondDate - firstDate;
    if (mode === "title") return (first.dataset.title || "").localeCompare(second.dataset.title || "");

    return secondDate - firstDate;
  };

  const createPageButton = (label, targetPage, isCurrent = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pr-page-btn";
    button.textContent = label;
    button.disabled = isCurrent;
    button.setAttribute("aria-current", isCurrent ? "page" : "false");

    button.addEventListener("click", () => {
      currentPage = targetPage;
      applyReviewControls();
      document.querySelector("#customer-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return button;
  };

  const renderPagination = (pageCount) => {
    if (!pagination) return;

    pagination.replaceChildren();
    if (pageCount <= 1) return;

    pagination.append(createPageButton("‹", Math.max(1, currentPage - 1), currentPage === 1));

    for (let page = 1; page <= pageCount; page += 1) {
      pagination.append(createPageButton(String(page), page, page === currentPage));
    }

    pagination.append(createPageButton("›", Math.min(pageCount, currentPage + 1), currentPage === pageCount));
  };

  const applyReviewControls = () => {
    if (!cardsContainer) return;

    const matchingCards = cards
      .filter((card) => {
        const ratingMatches = activeRating === "all" || card.dataset.rating === activeRating;
        return ratingMatches && cardMatchesSearch(card);
      })
      .sort(compareCards);

    const pageCount = Math.max(1, Math.ceil(matchingCards.length / REVIEWS_PER_PAGE));
    currentPage = Math.min(currentPage, pageCount);

    cards.forEach((card) => (card.hidden = true));
    matchingCards.forEach((card) => cardsContainer.append(card));

    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    matchingCards.slice(start, start + REVIEWS_PER_PAGE).forEach((card) => (card.hidden = false));

    if (resultSummary) {
      resultSummary.textContent = `${matchingCards.length} review${matchingCards.length === 1 ? "" : "s"} found.`;
    }

    if (listEmptyState) {
      listEmptyState.hidden = matchingCards.length !== 0;
      listEmptyState.textContent = cards.length === 0
        ? "No reviews yet. Be the first to share your experience."
        : "No reviews match the selected search, sort and filter settings.";
    }

    renderPagination(pageCount);
  };

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    currentPage = 1;
    applyReviewControls();
  });

  searchInput?.addEventListener("input", () => {
    currentPage = 1;
    applyReviewControls();
  });

  searchField?.addEventListener("change", () => {
    currentPage = 1;
    applyReviewControls();
  });

  sortSelect?.addEventListener("change", () => {
    currentPage = 1;
    applyReviewControls();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeRating = button.dataset.ratingFilter;
      currentPage = 1;

      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      applyReviewControls();
    });
  });

  document.querySelectorAll("[data-delete-review]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const confirmed = window.confirm("Delete your review and its uploaded photos? This action cannot be undone.");
      if (!confirmed) event.preventDefault();
    });
  });

  applyReviewControls();
})();