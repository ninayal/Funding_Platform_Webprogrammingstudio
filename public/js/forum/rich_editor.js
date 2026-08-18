"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ALLOWED_URL_PATTERN = /^(https?:|mailto:)/i;
  const QUOTE_URL_PATTERN = /\/forum\/thread\/([^/?#\s]+)#post-([0-9a-fA-F-]+)/;
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
    const previewToggle = root.querySelector("[data-preview-toggle]");
    const previewPanel = root.querySelector("[data-rich-editor-preview]");
    const counterEl = root.querySelector("[data-rich-editor-counter]");
    const maxTextLength = Number(root.dataset.maxText || 0);
    const form = root.closest("form");

    if (!content || !hiddenInput || !form) {
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    const updateCounter = () => {
      if (!counterEl || !maxTextLength) {
        return;
      }

      const length = content.textContent.trim().length;
      counterEl.textContent = `${length}/${maxTextLength}`;

      const isOver = length > maxTextLength;
      counterEl.classList.toggle("is-over", isOver);

      if (submitButton) {
        submitButton.disabled = isOver;
      }
    };

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

    const insertLinkHtml = (url, label) => {
      restoreRange();
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      );
      syncHiddenInput();
    };

    const insertQuoteEmbedHtml = (data) => {
      restoreRange();
      const embed =
        `<blockquote class="forum-quote-embed"><a href="${escapeHtml(data.permalink)}" class="forum-quote-embed__link" target="_blank" rel="noopener noreferrer">` +
        `<span class="forum-quote-embed__author">${escapeHtml(data.author)}</span>` +
        `<span class="forum-quote-embed__snippet">${escapeHtml(data.snippet)}</span></a></blockquote><p><br></p>`;
      document.execCommand("insertHTML", false, embed);
      syncHiddenInput();
    };

    // If the URL points at a post on this forum, fetch that post and embed it
    // as a quote card instead of inserting a plain link.
    const tryInsertQuoteEmbed = (url) => {
      const match = url.match(QUOTE_URL_PATTERN);
      if (!match) return false;

      const [, slug, postId] = match;

      fetch(`/forum/thread/${slug}/post/${postId}/quote`, {
        headers: { Accept: "application/json" },
      })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => {
          if (!data || !data.ok) throw new Error("Preview unavailable");
          insertQuoteEmbedHtml(data);
        })
        .catch(() => insertLinkHtml(url, url));

      return true;
    };

    content.addEventListener("input", () => {
      syncHiddenInput();
      updateCounter();
    });
    content.addEventListener("keyup", updateActiveStates);
    content.addEventListener("mouseup", updateActiveStates);
    content.addEventListener("blur", saveRange);

    content.addEventListener("paste", (event) => {
      const clipboard = event.clipboardData || window.clipboardData;
      const pasted = clipboard ? clipboard.getData("text").trim() : "";

      if (pasted && QUOTE_URL_PATTERN.test(pasted) && ALLOWED_URL_PATTERN.test(pasted)) {
        event.preventDefault();
        saveRange();
        tryInsertQuoteEmbed(pasted);
      }
    });

    if (previewToggle && previewPanel) {
      previewToggle.addEventListener("click", () => {
        const isPreviewing = !previewPanel.hidden;

        if (isPreviewing) {
          previewPanel.hidden = true;
          content.hidden = false;
          previewToggle.textContent = "Preview";
        } else {
          syncHiddenInput();
          previewPanel.innerHTML = hiddenInput.value || "<p><em>Nothing to preview yet.</em></p>";
          previewPanel.hidden = false;
          content.hidden = true;
          previewToggle.textContent = "Edit";
        }
      });
    }

    syncHiddenInput();
    updateCounter();

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
          const url = window.prompt("Enter a URL (paste a forum post link to embed it as a quote):");
          if (!url) return;

          const trimmedUrl = url.trim();
          if (!ALLOWED_URL_PATTERN.test(trimmedUrl)) {
            window.alert("Please enter a valid http(s) or mailto link.");
            return;
          }

          if (tryInsertQuoteEmbed(trimmedUrl)) return;

          const label = savedRange && !savedRange.collapsed ? savedRange.toString() : trimmedUrl;
          insertLinkHtml(trimmedUrl, label);
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
