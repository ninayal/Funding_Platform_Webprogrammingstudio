document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#checkout-form-id");
    if (!form) return;

    const STORAGE_KEY = "checkoutFormData";

    const cardNumber = form.querySelector("#card_number");
    const cardExpiry = form.querySelector("#card_expiry");
    const cardCvv = form.querySelector("#card_cvv");

    const messages = {
        email: "Enter a valid email address.",
        first_name: "Enter your first name.",
        last_name: "Enter your last name.",
        address1: "Enter a valid street address.",
        city: "Enter your city.",
        state: "Enter your state or province.",
        postal_code: "Enter a valid postal code.",
        country: "Select a country.",
        phone: "Enter a valid phone number.",
        card_name: "Enter the name shown on the card.",
        card_number: "Enter a valid 16-digit card number.",
        card_cvv: "Enter a valid 3 or 4 digit security code."
    };

    const saveFormData = () => {
        const data = {};

        fields.forEach((field) => {
            if (field.name) {
                data[field.name] = field.value;
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const restoreFormData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        const data = JSON.parse(savedData);

        fields.forEach((field) => {
            if (field.name && data[field.name] !== undefined) {
                field.value = data[field.name];
            }
        });
    };

    const clearFormData = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const formatCardNumber = () => {
        const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
        cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    };

    const formatCardExpiry = () => {
        const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
        cardExpiry.value =
            digits.length <= 2
                ? digits
                : `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    };

    const formatCvv = () => {
        cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
    };

    const getExpiryError = () => {
        if (!cardExpiry.value.trim()) return "This field is required.";

        const match = cardExpiry.value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
        if (!match) return "Enter the expiry date in MM / YY format.";

        const month = Number(match[1]);
        const year = 2000 + Number(match[2]);

        if (month < 1 || month > 12) return "Enter a valid expiry month.";

        const now = new Date();
        const expired =
            year < now.getFullYear() ||
            (year === now.getFullYear() && month < now.getMonth() + 1);

        return expired ? "The card expiry date must not be in the past." : "";
    };

    const getValidationMessage = (field) => {
        const { validity } = field;

        if (validity.valueMissing) {
            return field.tagName === "SELECT"
                ? messages[field.name] || "Select an option."
                : "This field is required.";
        }

        if (validity.typeMismatch) {
            return messages[field.name] || "Enter a valid value.";
        }

        if (validity.tooShort) {
            return `Enter at least ${field.minLength} characters.`;
        }

        if (validity.tooLong) {
            return `Use no more than ${field.maxLength} characters.`;
        }

        if (validity.patternMismatch) {
            return messages[field.name] || "Enter a valid value.";
        }

        return "";
    };

    const showFieldError = (field, message) => {
        const group = field.closest(".form-group");
        if (!group) return;

        let error = group.querySelector(".field-error");

        if (message) {
            if (!error) {
                error = document.createElement("p");
                error.className = "field-error";
                group.appendChild(error);
            }

            error.textContent = message;
            error.hidden = false;
            field.setAttribute("aria-invalid", "true");
            return;
        }

        if (error) {
            error.textContent = "";
            error.hidden = true;
        }

        field.removeAttribute("aria-invalid");
    };

    const validateField = (field) => {
        field.setCustomValidity("");

        if (!field.required && !field.value.trim()) {
            showFieldError(field, "");
            return true;
        }

        const message =
            field === cardExpiry
                ? getExpiryError()
                : field.validity.valid
                    ? ""
                    : getValidationMessage(field);

        field.setCustomValidity(message);
        showFieldError(field, message);

        return !message;
    };

    const fields = [
        ...form.querySelectorAll(
            'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea'
        )
    ];

    restoreFormData();

    fields.forEach((field) => {
        field.addEventListener("input", () => {
            saveFormData();
            validateField(field);
        });

        field.addEventListener("change", () => {
            saveFormData();
            validateField(field);
        });

        field.addEventListener("blur", () => {
            validateField(field);
        });
    });

    cardNumber?.addEventListener("input", () => {
        formatCardNumber();
        saveFormData();
        validateField(cardNumber);
    });

    cardExpiry?.addEventListener("input", () => {
        formatCardExpiry();
        saveFormData();
        validateField(cardExpiry);
    });

    cardCvv?.addEventListener("input", () => {
        formatCvv();
        saveFormData();
        validateField(cardCvv);
    });

    [cardNumber, cardExpiry, cardCvv].forEach((field) => {
        field?.addEventListener("blur", () => validateField(field));
    });

    form.addEventListener("submit", (event) => {
        const isValid = fields.every(validateField);

        if (isValid && form.checkValidity()) {
            clearFormData();
            return;
        }

        event.preventDefault();
        form.querySelector('[aria-invalid="true"]')?.focus();
    });
});