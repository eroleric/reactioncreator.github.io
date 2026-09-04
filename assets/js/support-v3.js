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

const supportTabs = Array.from(document.querySelectorAll("[data-support-tab]"));
const supportPanels = Array.from(document.querySelectorAll("[data-support-panel]"));
const signalNumber = document.querySelector("[data-signal-number]");
let activeSupport = 2;

const setSupportTopic = (nextIndex, shouldFocus = false) => {
  const index = Math.max(0, Math.min(nextIndex, supportTabs.length - 1));
  if (!supportTabs[index] || !supportPanels[index]) return;
  supportTabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (signalNumber) signalNumber.textContent = String(index + 1).padStart(2, "0");

  const oldPanel = supportPanels[activeSupport];
  const newPanel = supportPanels[index];
  if (oldPanel !== newPanel && window.gsap && !reduceMotion) {
    supportPanels.forEach((panel) => {
      if (panel === oldPanel || panel === newPanel) return;
      window.gsap.killTweensOf([panel, ...panel.querySelectorAll("*")]);
      panel.hidden = true;
      panel.classList.remove("is-active");
    });
    window.gsap.killTweensOf([oldPanel, newPanel]);
    window.gsap.to(oldPanel, {
      xPercent: index > activeSupport ? -7 : 7,
      autoAlpha: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        oldPanel.hidden = true;
        oldPanel.classList.remove("is-active");
      }
    });
    newPanel.hidden = false;
    newPanel.classList.add("is-active");
    window.gsap.fromTo(newPanel,
      { xPercent: index > activeSupport ? 8 : -8, y: 16, autoAlpha: 0 },
      { xPercent: 0, y: 0, autoAlpha: 1, duration: 0.5, delay: 0.12, ease: "power3.out", clearProps: "transform,opacity,visibility" }
    );
    window.gsap.fromTo(newPanel.querySelectorAll(".panel-number, h2, p, a"),
      { y: 15, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.035, duration: 0.38, delay: 0.18, overwrite: true }
    );
    window.gsap.fromTo(".signal-core", { scale: 0.86, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.55, ease: "back.out(1.8)" });
    window.gsap.fromTo(".signal-pulse", { scale: 2.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" });
  } else {
    supportPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  }
  activeSupport = index;
  if (shouldFocus) supportTabs[index].focus();
};

supportTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setSupportTopic(index));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % supportTabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + supportTabs.length) % supportTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = supportTabs.length - 1;
    else return;
    event.preventDefault();
    setSupportTopic(nextIndex, true);
  });
});

document.querySelectorAll(".answer-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    const group = detail.closest(".answer-list");
    group.querySelectorAll("details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const answerLinks = Array.from(document.querySelectorAll("[data-answer-link]"));
const activateAnswerLink = (id) => {
  answerLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.answerLink === id));
};

