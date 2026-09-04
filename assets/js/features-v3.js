const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const progress = document.querySelector("[data-page-progress]");

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.classList.remove("is-open");
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.querySelector(".sr-only").textContent = "Open menu";
  document.body.classList.remove("menu-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const nextOpen = !navMenu.classList.contains("is-open");
    navToggle.classList.toggle("is-open", nextOpen);
    navMenu.classList.toggle("is-open", nextOpen);
    navToggle.setAttribute("aria-expanded", String(nextOpen));
    navToggle.querySelector(".sr-only").textContent = nextOpen ? "Close menu" : "Open menu";
    document.body.classList.toggle("menu-open", nextOpen);
  });
  navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("is-open")) return;
    if (!event.target.closest(".nav")) closeMenu();
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

const gsapReady = Boolean(window.gsap && window.ScrollTrigger);

if (!gsapReady || reduceMotion) {
  document.documentElement.classList.add("no-gsap");
} else {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
  document.documentElement.classList.add("has-gsap");
  gsap.defaults({ ease: "power3.out" });

  const compact = window.matchMedia("(max-width: 720px)").matches;
  const scrub = compact ? 0.22 : 0.48;

  const heroIntro = gsap.timeline({ defaults: { duration: 0.95 } });
  heroIntro
    .from(".site-header .nav", { y: -28, autoAlpha: 0, duration: 0.7 })
    .from(".feature-hero__copy .kicker", { y: 18, autoAlpha: 0 }, 0.15)
    .from(".feature-hero h1 span", { yPercent: 110, autoAlpha: 0, rotate: 2 }, 0.22)
    .from(".feature-hero h1 em", { yPercent: 110, autoAlpha: 0, rotate: -2 }, 0.32)
    .from(".feature-hero__lede", { y: 24, autoAlpha: 0 }, 0.44)
    .from(".hero-actions .button", { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.56)
    .from(".hero-signals li", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.62 }, 0.68)
    .from(".hero-device--wide", { x: compact ? 70 : 140, y: 55, rotate: 12, autoAlpha: 0, scale: 0.86, duration: 1.35 }, 0.2)
    .from(".hero-device--back", { x: compact ? -45 : -95, y: 75, rotate: -16, autoAlpha: 0, scale: 0.8, duration: 1.3 }, 0.28)
    .from(".hero-device--front", { x: compact ? 35 : 78, y: 82, rotate: 13, autoAlpha: 0, scale: 0.82, duration: 1.35 }, 0.34)
    .from(".hero-orbit", { scale: 0.5, rotate: -70, autoAlpha: 0, duration: 1.55 }, 0.3)
    .from(".feature-chip", { y: 24, autoAlpha: 0, scale: 0.9, stagger: 0.1, duration: 0.65 }, 0.76);

  gsap.timeline({
    scrollTrigger: { trigger: ".feature-hero", start: "top top", end: "bottom top", scrub }
  })
    .to(".feature-hero__copy", { y: compact ? -60 : -105, autoAlpha: 0.08, ease: "none" }, 0)
    .to(".hero-device--front", { x: compact ? 35 : 85, y: compact ? 75 : 135, rotate: 10, scale: 0.9, ease: "none" }, 0)
    .to(".hero-device--back", { x: compact ? -30 : -78, y: compact ? 55 : 105, rotate: -16, scale: 0.92, ease: "none" }, 0)
    .to(".hero-device--wide", { x: compact ? 40 : 105, y: 70, rotate: 10, scale: 0.92, ease: "none" }, 0)
    .to(".hero-orbit", { rotate: 100, scale: 1.15, autoAlpha: 0.3, ease: "none" }, 0)
    .to(".feature-chip--layout", { x: 70, autoAlpha: 0, ease: "none" }, 0)
    .to(".feature-chip--sync", { x: -70, autoAlpha: 0, ease: "none" }, 0);

  const tickerTrack = document.querySelector(".creator-strip__track");
  if (tickerTrack) {
    const ticker = gsap.to(tickerTrack, { xPercent: -50, duration: compact ? 24 : 29, repeat: -1, ease: "none", force3D: true });
    ScrollTrigger.create({
      trigger: ".creator-strip", start: "top bottom", end: "bottom top",
      onEnter: () => ticker.play(), onEnterBack: () => ticker.play(),
      onLeave: () => ticker.pause(), onLeaveBack: () => ticker.pause()
    });
  }

  const palettes = gsap.utils.toArray("[data-palette]");
  const sceneOrder = ["hero", "flow", "layouts", "record", "edit", "library", "final"];
  if (palettes.length === sceneOrder.length) {
    gsap.set(palettes, { autoAlpha: 0 });
    gsap.set(palettes[0], { autoAlpha: 1 });
    sceneOrder.slice(1).forEach((name, index) => {
      const scene = document.querySelector(`[data-scene="${name}"]`);
      if (!scene) return;
      gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 95%", end: "top 32%", scrub } })
        .to(palettes[index], { autoAlpha: 0, ease: "none", duration: 1 }, 0)
        .to(palettes[index + 1], { autoAlpha: 1, ease: "none", duration: 1 }, 0);
    });
  }

  const field = document.querySelector(".atmosphere-field");
  if (field) {
    gsap.to(field, {
      xPercent: compact ? -12 : -26,
      yPercent: compact ? 46 : 72,
      rotateZ: compact ? 48 : 115,
      ease: "none",
      scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: compact ? 0.3 : 0.72 }
    });
    if (!compact) {
      const fieldSpin = gsap.to(field, { rotationY: 360, duration: 48, repeat: -1, ease: "none", force3D: true });
      ScrollTrigger.create({ trigger: "main", start: "top bottom", end: "bottom top", onEnter: () => fieldSpin.play(), onEnterBack: () => fieldSpin.play(), onLeave: () => fieldSpin.pause(), onLeaveBack: () => fieldSpin.pause() });
      gsap.to(".field-dot", { scale: 1.8, autoAlpha: 0.35, duration: 2.3, stagger: 0.65, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
  }

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    if (element.matches(".creator-fit__grid article")) return;
    gsap.from(element, {
      y: compact ? 38 : 58,
      autoAlpha: 0,
      duration: compact ? 0.72 : 0.95,
      scrollTrigger: { trigger: element, start: "top 87%", once: true }
    });
  });

  const headingMotions = [
    [".feature-flow h2", { x: -70, rotate: -1 }],
    [".layout-lab__heading h2", { y: 70, scale: 0.94 }],
    [".record-together h2", { x: 76, rotate: 1 }],
    [".fast-finish h2", { y: 64, scale: 0.92 }],
    [".project-continuity h2", { x: -68, rotate: -1 }],
    [".creator-fit h2", { x: 76, rotate: 1 }],
    [".feature-faq h2", { y: 54, scale: 0.94 }],
    [".feature-download h2", { x: -56, rotate: -1 }]
  ];
  headingMotions.forEach(([selector, fromVars]) => {
    const heading = document.querySelector(selector);
    if (!heading) return;
    gsap.from(heading, {
      ...fromVars,
      autoAlpha: 0,
      duration: compact ? 0.75 : 1.05,
      scrollTrigger: { trigger: heading, start: "top 86%", once: true }
    });
    const accent = heading.querySelector("em");
    if (accent) {
      gsap.from(accent, {
        x: compact ? 22 : 48,
        autoAlpha: 0,
        duration: compact ? 0.7 : 0.95,
        delay: 0.08,
        scrollTrigger: { trigger: heading, start: "top 86%", once: true }
      });
    }
  });

  const flowLine = document.querySelector("[data-flow-line]");
  const flowSteps = gsap.utils.toArray("[data-flow-step]");
  if (flowLine && flowSteps.length) {
    gsap.to(flowLine, {
      "--flow-progress": 1,
      ease: "none",
      scrollTrigger: { trigger: flowLine, start: "top 82%", end: "bottom 58%", scrub }
    });
    gsap.from(flowSteps, {
      y: compact ? 34 : 54,
      autoAlpha: 0,
      stagger: compact ? 0.08 : 0.13,
      duration: 0.8,
      scrollTrigger: { trigger: flowLine, start: "top 84%", once: true }
    });
  }

  const motion = gsap.matchMedia();
  motion.add("(min-width: 721px)", () => {
    const layoutSteps = gsap.utils.toArray("[data-layout-step]");
    const layoutDevices = gsap.utils.toArray("[data-layout-device]");
    const count = document.querySelector("[data-layout-count]");
    let activeIndex = 0;
    gsap.set(layoutDevices.slice(1), { autoAlpha: 0, yPercent: 25, rotate: -5, scale: 0.92 });

    const activateLayout = (nextIndex, direction = 1) => {
      if (nextIndex === activeIndex || !layoutDevices[nextIndex]) return;
      const previous = layoutDevices[activeIndex];
      const next = layoutDevices[nextIndex];
      layoutSteps.forEach((step, index) => step.classList.toggle("is-active", index === nextIndex));
      layoutDevices.forEach((device, index) => device.classList.toggle("is-active", index === nextIndex));
      gsap.killTweensOf(layoutDevices);
      layoutDevices.forEach((device) => {
        if (device !== previous && device !== next) {
          gsap.set(device, { autoAlpha: 0, xPercent: 0, yPercent: 0 });
        }
      });
      gsap.set(next, { visibility: "visible" });
      gsap.timeline()
        .to(previous, { xPercent: direction > 0 ? 125 : -125, rotate: direction > 0 ? 8 : -8, autoAlpha: 0, duration: 0.48, ease: "power2.in" }, 0)
        .fromTo(next,
          { xPercent: 0, yPercent: direction > 0 ? 36 : -30, rotate: direction > 0 ? -5 : 5, scale: 0.9, autoAlpha: 0 },
          { xPercent: 0, yPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 0.62, ease: "power3.out" },
          0.04
        );
      gsap.fromTo(layoutSteps[nextIndex].querySelectorAll("h3, p, li"),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.035, duration: 0.44, overwrite: true }
      );
      activeIndex = nextIndex;
      if (count) count.textContent = String(nextIndex + 1).padStart(2, "0");
    };

    layoutSteps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 54%",
        end: "bottom 46%",
        onEnter: () => activateLayout(index, 1),
        onEnterBack: () => activateLayout(index, -1)
      });
    });
  });

  gsap.fromTo(".record-together__device",
    { xPercent: compact ? 12 : 22, yPercent: 14, rotate: 5, scale: 0.92 },
    { xPercent: compact ? -4 : -7, yPercent: -6, rotate: -2, scale: 1, ease: "none", scrollTrigger: { trigger: ".record-together", start: "top 88%", end: "bottom 18%", scrub } }
  );

  gsap.to(".editor-device", {
    yPercent: compact ? -8 : -16,
    rotate: compact ? 1 : -2,
    ease: "none",
    scrollTrigger: { trigger: ".finish-card--editor", start: "top bottom", end: "bottom top", scrub }
  });
  gsap.to(".export-pulse > i", {
    rotate: 24,
    scale: 1.08,
    ease: "none",
    scrollTrigger: { trigger: ".finish-card--export", start: "top bottom", end: "bottom top", scrub }
  });

  const libraryCards = gsap.utils.toArray(".library-card");
  if (libraryCards.length) {
    gsap.from(libraryCards, {
      y: compact ? 70 : 120,
      x: (index) => index ? 45 : -45,
      rotate: (index) => index ? 12 : -12,
      autoAlpha: 0,
      stagger: 0.18,
      duration: 1,
      scrollTrigger: { trigger: ".library-stack", start: "top 82%", once: true }
    });
    libraryCards.forEach((card, index) => {
      gsap.to(card, { y: index ? -40 : -65, ease: "none", scrollTrigger: { trigger: ".project-continuity", start: "top bottom", end: "bottom top", scrub } });
    });
  }

  gsap.from(".creator-fit__grid article", {
    y: compact ? 34 : 70,
    rotationY: compact ? 0 : -18,
    rotationX: compact ? 0 : 8,
    autoAlpha: 0,
    stagger: 0.1,
    duration: compact ? 0.72 : 1,
    transformOrigin: "50% 100%",
    scrollTrigger: { trigger: ".creator-fit__grid", start: "top 84%", once: true }
  });

  gsap.to(".feature-download__mark", {
    y: compact ? -12 : -28,
    rotate: compact ? 2 : 4,
    ease: "none",
    scrollTrigger: { trigger: ".feature-download", start: "top bottom", end: "bottom top", scrub }
  });
  gsap.to(".feature-download__mark > span", {
    rotate: 120,
    ease: "none",
    scrollTrigger: { trigger: ".feature-download", start: "top bottom", end: "bottom top", scrub }
  });

  motion.add("(min-width: 941px) and (hover: hover) and (pointer: fine)", () => {
    const heroVisual = document.querySelector(".feature-hero__visual");
    const heroFront = document.querySelector(".hero-device--front");
    const heroBack = document.querySelector(".hero-device--back");
    if (!heroVisual || !heroFront || !heroBack) return undefined;
    const frontX = gsap.quickTo(heroFront, "x", { duration: 0.8, ease: "power3.out" });
    const frontY = gsap.quickTo(heroFront, "y", { duration: 0.8, ease: "power3.out" });
    const backX = gsap.quickTo(heroBack, "x", { duration: 1.05, ease: "power3.out" });
    const backY = gsap.quickTo(heroBack, "y", { duration: 1.05, ease: "power3.out" });
    const onPointer = (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      frontX(nx * 24); frontY(ny * 18); backX(nx * -18); backY(ny * -13);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  });

  document.querySelectorAll(".feature-faq details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".feature-faq details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}
