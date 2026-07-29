"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const copyLink = document.querySelector("[data-copy-link]");
    const copyFeedback = document.querySelector("[data-copy-feedback]");
    const facebookLink = document.querySelector("[data-facebook-share]");
    const commentForm = document.querySelector("[data-comment-form]");
    const deleteForms = [
        ...document.querySelectorAll("[data-delete-comment-form]"),
    ];

    copyLink?.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            await navigator.clipboard.writeText(window.location.href);

            if (copyFeedback) {
                copyFeedback.hidden = false;

                window.setTimeout(() => {
                    copyFeedback.hidden = true;
                }, 2000);
            }
        } catch (error) {
            window.prompt("Copy this link:", window.location.href);
        }
    });

    facebookLink?.addEventListener("click", (event) => {
        event.preventDefault();

        const shareUrl =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            encodeURIComponent(window.location.href);

        window.open(
            shareUrl,
            "facebook-share",
            "width=680,height=520,noopener,noreferrer",
        );
    });

    deleteForms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            const confirmed = window.confirm(
                "Delete this comment? This action cannot be undone.",
            );

            if (!confirmed) {
                event.preventDefault();
            }
        });
    });

    if (!commentForm) {
        return;
    }

    const postId = commentForm.dataset.postId || "post";
    const storageKey = `langco.blog.commentDraft.${postId}`;

    const nameInput = commentForm.querySelector("[data-comment-name]");
    const emailInput = commentForm.querySelector("[data-comment-email]");
    const contentInput = commentForm.querySelector("[data-comment-content]");
    const countOutput = commentForm.querySelector("[data-comment-count]");
    const feedbackOutput = commentForm.querySelector(
        "[data-comment-feedback]",
    );

    const getErrorElement = (fieldName) =>
        commentForm.querySelector(`[data-error-for="${fieldName}"]`);

    const setError = (input, fieldName, message) => {
        if (!input) {
            return;
        }

        input.setAttribute("aria-invalid", message ? "true" : "false");

        const errorElement = getErrorElement(fieldName);

        if (errorElement) {
            errorElement.textContent = message;
        }
    };

    const validateName = () => {
        if (!nameInput || nameInput.readOnly) {
            return true;
        }

        const value = nameInput.value.trim();
        const valid = value.length >= 2 && value.length <= 80;

        setError(
            nameInput,
            "name",
            valid ? "" : "Name must contain between 2 and 80 characters.",
        );

        return valid;
    };

    const validateEmail = () => {
        if (!emailInput || emailInput.readOnly) {
            return true;
        }

        const value = emailInput.value.trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        setError(
            emailInput,
            "email",
            valid ? "" : "Enter a valid email address.",
        );

        return valid;
    };

    const validateContent = () => {
        if (!contentInput) {
            return false;
        }

        const value = contentInput.value.trim();
        const valid = value.length >= 3 && value.length <= 1000;

        setError(
            contentInput,
            "comment",
            valid
                ? ""
                : "Comment must contain between 3 and 1000 characters.",
        );

        if (countOutput) {
            countOutput.textContent = `${contentInput.value.length} / 1000`;
        }

        return valid;
    };

    const saveDraft = () => {
        const draft = {
            name: nameInput?.readOnly ? "" : nameInput?.value || "",
            email: emailInput?.readOnly ? "" : emailInput?.value || "",
            comment: contentInput?.value || "",
        };

        localStorage.setItem(storageKey, JSON.stringify(draft));
    };

    const restoreDraft = () => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("comment") === "added") {
            localStorage.removeItem(storageKey);
            return;
        }

        const storedDraft = localStorage.getItem(storageKey);

        if (!storedDraft) {
            return;
        }

        try {
            const draft = JSON.parse(storedDraft);

            if (nameInput && !nameInput.readOnly && !nameInput.value) {
                nameInput.value = draft.name || "";
            }

            if (emailInput && !emailInput.readOnly && !emailInput.value) {
                emailInput.value = draft.email || "";
            }

            if (contentInput && !contentInput.value) {
                contentInput.value = draft.comment || "";
            }
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
    };

    nameInput?.addEventListener("input", () => {
        validateName();
        saveDraft();
    });

    emailInput?.addEventListener("input", () => {
        validateEmail();
        saveDraft();
    });

    contentInput?.addEventListener("input", () => {
        validateContent();
        saveDraft();
    });

    commentForm.addEventListener("submit", (event) => {
        const valid = [
            validateName(),
            validateEmail(),
            validateContent(),
        ].every(Boolean);

        if (!valid) {
            event.preventDefault();

            if (feedbackOutput) {
                feedbackOutput.textContent =
                    "Correct the highlighted fields before posting.";
            }

            commentForm
                .querySelector('[aria-invalid="true"]')
                ?.focus();

            return;
        }

        if (feedbackOutput) {
            feedbackOutput.textContent = "Submitting comment…";
        }
    });

    restoreDraft();
    validateContent();
});