const gsapReady = Boolean(window.gsap && window.ScrollTrigger);
if (!gsapReady || reduceMotion) {
  document.documentElement.classList.add("no-gsap");
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activateAnswerLink(visible.target.id);
  }, { rootMargin: "-25% 0px -55%", threshold: [0, .25, .5] });
  document.querySelectorAll("[data-answer-group]").forEach((group) => observer.observe(group));
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
    .from(".support-hero__intro .kicker", { y: 18, autoAlpha: 0 }, 0.12)
    .from(".support-hero h1 span", { yPercent: 105, rotate: -2, autoAlpha: 0 }, 0.2)
    .from(".support-hero h1 em", { yPercent: 105, rotate: 2, autoAlpha: 0 }, 0.3)
    .from(".support-hero__intro > p:last-child", { y: 24, autoAlpha: 0 }, 0.42)
    .from(".support-console", { y: compact ? 42 : 75, scale: .96, autoAlpha: 0, duration: 1.05 }, 0.48)
    .from(".signal-ring", { scale: .55, rotate: -45, autoAlpha: 0, stagger: .11, duration: .95 }, 0.58)
    .from(".signal-core", { scale: .55, autoAlpha: 0, duration: .75 }, 0.72)
    .from(".support-tabs button", { y: 18, autoAlpha: 0, stagger: .06, duration: .52 }, 0.75)
    .from(".support-panels article.is-active > *", { y: 17, autoAlpha: 0, stagger: .05, duration: .48 }, 0.85);

  gsap.timeline({ scrollTrigger: { trigger: ".support-hero", start: "top top", end: "bottom top", scrub } })
    .to(".support-hero__intro", { y: compact ? -45 : -90, autoAlpha: .08, ease: "none" }, 0)
    .to(".support-console", { y: compact ? 30 : 75, scale: .96, autoAlpha: .3, ease: "none" }, 0)
    .to(".signal-ring--one", { rotate: 85, ease: "none" }, 0)
    .to(".signal-ring--two", { rotate: -110, ease: "none" }, 0)
    .to(".signal-ring--three", { rotate: 135, ease: "none" }, 0);

  const tickerTrack = document.querySelector(".support-ticker > div");
  if (tickerTrack) {
    const ticker = gsap.to(tickerTrack, { xPercent: -50, duration: compact ? 27 : 34, repeat: -1, ease: "none", force3D: true });
    ScrollTrigger.create({ trigger: ".support-ticker", start: "top bottom", end: "bottom top", onEnter: () => ticker.play(), onEnterBack: () => ticker.play(), onLeave: () => ticker.pause(), onLeaveBack: () => ticker.pause() });
  }

  const palettes = gsap.utils.toArray("[data-support-palette]");
  const scenes = [".support-hero", ".answer-workspace", ".report-path", ".support-contact"];
  if (palettes.length === scenes.length) {
    gsap.set(palettes, { autoAlpha: 0 });
    gsap.set(palettes[0], { autoAlpha: 1 });
    scenes.slice(1).forEach((selector, index) => {
      gsap.timeline({ scrollTrigger: { trigger: selector, start: "top 96%", end: "top 32%", scrub } })
        .to(palettes[index], { autoAlpha: 0, duration: 1, ease: "none" }, 0)
        .to(palettes[index + 1], { autoAlpha: 1, duration: 1, ease: "none" }, 0);
    });
  }

  const field = document.querySelector(".support-field");
  if (field) {
    gsap.to(field, { xPercent: compact ? -18 : -35, yPercent: compact ? 48 : 90, rotate: compact ? 50 : 126, ease: "none", scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: compact ? .28 : .68 } });
  }

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.from(element, { y: compact ? 34 : 55, autoAlpha: 0, duration: compact ? .72 : .95, scrollTrigger: { trigger: element, start: "top 87%", once: true } });
  });

  const headingMotions = [
    [".answer-workspace h2", { x: compact ? -22 : -70, rotate: -1 }],
    [".report-path h2", { y: compact ? 35 : 70, scale: .94 }],
    [".support-contact h2", { x: compact ? 24 : 70, rotate: 1 }]
  ];
  headingMotions.forEach(([selector, vars]) => {
    const heading = document.querySelector(selector);
    if (!heading) return;
    gsap.from(heading, { ...vars, autoAlpha: 0, duration: compact ? .74 : 1.05, scrollTrigger: { trigger: heading, start: "top 86%", once: true } });
  });

  document.querySelectorAll("[data-answer-group]").forEach((group) => {
    ScrollTrigger.create({ trigger: group, start: "top 42%", end: "bottom 42%", onEnter: () => activateAnswerLink(group.id), onEnterBack: () => activateAnswerLink(group.id) });
  });

  gsap.from(".answer-group > header > *", { x: compact ? -18 : -42, autoAlpha: 0, stagger: .1, duration: .65, scrollTrigger: { trigger: ".answer-groups", start: "top 83%", once: true } });
  gsap.from(".report-path__steps li", { y: compact ? 34 : 78, rotationY: compact ? 0 : -15, rotationX: compact ? 0 : 7, autoAlpha: 0, stagger: .1, duration: .9, transformOrigin: "50% 100%", scrollTrigger: { trigger: ".report-path__steps", start: "top 84%", once: true } });
  gsap.to(".report-path__steps li:nth-child(odd)", { y: compact ? 0 : -28, ease: "none", scrollTrigger: { trigger: ".report-path", start: "top bottom", end: "bottom top", scrub } });
  gsap.to(".support-contact__signal", { yPercent: compact ? -4 : -10, rotate: compact ? 2 : 5, ease: "none", scrollTrigger: { trigger: ".support-contact", start: "top bottom", end: "bottom top", scrub } });
  gsap.to(".support-contact__signal span:nth-child(2)", { rotate: 145, ease: "none", scrollTrigger: { trigger: ".support-contact", start: "top bottom", end: "bottom top", scrub } });

  const motion = gsap.matchMedia();
  motion.add("(min-width: 941px) and (hover: hover) and (pointer: fine)", () => {
    const consoleElement = document.querySelector(".support-console");
    const signal = document.querySelector(".support-console__signal");
    if (!consoleElement || !signal) return undefined;
    const moveX = gsap.quickTo(signal, "x", { duration: .8, ease: "power3.out" });
    const moveY = gsap.quickTo(signal, "y", { duration: .8, ease: "power3.out" });
    const onPointer = (event) => {
      const rect = consoleElement.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / Math.max(rect.width, 1) - .5;
      const ny = (event.clientY - rect.top) / Math.max(rect.height, 1) - .5;
      moveX(nx * 17);
      moveY(ny * 13);
    };
    consoleElement.addEventListener("pointermove", onPointer, { passive: true });
    return () => consoleElement.removeEventListener("pointermove", onPointer);
  });

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}
