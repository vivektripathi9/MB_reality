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

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isInternalPageLink = (anchor) => {
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      return false;
    }
    let url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return false;
    }
    if (url.origin !== window.location.origin) return false;
    const samePage =
      url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "") &&
      url.search === window.location.search;
    return !samePage;
  };

  if (!reduceMotion) {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (!isInternalPageLink(anchor)) return;
      event.preventDefault();
      if (document.body.classList.contains("is-leaving")) return;
      document.body.classList.add("is-leaving");
        window.setTimeout(() => {
        window.location.href = anchor.href;
      }, 150);
    });

    window.addEventListener("pageshow", (event) => {
      document.body.classList.remove("is-leaving");
      if (event.persisted) {
        document.body.style.animation = "none";
        requestAnimationFrame(() => {
          document.body.style.animation = "";
        });
      }
    });
  }

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
