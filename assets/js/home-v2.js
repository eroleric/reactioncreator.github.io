/* Reaction Creator homepage V2 */

const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (navToggle && navMenu) {
  const navStatus = navToggle.querySelector(".screen-reader-only");
  const setMenuState = (isOpen) => {
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    if (navStatus) navStatus.textContent = isOpen ? "Close menu" : "Open menu";
  };

  navToggle.addEventListener("click", () => {
    setMenuState(!navMenu.classList.contains("is-open"));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
      navToggle.focus();
    }
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const layoutTabs = Array.from(document.querySelectorAll("[data-layout-tab]"));
const layoutPanels = Array.from(document.querySelectorAll("[data-layout-panel]"));
const layoutTabsContainer = document.querySelector(".layout-tabs");
const layoutViewport = document.querySelector("[data-layout-viewport]");
const layoutMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const layoutStage = document.querySelector(".layout-stage");
const layoutAutoDelay = 4000;
const layoutManualDelay = 10000;
const layoutTransitionDuration = 520;
let layoutRotationTimer = null;
let layoutTransitionTimer = null;
let layoutTransitionCleanup = null;
let layoutIsVisible = !("IntersectionObserver" in window);

const updateLayoutGlider = (tab) => {
  if (!layoutTabsContainer || !tab) return;
  layoutTabsContainer.style.setProperty("--layout-glider-x", `${tab.offsetLeft}px`);
  layoutTabsContainer.style.setProperty("--layout-glider-width", `${tab.offsetWidth}px`);
};

const scheduleLayoutRotation = (delay = layoutAutoDelay) => {
  window.clearTimeout(layoutRotationTimer);
  if (layoutMotionPreference.matches || document.hidden || !layoutIsVisible || layoutTabs.length < 2) return;

  layoutRotationTimer = window.setTimeout(() => {
    const currentIndex = Math.max(0, layoutTabs.findIndex((tab) => tab.classList.contains("is-active")));
    const nextIndex = (currentIndex + 1) % layoutTabs.length;
    activateLayout(layoutTabs[nextIndex].dataset.layoutTab, false, 1);
    scheduleLayoutRotation(layoutAutoDelay);
  }, delay);
};

const syncLayoutViewportHeight = (panel, animate = true) => {
  if (!layoutViewport || !panel || panel.hidden) return;

  const viewportStyle = window.getComputedStyle(layoutViewport);
  const verticalPadding = parseFloat(viewportStyle.paddingTop) + parseFloat(viewportStyle.paddingBottom);
  const nextHeight = Math.ceil(panel.getBoundingClientRect().height + verticalPadding);

  layoutViewport.classList.toggle("is-height-static", !animate);
  layoutViewport.style.height = `${nextHeight}px`;

  if (!animate) {
    window.requestAnimationFrame(() => layoutViewport.classList.remove("is-height-static"));
  }
};

const finishLayoutTransition = () => {
  if (layoutTransitionCleanup) layoutTransitionCleanup();
};

const activateLayout = (key, moveFocus = false, direction = 0, releaseOffset = 0) => {
  const activeTab = layoutTabs.find((tab) => tab.dataset.layoutTab === key);
  const activePanel = layoutPanels.find((panel) => panel.dataset.layoutPanel === key);
  const previousTab = layoutTabs.find((tab) => tab.classList.contains("is-active"));
  const previousPanel = layoutPanels.find((panel) => panel.classList.contains("is-active"));

  if (!activeTab || !activePanel) return;

  if (previousPanel === activePanel) {
    updateLayoutGlider(activeTab);
    if (moveFocus) activeTab.focus();
    return;
  }

  finishLayoutTransition();

  const previousIndex = Math.max(0, layoutTabs.indexOf(previousTab));
  const nextIndex = layoutTabs.indexOf(activeTab);
  const resolvedDirection = direction || (nextIndex >= previousIndex ? 1 : -1);

  window.clearTimeout(layoutTransitionTimer);

  layoutTabs.forEach((tab) => {
    const isActive = tab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  updateLayoutGlider(activeTab);

  layoutPanels.forEach((panel) => {
    panel.classList.remove(
      "is-entering-next",
      "is-entering-previous",
      "is-leaving-next",
      "is-leaving-previous"
    );
  });

  if (layoutViewport) {
    layoutViewport.classList.toggle("is-wide", activePanel.classList.contains("layout-panel--wide"));
  }

  if (!previousPanel || layoutMotionPreference.matches) {
    layoutPanels.forEach((panel) => {
      const isActive = panel === activePanel;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
    syncLayoutViewportHeight(activePanel, false);
  } else {
    layoutPanels.forEach((panel) => {
      panel.hidden = panel !== previousPanel && panel !== activePanel;
      panel.classList.toggle("is-active", panel === activePanel);
    });

    previousPanel.style.setProperty("--layout-exit-start", `${releaseOffset}px`);
    syncLayoutViewportHeight(activePanel);

    // Force a clean animation boundary after unhiding the incoming panel. This
    // prevents stale transforms from a previous drag appearing for one frame.
    void activePanel.offsetWidth;
    previousPanel.classList.add(resolvedDirection > 0 ? "is-leaving-next" : "is-leaving-previous");
    activePanel.classList.add(resolvedDirection > 0 ? "is-entering-next" : "is-entering-previous");
    layoutViewport?.classList.add("is-switching");

    let isClean = false;
    const cleanup = () => {
      if (isClean) return;
      isClean = true;
      window.clearTimeout(layoutTransitionTimer);
      previousPanel.hidden = true;
      previousPanel.classList.remove("is-leaving-next", "is-leaving-previous");
      previousPanel.style.removeProperty("--layout-exit-start");
      activePanel.classList.remove("is-entering-next", "is-entering-previous");
      layoutViewport?.classList.remove("is-switching");
      activePanel.removeEventListener("animationend", handleAnimationEnd);
      if (layoutTransitionCleanup === cleanup) layoutTransitionCleanup = null;
    };

    const handleAnimationEnd = (event) => {
      if (event.target === activePanel) cleanup();
    };

    activePanel.addEventListener("animationend", handleAnimationEnd);
    layoutTransitionCleanup = cleanup;
    layoutTransitionTimer = window.setTimeout(cleanup, layoutTransitionDuration + 120);
  }

  if (moveFocus) activeTab.focus();
};

layoutTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    const currentIndex = Math.max(0, layoutTabs.findIndex((item) => item.classList.contains("is-active")));
    activateLayout(tab.dataset.layoutTab, false, index >= currentIndex ? 1 : -1);
    scheduleLayoutRotation(layoutManualDelay);
  });

  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % layoutTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + layoutTabs.length) % layoutTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = layoutTabs.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key === "Home" ? -1 : 1;
      activateLayout(layoutTabs[nextIndex].dataset.layoutTab, true, direction);
      scheduleLayoutRotation(layoutManualDelay);
    }
  });
});

