document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#checkout-form-id");
    const cardNumber = document.querySelector("#card_number");
    const cardExpiry = document.querySelector("#card_expiry");
    const cardCvv = document.querySelector("#card_cvv");

    if (!form) return;

    const STORAGE_KEY = "langco-checkout-draft";

    const draftFields = [
        "email",
        "first_name",
        "last_name",
        "address1",
        "address2",
        "city",
        "state",
        "postal_code",
        "country",
        "phone",
        "gift_note"
    ];

    const draftCheckboxes = ["newsletter", "billing_same"];

    const saveDraft = () => {
        const draft = {};

        draftFields.forEach((name) => {
            const field = form.elements.namedItem(name);
            if (field) draft[name] = field.value;
        });

        draftCheckboxes.forEach((name) => {
            const field = form.elements.namedItem(name);
            if (field) draft[name] = field.checked;
        });

        const shipping = form.elements.namedItem("shipping");
        draft.shipping = shipping?.value || "standard";

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    };

    const restoreDraft = () => {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
            const draft = JSON.parse(saved);

            draftFields.forEach((name) => {
                const field = form.elements.namedItem(name);

                if (field && draft[name] !== undefined) {
                    field.value = draft[name];
                }
            });

            draftCheckboxes.forEach((name) => {
                const field = form.elements.namedItem(name);

                if (field && draft[name] !== undefined) {
                    field.checked = draft[name];
                }
            });

            if (draft.shipping) {
                form.querySelectorAll('input[name="shipping"]').forEach((radio) => {
                    radio.checked = radio.value === draft.shipping;
                });
            }
        } catch {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    };

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

    restoreDraft();

    form.addEventListener("input", saveDraft);
    form.addEventListener("change", saveDraft);

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
            return;
        }

        sessionStorage.removeItem(STORAGE_KEY);
    });
});