(() => {
  const dialog = document.getElementById("project-document");
  if (typeof dialog.showModal !== "function") return;
  const documentBody = dialog.querySelector(".document-body");
  let opener = null;
  let returning = false;

  function syncDocument() {
    returning = false;
    const url = new URL(location.href);
    const slug = url.searchParams.get("project");
    const template = document.getElementById("document-template-" + slug);
    const showScreen = url.hash === "#service-screen";
    if (template && (url.hash === "#briefing" || showScreen)) {
      documentBody.replaceChildren(template.content.cloneNode(true));
      if (!dialog.open) {
        // Reload and Forward should restore the sheet underneath this document too.
        if (!opener && history.state?.bridgeDocument?.fromResume) {
          const resumeDialog = document.getElementById("resume");
          if (!resumeDialog.open) resumeDialog.showModal();
          opener = resumeDialog.querySelector(`[data-document="${CSS.escape(slug)}"]`);
        }
        opener ??= document.activeElement === document.body ? null : document.activeElement;
        dialog.showModal();
      }
      documentBody.scrollTop = 0;
      if (showScreen) {
        const figure = documentBody.querySelector(".service-figure");
        figure?.scrollIntoView({ block: "start" });
        figure?.querySelector("a")?.focus({ preventScroll: true });
      }
      return;
    }
    if (!dialog.open) return;
    dialog.close();
    documentBody.replaceChildren();
    const returnTo = opener?.isConnected && opener.getClientRects().length
      ? opener : document.querySelector('.planet-choice[aria-pressed="true"]');
    returnTo?.focus({ preventScroll: true });
    opener = null;
  }

  // Real hrefs still open the standalone document in a new tab or without JavaScript.
  document.addEventListener("click", event => {
    const link = event.target.closest("a[data-document]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey) return;
    const url = new URL(location.href);
    url.searchParams.set("project", link.dataset.document);
    url.hash = link.hash || "briefing";
    const returnProject = document.querySelector('.planet-choice[aria-pressed="true"]').dataset.project;
    const bridgeDocument = { returnProject, fromResume: !!link.closest("#resume") };
    history.pushState({ ...history.state, bridgeDocument }, "", url);
    event.preventDefault();
    opener = link;
    syncDocument();
  });

  function dismiss() {
    if (returning) return;
    if (history.state?.bridgeDocument) {
      returning = true;
      history.back();
    } else {
      // A shared document URL can be the first entry in this tab.
      const url = new URL(location.href);
      url.hash = "";
      history.replaceState(history.state, "", url);
      syncDocument();
    }
  }

  dialog.querySelector(".document-close").addEventListener("click", dismiss);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    dismiss();
  });
  let pressedBackdrop = false;
  dialog.addEventListener("pointerdown", event => { pressedBackdrop = event.target === dialog; });
  dialog.addEventListener("click", event => {
    if (pressedBackdrop && event.target === dialog) dismiss();
  });
  window.addEventListener("popstate", syncDocument);
  syncDocument();
})();
