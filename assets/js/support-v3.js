document.documentElement.classList.add("no-gsap");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

const setMenu = (open) => {
  if (!navToggle || !navMenu) return;
  navToggle.classList.toggle("is-open", open);
  navMenu.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);

  const label = navToggle.querySelector(".sr-only");
  if (label) label.textContent = open ? "Close menu" : "Open menu";
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    setMenu(!navMenu.classList.contains("is-open"));
  });
  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (header && !header.contains(event.target)) setMenu(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 940) setMenu(false);
  }, { passive: true });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

let headerFrame = 0;
const updateHeader = () => {
  headerFrame = 0;
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 28);
};
window.addEventListener("scroll", () => {
  if (headerFrame) return;
  headerFrame = window.requestAnimationFrame(updateHeader);
}, { passive: true });
updateHeader();

const supportTabs = [...document.querySelectorAll("[data-support-tab]")];
const supportPanels = [...document.querySelectorAll("[data-support-panel]")];
const signalNumber = document.querySelector("[data-signal-number]");

const setSupportTopic = (nextIndex, shouldFocus = false) => {
  const index = Math.max(0, Math.min(nextIndex, supportTabs.length - 1));
  if (!supportTabs[index] || !supportPanels[index]) return;

  supportTabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  supportPanels.forEach((panel, panelIndex) => {
    const active = panelIndex === index;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });

  if (signalNumber) signalNumber.textContent = String(index + 1).padStart(2, "0");
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

const answerLinks = [...document.querySelectorAll("[data-answer-link]")];
const answerGroups = [...document.querySelectorAll("[data-answer-group]")];

if ("IntersectionObserver" in window && answerLinks.length && answerGroups.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    answerLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.answerLink === visible.target.id);
    });
  }, { rootMargin: "-25% 0px -55%", threshold: [0, 0.25, 0.5] });

  answerGroups.forEach((group) => observer.observe(group));
}

setSupportTopic(2);
