// Motor de Animaciones en Scroll y Revelado Progresivo para SIAPPWeb

function initScrollAnimations() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Respetar preferencias de accesibilidad del usuario
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-init, [data-reveal]').forEach((el) => {
      el.classList.add('reveal-in');
    });
    return;
  }

  // 1. Auto-etiquetar elementos interactivos y tarjetas clave si aún no tienen data-reveal
  const autoSelectors = [
    'section:not([data-no-reveal]) > .max-w-7xl > .text-center',
    'section:not([data-no-reveal]) h2',
    'section:not([data-no-reveal]) .grid > div:not([data-no-reveal])',
    '.reveal-card',
    '[data-reveal]'
  ];

  const candidateElements = document.querySelectorAll(autoSelectors.join(', '));
  candidateElements.forEach((el, idx) => {
    if (!el.classList.contains('reveal-init') && !el.classList.contains('reveal-in')) {
      el.classList.add('reveal-init');
      
      // Si está dentro de una cuadrícula, calcular delay escalonado automático (stagger)
      const parentGrid = el.parentElement;
      if (parentGrid && parentGrid.classList.contains('grid')) {
        const siblings = Array.from(parentGrid.children);
        const childIndex = siblings.indexOf(el);
        if (childIndex >= 0) {
          const staggerDelay = Math.min((childIndex % 6) * 120, 600);
          el.style.setProperty('--reveal-delay', `${staggerDelay}ms`);
        }
      }
    }
  });

  // 2. IntersectionObserver con margen de anticipación natural
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        // Una vez animado, dejamos de observarlo para óptimo rendimiento de CPU/GPU
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 3. Observar todos los elementos con clase .reveal-init o [data-reveal]
  document.querySelectorAll('.reveal-init, [data-reveal]').forEach((el) => {
    // Si ya está en la parte superior visible de la pantalla al cargar, animarlo de inmediato
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setTimeout(() => {
        el.classList.add('reveal-in');
      }, 50);
    } else {
      revealObserver.observe(el);
    }
  });
}

// Inicializar en carga de DOM y en navegación Astro
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
  document.addEventListener('astro:page-load', initScrollAnimations);
}

export default initScrollAnimations;
