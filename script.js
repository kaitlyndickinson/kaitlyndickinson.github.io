document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- starfield ---------- */
(function starfield() {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let w, h, dpr;
  let scrollY = window.scrollY;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 7000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      // depth drives size, brightness and parallax speed
      z: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.2,
    }));
    if (reduceMotion) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const twinkle = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(t * 0.001 * s.speed + s.phase);
      const y = (((s.y - scrollY * s.z * 0.08) % h) + h) % h;
      ctx.globalAlpha = s.z * 0.8 * twinkle;
      ctx.fillStyle = s.z > 0.85 ? "#dfe8ff" : "#aab6cc";
      ctx.beginPath();
      ctx.arc(s.x, y, s.z * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    draw(t);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    if (reduceMotion) draw(0);
  }, { passive: true });

  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();

/* ---------- nav state + scroll progress ---------- */
(function nav() {
  const navEl = document.querySelector(".site-nav");
  const bar = document.querySelector(".scroll-progress");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    if (navEl) navEl.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!navEl || !("IntersectionObserver" in window)) return;
  const links = new Map(
    [...navEl.querySelectorAll('.nav-links a[href^="#"]')].map((a) => [a.getAttribute("href").slice(1), a])
  );
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((a) => a.classList.remove("active"));
      links.get(entry.target.id)?.classList.add("active");
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();

/* ---------- reveal on scroll ---------- */
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  items.forEach((el) => observer.observe(el));
})();

/* ---------- card glow follows cursor ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
});

/* ---------- copy email ---------- */
(function copyEmail() {
  const toast = document.querySelector(".toast");
  let timer;
  document.querySelectorAll(".copy-email").forEach((link) => {
    link.addEventListener("click", async (e) => {
      if (!navigator.clipboard || !toast) return; // fall back to mailto
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(link.dataset.email);
        toast.textContent = `copied ${link.dataset.email}`;
      } catch {
        window.location.href = link.href;
        return;
      }
      toast.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("show"), 2200);
    });
  });
})();

