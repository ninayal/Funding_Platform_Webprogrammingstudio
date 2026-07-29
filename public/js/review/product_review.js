(() => {
  "use strict";

  const main = document.querySelector(".product-review");

  if (!main) {
    return;
  }

  const form = document.querySelector("#review-form");
  const submitButton = document.querySelector("#review-submit");
  const clearDraftButton = document.querySelector("#clear-review-draft");
  const draftStatus = document.querySelector("#review-draft-status");

  const titleInput = document.querySelector("#review-title");
  const reviewInput = document.querySelector("#review-content");
  const imageInput = document.querySelector("#review-image-url");
  const ratingInputs = [...document.querySelectorAll('input[name="rating"]')];

  const titleError = document.querySelector("#review-title-error");
  const reviewError = document.querySelector("#review-content-error");
  const imageError = document.querySelector("#review-image-error");
  const ratingError = document.querySelector("#rating-error");

  const titleCounter = document.querySelector("#review-title-counter");
  const reviewCounter = document.querySelector("#review-content-counter");

  const productId = main.dataset.productId;
  const formMode = main.dataset.formMode;
  const editingReviewId = main.dataset.editingReviewId || "new";
  const pageStatus = main.dataset.pageStatus;

  const draftKey = `reviewDraft:${productId}:${formMode}:${editingReviewId}`;
  const touchedFields = new Set();

  const normaliseText = (value) => value.replace(/\s+/g, " ").trim();

  const selectedRating = () => {
    const selected = ratingInputs.find((input) => input.checked);
    return selected ? Number(selected.value) : null;
  };

  const validImagePath = (value) => {
    const image = value.trim();

    if (!image) {
      return true;
    }

    if (image.startsWith("/images/") || image.startsWith("/uploads/")) {
      return true;
    }

    try {
      const parsedUrl = new URL(image);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const getValidationErrors = () => {
    const errors = {};
    const title = normaliseText(titleInput.value);
    const review = reviewInput.value.trim();
    const wordCount = review.split(/\s+/).filter(Boolean).length;

    if (!selectedRating()) {
      errors.rating = "Choose a rating from 1 to 5 stars.";
    }

    if (title.length < 4 || title.length > 80) {
      errors.reviewTitle = "Use between 4 and 80 characters.";
    } else if (!/[\p{L}\p{N}]/u.test(title)) {
      errors.reviewTitle = "Include at least one letter or number.";
    }

    if (review.length < 10 || review.length > 600) {
      errors.review = "Use between 10 and 600 characters.";
    } else if (wordCount < 3) {
      errors.review = "Write at least three words.";
    }

    if (!validImagePath(imageInput.value)) {
      errors.imageUrl =
        "Use http(s), /images/ or /uploads/ for the image path.";
    }

    return errors;
  };

  const showValidation = (showAll = false) => {
    const errors = getValidationErrors();

    const shouldShow = (fieldName) =>
      showAll || touchedFields.has(fieldName);

    ratingError.textContent =
      shouldShow("rating") && errors.rating ? errors.rating : "";
    titleError.textContent =
      shouldShow("reviewTitle") && errors.reviewTitle
        ? errors.reviewTitle
        : "";
    reviewError.textContent =
      shouldShow("review") && errors.review ? errors.review : "";
    imageError.textContent =
      shouldShow("imageUrl") && errors.imageUrl ? errors.imageUrl : "";

    titleInput.setAttribute(
      "aria-invalid",
      Boolean(errors.reviewTitle && shouldShow("reviewTitle"))
    );
    reviewInput.setAttribute(
      "aria-invalid",
      Boolean(errors.review && shouldShow("review"))
    );
    imageInput.setAttribute(
      "aria-invalid",
      Boolean(errors.imageUrl && shouldShow("imageUrl"))
    );

    submitButton.disabled = Object.keys(errors).length > 0;
    return errors;
  };

  const updateCounters = () => {
    titleCounter.textContent = `${titleInput.value.length}/80`;
    reviewCounter.textContent = `${reviewInput.value.length}/600`;
  };

  const getDraft = () => ({
    rating: selectedRating(),
    reviewTitle: titleInput.value,
    review: reviewInput.value,
    imageUrl: imageInput.value
  });

  const saveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify(getDraft()));
    draftStatus.textContent = "Draft saved in this browser.";
  };

  const restoreDraft = () => {
    if (pageStatus === "created" || pageStatus === "updated") {
      localStorage.removeItem(draftKey);
      return;
    }

    const storedDraft = localStorage.getItem(draftKey);

    if (!storedDraft) {
      return;
    }

    try {
      const draft = JSON.parse(storedDraft);

      if (draft.reviewTitle) {
        titleInput.value = draft.reviewTitle;
      }

      if (draft.review) {
        reviewInput.value = draft.review;
      }

      if (draft.imageUrl) {
        imageInput.value = draft.imageUrl;
      }

      if (draft.rating) {
        const ratingInput = ratingInputs.find(
          (input) => Number(input.value) === Number(draft.rating)
        );

        if (ratingInput) {
          ratingInput.checked = true;
        }
      }

      draftStatus.textContent = "Draft restored from this browser.";
    } catch {
      localStorage.removeItem(draftKey);
    }
  };

  if (form) {
    restoreDraft();
    updateCounters();
    showValidation();

    [titleInput, reviewInput, imageInput].forEach((input) => {
      input.addEventListener("input", () => {
        touchedFields.add(input.name);
        updateCounters();
        showValidation();
        saveDraft();
      });

      input.addEventListener("blur", () => {
        touchedFields.add(input.name);
        showValidation();
      });
    });

    ratingInputs.forEach((input) => {
      input.addEventListener("change", () => {
        touchedFields.add("rating");
        showValidation();
        saveDraft();
      });
    });

    form.addEventListener("submit", (event) => {
      touchedFields.add("rating");
      touchedFields.add("reviewTitle");
      touchedFields.add("review");
      touchedFields.add("imageUrl");

      const errors = showValidation(true);

      if (Object.keys(errors).length > 0) {
        event.preventDefault();
        form.querySelector('[aria-invalid="true"], input[name="rating"]')?.focus();
        return;
      }

      titleInput.value = normaliseText(titleInput.value);
      reviewInput.value = reviewInput.value.trim();
    });

    clearDraftButton.addEventListener("click", () => {
      localStorage.removeItem(draftKey);
      form.reset();
      touchedFields.clear();
      draftStatus.textContent = "Saved draft cleared.";
      updateCounters();
      showValidation();
    });
  }

  const searchForm = document.querySelector("#review-search-form");
  const searchInput = document.querySelector("#review-search-query");
  const searchField = document.querySelector("#review-search-field");
  const sortSelect = document.querySelector("#review-sort");
  const filterButtons = [
    ...document.querySelectorAll("[data-rating-filter]")
  ];
  const cardsContainer = document.querySelector("#review-card-list");
  const allCards = [...document.querySelectorAll(".pr-card")];
  const pagination = document.querySelector("#review-pagination");
  const resultSummary = document.querySelector("#review-results-summary");
  const emptyState = document.querySelector("#review-empty-state");

  const reviewsPerPage = 5;
  let activeRating = "all";
  let currentPage = 1;

  const cardMatchesSearch = (card) => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const field = searchField.value;

    if (field === "all") {
      return [
        card.dataset.title,
        card.dataset.reviewer,
        card.dataset.date,
        card.dataset.description
      ].some((value) => value.includes(query));
    }

    const fieldMap = {
      title: "title",
      reviewer: "reviewer",
      date: "date",
      description: "description"
    };

    return card.dataset[fieldMap[field]].includes(query);
  };

  const compareCards = (firstCard, secondCard) => {
    const sortMode = sortSelect.value;
    const firstRating = Number(firstCard.dataset.rating);
    const secondRating = Number(secondCard.dataset.rating);
    const firstDate = new Date(firstCard.dataset.date);
    const secondDate = new Date(secondCard.dataset.date);

    if (sortMode === "oldest") {
      return firstDate - secondDate;
    }

    if (sortMode === "rating-high") {
      return secondRating - firstRating || secondDate - firstDate;
    }

    if (sortMode === "rating-low") {
      return firstRating - secondRating || secondDate - firstDate;
    }

    if (sortMode === "title") {
      return firstCard.dataset.title.localeCompare(secondCard.dataset.title);
    }

    return secondDate - firstDate;
  };

  const renderPagination = (pageCount) => {
    pagination.replaceChildren();

    if (pageCount <= 1) {
      return;
    }

    const createPageButton = (label, targetPage, isCurrent = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pr-page-btn";
      button.textContent = label;
      button.disabled = isCurrent;
      button.setAttribute("aria-current", isCurrent ? "page" : "false");

      button.addEventListener("click", () => {
        currentPage = targetPage;
        applyControls();
        document.querySelector("#customer-reviews")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });

      return button;
    };

    pagination.append(
      createPageButton("‹", Math.max(1, currentPage - 1), currentPage === 1)
    );

    for (let page = 1; page <= pageCount; page += 1) {
      pagination.append(createPageButton(String(page), page, page === currentPage));
    }

    pagination.append(
      createPageButton(
        "›",
        Math.min(pageCount, currentPage + 1),
        currentPage === pageCount
      )
    );
  };

  const applyControls = () => {
    const matchingCards = allCards
      .filter((card) => {
        const matchesRating =
          activeRating === "all" ||
          card.dataset.rating === activeRating;

        return matchesRating && cardMatchesSearch(card);
      })
      .sort(compareCards);

    const pageCount = Math.max(
      1,
      Math.ceil(matchingCards.length / reviewsPerPage)
    );

    currentPage = Math.min(currentPage, pageCount);

    allCards.forEach((card) => {
      card.hidden = true;
    });

    matchingCards.forEach((card) => {
      cardsContainer.append(card);
    });

    const startIndex = (currentPage - 1) * reviewsPerPage;
    matchingCards
      .slice(startIndex, startIndex + reviewsPerPage)
      .forEach((card) => {
        card.hidden = false;
      });

    resultSummary.textContent =
      `${matchingCards.length} review${matchingCards.length === 1 ? "" : "s"} found.`;
    emptyState.hidden = matchingCards.length !== 0;

    renderPagination(pageCount);
  };

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    currentPage = 1;
    applyControls();
  });

  searchInput?.addEventListener("input", () => {
    currentPage = 1;
    applyControls();
  });

  searchField?.addEventListener("change", () => {
    currentPage = 1;
    applyControls();
  });

  sortSelect?.addEventListener("change", () => {
    currentPage = 1;
    applyControls();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeRating = button.dataset.ratingFilter;
      currentPage = 1;

      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      applyControls();
    });
  });

  document.querySelectorAll("[data-delete-review]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const confirmed = window.confirm(
        "Delete your review? This action cannot be undone."
      );

      if (!confirmed) {
        event.preventDefault();
      }
    });
  });

  applyControls();
})();
