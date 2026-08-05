document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector("#product-grid");
    const cards = [...document.querySelectorAll(".shop-card")];
    const count = document.querySelector("#results-count");
    const emptyState = document.querySelector("#products-empty-state");
    const sortSelect = document.querySelector("#product-sort");
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const filterInputs = document.querySelectorAll(".shop-sidebar input[type='checkbox']");
    if (!grid) return;
    const getSelectedCategory = () => {
        const selected = document.querySelector('input[name="category"]:checked');
        return selected ? selected.id.replace("filter-", "") : "all";
    };
    const getCheckedValues = (name) => [
        ...document.querySelectorAll(`input[name="${name}"]:checked`)
    ].map((input) => input.value);
    const matchesPrice = (price, filters) => {
        if (filters.length === 0) return true;
        return filters.some((filter) => {
            if (filter === "under-25") return price < 25;
            if (filter === "25-50") return price >= 25 && price < 50;
            if (filter === "50-100") return price >= 50 && price < 100;
            if (filter === "100-plus") return price >= 100;
            return true;
        });
    };
    const matchesAvailability = (stock, filters) => {
        if (filters.length === 0) return true;
        return filters.some((filter) => {
            if (filter === "in-stock") return stock > 5;
            if (filter === "low-stock") return stock > 0 && stock <= 5;
            return true;
        });
    };
    const applyFilters = () => {
        const category = getSelectedCategory();
        const prices = getCheckedValues("price");
        const makers = getCheckedValues("maker");
        const materials = getCheckedValues("material");
        const availability = getCheckedValues("availability");
        const ratings = getCheckedValues("rating");
        let visibleCount = 0;
        cards.forEach((card) => {
            const price = Number(card.dataset.price);
            const stock = Number(card.dataset.stock);
            const rating = Number(card.dataset.rating);
            const visible =
                (category === "all" || card.dataset.category === category) &&
                (matchesPrice(price, prices)) &&
                (makers.length === 0 || makers.includes(card.dataset.maker)) &&
                (materials.length === 0 || materials.includes(card.dataset.material)) &&
                (matchesAvailability(stock, availability)) &&
                (ratings.length === 0 || ratings.some((value) => rating >= Number(value)));
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });
        if (count) count.textContent = visibleCount;
        if (emptyState) emptyState.hidden = visibleCount !== 0;
    };
    const sortProducts = () => {
        const value = sortSelect?.value || "featured";
        const sorted = [...cards].sort((a, b) => {
            if (value === "price-low") return Number(a.dataset.price) - Number(b.dataset.price);
            if (value === "price-high") return Number(b.dataset.price) - Number(a.dataset.price);
            if (value === "name") return a.dataset.name.localeCompare(b.dataset.name);
            if (value === "rating") return Number(b.dataset.rating) - Number(a.dataset.rating);
            return 0;
        });
        sorted.forEach((card) => grid.appendChild(card));
    };
    categoryInputs.forEach((input) => input.addEventListener("change", applyFilters));
    filterInputs.forEach((input) => input.addEventListener("change", applyFilters));
    sortSelect?.addEventListener("change", sortProducts);
    applyFilters();
});