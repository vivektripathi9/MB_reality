(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".nav a");

  if (toggle && header) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      updateHeaderScroll();
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        updateHeaderScroll();
      });
    });
  }

  const updateHeaderScroll = () => {
    if (!header) return;
    const atTop = window.scrollY <= 24;
    header.classList.toggle("is-hidden", !atTop && !header.classList.contains("nav-open"));
  };

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
        updateHeaderScroll();
        setActive();
        scrollTick = false;
      });
    },
    { passive: true }
  );
  updateHeaderScroll();
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

  const revealSections = document.querySelectorAll(".belief, .lap, .spaces, .blogs--featured");
  if (revealSections.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealSections.forEach((section) => section.classList.add("is-inview"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-inview");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      revealSections.forEach((section) => revealObserver.observe(section));
    }
  }

  const spacesCards = document.querySelectorAll(".spaces-card[data-spaces-index]");
  if (spacesCards.length && !reduceMotion) {
    let focusIndex = 0;
    const total = 6;
    const setFocus = (index) => {
      spacesCards.forEach((card) => {
        card.classList.toggle("is-focus", Number(card.dataset.spacesIndex) === index);
      });
    };
    setFocus(focusIndex);
    window.setInterval(() => {
      focusIndex = (focusIndex + 1) % total;
      setFocus(focusIndex);
    }, 3200);
  }

  const blogsFeatured = document.querySelector(".blogs--featured");
  if (blogsFeatured) {
    const slides = [...blogsFeatured.querySelectorAll(".blogs-slide")];
    const dots = [...blogsFeatured.querySelectorAll(".blogs-dot")];
    let active = 0;

    const showSlide = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const on = i === active;
        slide.hidden = !on;
        slide.classList.remove("is-active");
        if (on) {
          // Restart stagger animation on each change
          void slide.offsetWidth;
          slide.classList.add("is-active");
        }
      });
      dots.forEach((dot, i) => {
        const on = i === active;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", String(on));
      });
    };

    blogsFeatured.addEventListener("click", (event) => {
      const prev = event.target.closest(".blogs-nav-prev");
      const next = event.target.closest(".blogs-nav-next");
      const dot = event.target.closest(".blogs-dot");
      if (prev) showSlide(active - 1);
      if (next) showSlide(active + 1);
      if (dot && dot.dataset.blogIndex != null) showSlide(Number(dot.dataset.blogIndex));
    });
  }
})();
