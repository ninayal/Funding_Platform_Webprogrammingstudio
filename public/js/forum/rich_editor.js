"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ALLOWED_URL_PATTERN = /^(https?:|mailto:)/i;
  const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const initEditor = (root) => {
    const content = root.querySelector("[data-rich-editor-content]");
    const hiddenInput = root.querySelector("[data-rich-editor-input]");
    const imageInput = root.querySelector("[data-rich-editor-image-input]");
    const form = root.closest("form");

    if (!content || !hiddenInput || !form) {
      return;
    }

    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch (error) {
      // Some browsers don't support this command; falls back to their default behavior.
    }

    let savedRange = null;

    const saveRange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (content.contains(range.commonAncestorContainer)) {
        savedRange = range.cloneRange();
      }
    };

    const restoreRange = () => {
      content.focus();
      const selection = window.getSelection();
      selection.removeAllRanges();
      if (savedRange) {
        selection.addRange(savedRange);
      }
    };

    const syncHiddenInput = () => {
      const html = content.innerHTML.trim();
      hiddenInput.value = html === "<br>" ? "" : html;
    };

    const updateActiveStates = () => {
      root.querySelectorAll("[data-cmd]").forEach((button) => {
        let active = false;
        try {
          active = document.queryCommandState(button.dataset.cmd);
        } catch (error) {
          active = false;
        }
        button.classList.toggle("is-active", active);
      });
    };

    content.addEventListener("input", syncHiddenInput);
    content.addEventListener("keyup", updateActiveStates);
    content.addEventListener("mouseup", updateActiveStates);
    content.addEventListener("blur", saveRange);

    root.querySelectorAll("[data-cmd]").forEach((button) => {
      button.addEventListener("click", () => {
        content.focus();
        document.execCommand(button.dataset.cmd, false, null);
        syncHiddenInput();
        updateActiveStates();
      });
    });

    root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "link") {
          saveRange();
          const url = window.prompt("Enter a URL:");
          if (!url) return;

          const trimmedUrl = url.trim();
          if (!ALLOWED_URL_PATTERN.test(trimmedUrl)) {
            window.alert("Please enter a valid http(s) or mailto link.");
            return;
          }

          const label = savedRange && !savedRange.collapsed ? savedRange.toString() : trimmedUrl;
          restoreRange();
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${escapeHtml(trimmedUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
          );
          syncHiddenInput();
        }

        if (action === "image" && imageInput) {
          saveRange();
          imageInput.click();
        }
      });
    });

    if (imageInput) {
      imageInput.addEventListener("change", () => {
        const file = imageInput.files && imageInput.files[0];
        imageInput.value = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
          window.alert("Please choose an image file.");
          return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
          window.alert("Image is too large (max 3MB).");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          restoreRange();
          document.execCommand("insertHTML", false, `<img src="${reader.result}" alt="">`);
          syncHiddenInput();
        };
        reader.readAsDataURL(file);
      });
    }

    form.addEventListener("submit", (event) => {
      syncHiddenInput();

      const hasImage = /<img\b/i.test(hiddenInput.value);
      const isEmpty = !hasImage && content.textContent.trim() === "";

      if (isEmpty) {
        event.preventDefault();
        root.classList.add("is-invalid");
        content.focus();
      } else {
        root.classList.remove("is-invalid");
      }
    });
  };

  document.querySelectorAll("[data-rich-editor]").forEach(initEditor);
});
