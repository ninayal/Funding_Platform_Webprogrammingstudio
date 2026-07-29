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
        ...document.querySelectorAll("[data-blog-post]"),
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

    const emptyMessage = document.querySelector(
        "#blog-search-empty",
    );

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

    const getArchiveCards = () => {
        return [
            ...archiveList.querySelectorAll(
                "[data-blog-post]",
            ),
        ];
    };

    const getCategoryValue = (input) => {
        if (!input) {
            return "all";
        }

        if (input.value && input.value !== "on") {
            return input.value
                .trim()
                .toLowerCase();
        }

        return input.id
            .replace("filter-", "")
            .trim()
            .toLowerCase();
    };

    const getActiveCategory = () => {
        const selectedInput = categoryInputs.find(
            (input) => input.checked,
        );

        return getCategoryValue(selectedInput);
    };

    /*
     * Use inline !important so this behaviour does not depend
     * on blog-dynamic.css loading correctly.
     */
    const hideElement = (element) => {
        if (!element) {
            return;
        }

        element.style.setProperty(
            "display",
            "none",
            "important",
        );
    };

    const showElement = (element) => {
        if (!element) {
            return;
        }

        element.style.removeProperty("display");
    };

    const sectionHasVisiblePost = (section) => {
        if (!section) {
            return false;
        }

        const cards = [
            ...section.querySelectorAll(
                "[data-blog-post]",
            ),
        ];

        return cards.some((card) => !card.hidden);
    };

    const updatePageSections = (
        activeCategory,
    ) => {
        const categoryIsFiltered =
            activeCategory !== "all";

        if (categoryIsFiltered) {
            /*
             * For Mission, Donation, Places or Guide:
             * remove all introductory and featured sections.
             * Only matching archive cards remain.
             */
            hideElement(leadSection);
            hideElement(featuredSection);
            hideElement(archiveHeading);

            if (allPostsSection) {
                allPostsSection.style.setProperty(
                    "margin-top",
                    "24px",
                    "important",
                );

                allPostsSection.style.setProperty(
                    "padding-top",
                    "0",
                    "important",
                );
            }

            return;
        }

        /*
         * Restore the original page structure for All.
         */
        if (sectionHasVisiblePost(leadSection)) {
            showElement(leadSection);
        } else {
            hideElement(leadSection);
        }

        if (sectionHasVisiblePost(featuredSection)) {
            showElement(featuredSection);
        } else {
            hideElement(featuredSection);
        }

        showElement(archiveHeading);

        if (allPostsSection) {
            allPostsSection.style.removeProperty(
                "margin-top",
            );

            allPostsSection.style.removeProperty(
                "padding-top",
            );
        }
    };

    const applyFilters = () => {
        const searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        const activeCategory =
            getActiveCategory();

        allPostCards.forEach((card) => {
            const cardCategory = (
                card.dataset.category || ""
            )
                .trim()
                .toLowerCase();

            const searchableText = (
                card.dataset.search || ""
            )
                .trim()
                .toLowerCase();

            const matchesCategory =
                activeCategory === "all" ||
                cardCategory === activeCategory;

            const matchesSearch =
                searchableText.includes(searchTerm);

            card.hidden = !(
                matchesCategory &&
                matchesSearch
            );

            /*
             * Force hidden cards off-screen even when an existing
             * Blog CSS rule defines display:grid or display:flex.
             */
            if (card.hidden) {
                hideElement(card);
            } else {
                showElement(card);
            }
        });

        updatePageSections(activeCategory);

        const visibleArchiveCards =
            getArchiveCards().filter(
                (card) => !card.hidden,
            );

        if (emptyMessage) {
            emptyMessage.hidden =
                visibleArchiveCards.length > 0;

            if (emptyMessage.hidden) {
                hideElement(emptyMessage);
            } else {
                showElement(emptyMessage);
            }
        }

        localStorage.setItem(
            storageKeys.search,
            searchInput.value,
        );

        localStorage.setItem(
            storageKeys.category,
            activeCategory,
        );
    };

    const applySort = () => {
        if (!sortSelect) {
            return;
        }

        const cards = getArchiveCards();

        cards.sort((cardA, cardB) => {
            const dateA = new Date(
                cardA.dataset.date || 0,
            ).getTime();

            const dateB = new Date(
                cardB.dataset.date || 0,
            ).getTime();

            if (sortSelect.value === "oldest") {
                return dateA - dateB;
            }

            if (sortSelect.value === "title") {
                const titleA =
                    cardA.dataset.title || "";

                const titleB =
                    cardB.dataset.title || "";

                return titleA.localeCompare(
                    titleB,
                    "en",
                    {
                        sensitivity: "base",
                    },
                );
            }

            return dateB - dateA;
        });

        cards.forEach((card) => {
            archiveList.appendChild(card);
        });

        localStorage.setItem(
            storageKeys.sort,
            sortSelect.value,
        );
    };

    const restoreStoredState = () => {
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

        if (storedSearch !== null) {
            searchInput.value = storedSearch;
        }

        if (storedCategory) {
            const matchingInput =
                categoryInputs.find((input) => {
                    return (
                        getCategoryValue(input) ===
                        storedCategory
                    );
                });

            if (matchingInput) {
                matchingInput.checked = true;
            }
        }

        if (
            sortSelect &&
            ["newest", "oldest", "title"].includes(
                storedSort,
            )
        ) {
            sortSelect.value = storedSort;
        }
    };

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
            window.requestAnimationFrame(() => {
                applyFilters();
                searchInput.focus();
            });
        },
    );

    searchInput.addEventListener(
        "input",
        applyFilters,
    );

    categoryInputs.forEach((input) => {
        input.addEventListener(
            "change",
            () => {
                applyFilters();

                /*
                 * Bring the matching post list into view after
                 * removing the large sections above it.
                 */
                archiveList.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            },
        );
    });

    sortSelect?.addEventListener(
        "change",
        () => {
            applySort();
            applyFilters();
        },
    );

    restoreStoredState();
    applySort();
    applyFilters();

    console.log(
        "Blog filtering loaded successfully.",
    );
});