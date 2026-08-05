document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#checkout-form-id");
    if (!form) return;
    const storageKey = "checkoutDeliveryDraft";
    const draftFields = ["email", "first_name", "last_name", "address1", "address2", "city", "state", "postal_code", "country", "phone", "gift_note"];
    const getField = (name) => form.elements.namedItem(name);
    const showError = (input, message) => {
        const error = document.querySelector(`#${input.id}-error`);
        input.setCustomValidity(message);
        input.setAttribute("aria-invalid", message ? "true" : "false");
        if (error) error.textContent = message;
    };
    const validateField = (input) => {
        const value = input.value.trim();
        let message = "";
        if (input.required && !value) message = "This field is required.";
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address.";
        else if (input.name === "phone" && !/^\+?[0-9\s().-]{7,20}$/.test(value)) message = "Enter a valid phone number.";
        else if (input.name === "postal_code" && !/^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/.test(value)) message = "Enter a valid postal code.";
        else if (input.name === "card_number" && !/^\d{16}$/.test(value.replace(/\s/g, ""))) message = "Enter a 16-digit card number.";
        else if (input.name === "card_expiry" && !/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(value)) message = "Use MM / YY format.";
        else if (input.name === "card_cvv" && !/^\d{3,4}$/.test(value)) message = "Enter a 3 or 4-digit security code.";
        else if (input.minLength > 0 && value.length < input.minLength) message = `Enter at least ${input.minLength} characters.`;
        showError(input, message);
        return !message;
    };
    const saveDraft = () => {
        const draft = {};
        draftFields.forEach((name) => {
            const field = getField(name);
            if (field) draft[name] = field.value;
        });
        localStorage.setItem(storageKey, JSON.stringify(draft));
    };
    const restoreDraft = () => {
        try {
            const draft = JSON.parse(localStorage.getItem(storageKey));
            if (!draft) return;
            draftFields.forEach((name) => {
                const field = getField(name);
                if (field && draft[name] !== undefined) field.value = draft[name];
            });
        } catch {
            localStorage.removeItem(storageKey);
        }
    };
    form.querySelectorAll("input,select,textarea").forEach((input) => {
        if (["card_number", "card_expiry", "card_cvv"].includes(input.name)) return;
        input.addEventListener("input", saveDraft);
        input.addEventListener("change", saveDraft);
    });
    form.querySelectorAll("[required]").forEach((input) => {
        input.addEventListener("input", () => validateField(input));
        input.addEventListener("blur", () => validateField(input));
    });
    const cardNumber = getField("card_number");
    cardNumber?.addEventListener("input", () => {
        const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
        cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
        validateField(cardNumber);
    });
    const cardExpiry = getField("card_expiry");
    cardExpiry?.addEventListener("input", () => {
        const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
        cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
        validateField(cardExpiry);
    });
    const cardCvv = getField("card_cvv");
    cardCvv?.addEventListener("input", () => {
        cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
        validateField(cardCvv);
    });
    form.addEventListener("submit", (event) => {
        const requiredFields = [...form.querySelectorAll("[required]")];
        const valid = requiredFields.every(validateField);
        if (!valid) {
            event.preventDefault();
            requiredFields.find((input) => !input.checkValidity())?.focus();
        }
    });
    restoreDraft();
});