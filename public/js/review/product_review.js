(() => {
  "use strict";

  const root = document.querySelector(
    ".product-review"
  );

  if (!root) {
    return;
  }

  const form = document.querySelector(
    "#review-form"
  );

  if (form) {
    const titleInput =
      form.querySelector(
        "#review-title"
      );

    const reviewInput =
      form.querySelector(
        "#review-content"
      );

    const titleCounter =
      form.querySelector(
        "#review-title-counter"
      );

    const reviewCounter =
      form.querySelector(
        "#review-content-counter"
      );

    const titleError =
      form.querySelector(
        "#review-title-error"
      );

    const reviewError =
      form.querySelector(
        "#review-content-error"
      );

    const ratingError =
      form.querySelector(
        "#rating-error"
      );

    const ratingInputs = [
      ...form.querySelectorAll(
        'input[name="rating"]'
      )
    ];

    const clearDraftButton =
      form.querySelector(
        "#clear-review-draft"
      );

    const draftStatus =
      form.querySelector(
        "#review-draft-status"
      );

    const pageStatus =
      root.dataset.pageStatus || "";

    const productId =
      root.dataset.productId || "";

    const formMode =
      root.dataset.formMode || "create";

    const editingReviewId =
      root.dataset.editingReviewId ||
      "new";

    const draftKey =
      `reviewDraft:${productId}:` +
      `${formMode}:${editingReviewId}`;

    const initialValues = {
      rating:
        ratingInputs.find(
          (input) =>
            input.checked
        )?.value || "",

      reviewTitle:
        titleInput?.value || "",

      review:
        reviewInput?.value || ""
    };

    const normaliseText = (
      value
    ) =>
      String(value || "")
        .replace(/\s+/g, " ")
        .trim();

    const selectedRating = () => {
      const selected =
        ratingInputs.find(
          (input) =>
            input.checked
        );

      return selected
        ? Number(selected.value)
        : 0;
    };

    const validateTextFields = () => {
      const errors = {};

      const title =
        normaliseText(
          titleInput?.value
        );

      const review =
        String(
          reviewInput?.value || ""
        ).trim();

      const wordCount =
        review
          .split(/\s+/)
          .filter(Boolean)
          .length;

      if (!selectedRating()) {
        errors.rating =
          "Choose a rating from 1 to 5 stars.";
      }

      if (
        title.length < 4 ||
        title.length > 80
      ) {
        errors.reviewTitle =
          "Use between 4 and 80 characters.";
      } else if (
        !/[\p{L}\p{N}]/u.test(
          title
        )
      ) {
        errors.reviewTitle =
          "Include at least one letter or number.";
      }

      if (
        review.length < 10 ||
        review.length > 600
      ) {
        errors.review =
          "Use between 10 and 600 characters.";
      } else if (
        wordCount < 3
      ) {
        errors.review =
          "Write at least three words.";
      }

      return errors;
    };

    const updateCounters = () => {
      if (titleCounter) {
        titleCounter.textContent =
          `${titleInput?.value.length || 0}/80`;
      }

      if (reviewCounter) {
        reviewCounter.textContent =
          `${reviewInput?.value.length || 0}/600`;
      }
    };

    const showTextValidation = () => {
      const errors =
        validateTextFields();

      if (titleError) {
        titleError.textContent =
          errors.reviewTitle || "";
      }

      if (reviewError) {
        reviewError.textContent =
          errors.review || "";
      }

      if (ratingError) {
        ratingError.textContent =
          errors.rating || "";
      }

      titleInput?.setAttribute(
        "aria-invalid",
        errors.reviewTitle
          ? "true"
          : "false"
      );

      reviewInput?.setAttribute(
        "aria-invalid",
        errors.review
          ? "true"
          : "false"
      );

      return errors;
    };

    const saveDraft = () => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          rating:
            selectedRating(),

          reviewTitle:
            titleInput?.value || "",

          review:
            reviewInput?.value || ""
        })
      );

      if (draftStatus) {
        draftStatus.textContent =
          "Text draft saved in this browser. Images are never stored in Local Storage.";
      }
    };

    const restoreDraft = () => {
      if (
        pageStatus === "created" ||
        pageStatus === "updated" ||
        pageStatus === "deleted"
      ) {
        localStorage.removeItem(
          draftKey
        );

        return;
      }

      const raw =
        localStorage.getItem(
          draftKey
        );

      if (!raw) {
        return;
      }

      try {
        const draft =
          JSON.parse(raw);

        if (
          draft.reviewTitle &&
          titleInput
        ) {
          titleInput.value =
            draft.reviewTitle;
        }

        if (
          draft.review &&
          reviewInput
        ) {
          reviewInput.value =
            draft.review;
        }

        if (draft.rating) {
          const input =
            ratingInputs.find(
              (item) =>
                Number(item.value) ===
                Number(draft.rating)
            );

          if (input) {
            input.checked = true;
          }
        }

        if (draftStatus) {
          draftStatus.textContent =
            "Text draft restored. Select the images again before publishing.";
        }
      } catch {
        localStorage.removeItem(
          draftKey
        );
      }
    };

    [
      titleInput,
      reviewInput
    ]
      .filter(Boolean)
      .forEach(
        (input) => {
          input.addEventListener(
            "input",
            () => {
              updateCounters();
              saveDraft();
            }
          );

          input.addEventListener(
            "blur",
            showTextValidation
          );
        }
      );

    ratingInputs.forEach(
      (input) => {
        input.addEventListener(
          "change",
          () => {
            showTextValidation();
            saveDraft();
          }
        );
      }
    );

    form.addEventListener(
      "submit",
      (event) => {
        const errors =
          showTextValidation();

        if (
          Object.keys(errors)
            .length
        ) {
          event.preventDefault();

          form.querySelector(
            '[aria-invalid="true"], ' +
            'input[name="rating"]'
          )?.focus();

          return;
        }

        if (titleInput) {
          titleInput.value =
            normaliseText(
              titleInput.value
            );
        }

        if (reviewInput) {
          reviewInput.value =
            reviewInput.value.trim();
        }
      }
    );

    clearDraftButton?.addEventListener(
      "click",
      () => {
        localStorage.removeItem(
          draftKey
        );

        if (titleInput) {
          titleInput.value =
            initialValues.reviewTitle;
        }

        if (reviewInput) {
          reviewInput.value =
            initialValues.review;
        }

        ratingInputs.forEach(
          (input) => {
            input.checked =
              input.value ===
              initialValues.rating;
          }
        );

        if (draftStatus) {
          draftStatus.textContent =
            "Saved text draft cleared.";
        }

        updateCounters();
        showTextValidation();
      }
    );

    restoreDraft();
    updateCounters();
  }

  const searchForm =
    document.querySelector(
      "#review-search-form"
    );

  const searchInput =
    document.querySelector(
      "#review-search-query"
    );

  const searchField =
    document.querySelector(
      "#review-search-field"
    );

  const sortSelect =
    document.querySelector(
      "#review-sort"
    );

  const filterButtons = [
    ...document.querySelectorAll(
      "[data-rating-filter]"
    )
  ];

  const cardsContainer =
    document.querySelector(
      "#review-card-list"
    );

  const allCards = [
    ...document.querySelectorAll(
      ".pr-card"
    )
  ];

  const resultSummary =
    document.querySelector(
      "#review-results-summary"
    );

  const emptyState =
    document.querySelector(
      "#review-empty-state"
    );

  const pagination =
    document.querySelector(
      "#review-pagination"
    );

  const reviewsPerPage = 5;

  let activeRating = "all";
  let currentPage = 1;

  const normaliseSearch = (
    value
  ) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const getSearchValue = (
    card,
    field
  ) => {
    if (field === "title") {
      return (
        card.dataset.title || ""
      );
    }

    if (field === "reviewer") {
      return (
        card.dataset.reviewer || ""
      );
    }

    if (field === "date") {
      return (
        card.dataset.date || ""
      );
    }

    if (
      field === "description"
    ) {
      return (
        card.dataset.description ||
        ""
      );
    }

    return [
      card.dataset.title,
      card.dataset.reviewer,
      card.dataset.date,
      card.dataset.description
    ]
      .filter(Boolean)
      .join(" ");
  };

  const cardMatchesSearch = (
    card
  ) => {
    const query =
      normaliseSearch(
        searchInput?.value
      );

    if (!query) {
      return true;
    }

    return normaliseSearch(
      getSearchValue(
        card,
        searchField?.value ||
        "all"
      )
    ).includes(query);
  };

  const compareCards = (
    firstCard,
    secondCard
  ) => {
    const sortMode =
      sortSelect?.value ||
      "newest";

    const firstDate =
      new Date(
        firstCard.dataset.date
      ).getTime();

    const secondDate =
      new Date(
        secondCard.dataset.date
      ).getTime();

    const firstRating =
      Number(
        firstCard.dataset.rating
      );

    const secondRating =
      Number(
        secondCard.dataset.rating
      );

    if (sortMode === "oldest") {
      return firstDate - secondDate;
    }

    if (
      sortMode ===
      "rating-high"
    ) {
      return (
        secondRating -
          firstRating ||
        secondDate -
          firstDate
      );
    }

    if (
      sortMode ===
      "rating-low"
    ) {
      return (
        firstRating -
          secondRating ||
        secondDate -
          firstDate
      );
    }

    if (sortMode === "title") {
      return (
        firstCard.dataset.title ||
        ""
      ).localeCompare(
        secondCard.dataset.title ||
        ""
      );
    }

    return secondDate - firstDate;
  };

  const createPageButton = (
    label,
    targetPage,
    isCurrent = false
  ) => {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";
    button.className =
      "pr-page-btn";
    button.textContent = label;
    button.disabled = isCurrent;

    button.setAttribute(
      "aria-current",
      isCurrent
        ? "page"
        : "false"
    );

    button.addEventListener(
      "click",
      () => {
        currentPage =
          targetPage;

        applyControls();

        document.querySelector(
          "#customer-reviews"
        )?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );

    return button;
  };

  const renderPagination = (
    pageCount
  ) => {
    if (!pagination) {
      return;
    }

    pagination.replaceChildren();

    if (pageCount <= 1) {
      return;
    }

    pagination.append(
      createPageButton(
        "‹",
        Math.max(
          1,
          currentPage - 1
        ),
        currentPage === 1
      )
    );

    for (
      let page = 1;
      page <= pageCount;
      page += 1
    ) {
      pagination.append(
        createPageButton(
          String(page),
          page,
          page === currentPage
        )
      );
    }

    pagination.append(
      createPageButton(
        "›",
        Math.min(
          pageCount,
          currentPage + 1
        ),
        currentPage === pageCount
      )
    );
  };

  const applyControls = () => {
    if (!cardsContainer) {
      return;
    }

    const matchingCards =
      allCards
        .filter(
          (card) => {
            const matchesRating =
              activeRating === "all" ||
              card.dataset.rating ===
                activeRating;

            return (
              matchesRating &&
              cardMatchesSearch(card)
            );
          }
        )
        .sort(compareCards);

    const pageCount = Math.max(
      1,
      Math.ceil(
        matchingCards.length /
        reviewsPerPage
      )
    );

    currentPage = Math.min(
      currentPage,
      pageCount
    );

    allCards.forEach(
      (card) => {
        card.hidden = true;
      }
    );

    matchingCards.forEach(
      (card) => {
        cardsContainer.appendChild(
          card
        );
      }
    );

    const start =
      (currentPage - 1) *
      reviewsPerPage;

    matchingCards
      .slice(
        start,
        start + reviewsPerPage
      )
      .forEach(
        (card) => {
          card.hidden = false;
        }
      );

    if (resultSummary) {
      resultSummary.textContent =
        `${matchingCards.length} ` +
        `review${
          matchingCards.length === 1
            ? ""
            : "s"
        } found.`;
    }

    if (emptyState) {
      emptyState.hidden =
        matchingCards.length !== 0;
    }

    renderPagination(pageCount);
  };

  searchForm?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      currentPage = 1;
      applyControls();
    }
  );

  searchInput?.addEventListener(
    "input",
    () => {
      currentPage = 1;
      applyControls();
    }
  );

  searchField?.addEventListener(
    "change",
    () => {
      currentPage = 1;
      applyControls();
    }
  );

  sortSelect?.addEventListener(
    "change",
    () => {
      currentPage = 1;
      applyControls();
    }
  );

  filterButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          activeRating =
            button.dataset
              .ratingFilter;

          currentPage = 1;

          filterButtons.forEach(
            (item) => {
              item.classList.toggle(
                "is-active",
                item === button
              );
            }
          );

          applyControls();
        }
      );
    }
  );

  document
    .querySelectorAll(
      "[data-delete-review]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          (event) => {
            const confirmed =
              window.confirm(
                "Delete your review and all uploaded images? This action cannot be undone."
              );

            if (!confirmed) {
              event.preventDefault();
            }
          }
        );
      }
    );

  applyControls();
})();
