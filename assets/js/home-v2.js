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
const layoutViewport = document.querySelector("[data-layout-viewport]");
const layoutKicker = document.querySelector("[data-layout-kicker]");
const layoutTitle = document.querySelector("[data-layout-title]");
const layoutDescription = document.querySelector("[data-layout-description]");

const layoutContent = {
  916: {
    kicker: "9:16 layout",
    title: "Vertical, ready to post.",
    description: "Built for Shorts, Reels, and TikTok."
  },
  pip: {
    kicker: "Picture-in-picture",
    title: "Keep both in view.",
    description: "Your camera stays visible without covering the moment."
  },
  cutout: {
    kicker: "Cutout layout",
    title: "React inside the action.",
    description: "Your background disappears. Your reaction stays."
  },
  169: {
    kicker: "16:9 layout",
    title: "Wide-screen, ready.",
    description: "Creator and source share one landscape frame."
  }
};

const activateLayout = (key, moveFocus = false) => {
  const activeTab = layoutTabs.find((tab) => tab.dataset.layoutTab === key);
  const activePanel = layoutPanels.find((panel) => panel.dataset.layoutPanel === key);
  const content = layoutContent[key];

  if (!activeTab || !activePanel || !content) return;

  layoutTabs.forEach((tab) => {
    const isActive = tab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  layoutPanels.forEach((panel) => {
    const isActive = panel === activePanel;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
    panel.classList.remove("is-entering");
  });

  activePanel.classList.add("is-entering");
  window.setTimeout(() => activePanel.classList.remove("is-entering"), 360);

  if (layoutKicker) layoutKicker.textContent = content.kicker;
  if (layoutTitle) layoutTitle.textContent = content.title;
  if (layoutDescription) layoutDescription.textContent = content.description;
  if (layoutViewport) layoutViewport.classList.toggle("is-wide", key === "169");
  if (moveFocus) activeTab.focus();
};

layoutTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateLayout(tab.dataset.layoutTab));

  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % layoutTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + layoutTabs.length) % layoutTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = layoutTabs.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      activateLayout(layoutTabs[nextIndex].dataset.layoutTab, true);
    }
  });
});

if (layoutViewport && layoutTabs.length > 1) {
  let pointerStart = null;

  layoutViewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  layoutViewport.addEventListener("pointerup", (event) => {
    if (!pointerStart || event.pointerType === "mouse") return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    const currentIndex = Math.max(0, layoutTabs.findIndex((tab) => tab.classList.contains("is-active")));
    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex = (currentIndex + direction + layoutTabs.length) % layoutTabs.length;
    activateLayout(layoutTabs[nextIndex].dataset.layoutTab);
  });

  layoutViewport.addEventListener("pointercancel", () => {
    pointerStart = null;
  });
}

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
