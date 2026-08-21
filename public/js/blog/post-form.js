"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-post-form]");
  if (!form) return;

  const feedback = form.querySelector("[data-post-feedback]");

  const getField = (name) => form.querySelector(`[data-post-field="${name}"]`);
  const getError = (name) => form.querySelector(`[data-post-error="${name}"]`);

  const setError = (name, message) => {
    const field = getField(name);
    const error = getError(name);

    field?.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;

    return !message;
  };

  const validateField = (name, publishing) => {
    const field = getField(name);
    if (!field) return true;

    const value = field.value.trim();
    let message = "";

    if (name === "title") {
      if (!value) {
        message = "Enter a post title.";
      } else if (value.length > 150) {
        message = "Title must not exceed 150 characters.";
      } else if (publishing && value.length < 5) {
        message = "Published titles require at least 5 characters.";
      }
    }

    if (name === "category") {
      const validCategory = field.options
        ? Array.from(field.options).some((option) => !option.disabled && option.value === value)
        : false;

      if (!value || !validCategory) message = "Select a valid category.";
    }

    if (name === "imageUrl") {
      if (value && !/^https?:\/\/\S+$/i.test(value)) {
        message = "Image URL must begin with http:// or https://.";
      } else if (publishing && !value) {
        message = "Published posts require an image URL.";
      }
    }

    if (name === "summary" && publishing && (value.length < 20 || value.length > 400)) {
      message = "Summary must contain between 20 and 400 characters.";
    }

    if (name === "content" && publishing && (value.length < 50 || value.length > 20000)) {
      message = "Content must contain between 50 and 20,000 characters.";
    }

    if (name === "tags") {
      const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
      if (tags.length > 12) message = "Use no more than 12 tags.";
    }

    return setError(name, message);
  };

  const updateCount = (name, maximum) => {
    const field = getField(name);
    const output = form.querySelector(`[data-post-count="${name}"]`);
    if (field && output) output.textContent = `${field.value.length} / ${maximum}`;
  };

  const previewImage = document.querySelector("[data-preview-image]");
  const previewPlaceholder = document.querySelector("[data-preview-placeholder]");
  const previewTitle = document.querySelector("[data-preview-title]");
  const previewSummary = document.querySelector("[data-preview-summary]");
  const previewCategory = document.querySelector("[data-preview-category]");
  const previewStatus = document.querySelector("[data-preview-status]");
  const previewStatusText = document.querySelector("[data-preview-status-text]");

  const updatePreview = () => {
    const title = getField("title")?.value.trim() || "Your story title";
    const summary = getField("summary")?.value.trim() || "Your summary will appear here as you type.";
    const category = getField("category")?.value || "Guide";
    const imageUrl = getField("imageUrl")?.value.trim() || "";

    if (previewTitle) previewTitle.textContent = title;
    if (previewSummary) previewSummary.textContent = summary;
    if (previewCategory) previewCategory.textContent = category;

    if (previewImage) {
      if (imageUrl) {
        previewImage.src = imageUrl;
        previewImage.hidden = false;
        if (previewPlaceholder) previewPlaceholder.hidden = true;
      } else {
        previewImage.removeAttribute("src");
        previewImage.hidden = true;
        if (previewPlaceholder) previewPlaceholder.hidden = false;
      }
    }
  };

  previewImage?.addEventListener("error", () => {
    previewImage.hidden = true;
    if (previewPlaceholder) {
      previewPlaceholder.hidden = false;
      previewPlaceholder.textContent = "Image could not be loaded";
    }
  });

  form.addEventListener("input", (event) => {
    const name = event.target.dataset.postField;
    if (name) validateField(name, false);

    updateCount("title", 150);
    updateCount("summary", 400);
    updateCount("content", 20000);
    updatePreview();
  });

  form.addEventListener("change", () => updatePreview());

  form.addEventListener("submit", (event) => {
    const requestedStatus = event.submitter?.value || "draft";
    const publishing = requestedStatus === "published";

    const valid = [
      validateField("title", publishing),
      validateField("category", publishing),
      validateField("tags", publishing),
      validateField("imageUrl", publishing),
      validateField("summary", publishing),
      validateField("content", publishing)
    ].every(Boolean);

    if (!valid) {
      event.preventDefault();
      if (feedback) feedback.textContent = "Correct the highlighted fields before continuing.";
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    if (previewStatus) previewStatus.textContent = publishing ? "Published" : "Draft";
    if (previewStatusText) previewStatusText.textContent = publishing ? "Published" : "Draft";
    if (feedback) feedback.textContent = publishing ? "Publishing post…" : "Saving draft…";
  });

  updateCount("title", 150);
  updateCount("summary", 400);
  updateCount("content", 20000);
  updatePreview();
});