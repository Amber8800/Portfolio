const map = document.querySelector("[data-orbit]");
const choices = Array.from(map.querySelectorAll("[data-project]"));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const listLayout = matchMedia("(max-width: 899px)");
const status = document.getElementById("selection-status");
let selected = choices[0];

function finishBoot() {
  document.body.classList.remove("booting");
}

function bootOnce() {
  try {
    if (sessionStorage.getItem("bridge-visited")) return;
    sessionStorage.setItem("bridge-visited", "1");
    if (localStorage.getItem("bridge-motion-paused") === "1") return;
  } catch {
    // A blocked store still leaves the fully lit, interactive layout available.
    return;
  }
  if (reducedMotion.matches || listLayout.matches) return;
  document.body.classList.add("booting");
  for (const event of ["pointerdown", "focusin", "keydown"]) {
    document.addEventListener(event, finishBoot, { once: true, capture: true });
  }
  setTimeout(finishBoot, 800);
}

function selectProject(choice, announce = true) {
  finishBoot();
  if (choice === selected) return;
  selected = choice;
  map.style.setProperty("--focus-base", choice.style.getPropertyValue("--base"));
  for (const button of choices) {
    const active = button === choice;
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-pressed", String(active));
    panel.hidden = !active;
    panel.inert = !active;
  }

  // The registered CSS property gives the actual interpolated angle, even
  // when the visitor picks another world in the middle of the 420ms turn.
  const angle = Number(getComputedStyle(map).getPropertyValue("--orbit-turn")) || 0;
  const destination = -choices.indexOf(choice) * (360 / choices.length);
  const shortestTurn = ((destination - angle + 180) % 360 + 360) % 360 - 180;
  map.style.setProperty("--orbit-turn", String(angle + shortestTurn));
  if (announce) {
    status.textContent = choice.querySelector("strong").textContent + " 프로젝트 선택";
  }
}

map.addEventListener("submit", (event) => {
  const choice = event.submitter;
  if (!choices.includes(choice)) return;
  event.preventDefault();
  selectProject(choice);
});

// Returning from a case study restores that project directly.
const initialSlug = new URLSearchParams(location.search).get("project");
const initial = choices.find((button) => button.dataset.project === initialSlug);
if (initial) {
  map.classList.add("instant");
  selectProject(initial, false);
  requestAnimationFrame(() => requestAnimationFrame(() => map.classList.remove("instant")));
} else {
  bootOnce();
}
reducedMotion.addEventListener("change", finishBoot);
listLayout.addEventListener("change", finishBoot);
