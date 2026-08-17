"use strict";


/* =========================================
   CONSTANTS
========================================= */

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const allowedGiftTypes =
    new Set([
        "lang-impact",
        "donation-in-honour",
    ]);


const allowedDeliveryTypes =
    new Set([
        "digital",
        "printable",
        "physical",
    ]);


const allowedDesignTypes =
    new Set([
        "ho-tay-lotus",
        "bat-trang-blue",
        "van-phuc-silk",
        "ha-thai-lacquer",
        "hoi-an-glow",
        "phu-vinh-bamboo",
    ]);


const allowedCauses =
    new Set([
        "craft-preservation",
        "education",
        "community-support",
        "environment",
        "artisan-support",
    ]);


const allowedEmailTimings =
    new Set([
        "Send immediately",
        "Schedule delivery",
    ]);


const allowedPrintFormats =
    new Set([
        "Flat Card",
        "Folded Card",
        "Postcard Style",
    ]);


const allowedPaperSizes =
    new Set([
        "A4",
        "A5",
        "A6",
    ]);


/* =========================================
   HELPERS
========================================= */

const cleanText = (value) =>
    String(value || "").trim();


/* =========================================
   VALIDATE GIFTCARD
========================================= */

const validateGiftcard = (
    body = {},
) => {
    const values = {
        giftType:
            cleanText(
                body.giftType,
            ),

        deliveryType:
            cleanText(
                body.deliveryType,
            ),

        designType:
            cleanText(
                body.designType,
            ),

        quantity:
            Number(
                body.quantity,
            ),

        amountPerCard:
            Number(
                body.amountPerCard,
            ),

        recipientName:
            cleanText(
                body.recipientName,
            ),

        senderName:
            cleanText(
                body.senderName,
            ),

        message:
            cleanText(
                body.message,
            ),

        causeCategory:
            cleanText(
                body.causeCategory,
            ),

        causeNote:
            cleanText(
                body.causeNote,
            ),

        recipientEmail:
            cleanText(
                body.recipientEmail,
            ),

        emailTiming:
            cleanText(
                body.emailTiming,
            ),

        emailDeliveryDate:
            cleanText(
                body.emailDeliveryDate,
            ),

        printFormat:
            cleanText(
                body.printFormat,
            ),

        paperSize:
            cleanText(
                body.paperSize,
            ),

        downloadFormat:
            cleanText(
                body.downloadFormat,
            ),

        recipientPhone:
            cleanText(
                body.recipientPhone,
            ),

        physicalDeliveryDate:
            cleanText(
                body.physicalDeliveryDate,
            ),

        streetAddress:
            cleanText(
                body.streetAddress,
            ),

        district:
            cleanText(
                body.district,
            ),

        city:
            cleanText(
                body.city,
            ),

        postalCode:
            cleanText(
                body.postalCode,
            ),
    };


    const errors = {};


    /* =========================================
       GIFT TYPE
    ========================================= */

    if (
        !allowedGiftTypes.has(
            values.giftType,
        )
    ) {
        errors.giftType =
            "Choose a valid gift type.";
    }


    /* =========================================
       DELIVERY TYPE
    ========================================= */

    if (
        !allowedDeliveryTypes.has(
            values.deliveryType,
        )
    ) {
        errors.deliveryType =
            "Choose a valid delivery type.";
    }


    /* =========================================
       DESIGN
    ========================================= */

    if (
        !allowedDesignTypes.has(
            values.designType,
        )
    ) {
        errors.designType =
            "Choose a valid design.";
    }


    /* =========================================
       QUANTITY
    ========================================= */

    if (
        !Number.isInteger(
            values.quantity,
        ) ||
        values.quantity < 1 ||
        values.quantity > 20
    ) {
        errors.quantity =
            "Quantity must be between 1 and 20.";
    }


    /* =========================================
       AMOUNT
    ========================================= */

    if (
        !Number.isFinite(
            values.amountPerCard,
        ) ||
        values.amountPerCard < 5 ||
        values.amountPerCard > 10000
    ) {
        errors.amountPerCard =
            "Amount must be between $5 and $10,000.";
    }


    /* =========================================
       RECIPIENT
    ========================================= */

    if (
        values.recipientName.length < 2 ||
        values.recipientName.length > 60
    ) {
        errors.recipientName =
            "Recipient name must be 2–60 characters.";
    }


    /* =========================================
       SENDER
    ========================================= */

    if (
        values.senderName.length < 2 ||
        values.senderName.length > 60
    ) {
        errors.senderName =
            "Sender name must be 2–60 characters.";
    }


    /* =========================================
       MESSAGE
    ========================================= */

    if (
        values.message.length < 5 ||
        values.message.length > 280
    ) {
        errors.message =
            "Message must be 5–280 characters.";
    }


    /* =========================================
       DONATION IN HONOUR
    ========================================= */

    if (
        values.giftType ===
        "donation-in-honour"
    ) {
        if (
            !allowedCauses.has(
                values.causeCategory,
            )
        ) {
            errors.causeCategory =
                "Choose a valid donation cause.";
        }

        if (
            values.causeNote.length > 180
        ) {
            errors.causeNote =
                "Cause note cannot exceed 180 characters.";
        }
    }


    /* =========================================
       DIGITAL ECARD
    ========================================= */

    if (
        values.deliveryType ===
        "digital"
    ) {
        if (
            !EMAIL_PATTERN.test(
                values.recipientEmail,
            )
        ) {
            errors.recipientEmail =
                "Enter a valid recipient email.";
        }


        if (
            !allowedEmailTimings.has(
                values.emailTiming,
            )
        ) {
            errors.emailTiming =
                "Choose a valid email delivery option.";
        }


        if (
            values.emailTiming ===
            "Schedule delivery" &&
            !values.emailDeliveryDate
        ) {
            errors.emailDeliveryDate =
                "Choose a delivery date.";
        }
    }


    /* =========================================
       PRINTABLE
    ========================================= */

    if (
        values.deliveryType ===
        "printable"
    ) {
        if (
            !allowedPrintFormats.has(
                values.printFormat,
            )
        ) {
            errors.printFormat =
                "Choose a valid print format.";
        }


        if (
            !allowedPaperSizes.has(
                values.paperSize,
            )
        ) {
            errors.paperSize =
                "Choose a valid paper size.";
        }
    }


    /* =========================================
       PHYSICAL CARD
    ========================================= */

    if (
        values.deliveryType ===
        "physical"
    ) {
        if (
            values.recipientPhone.length < 7
        ) {
            errors.recipientPhone =
                "Enter a valid phone number.";
        }


        if (
            !values.streetAddress
        ) {
            errors.streetAddress =
                "Street address is required.";
        }


        if (
            !values.district
        ) {
            errors.district =
                "District is required.";
        }


        if (
            !values.city
        ) {
            errors.city =
                "City or province is required.";
        }
    }


    /* =========================================
       RESULT
    ========================================= */

    return {
        values,

        errors,

        valid:
            Object.keys(
                errors,
            ).length === 0,
    };
};


/* =========================================
   EXPORT
========================================= */

module.exports = {
    validateGiftcard,
};