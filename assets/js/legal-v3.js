const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const progressShell = document.createElement("div");
progressShell.className = "legal-progress";
progressShell.setAttribute("aria-hidden", "true");
progressShell.innerHTML = "<span></span>";
document.body.prepend(progressShell);
const progress = progressShell.firstElementChild;

const atmosphere = document.createElement("div");
atmosphere.className = "legal-atmosphere";
atmosphere.setAttribute("aria-hidden", "true");
atmosphere.innerHTML = `
  <div class="legal-palette legal-palette--hero" data-legal-palette></div>
  <div class="legal-palette legal-palette--summary" data-legal-palette></div>
  <div class="legal-palette legal-palette--content" data-legal-palette></div>
  <div class="legal-palette legal-palette--contact" data-legal-palette></div>
  <div class="legal-field"><span></span><span></span><span></span><span></span></div>
`;
document.body.prepend(atmosphere);

const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.classList.remove("is-open");
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  const label = navToggle.querySelector(".screen-reader-only");
  if (label) label.textContent = "Open menu";
  document.body.classList.remove("menu-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const nextOpen = !navMenu.classList.contains("is-open");
    navToggle.classList.toggle("is-open", nextOpen);
    navMenu.classList.toggle("is-open", nextOpen);
    navToggle.setAttribute("aria-expanded", String(nextOpen));
    const label = navToggle.querySelector(".screen-reader-only");
    if (label) label.textContent = nextOpen ? "Close menu" : "Open menu";
    document.body.classList.toggle("menu-open", nextOpen);
  });
  navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (navMenu.classList.contains("is-open") && !event.target.closest(".nav")) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 940) closeMenu();
  }, { passive: true });
}

let interfaceFrame = 0;
const updateInterface = () => {
  interfaceFrame = 0;
  const scrollTop = window.scrollY;
  const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  if (progress) progress.style.transform = `scaleX(${Math.min(scrollTop / scrollRange, 1)})`;
  if (header) header.classList.toggle("is-scrolled", scrollTop > 28);
};
const queueInterfaceUpdate = () => {
  if (interfaceFrame) return;
  interfaceFrame = window.requestAnimationFrame(updateInterface);
};
window.addEventListener("scroll", queueInterfaceUpdate, { passive: true });
window.addEventListener("resize", queueInterfaceUpdate, { passive: true });
updateInterface();

