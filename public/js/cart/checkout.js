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

    const validateCardExpiry = () => {
        const match = cardExpiry.value.match(/^(\d{2})\s*\/\s*(\d{2})$/);

        if (!match) {
            cardExpiry.setCustomValidity("Enter the expiry date in MM / YY format.");
            return false;
        }

        const month = Number(match[1]);
        const year = 2000 + Number(match[2]);

        if (month < 1 || month > 12) {
            cardExpiry.setCustomValidity("Enter a valid expiry month.");
            return false;
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const expired =
            year < currentYear ||
            (year === currentYear && month < currentMonth);

        if (expired) {
            cardExpiry.setCustomValidity("The card expiry date must not be in the past.");
            return false;
        }

        cardExpiry.setCustomValidity("");
        return true;
    };

    const formatCvv = () => {
        cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
    };

    cardNumber?.addEventListener("input", formatCardNumber);

    cardExpiry?.addEventListener("input", () => {
        formatCardExpiry();
        validateCardExpiry();
    });

    cardExpiry?.addEventListener("blur", validateCardExpiry);
    cardCvv?.addEventListener("input", formatCvv);

    form.addEventListener("submit", (event) => {
        validateCardExpiry();

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
        }
    });
});