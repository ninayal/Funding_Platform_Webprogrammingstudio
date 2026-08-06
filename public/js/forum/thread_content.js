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
});
