"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(
    "[data-blog-search-form]",
  );

  const searchInput = document.querySelector(
    "[data-blog-search-input]",
  );

  const categoryInputs = [
    ...document.querySelectorAll(
      'input[name="post-filter"]',
    ),
  ];

  const allPostCards = [
    ...document.querySelectorAll(
      "[data-blog-post]",
    ),
  ];

  const leadSection = document.querySelector(
    ".lead-story-section",
  );

  const featuredSection = document.querySelector(
    ".featured-section",
  );

  const allPostsSection = document.querySelector(
    ".all-posts-section",
  );

  const archiveHeading = document.querySelector(
    ".all-posts-section > .section-heading",
  );

  const archiveList = document.querySelector(
    "#blog-post-list",
  );

  const sortSelect = document.querySelector(
    "[data-blog-sort]",
  );

  const sortControl = document.querySelector(
    "[data-blog-sort-control]",
  );

  const sortButton = document.querySelector(
    "[data-blog-sort-button]",
  );

  const sortLabel = document.querySelector(
    "[data-blog-sort-label]",
  );

  const sortMenu = document.querySelector(
    "[data-blog-sort-menu]",
  );

  const sortOptions = [
    ...document.querySelectorAll(
      "[data-blog-sort-option]",
    ),
  ];

  const emptyMessage = document.querySelector(
    "#blog-search-empty",
  );

  const pagination = document.querySelector(
    "[data-blog-pagination]",
  );

  const previousPageButton = document.querySelector(
    "[data-blog-page-previous]",
  );

  const nextPageButton = document.querySelector(
    "[data-blog-page-next]",
  );

  const pageNumbers = document.querySelector(
    "[data-blog-page-numbers]",
  );

  const POSTS_PER_PAGE = 9;

  let currentPage = 1;

  if (
    !searchInput ||
    !archiveList ||
    categoryInputs.length === 0
  ) {
    console.error(
      "Blog filtering could not start because required elements are missing.",
    );

    return;
  }

  const storageKeys = {
    search: "langco.blog.search",
    category: "langco.blog.category",
    sort: "langco.blog.sort",
  };


  /* =========================================
     CUSTOM SORT DROPDOWN
  ========================================= */

  const closeSortDropdown = () => {
    if (
      !sortControl ||
      !sortButton ||
      !sortMenu
    ) {
      return;
    }

    sortControl
      .querySelector(
        ".blog-sort-dropdown",
      )
      ?.classList.remove(
        "is-open",
      );

    sortButton.setAttribute(
      "aria-expanded",
      "false",
    );

    sortMenu.hidden = true;
  };


  const openSortDropdown = () => {
    if (
      !sortControl ||
      !sortButton ||
      !sortMenu
    ) {
      return;
    }

    sortControl
      .querySelector(
        ".blog-sort-dropdown",
      )
      ?.classList.add(
        "is-open",
      );

    sortButton.setAttribute(
      "aria-expanded",
      "true",
    );

    sortMenu.hidden = false;
  };


  const toggleSortDropdown = () => {
    if (!sortMenu) {
      return;
    }

    if (sortMenu.hidden) {
      openSortDropdown();
    } else {
      closeSortDropdown();
    }
  };


  const updateSortDropdown = (
    value,
  ) => {
    if (
      !sortSelect ||
      !sortLabel
    ) {
      return;
    }

    const selectedOption =
      sortOptions.find(
        (option) =>
          option.dataset
            .blogSortOption ===
          value,
      );

    if (!selectedOption) {
      return;
    }

    sortLabel.textContent =
      selectedOption
        .querySelector("span")
        ?.textContent
        .trim() ||
      "Newest first";

    sortOptions.forEach(
      (option) => {
        const isSelected =
          option.dataset
            .blogSortOption ===
          value;

        option.classList.toggle(
          "is-selected",
          isSelected,
        );

        option.setAttribute(
          "aria-selected",
          String(isSelected),
        );
      },
    );
  };


  /* =========================================
     BLOG HELPERS
  ========================================= */

  const getArchiveCards = () => [
    ...archiveList.querySelectorAll(
      "[data-blog-post]",
    ),
  ];


  const getCategoryValue = (
    input,
  ) => {
    if (!input) {
      return "all";
    }

    if (
      input.value &&
      input.value !== "on"
    ) {
      return input.value
        .trim()
        .toLowerCase();
    }

    return input.id
      .replace(
        "filter-",
        "",
      )
      .trim()
      .toLowerCase();
  };


  const getActiveCategory = () => {
    const selectedInput =
      categoryInputs.find(
        (input) =>
          input.checked,
      );

    return getCategoryValue(
      selectedInput,
    );
  };


  const hideElement = (
    element,
  ) => {
    if (!element) {
      return;
    }

    element.style.setProperty(
      "display",
      "none",
      "important",
    );
  };


  const showElement = (
    element,
  ) => {
    if (!element) {
      return;
    }

    element.style.removeProperty(
      "display",
    );
  };


  const getMatchedArchiveCards =
    () =>
      getArchiveCards().filter(
        (card) =>
          card.dataset.matchesFilter ===
          "true",
      );


  const scrollToArchive = () => {
    allPostsSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };


  /* =========================================
     PAGINATION
  ========================================= */

  const renderPageNumbers = (
    totalPages,
  ) => {
    if (!pageNumbers) {
      return;
    }

    pageNumbers.innerHTML = "";

    for (
      let page = 1;
      page <= totalPages;
      page += 1
    ) {
      const button =
        document.createElement(
          "button",
        );

      button.type = "button";

      button.className =
        "blog-pagination__number";

      button.textContent =
        String(page);

      button.dataset.blogPage =
        String(page);

      button.setAttribute(
        "aria-label",
        `Go to page ${page}`,
      );

      if (
        page === currentPage
      ) {
        button.classList.add(
          "is-active",
        );

        button.setAttribute(
          "aria-current",
          "page",
        );
      }

      pageNumbers.appendChild(
        button,
      );
    }
  };


  const applyPagination = () => {
    const archiveCards =
      getArchiveCards();

    const matchedCards =
      getMatchedArchiveCards();

    const totalPages =
      Math.ceil(
        matchedCards.length /
          POSTS_PER_PAGE,
      );

    if (
      totalPages === 0
    ) {
      currentPage = 1;
    } else if (
      currentPage >
      totalPages
    ) {
      currentPage =
        totalPages;
    }

    const firstIndex =
      (currentPage - 1) *
      POSTS_PER_PAGE;

    const lastIndex =
      firstIndex +
      POSTS_PER_PAGE;

    archiveCards.forEach(
      (card) => {
        card.hidden = true;

        hideElement(
          card,
        );
      },
    );

    matchedCards
      .slice(
        firstIndex,
        lastIndex,
      )
      .forEach(
        (card) => {
          card.hidden = false;

          showElement(
            card,
          );
        },
      );

    if (emptyMessage) {
      const hasNoResults =
        matchedCards.length === 0;

      emptyMessage.hidden =
        !hasNoResults;

      if (hasNoResults) {
        showElement(
          emptyMessage,
        );
      } else {
        hideElement(
          emptyMessage,
        );
      }
    }

    if (
      !pagination ||
      totalPages <= 1
    ) {
      if (pagination) {
        pagination.hidden =
          true;

        hideElement(
          pagination,
        );
      }

      return;
    }

    pagination.hidden =
      false;

    showElement(
      pagination,
    );

    if (
      previousPageButton
    ) {
      previousPageButton.disabled =
        currentPage === 1;
    }

    if (
      nextPageButton
    ) {
      nextPageButton.disabled =
        currentPage ===
        totalPages;
    }

    renderPageNumbers(
      totalPages,
    );
  };


  /* =========================================
     PAGE SECTIONS
  ========================================= */

  const sectionHasVisiblePost = (
    section,
  ) => {
    if (!section) {
      return false;
    }

    const cards = [
      ...section.querySelectorAll(
        "[data-blog-post]",
      ),
    ];

    return cards.some(
      (card) =>
        !card.hidden,
    );
  };


  const resetArchiveSpacing =
    () => {
      if (!allPostsSection) {
        return;
      }

      allPostsSection.style
        .removeProperty(
          "margin-top",
        );

      allPostsSection.style
        .removeProperty(
          "padding-top",
        );
    };


  const compactArchiveSpacing =
    () => {
      if (!allPostsSection) {
        return;
      }

      allPostsSection.style
        .setProperty(
          "margin-top",
          "24px",
          "important",
        );

      allPostsSection.style
        .setProperty(
          "padding-top",
          "0",
          "important",
        );
    };


  const updatePageSections = (
    activeCategory,
  ) => {
    const categoryIsFiltered =
      activeCategory !==
      "all";

    const isLaterPage =
      currentPage > 1;

    if (
      categoryIsFiltered
    ) {
      hideElement(
        leadSection,
      );

      hideElement(
        featuredSection,
      );

      hideElement(
        archiveHeading,
      );

      compactArchiveSpacing();

      return;
    }

    if (isLaterPage) {
      hideElement(
        leadSection,
      );

      hideElement(
        featuredSection,
      );

      showElement(
        archiveHeading,
      );

      resetArchiveSpacing();

      return;
    }

    if (
      sectionHasVisiblePost(
        leadSection,
      )
    ) {
      showElement(
        leadSection,
      );
    } else {
      hideElement(
        leadSection,
      );
    }

    if (
      sectionHasVisiblePost(
        featuredSection,
      )
    ) {
      showElement(
        featuredSection,
      );
    } else {
      hideElement(
        featuredSection,
      );
    }

    showElement(
      archiveHeading,
    );

    resetArchiveSpacing();
  };


  /* =========================================
     FILTERING
  ========================================= */

  const applyFilters = (
    {
      resetPage = true,
    } = {},
  ) => {
    if (resetPage) {
      currentPage = 1;
    }

    const searchTerm =
      searchInput.value
        .trim()
        .toLowerCase();

    const activeCategory =
      getActiveCategory();

    allPostCards.forEach(
      (card) => {
        const cardCategory =
          (
            card.dataset.category ||
            ""
          )
            .trim()
            .toLowerCase();

        const searchableText =
          (
            card.dataset.search ||
            ""
          )
            .trim()
            .toLowerCase();

        const matchesCategory =
          activeCategory ===
            "all" ||
          cardCategory ===
            activeCategory;

        const matchesSearch =
          searchableText.includes(
            searchTerm,
          );

        const matches =
          matchesCategory &&
          matchesSearch;

        card.dataset.matchesFilter =
          matches
            ? "true"
            : "false";

        if (
          archiveList.contains(
            card,
          )
        ) {
          return;
        }

        card.hidden =
          !matches;

        if (matches) {
          showElement(
            card,
          );
        } else {
          hideElement(
            card,
          );
        }
      },
    );

    applyPagination();

    updatePageSections(
      activeCategory,
    );

    localStorage.setItem(
      storageKeys.search,
      searchInput.value,
    );

    localStorage.setItem(
      storageKeys.category,
      activeCategory,
    );
  };


  /* =========================================
     SORTING
  ========================================= */

  const applySort = () => {
    if (!sortSelect) {
      return;
    }

    const cards =
      getArchiveCards();

    cards.sort(
      (
        cardA,
        cardB,
      ) => {
        const dateA =
          new Date(
            cardA.dataset.date ||
              0,
          ).getTime();

        const dateB =
          new Date(
            cardB.dataset.date ||
              0,
          ).getTime();

        if (
          sortSelect.value ===
          "oldest"
        ) {
          return (
            dateA -
            dateB
          );
        }

        if (
          sortSelect.value ===
          "title"
        ) {
          const titleA =
            cardA.dataset.title ||
            "";

          const titleB =
            cardB.dataset.title ||
            "";

          return titleA.localeCompare(
            titleB,
            "en",
            {
              sensitivity:
                "base",
            },
          );
        }

        return (
          dateB -
          dateA
        );
      },
    );

    cards.forEach(
      (card) => {
        archiveList.appendChild(
          card,
        );
      },
    );

    localStorage.setItem(
      storageKeys.sort,
      sortSelect.value,
    );
  };


  /* =========================================
     RESTORE STORED STATE
  ========================================= */

  const restoreStoredState =
    () => {
      const storedSearch =
        localStorage.getItem(
          storageKeys.search,
        );

      const storedCategory =
        localStorage.getItem(
          storageKeys.category,
        );

      const storedSort =
        localStorage.getItem(
          storageKeys.sort,
        );

      if (
        storedSearch !== null
      ) {
        searchInput.value =
          storedSearch;
      }

      if (
        storedCategory
      ) {
        const matchingInput =
          categoryInputs.find(
            (input) =>
              getCategoryValue(
                input,
              ) ===
              storedCategory,
          );

        if (
          matchingInput
        ) {
          matchingInput.checked =
            true;
        }
      }

      if (
        sortSelect &&
        [
          "newest",
          "oldest",
          "title",
        ].includes(
          storedSort,
        )
      ) {
        sortSelect.value =
          storedSort;
      }
    };


  /* =========================================
     SEARCH EVENTS
  ========================================= */

  searchForm?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      applyFilters();
    },
  );


  searchForm?.addEventListener(
    "reset",
    () => {
      window.requestAnimationFrame(
        () => {
          applyFilters();

          searchInput.focus();
        },
      );
    },
  );


  searchInput.addEventListener(
    "input",
    () => {
      applyFilters();
    },
  );


  /* =========================================
     CATEGORY EVENTS
  ========================================= */

  categoryInputs.forEach(
    (input) => {
      input.addEventListener(
        "change",
        () => {
          applyFilters();

          scrollToArchive();
        },
      );
    },
  );


  /* =========================================
     SORT EVENTS
  ========================================= */

  sortSelect?.addEventListener(
    "change",
    () => {
      currentPage = 1;

      updateSortDropdown(
        sortSelect.value,
      );

      applySort();

      applyFilters({
        resetPage: false,
      });
    },
  );


  sortButton?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      toggleSortDropdown();
    },
  );


  sortOptions.forEach(
    (option) => {
      option.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          if (!sortSelect) {
            return;
          }

          const value =
            option.dataset
              .blogSortOption;

          if (!value) {
            return;
          }

          /*
           * Update the hidden
           * real select.
           */
          sortSelect.value =
            value;

          /*
           * Trigger the existing
           * sorting logic.
           */
          sortSelect.dispatchEvent(
            new Event(
              "change",
              {
                bubbles: true,
              },
            ),
          );

          closeSortDropdown();
        },
      );
    },
  );


  /*
   * Close when clicking
   * outside the dropdown.
   */
  document.addEventListener(
    "click",
    (event) => {
      if (
        sortControl &&
        !sortControl.contains(
          event.target,
        )
      ) {
        closeSortDropdown();
      }
    },
  );


  /*
   * ESC closes dropdown.
   */
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeSortDropdown();

        sortButton?.focus();
      }
    },
  );


  /* =========================================
     PAGINATION EVENTS
  ========================================= */

  previousPageButton?.addEventListener(
    "click",
    () => {
      if (
        currentPage <= 1
      ) {
        return;
      }

      currentPage -= 1;

      applyPagination();

      updatePageSections(
        getActiveCategory(),
      );

      scrollToArchive();
    },
  );


  nextPageButton?.addEventListener(
    "click",
    () => {
      const totalPages =
        Math.ceil(
          getMatchedArchiveCards()
            .length /
            POSTS_PER_PAGE,
        );

      if (
        currentPage >=
        totalPages
      ) {
        return;
      }

      currentPage += 1;

      applyPagination();

      updatePageSections(
        getActiveCategory(),
      );

      scrollToArchive();
    },
  );


  pageNumbers?.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-blog-page]",
        );

      if (!button) {
        return;
      }

      const selectedPage =
        Number(
          button.dataset.blogPage,
        );

      if (
        !Number.isInteger(
          selectedPage,
        ) ||
        selectedPage < 1
      ) {
        return;
      }

      currentPage =
        selectedPage;

      applyPagination();

      updatePageSections(
        getActiveCategory(),
      );

      scrollToArchive();
    },
  );


  /* =========================================
     INITIAL LOAD
  ========================================= */

  restoreStoredState();

  updateSortDropdown(
    sortSelect?.value ||
    "newest",
  );

  closeSortDropdown();

  applySort();

  applyFilters();

  console.log(
    "Blog filtering, custom sorting and pagination loaded successfully.",
  );
});