document.addEventListener("DOMContentLoaded", () => {
    const cartList = document.querySelector("#cart-list");
    const quantityInputs = document.querySelectorAll(".cart-quantity-input");
    const updateForms = document.querySelectorAll(".cart-update-form");
    const removeForms = document.querySelectorAll(".cart-remove-form");
    const searchInput = document.querySelector("#cart-search");
    const sortSelect = document.querySelector("#cart-sort");
    const filterSelect = document.querySelector("#cart-filter");
    const showFeedback = (message, type = "error") => {
        let feedback = document.querySelector("#cart-feedback");
        if (!feedback) {
            feedback = document.createElement("p");
            feedback.id = "cart-feedback";
            feedback.setAttribute("role", "status");
            document.querySelector(".cart-page")?.prepend(feedback);
        }
        feedback.textContent = message;
        feedback.className = `cart-feedback ${type}`;
    };
    const validateQuantity = (input) => {
        const quantity = Number(input.value);
        const min = Number(input.min) || 1;
        const max = Number(input.max);
        if (!Number.isInteger(quantity) || quantity < min) {
            input.setCustomValidity(`Quantity must be at least ${min}.`);
            showFeedback(`Quantity must be at least ${min}.`);
            return false;
        }
        if (Number.isFinite(max) && quantity > max) {
            input.setCustomValidity(`Only ${max} item(s) available.`);
            showFeedback(`Only ${max} item(s) available.`);
            return false;
        }
        input.setCustomValidity("");
        return true;
    };
    quantityInputs.forEach((input) => {
        input.addEventListener("input", () => {
            validateQuantity(input);
            const item = input.closest(".cart-item");
            if (item) item.dataset.quantity = input.value;
        });
    });
    updateForms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            const input = form.querySelector(".cart-quantity-input");
            if (!input || !validateQuantity(input)) {
                event.preventDefault();
                input?.reportValidity();
            }
        });
    });
    removeForms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            if (!window.confirm("Remove this item from your cart?")) event.preventDefault();
        });
    });
    const updateVisibleItems = () => {
        if (!cartList) return;
        const query = searchInput?.value.trim().toLowerCase() || "";
        const filter = filterSelect?.value || "all";
        const items = [...cartList.querySelectorAll(".cart-item")];
        items.forEach((item) => {
            const title = item.dataset.title || "";
            const quantity = Number(item.dataset.quantity);
            const matchesSearch = title.includes(query);
            const matchesFilter = filter === "all" || (filter === "single" && quantity === 1) || (filter === "multiple" && quantity > 1);
            item.hidden = !(matchesSearch && matchesFilter);
        });
    };
    const sortItems = () => {
        if (!cartList || !sortSelect) return;
        const items = [...cartList.querySelectorAll(".cart-item")];
        const value = sortSelect.value;
        items.sort((a, b) => {
            if (value === "title-asc") return (a.dataset.title || "").localeCompare(b.dataset.title || "");
            if (value === "title-desc") return (b.dataset.title || "").localeCompare(a.dataset.title || "");
            if (value === "price-asc") return Number(a.dataset.price) - Number(b.dataset.price);
            if (value === "price-desc") return Number(b.dataset.price) - Number(a.dataset.price);
            if (value === "quantity-asc") return Number(a.dataset.quantity) - Number(b.dataset.quantity);
            if (value === "quantity-desc") return Number(b.dataset.quantity) - Number(a.dataset.quantity);
            return 0;
        });
        items.forEach((item) => cartList.appendChild(item));
    };
    searchInput?.addEventListener("input", updateVisibleItems);
    filterSelect?.addEventListener("change", updateVisibleItems);
    sortSelect?.addEventListener("change", sortItems);
});