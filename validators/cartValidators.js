const validateCheckout = (body) => {
    const errors = {};
    const requiredFields = [
        "email",
        "first_name",
        "last_name",
        "address1",
        "city",
        "state",
        "postal_code",
        "country",
        "phone",
        "card_name",
        "card_number",
        "card_expiry",
        "card_cvv",
        "shipping"
    ];
    requiredFields.forEach((field) => {
        if (!String(body[field] || "").trim()) {
            errors[field] = "This field is required.";
        }
    });
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.email = "Enter a valid email address.";
    }
    if (body.phone && !/^\+?[0-9\s().-]{7,20}$/.test(body.phone)) {
        errors.phone = "Enter a valid phone number.";
    }
    if (body.postal_code && !/^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/.test(body.postal_code)) {
        errors.postal_code = "Enter a valid postal code.";
    }
    const cardNumber = String(body.card_number || "").replace(/\s/g, "");
    if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
        errors.card_number = "Enter a 16-digit card number.";
    }
    if (body.card_expiry && !/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(body.card_expiry)) {
        errors.card_expiry = "Use MM / YY format.";
    }
    if (body.card_cvv && !/^\d{3,4}$/.test(body.card_cvv)) {
        errors.card_cvv = "Enter a 3 or 4-digit security code.";
    }
    if (body.shipping && !["standard", "express"].includes(body.shipping)) {
        errors.shipping = "Select a valid shipping method.";
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
module.exports = {
    validateCheckout
};