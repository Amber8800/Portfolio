const map = document.querySelector("[data-orbit]");
const camera = map.closest("[data-camera]");
const briefingHost = document.getElementById("project-briefing");
const flightShortcut = document.querySelector(".flight-shortcut");
const choices = Array.from(map.querySelectorAll("[data-project]"));
const indexButtons = document.querySelectorAll(".project-index button");
const courses = map.querySelectorAll("[data-course]");
const listLayout = matchMedia("(max-width: 899px)");
const status = document.getElementById("selection-status");
const graphemes = Intl.Segmenter && new Intl.Segmenter("ko", { granularity: "grapheme" });
let selected = choices[0];
let selectionVersion = 0;
let writingFrame = 0;
let writingDone = null;

function finishWriting() {
  cancelAnimationFrame(writingFrame);
  writingFrame = 0;
  CSS.highlights?.delete("brief-unwritten");
  briefingHost.classList.remove("media-pending");
  if (writingDone) writingDone();
  writingDone = null;
}

function writeBriefing(article) {
  if (!graphemes || !window.Highlight || !CSS.highlights) return;
  // Mask only the unwritten ink so wrapping and accessible text stay intact.
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const stops = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.data.trim() || node.parentElement.closest("a, figcaption")) continue;
    for (const { index, segment } of graphemes.segment(node.data)) {
      stops.push({ node, end: index + segment.length });
    }
  }
  if (!stops.length) return;
  const tail = new Range();
  tail.setStart(stops[0].node, 0);
  tail.setEnd(stops.at(-1).node, stops.at(-1).end);
  CSS.highlights.set("brief-unwritten", new Highlight(tail));
  const mediaCue = Math.ceil(stops.length * .8);
  briefingHost.classList.add("media-pending");

  const start = performance.now();
  const stepTime = Math.min(20, 1200 / stops.length);
  function advance(now) {
    const written = Math.floor((now - start) / stepTime);
    const compactList = listLayout.matches && !document.documentElement.classList.contains("boot-briefing");
    if (written >= stops.length || !document.body.classList.contains("scene-playing") || compactList) {
      finishWriting();
      return;
    }
    if (written > 0) {
      const { node, end } = stops[written - 1];
      tail.setStart(node, end);
      briefingHost.classList.toggle("media-pending", written < mediaCue);
    }
    writingFrame = requestAnimationFrame(advance);
  }
  return new Promise(resolve => {
    writingDone = resolve;
    writingFrame = requestAnimationFrame(advance);
  });
}

function flyTo(choice, animate) {
  const view = getComputedStyle(camera);
  const bearing = Number(view.getPropertyValue("--camera-bearing"));
  const distance = Number(view.getPropertyValue("--camera-distance"));
  const targetRadius = Number(view.getPropertyValue("--camera-target"));
  const orbit = getComputedStyle(choice);
  const destination = parseFloat(orbit.getPropertyValue("--base"));
  const destinationRadius = orbit.getPropertyValue("--radius");
  const shortestTurn = ((destination - bearing + 180) % 360 + 360) % 360 - 180;

  // A new target inherits the actual camera pose, including an interrupted approach.
  camera.classList.add("instant");
  camera.style.setProperty("--bearing-from", String(bearing));
  camera.style.setProperty("--bearing-to", String(bearing + shortestTurn));
  camera.style.setProperty("--distance-from", String(distance));
  camera.style.setProperty("--distance-to", choice.dataset.cameraDistance);
  camera.style.setProperty("--target-from", String(targetRadius));
  camera.style.setProperty("--target-to", destinationRadius);
  camera.style.setProperty("--flight-progress", "0");
  view.getPropertyValue("--flight-progress");
  if (animate) camera.classList.remove("instant");
  camera.style.setProperty("--flight-progress", "1");
  view.getPropertyValue("--flight-progress");
  const flight = camera.getAnimations?.().find(animation => animation.transitionProperty === "--flight-progress");
  camera.classList.remove("instant");
  return flight;
}

