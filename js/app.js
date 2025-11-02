const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = Array.from(
  document.querySelectorAll(".site-nav .js-navlink")
);
const siteNavLinks = document.querySelectorAll(".site-nav a");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const observedSections = document.querySelectorAll("[data-observe]");
const scrollSections = document.querySelectorAll(".js-section");
const yearEl = document.getElementById("year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const HEADER_CONDENSE_OFFSET = 160;
let scrollTicking = false;
let activeNavLink = null;

const navLinkMap = new Map();
navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && href.startsWith("#")) {
    navLinkMap.set(href.slice(1), link);
  }
});

const activateNavLink = (id) => {
  if (!id || !navLinkMap.has(id)) {
    return;
  }

  const targetLink = navLinkMap.get(id);
  if (activeNavLink === targetLink) {
    return;
  }

  navLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  targetLink.classList.add("is-active");
  targetLink.setAttribute("aria-current", "page");
  activeNavLink = targetLink;
};

const defaultActiveId = navLinks[0]?.getAttribute("href")?.slice(1);
if (defaultActiveId) {
  activateNavLink(defaultActiveId);
}

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }
};

const openMenu = () => {
  document.body.classList.add("menu-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "true");
  }
};

const toggleMenu = () => {
  if (document.body.classList.contains("menu-open")) {
    closeMenu();
  } else {
    openMenu();
  }
};

menuToggle?.addEventListener("click", () => {
  toggleMenu();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

siteNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

const getHeaderOffset = () => {
  const headerHeight = siteHeader?.offsetHeight ?? 0;
  return headerHeight + 16;
};

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    activateNavLink(targetId.slice(1));
    const offset = getHeaderOffset();
    const top =
      target.getBoundingClientRect().top + window.pageYOffset - offset;

    if (prefersReducedMotion.matches) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  });
});

const observeSections = () => {
  if (!scrollSections.length || !navLinks.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          activateNavLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-100px 0px -30% 0px",
      threshold: [0.35, 0.5, 0.75],
    }
  );

  scrollSections.forEach((section) => {
    observer.observe(section);
  });
};

observeSections();

const setScrollReveal = () => {
  if (prefersReducedMotion.matches) {
    observedSections.forEach((section) => {
      section.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observerRef) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observerRef.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.2,
    }
  );

  observedSections.forEach((section) => {
    revealObserver.observe(section);
  });
};

setScrollReveal();

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const updateHeaderCondensedState = () => {
  if (!siteHeader) {
    return;
  }
  const shouldCondense = window.scrollY > HEADER_CONDENSE_OFFSET;
  siteHeader.classList.toggle("site-header--condensed", shouldCondense);
};

updateHeaderCondensedState();

window.addEventListener("scroll", () => {
  if (scrollTicking) {
    return;
  }
  window.requestAnimationFrame(() => {
    updateHeaderCondensedState();
    scrollTicking = false;
  });
  scrollTicking = true;
});