const tocLinks = Array.from(document.querySelectorAll(".legal-toc a[href^='#']"));
const setActiveToc = (id) => {
  tocLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${id}`));
};
if (tocLinks[0]) tocLinks[0].classList.add("is-active");

const gsapReady = Boolean(window.gsap && window.ScrollTrigger);
if (!gsapReady || reduceMotion) {
  document.documentElement.classList.add("no-gsap");
  const tocTargets = tocLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if (tocTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveToc(visible.target.id);
    }, { rootMargin: "-25% 0px -58%", threshold: [0, .2, .45] });
    tocTargets.forEach((target) => observer.observe(target));
  }
} else {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
  document.documentElement.classList.add("has-gsap");
  gsap.defaults({ ease: "power3.out" });

  const compact = window.matchMedia("(max-width: 720px)").matches;
  const scrub = compact ? 0.2 : 0.46;

  const intro = gsap.timeline({ defaults: { duration: compact ? 0.68 : 0.92 } });
  intro
    .from(".site-header .nav", { y: -25, autoAlpha: 0, duration: 0.65 })
    .from(".legal-hero__copy .section-label", { y: 18, autoAlpha: 0 }, 0.12)
    .from(".legal-hero h1", { y: compact ? 45 : 80, rotate: -1.5, autoAlpha: 0 }, 0.2)
    .from(".legal-hero h1 span", { x: compact ? 24 : 56, autoAlpha: 0 }, 0.34)
    .from(".legal-hero__description", { y: 24, autoAlpha: 0 }, 0.42)
    .from(".legal-hero .button-row > *", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.53)
    .from(".legal-hero__meta", { y: 14, autoAlpha: 0, duration: 0.55 }, 0.64)
    .from(".legal-hero__visual", { x: compact ? 35 : 80, y: 55, rotate: 9, scale: 0.78, autoAlpha: 0, duration: 1.2 }, 0.22)
    .from(".legal-hero__ring", { scale: 0.55, rotate: -50, autoAlpha: 0, stagger: 0.13, duration: 1 }, 0.4)
    .from(".legal-app-mark", { scale: 0.55, autoAlpha: 0, duration: 0.82 }, 0.55)
    .from(".legal-fact", { y: 22, scale: 0.85, autoAlpha: 0, stagger: 0.09, duration: 0.58 }, 0.68);

  gsap.timeline({ scrollTrigger: { trigger: ".legal-hero", start: "top top", end: "bottom top", scrub } })
    .to(".legal-hero__copy", { y: compact ? -45 : -90, autoAlpha: 0.08, ease: "none" }, 0)
    .to(".legal-hero__visual", { y: compact ? 30 : 85, rotate: compact ? 7 : 18, scale: 0.92, autoAlpha: 0.28, ease: "none" }, 0)
    .to(".legal-hero__ring--outer", { rotate: 95, ease: "none" }, 0)
    .to(".legal-hero__ring--inner", { rotate: -115, ease: "none" }, 0)
    .to(".legal-fact--pending", { x: compact ? -12 : -55, y: -28, ease: "none" }, 0)
    .to(".legal-fact--cancel", { x: compact ? 12 : 55, y: 12, ease: "none" }, 0)
    .to(".legal-fact--billing", { x: compact ? 10 : 42, y: 38, ease: "none" }, 0);

  const palettes = gsap.utils.toArray("[data-legal-palette]");
  const scenes = [".legal-hero", ".deletion-summary", ".legal-content-stage", ".legal-contact"];
  if (palettes.length === scenes.length) {
    gsap.set(palettes, { autoAlpha: 0 });
    gsap.set(palettes[0], { autoAlpha: 1 });
    scenes.slice(1).forEach((selector, index) => {
      const scene = document.querySelector(selector);
      if (!scene) return;
      gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 98%", end: "top 32%", scrub } })
        .to(palettes[index], { autoAlpha: 0, duration: 1, ease: "none" }, 0)
        .to(palettes[index + 1], { autoAlpha: 1, duration: 1, ease: "none" }, 0);
    });
  }

  const field = document.querySelector(".legal-field");
  if (field) {
    gsap.to(field, { xPercent: compact ? -18 : -34, yPercent: compact ? 48 : 88, rotate: compact ? 48 : 124, ease: "none", scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: compact ? 0.28 : 0.68 } });
  }

  gsap.from(".legal-heading > *", { y: compact ? 32 : 55, autoAlpha: 0, stagger: 0.1, duration: compact ? 0.72 : 0.95, scrollTrigger: { trigger: ".deletion-summary", start: "top 84%", once: true } });
  gsap.from(".summary-card", { y: compact ? 35 : 75, rotationY: compact ? 0 : -15, rotationX: compact ? 0 : 7, autoAlpha: 0, stagger: 0.11, duration: 0.88, transformOrigin: "50% 100%", scrollTrigger: { trigger: ".deletion-summary__grid", start: "top 84%", once: true } });
  gsap.to(".summary-card:nth-child(2)", { y: compact ? 0 : -28, ease: "none", scrollTrigger: { trigger: ".deletion-summary", start: "top bottom", end: "bottom top", scrub } });

  gsap.utils.toArray(".legal-article").forEach((article, index) => {
    gsap.from(article, { x: compact ? 0 : (index % 2 ? 52 : -52), y: compact ? 34 : 55, rotate: compact ? 0 : (index % 2 ? 0.7 : -0.7), autoAlpha: 0, duration: compact ? 0.72 : 0.92, scrollTrigger: { trigger: article, start: "top 88%", once: true } });
    const heading = article.querySelector("h2");
    if (heading) gsap.from(heading, { y: 23, autoAlpha: 0, duration: 0.65, delay: 0.06, scrollTrigger: { trigger: article, start: "top 88%", once: true } });
  });

  gsap.from(".legal-contact > *", { y: compact ? 30 : 55, autoAlpha: 0, stagger: 0.12, duration: 0.82, scrollTrigger: { trigger: ".legal-contact", start: "top 85%", once: true } });

  tocLinks.forEach((link) => {
    const target = document.querySelector(link.hash);
    if (!target) return;
    ScrollTrigger.create({ trigger: target, start: "top 42%", end: "bottom 42%", onEnter: () => setActiveToc(target.id), onEnterBack: () => setActiveToc(target.id) });
  });

  const motion = gsap.matchMedia();
  motion.add("(min-width: 941px) and (hover: hover) and (pointer: fine)", () => {
    const visual = document.querySelector(".legal-hero__visual");
    const mark = document.querySelector(".legal-app-mark");
    if (!visual || !mark) return undefined;
    const moveX = gsap.quickTo(mark, "x", { duration: 0.8, ease: "power3.out" });
    const moveY = gsap.quickTo(mark, "y", { duration: 0.8, ease: "power3.out" });
    const onPointer = (event) => {
      const rect = visual.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      const ny = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
      moveX(nx * 18);
      moveY(ny * 14);
    };
    visual.addEventListener("pointermove", onPointer, { passive: true });
    return () => visual.removeEventListener("pointermove", onPointer);
  });

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}
