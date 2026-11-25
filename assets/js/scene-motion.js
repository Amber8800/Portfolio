(() => {
  const map = document.querySelector("[data-orbit]");
  const toggle = document.querySelector(".motion-toggle");
  const resume = document.getElementById("resume");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const preference = "bridge-motion-paused";
  const textures = new Map();
  const projections = new Map();
  const surfaces = [];
  let paused = false;
  let frame = 0;
  let lastPaint = null;
  let elapsed = 0;

  try { paused = localStorage.getItem(preference) === "1"; } catch { /* Preference is optional. */ }

  function readTexture(image) {
    if (!textures.has(image.src)) {
      textures.set(image.src, image.decode().then(() => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        const strip = document.createElement("canvas");
        strip.width = 2 * width;
        strip.height = height;
        const context = strip.getContext("2d", { willReadFrequently: true });
        // Repeat the longitude map once so sampling across the seam is contiguous.
        context.drawImage(image, 0, 0);
        context.drawImage(image, width, 0);
        const pixels = context.getImageData(0, 0, strip.width, height);
        return { width, height, colors: new Uint32Array(pixels.data.buffer) };
      }));
    }
    return textures.get(image.src);
  }

  function sphereProjection(size, texture) {
    const key = [size, texture.width, texture.height].join("/");
    if (projections.has(key)) return projections.get(key);
    // Orthographic screen coordinates -> latitude and longitude. The CSS
    // circle clips the corners and the lighting stays fixed in screen space.
    const samples = new Uint32Array(size * size);
    for (let y = 0; y < size; y++) {
      const ny = 2 * (y + .5) / size - 1;
      const latitude = Math.asin(ny);
      const row = Math.floor((.5 + latitude / Math.PI) * texture.height);
      const rowStart = row * texture.width * 2;
      const radius = Math.cos(latitude);
      for (let x = 0; x < size; x++) {
        const nx = (2 * (x + .5) / size - 1) / radius;
        const longitude = Math.asin(Math.max(-1, Math.min(1, nx)));
        samples[y * size + x] = rowStart + Math.floor((.5 + longitude / (2 * Math.PI)) * texture.width);
      }
    }
    projections.set(key, samples);
    return samples;
  }

  function paint(surface, turn) {
    const { canvas, context, texture, size } = surface;
    if (canvas.width !== size) {
      canvas.width = canvas.height = size;
      surface.frame = context.createImageData(size, size);
      surface.output = new Uint32Array(surface.frame.data.buffer);
      surface.samples = sphereProjection(size, texture);
      surface.shift = -1;
    }
    const longitude = surface.start + elapsed / surface.period + turn / 1200;
    const shift = Math.floor(((longitude % 1 + 1) % 1) * texture.width);
    if (shift === surface.shift) return;
    surface.shift = shift;
    const { output, samples } = surface;
    const colors = texture.colors;
    for (let i = 0; i < samples.length; i++) output[i] = colors[samples[i] + shift];
    context.putImageData(surface.frame, 0, 0);
  }

  function moving() {
    return !paused && !reduced.matches && !document.hidden && !resume.open;
  }

  function requestPaint() {
    if (!frame && surfaces.length && !document.hidden && !resume.open) frame = requestAnimationFrame(draw);
  }

  function draw(now) {
    frame = 0;
    if (lastPaint === null || now - lastPaint >= 1000 / 30 - 1) {
      if (lastPaint !== null && moving()) elapsed += Math.min(now - lastPaint, 150) / 1000;
      lastPaint = now;
      const turn = Number(getComputedStyle(map).getPropertyValue("--orbit-turn")) || 0;
      for (const surface of surfaces) paint(surface, turn);
    }
    if (moving()) requestPaint();
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = null;
    document.body.classList.toggle("scene-playing", moving());
    document.body.classList.toggle("motion-paused", paused);
    if (paused || reduced.matches) document.body.classList.remove("booting");
    toggle.textContent = paused ? "모션 재생" : "모션 멈춤";
    toggle.hidden = reduced.matches;
    requestPaint();
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    try { localStorage.setItem(preference, paused ? "1" : "0"); } catch { /* The current tab still responds. */ }
    syncMotion();
  });
  reduced.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  new MutationObserver(syncMotion).observe(resume, { attributes: true, attributeFilter: ["open"] });
  syncMotion();

  const resolutions = [40, 80, 128, 192, 256, 320, 384];
  document.querySelectorAll(".world").forEach(async (world, index) => {
    const canvas = world.querySelector("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    let texture;
    try {
      texture = await readTexture(world.querySelector(".crust"));
    } catch {
      return; // Keep the visible source image if pixel access is unavailable.
    }
    const surface = { canvas, context, texture, size: 80, start: index * .24, period: 32 + index * 4 };
    surfaces.push(surface);
    const resize = new ResizeObserver(([entry]) => {
      const pixels = entry.contentRect.width * Math.min(devicePixelRatio, 1.35);
      surface.size = resolutions.find(size => size >= pixels) || resolutions.at(-1);
      if (!moving()) lastPaint = null;
      requestPaint();
    });
    resize.observe(canvas);
    requestPaint();
  });
})();
