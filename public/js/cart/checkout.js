document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#checkout-form-id");
    const cardNumber = document.querySelector("#card_number");
    const cardExpiry = document.querySelector("#card_expiry");
    const cardCvv = document.querySelector("#card_cvv");

    if (!form) return;

    const formatCardNumber = () => {
        const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
        cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    };

    const formatCardExpiry = () => {
        const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);

        if (digits.length <= 2) {
            cardExpiry.value = digits;
            return;
        }

        cardExpiry.value = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    };

    const formatCvv = () => {
        cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
    };

    const getValidationMessage = (field) => {
        const { validity } = field;

        if (validity.valueMissing) {
            return "This field is required.";
        }

        if (validity.typeMismatch) {
            return "Enter a valid email address.";
        }

        if (validity.tooShort) {
            return `Enter at least ${field.minLength} characters.`;
        }

        if (validity.tooLong) {
            return `Use no more than ${field.maxLength} characters.`;
        }

        if (validity.patternMismatch) {
            const messages = {
                postal_code: "Enter a valid postal code.",
                phone: "Enter a valid phone number.",
                card_number: "Enter a valid 16-digit card number.",
                card_cvv: "Enter a valid 3 or 4 digit security code."
            };

            return messages[field.name] || "Enter a valid value.";
        }

        return "";
    };

    const getExpiryError = () => {
        if (!cardExpiry?.value.trim()) {
            return "This field is required.";
        }

        const match = cardExpiry.value.match(/^(\d{2})\s*\/\s*(\d{2})$/);

        if (!match) {
            return "Enter the expiry date in MM / YY format.";
        }

        const month = Number(match[1]);
        const year = 2000 + Number(match[2]);

        if (month < 1 || month > 12) {
            return "Enter a valid expiry month.";
        }

        const now = new Date();
        const expired =
            year < now.getFullYear() ||
            (year === now.getFullYear() && month < now.getMonth() + 1);

        if (expired) {
            return "The card expiry date must not be in the past.";
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

        let message = "";

        if (field === cardExpiry) {
            message = getExpiryError();
        } else if (!field.validity.valid) {
            message = getValidationMessage(field);
        }

        field.setCustomValidity(message);
        showFieldError(field, message);

        return message === "";
    };

    const liveFields = [
        ...form.querySelectorAll(
            'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea'
        )
    ];

    liveFields
        .filter((field) => ![cardNumber, cardExpiry, cardCvv].includes(field))
        .forEach((field) => {
            field.addEventListener("input", () => validateField(field));
            field.addEventListener("change", () => validateField(field));
            field.addEventListener("blur", () => validateField(field));
        });

    cardNumber?.addEventListener("input", () => {
        formatCardNumber();
        validateField(cardNumber);
    });

    cardNumber?.addEventListener("blur", () => {
        validateField(cardNumber);
    });

    cardExpiry?.addEventListener("input", () => {
        formatCardExpiry();
        validateField(cardExpiry);
    });

    cardExpiry?.addEventListener("blur", () => {
        validateField(cardExpiry);
    });

    cardCvv?.addEventListener("input", () => {
        formatCvv();
        validateField(cardCvv);
    });

    cardCvv?.addEventListener("blur", () => {
        validateField(cardCvv);
    });

    form.addEventListener("submit", (event) => {
        let isValid = true;

        liveFields.forEach((field) => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid || !form.checkValidity()) {
            event.preventDefault();

            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            firstInvalid?.focus();
        }
    });
});