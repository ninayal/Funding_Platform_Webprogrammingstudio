document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector("#product-grid");
    const cards = [...document.querySelectorAll(".shop-card")];
    const count = document.querySelector("#results-count");
    const emptyState = document.querySelector("#products-empty-state");
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const sortInputs = document.querySelectorAll('input[name="sort"]');

    if (!grid) return;

    const originalOrder = new Map(
        cards.map((card, index) => [card, index])
    );

    const setCategoryFromUrl = () => {
        const category = new URLSearchParams(window.location.search).get("category");

        if (!category) return;

        const input = document.querySelector(`#filter-${CSS.escape(category)}`);

        if (input) {
            input.checked = true;
        }
    };

    const updateResults = () => {
        const visibleCount = cards.filter((card) => !card.hidden).length;

        if (count) count.textContent = visibleCount;
        if (emptyState) emptyState.hidden = visibleCount !== 0;
    };

    const filterByCategory = () => {
        const selected = document.querySelector('input[name="category"]:checked');
        const category = selected
            ? selected.id.replace("filter-", "")
            : "all";

        cards.forEach((card) => {
            card.hidden =
                category !== "all" &&
                card.dataset.category !== category;
        });

        updateResults();
    };

    const sortProducts = () => {
        const selected = document.querySelector('input[name="sort"]:checked');
        const sort = selected ? selected.id : "sort-featured";

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

    document.querySelectorAll('form[action="/cart/add"]').forEach((form) => {
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

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Unable to add product.");
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

    categoryInputs.forEach((input) => {
        input.addEventListener("change", filterByCategory);
    });

    sortInputs.forEach((input) => {
        input.addEventListener("change", sortProducts);
    });

    setCategoryFromUrl();
    filterByCategory();
    sortProducts();
});