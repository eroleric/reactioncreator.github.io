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
  const label = navToggle.querySelector(".sr-only");
  if (label) label.textContent = "Open menu";
  document.body.classList.remove("menu-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const nextOpen = !navMenu.classList.contains("is-open");
    navToggle.classList.toggle("is-open", nextOpen);
    navMenu.classList.toggle("is-open", nextOpen);
    navToggle.setAttribute("aria-expanded", String(nextOpen));
    const label = navToggle.querySelector(".sr-only");
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

const planButtons = Array.from(document.querySelectorAll("[data-plan-button]"));
const planPanels = Array.from(document.querySelectorAll("[data-plan-panel]"));
const paceNodes = Array.from(document.querySelectorAll("[data-pace-node]"));
const paceNumber = document.querySelector("[data-pace-number]");
const paceLabel = document.querySelector("[data-pace-label]");
const paceTier = document.querySelector("[data-pace-tier]");
const paceValues = [
  { tier: "Premium Annual", number: "∞", label: "unlimited exports" },
  { tier: "Premium Monthly", number: "15", label: "exports / day" },
  { tier: "Free preview", number: "3", label: "exports / day" }
];
let activePlan = 0;

const setPlanState = (nextIndex, shouldFocus = false) => {
  const index = Math.max(0, Math.min(nextIndex, planButtons.length - 1));
  if (!planButtons[index] || !planPanels[index]) return;

  planButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  paceNodes.forEach((node, nodeIndex) => node.classList.toggle("is-active", nodeIndex === index));
  if (paceTier) paceTier.textContent = paceValues[index].tier;
  if (paceNumber) paceNumber.textContent = paceValues[index].number;
  if (paceLabel) paceLabel.textContent = paceValues[index].label;

  const oldPanel = planPanels[activePlan];
  const newPanel = planPanels[index];
  if (oldPanel !== newPanel && window.gsap && !reduceMotion) {
    planPanels.forEach((panel) => {
      if (panel === oldPanel || panel === newPanel) return;
      window.gsap.killTweensOf([panel, ...panel.querySelectorAll("*")]);
      panel.hidden = true;
      panel.classList.remove("is-active");
    });
    window.gsap.killTweensOf([oldPanel, newPanel]);
    window.gsap.to(oldPanel, {
      xPercent: index > activePlan ? -8 : 8,
      autoAlpha: 0,
      duration: 0.24,
      ease: "power2.in",
      onComplete: () => {
        oldPanel.hidden = true;
        oldPanel.classList.remove("is-active");
      }
    });
    newPanel.hidden = false;
    newPanel.classList.add("is-active");
    window.gsap.fromTo(newPanel,
      { xPercent: index > activePlan ? 8 : -8, y: 18, autoAlpha: 0 },
      { xPercent: 0, y: 0, autoAlpha: 1, duration: 0.52, delay: 0.13, ease: "power3.out", clearProps: "transform,opacity,visibility" }
    );
    window.gsap.fromTo(newPanel.querySelectorAll("h3, .plan-panel__copy > p, li, .button, .plan-panel__meter"),
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.035, duration: 0.4, delay: 0.2, ease: "power2.out", overwrite: true }
    );
    if (paceNumber) {
      window.gsap.fromTo(paceNumber, { yPercent: 28, autoAlpha: 0, scale: 0.84 }, { yPercent: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" });
    }
  } else {
    planPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  }
  activePlan = index;
  if (shouldFocus) planButtons[index].focus();
};

planButtons.forEach((button, index) => {
  button.addEventListener("click", () => setPlanState(index));
  button.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % planButtons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + planButtons.length) % planButtons.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = planButtons.length - 1;
    else return;
    event.preventDefault();
    setPlanState(nextIndex, true);
  });
});