if (layoutViewport && layoutTabs.length > 1) {
  let pointerStart = null;
  let pointerAxis = null;
  let pendingDragX = 0;
  let renderedDragX = 0;
  let dragFrame = 0;

  const renderDrag = () => {
    dragFrame = 0;
    renderedDragX = pendingDragX;
    layoutViewport.style.setProperty("--layout-drag-x", `${renderedDragX}px`);
  };

  const resetDragState = () => {
    if (dragFrame) window.cancelAnimationFrame(dragFrame);
    pointerStart = null;
    pointerAxis = null;
    pendingDragX = 0;
    renderedDragX = 0;
    dragFrame = 0;
    layoutViewport.style.setProperty("--layout-drag-x", "0px");
  };

  layoutViewport.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (layoutViewport.classList.contains("is-switching")) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    pointerAxis = null;
    pendingDragX = 0;
    renderedDragX = 0;
    layoutViewport.classList.add("is-dragging");
    layoutViewport.setPointerCapture?.(event.pointerId);
  });

  layoutViewport.addEventListener("pointermove", (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;

    if (!pointerAxis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 7) {
      pointerAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    if (pointerAxis !== "horizontal") return;

    event.preventDefault();
    const dragLimit = layoutViewport.clientWidth * 0.34;
    const resistedX = Math.max(-dragLimit, Math.min(dragLimit, deltaX * 0.86));
    pendingDragX = resistedX;
    if (!dragFrame) dragFrame = window.requestAnimationFrame(renderDrag);
  });

  const finishLayoutDrag = (event, cancelled = false) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    const threshold = Math.min(92, Math.max(52, layoutViewport.clientWidth * 0.14));
    const shouldSlide = !cancelled && pointerAxis === "horizontal" &&
      Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY);

    layoutViewport.releasePointerCapture?.(event.pointerId);

    if (dragFrame) {
      window.cancelAnimationFrame(dragFrame);
      renderDrag();
    }

    if (shouldSlide) {
      layoutViewport.classList.remove("is-dragging", "is-snapping-back");

      const currentIndex = Math.max(0, layoutTabs.findIndex((tab) => tab.classList.contains("is-active")));
      const direction = deltaX < 0 ? 1 : -1;
      const nextIndex = (currentIndex + direction + layoutTabs.length) % layoutTabs.length;
      activateLayout(layoutTabs[nextIndex].dataset.layoutTab, false, direction, renderedDragX);
      resetDragState();
      scheduleLayoutRotation(layoutManualDelay);
      return;
    }

    layoutViewport.classList.add("is-snapping-back");
    layoutViewport.style.setProperty("--layout-drag-x", "0px");
    window.setTimeout(() => {
      layoutViewport.classList.remove("is-dragging", "is-snapping-back");
      resetDragState();
    }, 300);
  };

  layoutViewport.addEventListener("pointerup", (event) => finishLayoutDrag(event));
  layoutViewport.addEventListener("pointercancel", (event) => finishLayoutDrag(event, true));
  layoutViewport.addEventListener("dragstart", (event) => event.preventDefault());
}

