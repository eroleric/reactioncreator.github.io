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

const planButtons = [...document.querySelectorAll("[data-plan-button]")];
const planPanels = [...document.querySelectorAll("[data-plan-panel]")];
const paceNodes = [...document.querySelectorAll("[data-pace-node]")];
const paceNumber = document.querySelector("[data-pace-number]");
const paceLabel = document.querySelector("[data-pace-label]");
const paceTier = document.querySelector("[data-pace-tier]");
const paceValues = [
  { tier: "Premium Annual", number: "∞", label: "unlimited exports" },
  { tier: "Premium Monthly", number: "15", label: "exports / day" },
  { tier: "Free preview", number: "3", label: "exports / day" }
];

const setPlanState = (nextIndex, shouldFocus = false) => {
  const index = Math.max(0, Math.min(nextIndex, planButtons.length - 1));
  if (!planButtons[index] || !planPanels[index]) return;

  planButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  planPanels.forEach((panel, panelIndex) => {
    const active = panelIndex === index;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });

  paceNodes.forEach((node, nodeIndex) => {
    node.classList.toggle("is-active", nodeIndex === index);
  });

  const value = paceValues[index];
  if (paceTier) paceTier.textContent = value.tier;
  if (paceNumber) paceNumber.textContent = value.number;
  if (paceLabel) paceLabel.textContent = value.label;
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

setPlanState(0);
