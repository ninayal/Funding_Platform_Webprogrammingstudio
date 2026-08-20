document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector("#product-grid");
    if (!grid) return;

    const cards = [...grid.querySelectorAll(".shop-card")];
    const count = document.querySelector("#results-count");
    const emptyState = document.querySelector("#products-empty-state");
    const filterForm = document.querySelector("#product-filter-form");
    const clearButton = document.querySelector("#filter-clear");
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const sortInputs = document.querySelectorAll('input[name="sort"]');

    const originalOrder = new Map(
        cards.map((card, index) => [card, index])
    );

    const getCheckedValues = (name) =>
        [...document.querySelectorAll(
            `#product-filter-form input[name="${name}"]:checked`
        )].map((input) => input.value);

    const applyCategoryFromUrl = () => {
        const category =
            new URLSearchParams(window.location.search).get("category");

        if (!category) return;

        const input = document.getElementById(`filter-${category}`);

        if (input) {
            input.checked = true;
        }
    };

    const matchesPrice = (price, filters) => {
        if (!filters.length) return true;

        return filters.some((filter) => {
            if (filter === "under-25") return price < 25;
            if (filter === "25-50") return price >= 25 && price <= 50;
            if (filter === "50-100") return price > 50 && price < 100;
            if (filter === "100-plus") return price >= 100;

            return false;
        });
    };

    const matchesAvailability = (stock, filters) => {
        if (!filters.length) return true;

        return filters.some((filter) => {
            if (filter === "in-stock") return stock > 0;
            if (filter === "out-of-stock") return stock <= 0;

            return false;
        });
    };

    const matchesRating = (rating, filters) => {
        if (!filters.length) return true;

        return filters.some((value) => rating >= Number(value));
    };

    const updateResults = () => {
        const visibleCount = cards.filter((card) => !card.hidden).length;

        if (count) {
            count.textContent = visibleCount;
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    const applyFilters = () => {
        const selectedCategory =
            document.querySelector('input[name="category"]:checked');

        const category = selectedCategory
            ? selectedCategory.id.replace("filter-", "")
            : "all";

        const prices = getCheckedValues("price");
        const makers = getCheckedValues("maker");
        const materials = getCheckedValues("material");
        const availability = getCheckedValues("availability");
        const ratings = getCheckedValues("rating");

        cards.forEach((card) => {
            const maker = card.dataset.maker || "";
            const material = card.dataset.material || "";
            const price = Number(card.dataset.price);
            const stock = Number(card.dataset.stock);
            const rating = Number(card.dataset.rating);

            const matchesCategory =
                category === "all" ||
                card.dataset.category === category;

            const matchesMaker =
                !makers.length ||
                makers.includes(maker);

            const matchesMaterial =
                !materials.length ||
                materials.includes(material);

            const visible =
                matchesCategory &&
                matchesPrice(price, prices) &&
                matchesMaker &&
                matchesMaterial &&
                matchesAvailability(stock, availability) &&
                matchesRating(rating, ratings);

            card.hidden = !visible;
        });

        updateResults();
    };

    const sortProducts = () => {
        const selected =
            document.querySelector('input[name="sort"]:checked');

        const sort = selected?.id || "sort-featured";

        const sorted = [...cards].sort((a, b) => {
            if (sort === "sort-low") {
                return Number(a.dataset.price) - Number(b.dataset.price);
            }

            if (sort === "sort-high") {
                return Number(b.dataset.price) - Number(a.dataset.price);
            }

            if (sort === "sort-name") {
                return a.dataset.name.localeCompare(b.dataset.name);
            }

            return originalOrder.get(a) - originalOrder.get(b);
        });

        sorted.forEach((card) => grid.appendChild(card));
    };

    filterForm?.addEventListener("change", applyFilters);

    clearButton?.addEventListener("click", () => {
        filterForm
            ?.querySelectorAll('input[type="checkbox"]')
            .forEach((input) => {
                input.checked = false;
            });

        applyFilters();
    });

    categoryInputs.forEach((input) => {
        input.addEventListener("change", applyFilters);
    });

    sortInputs.forEach((input) => {
        input.addEventListener("change", sortProducts);
    });

    document
        .querySelectorAll('form[action="/cart/add"]')
        .forEach((form) => {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const button = form.querySelector('button[type="submit"]');
                const originalText = button.textContent;

                button.disabled = true;

                try {
                    const response = await fetch("/cart/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json"
                        },
                        body: JSON.stringify({
                            productId: form.elements.productId.value,
                            quantity: Number(form.elements.quantity.value)
                        })
                    });

                    const result = await response.json();

                    if (response.status === 401 && result.requiresAuth) {
                        window.location.href = result.redirect;
                        return;
                    }

                    if (!response.ok || !result.success) {
                        throw new Error(
                            result.message || "Unable to add product."
                        );
                    }

                    const badge = document.querySelector("#cart-badge");

                    if (badge) {
                        badge.textContent = result.cart.totalQuantity;
                        badge.hidden = result.cart.totalQuantity === 0;
                    }

                    button.textContent = "✓";

                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 800);
                } catch (error) {
                    window.alert(error.message);
                } finally {
                    button.disabled = false;
                }
            });
        });

    applyCategoryFromUrl();
    applyFilters();
    sortProducts();
});