// Re-selection, reduced motion or a layout change can cancel an animation.
function finishedNormally(animation) {
  return animation.finished.then(() => true, () => false);
}

// Both a camera arrival and the first projection acquire the HUD before drawing its lead.
async function revealBriefing(choice, version) {
  choice.dataset.hud = "drawing";
  const arcs = (choice.getAnimations?.({ subtree: true }) ?? []).filter(animation =>
    animation.animationName === "hud-draw" || animation.animationName === "mobile-hud-lock");
  const completed = await Promise.all(arcs.map(finishedNormally));
  if (version !== selectionVersion) return;

  delete choice.dataset.hud;
  let traced = false;
  if (completed.every(Boolean)) {
    briefingHost.classList.add("brief-arrival");
    const trace = briefingHost.querySelector(".hud-rule").getAnimations?.()
      .find(animation => animation.animationName === "brief-trace");
    if (trace) traced = await finishedNormally(trace);
    if (version !== selectionVersion) return;
  }
  briefingHost.removeAttribute("aria-busy");
  if (traced) await writeBriefing(briefingHost.querySelector(".briefing"));
}

function revealInitialBriefing(signal) {
  const version = ++selectionVersion;
  const choice = selected;
  briefingHost.setAttribute("aria-busy", "true");
  signal.addEventListener("abort", () => {
    if (version !== selectionVersion) return;
    ++selectionVersion;
    delete choice.dataset.hud;
    briefingHost.classList.remove("brief-arrival");
    briefingHost.removeAttribute("aria-busy");
    finishWriting();
  }, { once: true });
  return revealBriefing(choice, version);
}

async function selectProject(choice, announce = true) {
  if (choice === selected) return;
  const version = ++selectionVersion;
  const name = choice.querySelector("strong").textContent;
  const template = document.getElementById("brief-template-" + choice.dataset.project);
  const nextBriefing = template.content.cloneNode(true);
  finishWriting();
  selected.setAttribute("aria-pressed", "false");
  delete selected.dataset.hud;
  choice.dataset.hud = "in-flight";
  choice.setAttribute("aria-pressed", "true");
  selected = choice;
  for (const button of indexButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.destination === choice.dataset.project));
  }
  for (const course of courses) {
    course.classList.toggle("is-current", course.dataset.course === choice.dataset.project);
  }
  briefingHost.classList.remove("brief-arrival");
  briefingHost.setAttribute("aria-busy", "true");
  briefingHost.replaceChildren(nextBriefing);
  flightShortcut.href = choice.formAction;
  flightShortcut.dataset.document = choice.dataset.project;
  flightShortcut.textContent = name + " 상세 바로가기";
  if (announce) status.textContent = name + " 프로젝트 선택";

  const turn = flyTo(choice, announce && document.body.classList.contains("scene-playing"));
  const arrived = turn && await finishedNormally(turn);
  if (version !== selectionVersion) return;
  if (!arrived) {
    delete choice.dataset.hud;
    briefingHost.removeAttribute("aria-busy");
    return;
  }
  await revealBriefing(choice, version);
  if (version === selectionVersion && announce) status.textContent = name + " 브리핑 열림";
}

map.addEventListener("submit", (event) => {
  const trigger = event.submitter;
  const choice = choices.includes(trigger) ? trigger : choices.find(button => button.dataset.project === trigger?.dataset.destination);
  if (!choice) return;
  event.preventDefault();
  selectProject(choice);
});

// A reloaded document keeps the original planet beneath it. Shared links start at their own planet.
const initialSlug = history.state?.bridgeDocument?.returnProject ?? new URLSearchParams(location.search).get("project");
const initial = choices.find((button) => button.dataset.project === initialSlug);
if (initial) selectProject(initial, false);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) finishWriting();
});
