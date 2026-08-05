document.addEventListener("DOMContentLoaded", () => {
    const cartList = document.querySelector(".cart-list");
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    });
    const showFeedback = (message, type = "error") => {
        let feedback = document.querySelector("#cart-feedback");
        if (!feedback) {
            feedback = document.createElement("p");
            feedback.id = "cart-feedback";
            feedback.setAttribute("role", "status");
            document.querySelector(".cart-items")?.prepend(feedback);
        }
        feedback.textContent = message;
        feedback.className = `cart-feedback ${type}`;
    };
    const updateCartItem = async (row, input) => {
        const productId = row.dataset.productId;
        const quantity = Number(input.value);
        const min = Number(input.min) || 1;
        const max = Number(input.max);
        if (!Number.isInteger(quantity) || quantity < min || quantity > max) {
            input.value = Math.min(max, Math.max(min, quantity || min));
            showFeedback(`Quantity must be between ${min} and ${max}.`);
            return;
        }
        input.disabled = true;
        try {
            const response = await fetch("/cart/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    productId,
                    quantity
                })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to update cart.");
            }
            row.dataset.quantity = quantity;
            const item = result.cart.items.find((cartItem) => cartItem.productId === productId);
            if (item) {
                row.querySelector(".price-now").textContent = item.subtotalFormatted;
            }
            document.querySelector("#cart-subtotal").textContent = result.cart.subtotalFormatted;
            document.querySelector("#cart-total").textContent = result.cart.subtotalFormatted;
            document.querySelector(".cart-count").textContent = `(${result.cart.totalQuantity} items)`;
            const badge = document.querySelector("#cart-badge");
            if (badge) {
                badge.textContent = result.cart.totalQuantity;
                badge.hidden = result.cart.totalQuantity === 0;
            }
            showFeedback("Cart updated.", "success");
        } catch (error) {
            showFeedback(error.message);
        } finally {
            input.disabled = false;
        }
    };
    document.querySelectorAll(".cart-row").forEach((row) => {
        const input = row.querySelector(".cart-quantity-input");
        const decrease = row.querySelector(".qty-decrease");
        const increase = row.querySelector(".qty-increase");
        let timer;
        const scheduleUpdate = () => {
            clearTimeout(timer);
            timer = setTimeout(() => updateCartItem(row, input), 300);
        };
        decrease?.addEventListener("click", () => {
            input.value = Math.max(Number(input.min) || 1, Number(input.value) - 1);
            scheduleUpdate();
        });
        increase?.addEventListener("click", () => {
            input.value = Math.min(Number(input.max), Number(input.value) + 1);
            scheduleUpdate();
        });
        input?.addEventListener("change", scheduleUpdate);
    });
    document.querySelectorAll(".cart-remove-form").forEach((form) => {
        form.addEventListener("submit", (event) => {
            if (!window.confirm("Remove this item from your cart?")) {
                event.preventDefault();
            }
        });
    });
    const sortRows = (type) => {
        if (!cartList) return;
        const rows = [...cartList.querySelectorAll(".cart-row")];
        rows.sort((a, b) => {
            if (type === "title") return (a.dataset.title || "").localeCompare(b.dataset.title || "");
            if (type === "quantity") return Number(b.dataset.quantity) - Number(a.dataset.quantity);
            if (type === "price") return Number(a.dataset.price) - Number(b.dataset.price);
            return Number(a.className.match(/item-(\d+)/)?.[1] || 0) - Number(b.className.match(/item-(\d+)/)?.[1] || 0);
        });
        rows.forEach((row) => cartList.appendChild(row));
    };
    document.querySelector("#cart-sort-default")?.addEventListener("change", (event) => {
        if (event.target.checked) sortRows("default");
    });
    document.querySelector("#cart-sort-title")?.addEventListener("change", (event) => {
        if (event.target.checked) sortRows("title");
    });
    document.querySelector("#cart-sort-qty")?.addEventListener("change", (event) => {
        if (event.target.checked) sortRows("quantity");
    });
    document.querySelector("#cart-sort-price")?.addEventListener("change", (event) => {
        if (event.target.checked) sortRows("price");
    });
});