window.addEventListener("resize", () => {
  const activeTab = layoutTabs.find((tab) => tab.classList.contains("is-active"));
  const activePanel = layoutPanels.find((panel) => panel.classList.contains("is-active"));
  updateLayoutGlider(activeTab);
  syncLayoutViewportHeight(activePanel, false);
});

window.requestAnimationFrame(() => {
  const activeTab = layoutTabs.find((tab) => tab.classList.contains("is-active"));
  const activePanel = layoutPanels.find((panel) => panel.classList.contains("is-active"));
  updateLayoutGlider(activeTab);
  syncLayoutViewportHeight(activePanel, false);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearTimeout(layoutRotationTimer);
  } else {
    scheduleLayoutRotation(layoutAutoDelay);
  }
});

if ("IntersectionObserver" in window && layoutStage) {
  const layoutObserver = new IntersectionObserver((entries) => {
    layoutIsVisible = entries.some((entry) => entry.isIntersecting);
    if (layoutIsVisible) {
      scheduleLayoutRotation(layoutAutoDelay);
    } else {
      window.clearTimeout(layoutRotationTimer);
    }
  }, { threshold: 0.2 });

  layoutObserver.observe(layoutStage);
}

layoutMotionPreference.addEventListener("change", () => scheduleLayoutRotation(layoutAutoDelay));
scheduleLayoutRotation(layoutAutoDelay);

const exportButtons = Array.from(document.querySelectorAll("[data-export-step]"));
const exportStepLabel = document.querySelector("[data-export-step-label]");
const exportTitle = document.querySelector("[data-export-title]");
const exportDescription = document.querySelector("[data-export-description]");

const exportContent = {
  layout: {
    label: "01 · Layout",
    title: "Frame the reaction before you record.",
    description: "Choose 9:16, PiP, Cutout, or 16:9 so the final video starts in the right format."
  },
  source: {
    label: "02 · Source",
    title: "Bring in the moment worth reacting to.",
    description: "Add the source video and keep it visible in the same focused recording workflow."
  },
  record: {
    label: "03 · Record",
    title: "React while the source plays.",
    description: "Capture the source and your camera together, with no separate edit required."
  },
  export: {
    label: "04 · Export",
    title: "Send it out—no timeline required.",
    description: "When the reaction feels right, export immediately. Editor Mode waits only if you need it."
  }
};

exportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = exportContent[button.dataset.exportStep];
    if (!content) return;

    exportButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    if (exportStepLabel) exportStepLabel.textContent = content.label;
    if (exportTitle) exportTitle.textContent = content.title;
    if (exportDescription) exportDescription.textContent = content.description;
  });
});
