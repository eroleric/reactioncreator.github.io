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
