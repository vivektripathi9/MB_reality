(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".nav a");

  if (toggle && header) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const sections = document.querySelectorAll("section[id], footer[id]");
  const setActive = () => {
    if (![...navLinks].some((link) => (link.getAttribute("href") || "").startsWith("#"))) {
      return;
    }
    const y = window.scrollY + 120;
    let current = "home";
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      link.classList.toggle("is-active", href === `#${current}`);
    });
  };
  let scrollTick = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        setActive();
        scrollTick = false;
      });
    },
    { passive: true }
  );
  setActive();

  document.querySelectorAll(".about-accordion").forEach((accordion) => {
    accordion.querySelectorAll(".about-accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".about-accordion-item");
        const isOpen = item.classList.contains("is-open");
        accordion.querySelectorAll(".about-accordion-item").forEach((el) => {
          el.classList.remove("is-open");
          el.querySelector(".about-accordion-trigger")?.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
})();
