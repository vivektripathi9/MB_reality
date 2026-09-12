(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".nav a");

  if (toggle && header) {
    const closeMenu = () => {
      header.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };

    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.classList.contains("js-brochure-open")) {
          event.preventDefault();
        }
        closeMenu();
      });
    });

    const contactLink = header.querySelector(".header-contact");
    if (contactLink) {
      contactLink.addEventListener("click", closeMenu);
    }
  }

  const ensureBrochureModal = () => {
    let modal = document.getElementById("brochure-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "brochure-modal";
    modal.className = "brochure-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "brochure-modal-title");
    modal.hidden = true;
    modal.innerHTML = `
      <div class="brochure-modal-backdrop" data-brochure-close></div>
      <div class="brochure-modal-dialog">
        <button type="button" class="brochure-modal-close" data-brochure-close aria-label="Close">&times;</button>
        <h2 id="brochure-modal-title" class="brochure-modal-title">Download Brochure</h2>
        <p class="brochure-modal-copy">Share your details and we&rsquo;ll send the brochure to your inbox.</p>
        <form class="brochure-modal-form" action="#" method="post">
          <div class="brochure-modal-field">
            <label for="brochure-name">Full Name*</label>
            <input id="brochure-name" name="name" type="text" autocomplete="name" required />
          </div>
          <div class="brochure-modal-field">
            <label for="brochure-email">Email*</label>
            <input id="brochure-email" name="email" type="email" autocomplete="email" required />
          </div>
          <div class="brochure-modal-field">
            <label for="brochure-phone">Phone Number*</label>
            <input id="brochure-phone" name="phone" type="tel" autocomplete="tel" required />
          </div>
          <label class="brochure-modal-consent">
            <input type="checkbox" name="consent" required />
            <span>I authorize MB Realty and its representatives to contact me with the brochure and related updates via phone, email or WhatsApp.</span>
          </label>
          <button class="brochure-modal-submit" type="submit">Submit</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  };

  const brochureModal = ensureBrochureModal();
  const brochureForm = brochureModal.querySelector(".brochure-modal-form");

  const openBrochureModal = () => {
    brochureModal.hidden = false;
    requestAnimationFrame(() => {
      brochureModal.classList.add("is-open");
      document.body.classList.add("brochure-modal-open");
      brochureModal.querySelector("#brochure-name")?.focus();
    });
  };

  const closeBrochureModal = () => {
    brochureModal.classList.remove("is-open");
    document.body.classList.remove("brochure-modal-open");
    window.setTimeout(() => {
      if (!brochureModal.classList.contains("is-open")) {
        brochureModal.hidden = true;
      }
    }, 300);
  };

  document.querySelectorAll(".js-brochure-open").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openBrochureModal();
    });
  });

  brochureModal.querySelectorAll("[data-brochure-close]").forEach((el) => {
    el.addEventListener("click", closeBrochureModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && brochureModal.classList.contains("is-open")) {
      closeBrochureModal();
    }
  });

  brochureForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    brochureForm.reset();
    closeBrochureModal();
  });

  const updateHeaderScroll = () => {
    if (!header) return;
    const currentY = window.scrollY;
    const menuOpen = header.classList.contains("nav-open");

    header.classList.toggle("is-scrolled", currentY > 24);

    if (menuOpen || currentY <= 40) {
      header.classList.remove("is-hidden");
    } else {
      header.classList.add("is-hidden");
    }
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

  const revealSections = document.querySelectorAll(
    ".belief, .lap, .spaces, .blogs--featured, .about-team, .about-vision, .microsite-amenities, .blogs-article, .blogs-more"
  );
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
        { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
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

  const aboutTeam = document.querySelector(".about-team");
  if (aboutTeam) {
    const track = aboutTeam.querySelector(".about-team-track");
    const prevBtn = aboutTeam.querySelector(".about-team-prev");
    const nextBtn = aboutTeam.querySelector(".about-team-next");
    const teamReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let busy = false;

    const markSettled = () => {
      if (!aboutTeam.classList.contains("is-inview") || aboutTeam.classList.contains("is-settled")) return;
      window.setTimeout(() => aboutTeam.classList.add("is-settled"), teamReduceMotion ? 0 : 1000);
    };
    markSettled();
    new MutationObserver(markSettled).observe(aboutTeam, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const cardStep = () => {
      const card = track?.querySelector(".about-team-card");
      if (!card || !track) return 0;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    };

    const setBusy = (state) => {
      busy = state;
      prevBtn?.toggleAttribute("disabled", state);
      nextBtn?.toggleAttribute("disabled", state);
    };

    const rotate = (direction) => {
      if (!track || busy) return;
      const cards = track.children;
      if (cards.length < 2) return;

      const distance = cardStep();
      if (!distance) return;

      if (teamReduceMotion) {
        if (direction > 0) track.appendChild(cards[0]);
        else track.insertBefore(cards[cards.length - 1], cards[0]);
        return;
      }

      setBusy(true);
      const ease = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

      if (direction > 0) {
        const first = cards[0];
        track.style.transition = ease;
        track.style.transform = `translate3d(-${distance}px, 0, 0)`;

        const finish = (event) => {
          if (event.propertyName !== "transform") return;
          track.removeEventListener("transitionend", finish);
          track.appendChild(first);
          track.style.transition = "none";
          track.style.transform = "translate3d(0, 0, 0)";
          void track.offsetWidth;
          track.style.transition = "";
          setBusy(false);
        };
        track.addEventListener("transitionend", finish);
      } else {
        const last = cards[cards.length - 1];
        track.style.transition = "none";
        track.insertBefore(last, cards[0]);
        track.style.transform = `translate3d(-${distance}px, 0, 0)`;
        void track.offsetWidth;
        requestAnimationFrame(() => {
          track.style.transition = ease;
          track.style.transform = "translate3d(0, 0, 0)";
          const finish = (event) => {
            if (event.propertyName !== "transform") return;
            track.removeEventListener("transitionend", finish);
            track.style.transition = "";
            setBusy(false);
          };
          track.addEventListener("transitionend", finish);
        });
      }
    };

    prevBtn?.addEventListener("click", () => rotate(-1));
    nextBtn?.addEventListener("click", () => rotate(1));
  }

  const aboutVision = document.querySelector(".about-vision");
  if (aboutVision && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let raf = 0;
    let targetX = 50;
    let targetY = 40;
    let currentX = 50;
    let currentY = 40;

    const render = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      aboutVision.style.setProperty("--spot-x", `${currentX}%`);
      aboutVision.style.setProperty("--spot-y", `${currentY}%`);
      raf = requestAnimationFrame(render);
    };

    const onMove = (event) => {
      const rect = aboutVision.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
    };

    aboutVision.addEventListener("pointerenter", (event) => {
      aboutVision.classList.add("is-cursor-active");
      onMove(event);
      currentX = targetX;
      currentY = targetY;
      if (!raf) raf = requestAnimationFrame(render);
    });

    aboutVision.addEventListener("pointerleave", () => {
      aboutVision.classList.remove("is-cursor-active");
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });

    aboutVision.addEventListener("pointermove", onMove);
  }

  const locationHub = document.querySelector(".microsite-location-hub");
  if (locationHub) {
    const detail = locationHub.querySelector(".microsite-location-detail");
    const detailImg = detail?.querySelector(".microsite-location-detail-media img");
    const detailTitle = detail?.querySelector(".microsite-location-detail-title");
    const detailTime = detail?.querySelector(".microsite-location-detail-time");
    const detailInfo = detail?.querySelector(".microsite-location-detail-info");
    const closeBtn = detail?.querySelector(".microsite-location-detail-close");
    const nodes = [...locationHub.querySelectorAll(".microsite-location-node")];
    const triggers = [...locationHub.querySelectorAll(".microsite-location-trigger")];

    const closeDetail = () => {
      if (!detail) return;
      detail.classList.remove("is-open", "is-above");
      detail.hidden = true;
      nodes.forEach((node) => node.classList.remove("is-active"));
    };

    const placeDetail = (trigger) => {
      if (!detail) return;
      const icon = trigger.querySelector(".microsite-location-icon") || trigger;
      const hubRect = locationHub.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      const gap = 14;
      const panelWidth = Math.min(280, hubRect.width * 0.58);
      const panelHeight = detail.offsetHeight || 260;

      let left = iconRect.left - hubRect.left + iconRect.width / 2 - panelWidth / 2;
      left = Math.max(8, Math.min(left, hubRect.width - panelWidth - 8));

      const spaceBelow = hubRect.bottom - iconRect.bottom;
      const placeAbove = spaceBelow < panelHeight + gap && iconRect.top - hubRect.top > panelHeight + gap;

      detail.classList.toggle("is-above", placeAbove);

      let top;
      if (placeAbove) {
        top = iconRect.top - hubRect.top - panelHeight - gap;
      } else {
        top = iconRect.bottom - hubRect.top + gap;
      }
      top = Math.max(8, Math.min(top, hubRect.height - panelHeight - 8));

      detail.style.width = `${panelWidth}px`;
      detail.style.left = `${left}px`;
      detail.style.top = `${top}px`;
    };

    const openDetail = (trigger) => {
      if (!detail || !detailImg || !detailTitle || !detailTime || !detailInfo) return;
      const node = trigger.closest(".microsite-location-node");
      nodes.forEach((item) => item.classList.toggle("is-active", item === node));
      detailImg.src = trigger.dataset.locImage || "";
      detailImg.alt = trigger.dataset.locTitle || "";
      detailTitle.textContent = trigger.dataset.locTitle || "";
      detailTime.textContent = trigger.dataset.locTime || "";
      detailInfo.textContent = trigger.dataset.locInfo || "";
      detail.hidden = false;
      placeDetail(trigger);
      requestAnimationFrame(() => {
        placeDetail(trigger);
        detail.classList.add("is-open");
      });
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const node = trigger.closest(".microsite-location-node");
        if (node?.classList.contains("is-active") && detail && !detail.hidden) {
          closeDetail();
          return;
        }
        openDetail(trigger);
      });
    });

    closeBtn?.addEventListener("click", closeDetail);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDetail();
    });

    document.addEventListener("click", (event) => {
      if (!detail || detail.hidden) return;
      if (event.target.closest(".microsite-location-detail")) return;
      if (event.target.closest(".microsite-location-trigger")) return;
      closeDetail();
    });
  }
})();
