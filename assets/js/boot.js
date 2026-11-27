// Decide before the first body paint so the powered bridge never flashes over the closed shutter.
(() => {
  const query = new URLSearchParams(location.search);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (query.has("project") || location.hash || history.state?.bridgeDocument || reduced.matches) return;
  try {
    if (localStorage.getItem("bridge-motion-paused") === "1") return;
    if (sessionStorage.getItem("bridge-visited") && query.get("intro") !== "replay") return;
    sessionStorage.setItem("bridge-visited", "1");
  } catch {
    return;
  }

  const root = document.documentElement;
  const events = new AbortController();
  const { signal } = events;
  root.classList.add("booting");

  function finish() {
    if (signal.aborted) return;
    const restoreFocus = document.activeElement?.matches(".boot-skip");
    events.abort();
    root.classList.remove("booting", "boot-briefing");
    if (restoreFocus) document.querySelector('.planet-choice[aria-pressed="true"]')?.focus({ preventScroll: true });
  }

  // Let the original link, form or key perform its action on this same input.
  document.addEventListener("click", event => {
    if (event.target.closest("a, button, summary")) finish();
  }, { capture: true, signal });
  document.addEventListener("submit", finish, { capture: true, signal });
  document.addEventListener("focusin", event => {
    if (!event.target.matches(".boot-skip")) finish();
  }, { signal });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") finish();
  }, { signal });
  reduced.addEventListener("change", finish, { signal });
  window.addEventListener("pagehide", finish, { signal });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finish();
  }, { signal });

  // Wait for the actual projection, then use the same HUD and text sequence as a planet selection.
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const surface = document.querySelector('.planet-choice[aria-pressed="true"] .planet-system');
      const projection = surface?.getAnimations?.().find(animation => animation.animationName === "boot-on");
      if (!projection) return;
      const projected = await projection.finished.then(() => true, () => false);
      if (projected && !signal.aborted && typeof revealInitialBriefing === "function") {
        root.classList.add("boot-briefing");
        await revealInitialBriefing(signal);
      }
    } finally {
      finish();
    }
  }, { once: true, signal });
})();
