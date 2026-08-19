"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const submitReaction = async (form) => {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Action could not be completed.");
    }

    return result;
  };

  document.querySelectorAll("[data-vote-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("[data-vote-button]");
      const countEl = form.querySelector("[data-vote-count]");
      const kind = form.dataset.voteKind;

      const oppositeForm =
        kind === "like"
          ? form.parentElement.querySelector('[data-vote-kind="dislike"]')
          : form.parentElement.querySelector('[data-vote-kind="like"]');

      if (button) button.disabled = true;

      try {
        const result = await submitReaction(form);
        const active = kind === "like" ? result.liked : result.disliked;

        button?.classList.toggle("is-active", active);
        button?.setAttribute("aria-pressed", String(active));

        if (countEl) {
          countEl.textContent = String(
            kind === "like" ? result.likeCount : result.dislikeCount
          );
        }

        if (oppositeForm) {
          const oppositeButton = oppositeForm.querySelector("[data-vote-button]");
          const oppositeCount = oppositeForm.querySelector("[data-vote-count]");
          const oppositeActive = kind === "like" ? result.disliked : result.liked;

          oppositeButton?.classList.toggle("is-active", oppositeActive);
          oppositeButton?.setAttribute("aria-pressed", String(oppositeActive));

          if (oppositeCount) {
            oppositeCount.textContent = String(
              kind === "like" ? result.dislikeCount : result.likeCount
            );
          }
        }
      } catch (error) {
        window.alert(error.message || "Action could not be completed.");
      } finally {
        if (button) button.disabled = false;
      }
    });
  });

  document.querySelectorAll("[data-bookmark-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("[data-bookmark-button]");

      if (button) button.disabled = true;

      try {
        const result = await submitReaction(form);

        button?.classList.toggle("is-active", result.bookmarked);
        button?.setAttribute("aria-pressed", String(result.bookmarked));
      } catch (error) {
        window.alert(error.message || "Bookmark could not be updated.");
      } finally {
        if (button) button.disabled = false;
      }
    });
  });

  document.querySelectorAll("[data-report-toggle]").forEach((toggleButton) => {
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const form = toggleButton.closest(".forum-post__body").querySelector("[data-report-form]");
      if (!form) return;

      const isHidden = form.hidden;
      document.querySelectorAll("[data-report-form]").forEach((otherForm) => {
        otherForm.hidden = true;
      });
      document.querySelectorAll("[data-share-panel], [data-thread-share-panel]").forEach((panel) => {
        panel.hidden = true;
        panel
          .closest(".forum-post__share-wrap")
          ?.querySelector("[data-share-toggle], [data-thread-share-toggle]")
          ?.setAttribute("aria-expanded", "false");
      });
      form.hidden = !isHidden;
      toggleButton.setAttribute("aria-expanded", String(!isHidden));
    });
  });

  document.querySelectorAll("[data-report-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("button[type=submit]");
      if (button) button.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "Report could not be submitted.");
        }

        window.alert(result.message || "Report submitted.");
        form.hidden = true;
        if (button) button.textContent = "Reported";
      } catch (error) {
        window.alert(error.message || "Report could not be submitted.");
        if (button) button.disabled = false;
      }
    });
  });

  const closeAllSharePanels = (except) => {
    document.querySelectorAll("[data-share-panel], [data-thread-share-panel]").forEach((panel) => {
      if (panel === except) return;
      panel.hidden = true;
      panel
        .closest(".forum-post__share-wrap")
        ?.querySelector("[data-share-toggle], [data-thread-share-toggle]")
        ?.setAttribute("aria-expanded", "false");
    });
  };

  const wireSharePanel = (toggleButton, panel, permalink) => {
    const linkInput = panel.querySelector("[data-share-link]");
    if (linkInput) linkInput.value = permalink;

    const facebookLink = panel.querySelector('[data-share-network="facebook"]');
    if (facebookLink) {
      facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(permalink)}`;
    }

    const twitterLink = panel.querySelector('[data-share-network="twitter"]');
    if (twitterLink) {
      twitterLink.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(permalink)}`;
    }

    const instagramLink = panel.querySelector('[data-share-network="instagram"]');
    instagramLink?.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await navigator.clipboard.writeText(permalink);
        window.alert("Link copied! Instagram doesn't support direct web sharing, so paste it into your Instagram post or story.");
      } catch (error) {
        window.alert("Could not copy the link. Please copy it manually from the Share panel.");
      }
    });

    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isHidden = panel.hidden;
      closeAllSharePanels(isHidden ? panel : null);
      document.querySelectorAll("[data-report-form]").forEach((form) => {
        form.hidden = true;
      });
      panel.hidden = !isHidden;
      toggleButton.setAttribute("aria-expanded", String(isHidden));
    });

    panel.addEventListener("click", (event) => event.stopPropagation());
  };

  document.querySelectorAll("[data-share-toggle]").forEach((toggleButton) => {
    const wrap = toggleButton.closest(".forum-post__share-wrap");
    const panel = wrap?.querySelector("[data-share-panel]");
    if (!panel) return;

    const postId = toggleButton.dataset.postId;
    const permalink = `${window.location.origin}${window.location.pathname}#post-${postId}`;

    wireSharePanel(toggleButton, panel, permalink);
  });

  document.querySelectorAll("[data-thread-share-toggle]").forEach((toggleButton) => {
    const wrap = toggleButton.closest(".forum-post__share-wrap");
    const panel = wrap?.querySelector("[data-thread-share-panel]");
    if (!panel) return;

    const permalink = `${window.location.origin}${window.location.pathname}`;

    wireSharePanel(toggleButton, panel, permalink);
  });

  document.querySelectorAll("[data-share-copy]").forEach((copyButton) => {
    copyButton.addEventListener("click", async () => {
      const linkInput = copyButton
        .closest("[data-share-panel], [data-thread-share-panel]")
        ?.querySelector("[data-share-link]");
      if (!linkInput) return;

      try {
        await navigator.clipboard.writeText(linkInput.value);
      } catch (error) {
        linkInput.select();
        document.execCommand("copy");
      }

      const originalLabel = copyButton.textContent;
      copyButton.textContent = "Copied!";
      copyButton.disabled = true;
      setTimeout(() => {
        copyButton.textContent = originalLabel;
        copyButton.disabled = false;
      }, 1500);
    });
  });

  document.addEventListener("click", () => closeAllSharePanels(null));
});
