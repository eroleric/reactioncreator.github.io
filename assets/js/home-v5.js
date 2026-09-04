document.documentElement.classList.add("js");

const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-page-progress]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setMenu = (open) => {
  if (!navToggle || !navMenu) return;
  navMenu.classList.toggle("is-open", open);
  navToggle.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  const label = navToggle.querySelector(".sr-only");
  const visualLabel = navToggle.querySelector(".nav-toggle-label");
  if (label) label.textContent = open ? "Close menu" : "Open menu";
  if (visualLabel) visualLabel.textContent = open ? "Close" : "Menu";
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("is-open")));
  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (header && !header.contains(event.target)) setMenu(false);
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const navSectionLinks = navMenu ? [...navMenu.querySelectorAll('a[href^="#"]')] : [];
const navSections = navSectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateInterface = () => {
  const scrollTop = window.scrollY;
  const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  if (progress) progress.style.transform = `scaleX(${Math.min(scrollTop / scrollRange, 1)})`;
  if (header) header.classList.toggle("is-scrolled", scrollTop > 30);

  const guide = Math.min(230, window.innerHeight * 0.35);
  let currentId = "";
  navSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= guide) currentId = section.id;
  });
  navSectionLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-current", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

let interfaceFrame = 0;
const queueInterfaceUpdate = () => {
  if (interfaceFrame) return;
  interfaceFrame = window.requestAnimationFrame(() => {
    interfaceFrame = 0;
    updateInterface();
  });
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
  const compactHeroMotion = window.matchMedia("(max-width: 720px)").matches;
  const scrollScrub = compactHeroMotion ? 0.28 : 0.62;

  const heroIntro = gsap.timeline({ defaults: { duration: 1.05 } });
  heroIntro
    .from(".site-header .nav", { y: -34, autoAlpha: 0, duration: 0.8 })
    .from(".hero-copy .kicker", { y: 22, autoAlpha: 0 }, 0.18)
    .from(".hero h1 > span", { yPercent: 115, autoAlpha: 0, rotate: 2 }, 0.24)
    .from(".hero h1 > em", { yPercent: 115, autoAlpha: 0, rotate: -2 }, 0.34)
    .from(".hero-lede", { y: 26, autoAlpha: 0 }, 0.46)
    .from(".hero-actions .button", { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.75 }, 0.58)
    .from(".hero-positioning", { autoAlpha: 0, duration: 0.7 }, 0.72)
    .from(".hero-phone-secondary", {
      x: compactHeroMotion ? -34 : -86,
      y: compactHeroMotion ? 72 : 118,
      autoAlpha: 0,
      rotateZ: -16,
      rotateY: 11,
      scale: 0.78,
      duration: 1.45
    }, 0.2)
    .from(".hero-phone-primary", {
      x: compactHeroMotion ? 30 : 64,
      y: compactHeroMotion ? 68 : 102,
      autoAlpha: 0,
      rotateZ: 12,
      rotateY: -10,
      scale: 0.84,
      duration: 1.35
    }, 0.3)
    .from(".hero-orbit", { scale: 0.55, autoAlpha: 0, rotate: -80, duration: 1.6 }, 0.3)
    .from(".hero-chip", { y: 28, autoAlpha: 0, scale: 0.88, stagger: 0.12, duration: 0.75 }, 0.82);

  if (!compactHeroMotion) {
    const heroIdleTweens = [
      gsap.to(".hero-phone-primary .device-crop", {
        y: -7,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        force3D: true
      }),
      gsap.to(".hero-phone-secondary .device-crop", {
        y: 7,
        duration: 4.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        force3D: true
      })
    ];

    ScrollTrigger.create({
      trigger: "[data-hero]",
      start: "top bottom",
      end: "bottom top",
      onEnter: () => heroIdleTweens.forEach((tween) => tween.play()),
      onEnterBack: () => heroIdleTweens.forEach((tween) => tween.play()),
      onLeave: () => heroIdleTweens.forEach((tween) => tween.pause()),
      onLeaveBack: () => heroIdleTweens.forEach((tween) => tween.pause())
    });
  }

  gsap.timeline({
    scrollTrigger: {
      trigger: "[data-hero]",
      start: "top top",
      end: "bottom top",
      scrub: scrollScrub
    }
  })
    .to(".hero-copy", { y: -110, autoAlpha: 0.08, ease: "none" }, 0)
    .to(".hero-phone-primary", {
      x: compactHeroMotion ? 32 : 76,
      y: compactHeroMotion ? 92 : 150,
      rotateZ: 8,
      rotateY: 10,
      scale: 0.88,
      ease: "none"
    }, 0)
    .to(".hero-phone-secondary", {
      x: compactHeroMotion ? -28 : -72,
      y: compactHeroMotion ? 70 : 124,
      rotateZ: -14,
      rotateY: -8,
      scale: 0.9,
      ease: "none"
    }, 0)
    .to(".hero-orbit", { rotate: 110, scale: 1.16, autoAlpha: 0.3, ease: "none" }, 0)
    .to(".hero-chip-source", { x: -80, y: -25, autoAlpha: 0, ease: "none" }, 0)
    .to(".hero-chip-layout", { x: 85, y: -10, autoAlpha: 0, ease: "none" }, 0)
    .to(".hero-chip-export", { x: -55, y: 40, autoAlpha: 0, ease: "none" }, 0);

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    if (element.closest(".hero")) return;
    if (element.closest("[data-motion-story]")) return;
    if (element.closest(".download")) return;
    if (element.classList.contains("continuity-item")) return;
    gsap.from(element, {
      y: 60,
      autoAlpha: 0,
      duration: 1,
      scrollTrigger: {
        trigger: element,
        start: "top 86%",
        once: true
      }
    });
  });

  const tickerTrack = document.querySelector(".ticker-track");
  if (tickerTrack) {
    const tickerTween = gsap.to(tickerTrack, {
      xPercent: -50,
      duration: compactHeroMotion ? 24 : 28,
      repeat: -1,
      ease: "none",
      force3D: true
    });
    ScrollTrigger.create({
      trigger: ".creator-ticker",
      start: "top bottom",
      end: "bottom top",
      onEnter: () => tickerTween.play(),
      onEnterBack: () => tickerTween.play(),
      onLeave: () => tickerTween.pause(),
      onLeaveBack: () => tickerTween.pause()
    });
  }

  const ambientStage = document.querySelector("[data-ambient-stage]");
  const ambientCore = document.querySelector(".ambient-core");
  const ambientDepth = document.querySelector(".ambient-depth");
  const ambientOrbA = document.querySelector(".ambient-orb-a");
  const ambientOrbB = document.querySelector(".ambient-orb-b");
  const ambientPalettes = gsap.utils.toArray("[data-ambient-palette]");

  if (ambientStage && ambientCore && ambientDepth && ambientOrbA && ambientOrbB && ambientPalettes.length) {
    gsap.set(ambientPalettes, { autoAlpha: 0 });
    gsap.set(ambientPalettes[0], { autoAlpha: 1 });

    if (!compactHeroMotion) {
      gsap.to(ambientCore, {
        rotateZ: 360,
        rotateX: 24,
        rotateY: -22,
        duration: 44,
        repeat: -1,
        ease: "none",
        force3D: true
      });

      gsap.to(".ambient-spark", {
        scale: 1.8,
        autoAlpha: 0.38,
        duration: 2.4,
        stagger: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    gsap.to(ambientDepth, {
      xPercent: compactHeroMotion ? -16 : -26,
      yPercent: compactHeroMotion ? 42 : 68,
      rotateZ: compactHeroMotion ? 54 : 112,
      ease: "none",
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: compactHeroMotion ? 0.32 : 0.78
      }
    });

    const sceneStates = [
      ".workflow",
      ".formats",
      ".instant",
      ".orientation",
      ".editor-choice",
      ".continuity",
      ".download"
    ];

    sceneStates.forEach((selector, index) => {
      const scene = document.querySelector(selector);
      const previousPalette = ambientPalettes[index];
      const nextPalette = ambientPalettes[index + 1];
      if (!scene || !previousPalette || !nextPalette) return;
      gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: "top 96%",
          end: "top 28%",
          scrub: compactHeroMotion ? 0.22 : 0.45
        }
      })
        .to(previousPalette, { autoAlpha: 0, ease: "none", duration: 1 }, 0)
        .to(nextPalette, { autoAlpha: 1, ease: "none", duration: 1 }, 0);
    });
  }

  gsap.fromTo(".orientation-device-wide",
    { xPercent: -20, rotate: -7 },
    {
      xPercent: 5,
      rotate: 2,
      ease: "none",
      scrollTrigger: { trigger: ".orientation", start: "top 80%", end: "bottom 20%", scrub: scrollScrub }
    }
  );
  gsap.fromTo(".orientation-device-portrait",
    { xPercent: 30, yPercent: -10, rotate: 8 },
    {
      xPercent: -8,
      yPercent: 5,
      rotate: -3,
      ease: "none",
      scrollTrigger: { trigger: ".orientation", start: "top 80%", end: "bottom 20%", scrub: scrollScrub }
    }
  );
  gsap.to(".orientation-rotate", {
    rotate: 240,
    ease: "none",
    scrollTrigger: { trigger: ".orientation", start: "top 70%", end: "bottom 30%", scrub: scrollScrub }
  });

  gsap.fromTo(".editor-product",
    { y: 100, rotate: -5, scale: 0.9 },
    {
      y: -30,
      rotate: 2,
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: ".editor-choice", start: "top 85%", end: "bottom 15%", scrub: scrollScrub }
    }
  );

  gsap.utils.toArray(".continuity-item").forEach((item, index) => {
    gsap.from(item, {
      y: index ? 130 : 80,
      rotate: index ? 2 : -2,
      autoAlpha: 0,
      duration: 1.2,
      scrollTrigger: { trigger: item, start: "top 82%", once: true }
    });
    gsap.to(item.querySelector("figure"), {
      y: index ? -70 : -45,
      ease: "none",
      scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: scrollScrub }
    });
  });

  gsap.from(".vision-principles li", {
    y: 18,
    autoAlpha: 0,
    scale: 0.9,
    stagger: 0.09,
    duration: 0.65,
    scrollTrigger: { trigger: ".vision-principles", start: "top 88%", once: true }
  });

  const downloadSection = document.querySelector(".download");
  if (downloadSection) {
    gsap.timeline({
      scrollTrigger: { trigger: downloadSection, start: "top 82%", once: true }
    })
      .from(".download-copy .kicker", { y: 20, autoAlpha: 0, duration: 0.65 })
      .from(".download-copy h2", { y: 48, autoAlpha: 0, duration: 0.9 }, 0.12)
      .from(".download-copy > p:last-of-type", { y: 25, autoAlpha: 0, duration: 0.72 }, 0.28)
      .from(".download-action-row", { y: 22, autoAlpha: 0, duration: 0.72 }, 0.38)
      .from(".download-mark", { x: compactHeroMotion ? 0 : 72, y: 36, autoAlpha: 0, duration: 1.05 }, 0.2)
      .from(".download-mark-visual img", { scale: 0.72, rotate: -9, duration: 1.1 }, 0.26)
      .from(".download-mark figcaption", { y: 18, autoAlpha: 0, duration: 0.68 }, 0.64);

    gsap.to(".download-mark-visual", {
      y: compactHeroMotion ? -14 : -28,
      rotate: compactHeroMotion ? 2 : 4,
      ease: "none",
      scrollTrigger: { trigger: downloadSection, start: "top bottom", end: "bottom top", scrub: scrollScrub }
    });
    gsap.to(".download-mark-visual > span", {
      rotate: 120,
      ease: "none",
      scrollTrigger: { trigger: downloadSection, start: "top bottom", end: "bottom top", scrub: scrollScrub }
    });
  }

  const formatPin = document.querySelector(".formats-pin");
  const formatHeading = document.querySelector(".formats-heading");
  const syncFormatLayout = () => {
    if (!formatPin || !formatHeading || window.innerWidth <= 720) {
      if (formatPin) formatPin.style.removeProperty("--format-copy-top");
      return;
    }

    const headingBottom = formatHeading.offsetTop + formatHeading.offsetHeight;
    const gap = Math.max(24, Math.min(window.innerHeight * 0.04, 38));
    formatPin.style.setProperty("--format-copy-top", `${Math.ceil(headingBottom + gap)}px`);
  };

  syncFormatLayout();
  ScrollTrigger.addEventListener("refreshInit", syncFormatLayout);

  const instant = document.querySelector(".instant");
  const exportSteps = gsap.utils.toArray(".export-step");
  let activeExportStep = -1;
  const setExportStep = (index) => {
    if (!exportSteps.length || index === activeExportStep) return;
    activeExportStep = index;
    exportSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
  };

  const motionMedia = gsap.matchMedia();

  motionMedia.add("(min-width: 941px) and (hover: hover) and (pointer: fine)", () => {
    const pointerLayer = document.querySelector(".ambient-pointer");
    if (!pointerLayer || !ambientOrbA || !ambientOrbB) return undefined;

    const tiltX = gsap.quickTo(pointerLayer, "rotationX", { duration: 0.8, ease: "power3.out" });
    const tiltY = gsap.quickTo(pointerLayer, "rotationY", { duration: 0.8, ease: "power3.out" });
    const orbAX = gsap.quickTo(ambientOrbA, "x", { duration: 1.2, ease: "power3.out" });
    const orbAY = gsap.quickTo(ambientOrbA, "y", { duration: 1.2, ease: "power3.out" });
    const orbBX = gsap.quickTo(ambientOrbB, "x", { duration: 1.45, ease: "power3.out" });
    const orbBY = gsap.quickTo(ambientOrbB, "y", { duration: 1.45, ease: "power3.out" });

    const respondToPointer = (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      tiltX(ny * -10);
      tiltY(nx * 13);
      orbAX(nx * 42);
      orbAY(ny * 28);
      orbBX(nx * -34);
      orbBY(ny * -24);
    };

    window.addEventListener("pointermove", respondToPointer, { passive: true });
    return () => window.removeEventListener("pointermove", respondToPointer);
  });

  motionMedia.add("(min-width: 721px)", () => {
    const story = document.querySelector("[data-motion-story]");
    const storySteps = gsap.utils.toArray("[data-workflow-step]");

    if (story && storySteps.length) {
      gsap.set(storySteps.slice(1), { autoAlpha: 0, y: 54 });
      gsap.set(".workflow-manifesto", { autoAlpha: 0, y: 18 });
      const storyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: story,
          start: "top top",
          end: "+=2100",
          pin: ".workflow-pin",
          pinSpacing: true,
          scrub: 0.62,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 30
        }
      });

      storyTimeline
        .to(".workflow-device", { rotate: -4, y: -24, scale: 1.03, duration: 0.7, ease: "power2.inOut" })
        .to(storySteps[0], { autoAlpha: 0, y: -50, duration: 0.4 }, 0.75)
        .fromTo(storySteps[1], { autoAlpha: 0, y: 54 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.05)
        .to(".workflow-device", { rotate: 4, x: 18, y: 10, scale: 0.96, duration: 0.7, ease: "power2.inOut" }, 0.95)
        .to(storySteps[1], { autoAlpha: 0, y: -50, duration: 0.4 }, 1.85)
        .fromTo(storySteps[2], { autoAlpha: 0, y: 54 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 2.15)
        .to(".workflow-device", { rotate: 0, x: 0, y: -15, scale: 1.06, duration: 0.7, ease: "power2.inOut" }, 2.05)
        .to(".workflow-manifesto", { autoAlpha: 1, y: 0, duration: 0.45 }, 2.55);
    }

    const formatSection = document.querySelector("[data-formats]");
    const formatCards = gsap.utils.toArray("[data-format-card]");

    if (formatSection && formatCards.length) {
      gsap.set(formatCards.slice(1), { autoAlpha: 0 });
      const formatTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: formatSection,
          start: "top top",
          end: `+=${formatCards.length * 700}`,
          pin: ".formats-pin",
          pinSpacing: true,
          scrub: 0.62,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 20
        }
      });

      formatCards.slice(1).forEach((card, index) => {
        const previous = formatCards[index];
        const previousStage = previous.querySelector("figure");
        const previousCopy = previous.querySelector(".format-copy");
        const nextStage = card.querySelector("figure");
        const nextCopy = card.querySelector(".format-copy");
        const at = index + 0.8;

        formatTimeline
          .to(previousCopy, { autoAlpha: 0, y: -28, duration: 0.3 }, at)
          .to(previousStage, { xPercent: 145, rotate: 7, autoAlpha: 0, duration: 0.62, ease: "power2.in" }, at)
          .set(previous, { autoAlpha: 0 }, at + 0.62)
          .set(card, { autoAlpha: 1 }, at + 0.2)
          .fromTo(nextStage,
            { yPercent: 78, rotate: -5, scale: 0.9, autoAlpha: 0 },
            { yPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 0.72, ease: "power3.out" },
            at + 0.28
          )
          .fromTo(nextCopy,
            { y: 46, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
            at + 0.52
          );
      });
    }

    if (instant && exportSteps.length) {
      setExportStep(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: instant,
          start: "top top",
          end: "+=1450",
          pin: true,
          pinSpacing: true,
          scrub: 0.48,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          onUpdate: (self) => setExportStep(Math.min(exportSteps.length - 1, Math.floor(self.progress * exportSteps.length)))
        }
      })
        .to(".export-beam span", { yPercent: 230, ease: "none", duration: 4 }, 0)
        .to(".instant-orb", { xPercent: -18, yPercent: 10, scale: 1.18, ease: "none", duration: 4 }, 0)
        .to(".export-system", { x: 18, ease: "none", duration: 4 }, 0);
    }
  });

  motionMedia.add("(max-width: 720px)", () => {
    const mobileStory = document.querySelector("[data-motion-story]");
    const mobileStorySteps = gsap.utils.toArray("[data-workflow-step]");

    if (mobileStory && mobileStorySteps.length) {
      gsap.set(mobileStorySteps.slice(1), { autoAlpha: 0, y: 36 });
      gsap.set(".workflow-manifesto", { autoAlpha: 0, y: 14 });

      const mobileStoryTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: mobileStory,
          start: "top top",
          end: "+=1120",
          pin: ".workflow-pin",
          pinSpacing: true,
          scrub: 0.28,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 30
        }
      });

      mobileStoryTimeline
        .to(mobileStorySteps[0], { autoAlpha: 0, y: -34, duration: 0.38 }, 0.72)
        .fromTo(mobileStorySteps[1], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.46 }, 0.96)
        .to(mobileStorySteps[1], { autoAlpha: 0, y: -34, duration: 0.38 }, 1.72)
        .fromTo(mobileStorySteps[2], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.46 }, 1.96)
        .to(".workflow-manifesto", { autoAlpha: 1, y: 0, duration: 0.42 }, 2.42);
    }

    if (instant && exportSteps.length) {
      setExportStep(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: instant,
          start: "top top",
          end: "+=920",
          pin: true,
          pinSpacing: true,
          scrub: 0.26,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          onUpdate: (self) => setExportStep(Math.min(exportSteps.length - 1, Math.floor(self.progress * exportSteps.length)))
        }
      })
        .to(".export-beam span", { yPercent: 230, ease: "none", duration: 4 }, 0)
        .to(".instant-orb", { xPercent: -12, yPercent: 8, scale: 1.12, ease: "none", duration: 4 }, 0)
        .to(".export-system", { y: -12, ease: "none", duration: 4 }, 0);
    }

    gsap.utils.toArray("[data-format-card]").forEach((item) => {
      gsap.from(item, {
        y: 60,
        autoAlpha: 0,
        duration: 0.9,
        scrollTrigger: { trigger: item, start: "top 86%", once: true }
      });
    });
  });

  ScrollTrigger.sort();
  const refresh = () => {
    syncFormatLayout();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}
