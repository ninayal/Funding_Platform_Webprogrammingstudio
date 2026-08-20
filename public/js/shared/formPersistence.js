"use strict";

/**
 * Restores form fields from sessionStorage after a page refresh.
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
      (field) => !SKIP_TYPES.includes(field.type)
    );

  const storageKeyFor = (form, field) => {
    const formKey =
      form.dataset.persistForm ||
      form.id ||
      form.action;

    return `formPersist:${formKey}:${field.name}`;
  };

  document
    .querySelectorAll("[data-persist-form]")
    .forEach((form) => {
      const fields = persistableFields(form);

      fields.forEach((field) => {
        const key = storageKeyFor(form, field);
        const saved = sessionStorage.getItem(key);

        if (saved === null) {
          return;
        }

        const isCheckable =
          field.type === "checkbox" ||
          field.type === "radio";

        // Don't override values the server already rendered
        // (e.g. re-populated after a validation error).
        if (isCheckable) {
          if (!field.hasAttribute("checked")) {
            field.checked = saved === "true";
          }
        } else if (!field.value) {
          field.value = saved;
        }

        field.addEventListener("input", () => {
          sessionStorage.setItem(key, field.value);
        });

        field.addEventListener("change", () => {
          sessionStorage.setItem(
            key,
            isCheckable ? String(field.checked) : field.value
          );
        });
      });

      form.addEventListener("submit", () => {
        fields.forEach((field) => {
          sessionStorage.removeItem(storageKeyFor(form, field));
        });
      });
    });
});