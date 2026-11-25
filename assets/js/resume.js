const resume = document.getElementById("resume");
const resumeOpener = document.querySelector("[data-open-resume]");
const closeResume = resume.querySelector("[data-close-resume]");

if (typeof resume.showModal === "function") {
  resumeOpener.addEventListener("click", (event) => {
    event.preventDefault();
    resume.showModal();
    document.documentElement.classList.add("modal-open");
    closeResume.focus({ preventScroll: true });
  });
  closeResume.addEventListener("click", (event) => {
    if (!resume.open) return;
    event.preventDefault();
    resume.close();
  });
  resume.addEventListener("click", (event) => {
    if (event.target !== resume) return;
    const box = resume.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) resume.close();
  });
  resume.addEventListener("close", () => {
    document.documentElement.classList.remove("modal-open");
    resumeOpener.focus({ preventScroll: true });
  });
}
