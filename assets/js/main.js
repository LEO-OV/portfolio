// ============================================
// LANGUAGE SYSTEM - Sistema de traducción
// ============================================

let currentLanguage = "es";
let translations = {};

// Cargar traducciones
async function loadTranslations(lang) {
  try {
    const response = await fetch(`/assets/lang/${lang}.json`);
    if (!response.ok) throw new Error("Translation file not found");
    translations = await response.json();
    currentLanguage = lang;
    applyTranslations();
    localStorage.setItem("preferredLanguage", lang);
  } catch (error) {
    console.error("Error loading translations:", error);
  }
}

// Obtener valor de traducción anidado
function getNestedTranslation(section, value) {
  const keys = value.split(".");
  let result = translations[section];

  for (const key of keys) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      return null;
    }
  }

  return result;
}

// Aplicar traducciones a todos los elementos
function applyTranslations() {
  const elements = document.querySelectorAll("[data-section][data-value]");

  elements.forEach((element) => {
    const section = element.getAttribute("data-section");
    const value = element.getAttribute("data-value");
    const translation = getNestedTranslation(section, value);

    if (translation) {
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translation;
      } else {
        element.innerHTML = translation;
      }
    }
  });

  // Actualizar proyectos
  if (translations.projects && translations.projects.items) {
    renderProjects();
  }

  // Actualizar certificaciones
  if (translations.certifications && translations.certifications.items) {
    renderCertifications();
  }
}

// Cambiar idioma
function changeLanguage(lang) {
  if (lang !== currentLanguage) {
    loadTranslations(lang);
    updateLanguageButtons(lang);
  }
}

// Actualizar botones de idioma
function updateLanguageButtons(lang) {
  const buttons = document.querySelectorAll(".lang__button");
  buttons.forEach((button) => {
    const buttonLang = button.getAttribute("data-language");
    if (buttonLang === lang) {
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    }
  });
}

// ============================================
// PROJECTS RENDERING - Renderizado de proyectos
// ============================================

function renderProjects() {
  const projectsGrid = document.getElementById("projectsGrid");
  if (!projectsGrid || !translations.projects) return;

  const projects = translations.projects.items;
  const viewProjectText = translations.projects.viewProject || "View Project";
  const liveDemoText = translations.projects.liveDemo || "Live Demo";
  const technologiesText = translations.projects.technologies || "Technologies";

  projectsGrid.innerHTML = projects
    .map(
      (project) => `
    <article class="project-card">
      <div class="project-card__header">
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__description">${project.description}</p>
      </div>
      
      <div class="project-card__tech">
        <span class="project-card__tech-label">${technologiesText}:</span>
        ${project.technologies
          .map((tech) => `<span class="tech-tag">${tech}</span>`)
          .join("")}
      </div>
      
      <div class="project-card__links">
        ${
          project.github
            ? `
          <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
            </svg>
            ${viewProjectText}
          </a>
        `
            : ""
        }
        ${
          project.demo
            ? `
          <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link project-link--demo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            ${liveDemoText}
          </a>
        `
            : ""
        }
      </div>
    </article>
  `,
    )
    .join("");
}

// ============================================
// THEME TOGGLE - Cambio de tema
// ============================================

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Cargar tema guardado
  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);

  // Toggle theme
  themeToggle?.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButton(newTheme);
  });
}

function updateThemeButton(theme) {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-pressed",
      theme === "dark" ? "true" : "false",
    );
  }
}

// ============================================
// MOBILE MENU - Menú móvil
// ============================================

function initMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const navbar = document.getElementById("navbar");
  const overlay = document.getElementById("menuOverlay");
  const navLinks = document.querySelectorAll(".nav__link");

  function toggleMenu() {
    menuBtn?.classList.toggle("active");
    navbar?.classList.toggle("active");
    overlay?.classList.toggle("active");

    const isExpanded = menuBtn?.classList.contains("active");
    menuBtn?.setAttribute("aria-expanded", isExpanded);
    overlay?.setAttribute("aria-hidden", !isExpanded);

    // Prevent body scroll when menu is open
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  function closeMenu() {
    menuBtn?.classList.remove("active");
    navbar?.classList.remove("active");
    overlay?.classList.remove("active");
    menuBtn?.setAttribute("aria-expanded", "false");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", toggleMenu);
  overlay?.addEventListener("click", closeMenu);

  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 991) {
        closeMenu();
      }
    });
  });

  // Cerrar menú al cambiar tamaño de ventana
  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
      closeMenu();
    }
  });
}

// ============================================
// SMOOTH SCROLL - Desplazamiento suave
// ============================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Ignorar enlaces # vacíos o solo "#"
      if (href === "#" || href === "") return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

// ============================================
// HEADER SCROLL - Efecto de header al hacer scroll
// ============================================

function initHeaderScroll() {
  const header = document.getElementById("header");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      header?.classList.remove("scroll-up");
      return;
    }

    if (
      currentScroll > lastScroll &&
      !header?.classList.contains("scroll-down")
    ) {
      // Scrolling down
      header?.classList.remove("scroll-up");
      header?.classList.add("scroll-down");
    } else if (
      currentScroll < lastScroll &&
      header?.classList.contains("scroll-down")
    ) {
      // Scrolling up
      header?.classList.remove("scroll-down");
      header?.classList.add("scroll-up");
    }

    lastScroll = currentScroll;
  });
}

// ============================================
// ANIMATIONS ON SCROLL - Animaciones al hacer scroll
// ============================================

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos que queremos animar
  const animatedElements = document.querySelectorAll(
    ".card, .project-card, .certification-card, .metric",
  );
  animatedElements.forEach((el) => observer.observe(el));
}

// ============================================
// LANGUAGE BUTTONS - Botones de idioma
// ============================================

function initLanguageButtons() {
  const langButtons = document.querySelectorAll(".lang__button");

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.getAttribute("data-language");
      changeLanguage(lang);
    });
  });
}

// ============================================
// INITIALIZE - Inicialización
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Cargar idioma preferido
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "es";
  loadTranslations(preferredLanguage);
  updateLanguageButtons(preferredLanguage);

  // Inicializar componentes
  initTheme();
  initMobileMenu();
  initSmoothScroll();
  initHeaderScroll();
  initLanguageButtons();

  // Inicializar animaciones después de un pequeño delay
  setTimeout(initScrollAnimations, 100);
});