document.querySelectorAll(".pricing-faq details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".pricing-faq details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

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
  const scrub = compact ? 0.2 : 0.46;

  const intro = gsap.timeline({ defaults: { duration: compact ? 0.68 : 0.92 } });
  intro
    .from(".site-header .nav", { y: -25, autoAlpha: 0, duration: 0.65 })
    .from(".pricing-hero__copy .kicker", { y: 18, autoAlpha: 0 }, 0.12)
    .from(".pricing-hero h1 span", { yPercent: 105, rotate: -2, autoAlpha: 0 }, 0.2)
    .from(".pricing-hero h1 em", { yPercent: 105, rotate: 2, autoAlpha: 0 }, 0.3)
    .from(".pricing-hero__copy > p:last-of-type", { y: 25, autoAlpha: 0 }, 0.42)
    .from(".pricing-hero__actions > *", { y: 20, autoAlpha: 0, stagger: 0.09, duration: 0.65 }, 0.54)
    .from(".pace-orbit", { scale: 0.58, rotate: -35, autoAlpha: 0, duration: 1.25 }, 0.18)
    .from(".pace-orbit__ring", { scale: 0.55, rotate: -50, autoAlpha: 0, stagger: 0.12, duration: 1.1 }, 0.35)
    .from(".pace-orbit__core", { scale: 0.55, autoAlpha: 0, duration: 0.9 }, 0.48)
    .from(".pace-node", { y: 24, scale: 0.8, autoAlpha: 0, stagger: 0.1, duration: 0.65 }, 0.58);

  gsap.timeline({ scrollTrigger: { trigger: ".pricing-hero", start: "top top", end: "bottom top", scrub } })
    .to(".pricing-hero__copy", { y: compact ? -45 : -95, autoAlpha: 0.08, ease: "none" }, 0)
    .to(".pace-orbit", { y: compact ? 38 : 95, rotate: compact ? 18 : 42, scale: 0.9, autoAlpha: 0.3, ease: "none" }, 0)
    .to(".pace-node--free", { x: compact ? -18 : -65, y: -25, ease: "none" }, 0)
    .to(".pace-node--monthly", { x: compact ? 18 : 65, y: 10, ease: "none" }, 0)
    .to(".pace-node--annual", { x: compact ? 15 : 50, y: 45, ease: "none" }, 0);

  const tickerTrack = document.querySelector(".pricing-mantra > div");
  if (tickerTrack) {
    const ticker = gsap.to(tickerTrack, { xPercent: -50, duration: compact ? 25 : 32, repeat: -1, ease: "none", force3D: true });
    ScrollTrigger.create({
      trigger: ".pricing-mantra", start: "top bottom", end: "bottom top",
      onEnter: () => ticker.play(), onEnterBack: () => ticker.play(),
      onLeave: () => ticker.pause(), onLeaveBack: () => ticker.pause()
    });
  }

  const palettes = gsap.utils.toArray("[data-pricing-palette]");
  const sceneSelectors = [".pricing-hero", ".plan-studio", ".comparison", ".upgrade-logic", ".pricing-faq"];
  if (palettes.length === sceneSelectors.length) {
    gsap.set(palettes, { autoAlpha: 0 });
    gsap.set(palettes[0], { autoAlpha: 1 });
    sceneSelectors.slice(1).forEach((selector, index) => {
      gsap.timeline({ scrollTrigger: { trigger: selector, start: "top 96%", end: "top 32%", scrub } })
        .to(palettes[index], { autoAlpha: 0, duration: 1, ease: "none" }, 0)
        .to(palettes[index + 1], { autoAlpha: 1, duration: 1, ease: "none" }, 0);
    });
  }

  const rings = document.querySelector(".pricing-rings");
  if (rings) {
    gsap.to(rings, {
      xPercent: compact ? -15 : -32,
      yPercent: compact ? 45 : 86,
      rotate: compact ? 45 : 115,
      ease: "none",
      scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: compact ? 0.28 : 0.68 }
    });
  }

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.from(element, {
      y: compact ? 35 : 56,
      autoAlpha: 0,
      duration: compact ? 0.72 : 0.95,
      scrollTrigger: { trigger: element, start: "top 87%", once: true }
    });
  });

  const headingMotions = [
    [".plan-studio h2", { x: compact ? -22 : -68, rotate: -1 }],
    [".comparison h2", { y: compact ? 35 : 65, scale: 0.94 }],
    [".upgrade-logic h2", { x: compact ? 25 : 72, rotate: 1 }],
    [".billing-trust h2", { y: compact ? 35 : 64, scale: 0.94 }],
    [".pricing-faq h2", { x: compact ? -22 : -62, rotate: -1 }],
    [".pricing-download h2", { y: compact ? 35 : 62, scale: 0.94 }]
  ];
  headingMotions.forEach(([selector, vars]) => {
    const heading = document.querySelector(selector);
    if (!heading) return;
    gsap.from(heading, { ...vars, autoAlpha: 0, duration: compact ? 0.74 : 1.05, scrollTrigger: { trigger: heading, start: "top 86%", once: true } });
  });

  gsap.from(".plan-tabs button", {
    y: compact ? 20 : 42,
    rotateX: compact ? 0 : -10,
    autoAlpha: 0,
    stagger: 0.1,
    duration: 0.78,
    transformOrigin: "50% 100%",
    scrollTrigger: { trigger: ".plan-tabs", start: "top 86%", once: true }
  });
  gsap.from(".plan-panel.is-active", {
    y: compact ? 28 : 60,
    scale: 0.96,
    autoAlpha: 0,
    duration: 0.95,
    scrollTrigger: { trigger: ".plan-panels", start: "top 83%", once: true }
  });

  gsap.from(".comparison tbody tr", {
    x: (index) => index % 2 ? 32 : -32,
    autoAlpha: 0,
    stagger: 0.07,
    duration: 0.65,
    scrollTrigger: { trigger: ".comparison__table", start: "top 80%", once: true }
  });

  gsap.utils.toArray(".upgrade-steps li").forEach((step, index) => {
    gsap.from(step, {
      x: compact ? 24 : (index % 2 ? 65 : -65),
      rotate: compact ? 0 : (index % 2 ? 1.2 : -1.2),
      autoAlpha: 0,
      duration: 0.85,
      scrollTrigger: { trigger: step, start: "top 86%", once: true }
    });
  });

  gsap.from(".billing-trust li", {
    y: compact ? 28 : 55,
    rotationY: compact ? 0 : -16,
    autoAlpha: 0,
    stagger: 0.12,
    duration: 0.86,
    transformOrigin: "0% 50%",
    scrollTrigger: { trigger: ".billing-trust ul", start: "top 84%", once: true }
  });

  gsap.to(".pricing-download__numbers", {
    xPercent: compact ? 0 : -4,
    yPercent: compact ? -4 : -9,
    ease: "none",
    scrollTrigger: { trigger: ".pricing-download", start: "top bottom", end: "bottom top", scrub }
  });

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}
