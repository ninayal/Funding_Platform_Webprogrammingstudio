(() => {
  "use strict";

  const lightbox =
    document.querySelector(
      "#review-image-lightbox"
    );

  if (!lightbox) {
    return;
  }

  const lightboxDialog =
    lightbox.querySelector(
      ".pr-image-lightbox__dialog"
    );

  const lightboxImage =
    lightbox.querySelector(
      "#review-lightbox-image"
    );

  const lightboxCaption =
    lightbox.querySelector(
      "#review-lightbox-caption"
    );

  const closeButtons = [
    ...lightbox.querySelectorAll(
      "[data-close-review-lightbox]"
    )
  ];

  let lastTrigger = null;

  const openLightbox = (
    trigger
  ) => {
    const sourceImage =
      trigger.querySelector(
        "img"
      );

    if (
      !sourceImage ||
      !lightboxImage
    ) {
      return;
    }

    lastTrigger = trigger;

    lightboxImage.src =
      sourceImage.currentSrc ||
      sourceImage.src;

    lightboxImage.alt =
      sourceImage.alt || "";

    if (lightboxCaption) {
      lightboxCaption.textContent =
        sourceImage.alt || "";
    }

    lightbox.hidden = false;

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "pr-lightbox-open"
    );

    window.setTimeout(
      () => {
        closeButtons[0]?.focus();
      },
      20
    );
  };

  const closeLightbox = () => {
    if (lightbox.hidden) {
      return;
    }

    lightbox.hidden = true;

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "pr-lightbox-open"
    );

    if (lightboxImage) {
      lightboxImage.removeAttribute(
        "src"
      );

      lightboxImage.alt = "";
    }

    if (lightboxCaption) {
      lightboxCaption.textContent =
        "";
    }

    lastTrigger?.focus();
  };

  document.addEventListener(
    "click",
    (event) => {
      const trigger =
        event.target.closest(
          "[data-review-lightbox]"
        );

      if (!trigger) {
        return;
      }

      event.preventDefault();
      openLightbox(trigger);
    }
  );

  closeButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        closeLightbox
      );
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (lightbox.hidden) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (
        event.key === "Tab" &&
        lightboxDialog
      ) {
        event.preventDefault();
        closeButtons[0]?.focus();
      }
    }
  );
})();
