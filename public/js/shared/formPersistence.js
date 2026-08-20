"use strict";

/**
 * Restores form fields from localStorage after a page refresh.
 *
 * Usage:
 *   Add data-persist-form="unique-name" to any <form>.
 *
 * To explicitly exclude a field:
 *   Add data-no-persist to that input/select/textarea.
 *
 * Skipped automatically:
 * password, file, hidden, submit, button and reset fields.
 */

document.addEventListener("DOMContentLoaded", () => {
    const SKIP_TYPES = [
        "password",
        "file",
        "hidden",
        "submit",
        "button",
        "reset"
    ];

    const isCheckable = (field) =>
        field.type === "checkbox" ||
        field.type === "radio";

    const persistableFields = (form) =>
        Array.from(form.elements).filter(
            (field) =>
                field.matches?.("input, textarea, select") &&
                field.name &&
                !SKIP_TYPES.includes(field.type) &&
                !field.hasAttribute("data-no-persist")
        );

    const storageKeyFor = (form, field) => {
        const formKey =
            form.dataset.persistForm ||
            form.id ||
            form.action;

        const fieldKey = isCheckable(field)
            ? `${field.name}:${field.value}`
            : field.name;

        return `formPersist:${formKey}:${fieldKey}`;
    };

    document
        .querySelectorAll("form[data-persist-form]")
        .forEach((form) => {
            const fields = persistableFields(form);

            fields.forEach((field) => {
                const key = storageKeyFor(form, field);
                const saved = localStorage.getItem(key);

                // Restore previously saved value.
                if (saved !== null) {
                    if (isCheckable(field)) {
                        field.checked = saved === "true";
                    } else {
                        field.value = saved;
                    }
                }

                const saveField = () => {
                    localStorage.setItem(
                        key,
                        isCheckable(field)
                            ? String(field.checked)
                            : field.value
                    );
                };

                field.addEventListener("input", saveField);
                field.addEventListener("change", saveField);
            });

            /*
             * Only clear persisted data when the submission
             * is actually allowed to continue.
             *
             * This prevents custom validation code using
             * event.preventDefault() from destroying the draft.
             */
            form.addEventListener("submit", (event) => {
                queueMicrotask(() => {
                    if (event.defaultPrevented) {
                        return;
                    }

                    fields.forEach((field) => {
                        localStorage.removeItem(
                            storageKeyFor(form, field)
                        );
                    });
                });
            });
        });
});