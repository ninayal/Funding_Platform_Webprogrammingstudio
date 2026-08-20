"use strict";

/**
 * Restores form fields from localStorage after a page refresh.
 *
 * Usage: add data-persist-form="unique-name" to any <form>.
 * No other JS needed — this module handles every marked form
 * on every page automatically.
 *
 * Skipped automatically: password, file, hidden, submit,
 * button and reset fields are never read or written.
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

  const persistableFields = (form) =>
    Array.from(
      form.querySelectorAll("input, textarea, select")
    ).filter(
      (field) =>
        field.name &&
        !SKIP_TYPES.includes(field.type)
    );

  const storageKeyFor = (form, field) => {
    const formKey =
      form.dataset.persistForm ||
      form.id ||
      form.action;

    return `formPersist:${formKey}:${field.name}:${field.value}`;
  };

  document
    .querySelectorAll("[data-persist-form]")
    .forEach((form) => {
      const fields = persistableFields(form);

      fields.forEach((field) => {
        const key = storageKeyFor(form, field);

        const isCheckable =
          field.type === "checkbox" ||
          field.type === "radio";

        // Restore saved value
        const saved = localStorage.getItem(key);

        if (saved !== null) {
          // Don't override values the server already rendered
          // e.g. after a validation error.
          if (isCheckable) {
            if (!field.hasAttribute("checked")) {
              field.checked = saved === "true";
            }
          } else if (!field.value) {
            field.value = saved;
          }
        }

        // Save text/select values while typing
        field.addEventListener("input", () => {
          localStorage.setItem(
            key,
            isCheckable
              ? String(field.checked)
              : field.value
          );
        });

        // Save checkbox/radio/select changes
        field.addEventListener("change", () => {
          localStorage.setItem(
            key,
            isCheckable
              ? String(field.checked)
              : field.value
          );
        });
      });

      // Clear persisted data after form submission
      form.addEventListener("submit", () => {
        fields.forEach((field) => {
          localStorage.removeItem(
            storageKeyFor(form, field)
          );
        });
      });
    });
});