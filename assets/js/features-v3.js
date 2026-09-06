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
