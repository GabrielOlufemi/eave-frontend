/**
 * app.js — Eave Health shared utilities
 * - Toast notifications
 * - Page transition fade
 * - CMD+K spotlight navigation
 *
 * Include on every patient-facing page AFTER nav.js
 * Usage: <script src="app.js"></script>
 *        <script>EaveApp.init('home');</script>
 */

window.EaveApp = (function () {

  /* ─── Toast ─────────────────────────────────────────── */
  function toast(message, type = 'default', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-dot"></div><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('toast-out');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  }

  /* ─── Page Transitions ───────────────────────────────── */
  function initTransitions() {
    // Create overlay element
    let overlay = document.getElementById('page-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'page-transition';
      document.body.appendChild(overlay);
    }

    // Intercept all internal link clicks and button navigations
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

      e.preventDefault();
      overlay.classList.add('fade-out');
      setTimeout(() => { EaveAPI.navigate(href); }, 180);
    });
  }

  /* ─── Spotlight (CMD+K) ──────────────────────────────── */
  const SPOTLIGHT_PAGES = [
    { label: 'Home Dashboard',   href: '/dashboard',     icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>` },
    { label: 'Track Metrics',    href: '/metrics',  icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>` },
    { label: 'Previous Visits',  href: '/visits',   icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
    { label: 'Diet Plans',       href: '/recommendations',    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>` },
    { label: 'Eave AI Agent',    href: '/chat',    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>` },
    { label: 'Sign Out',         href: '/login',    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>` },
  ];

  let spotlightOpen = false;
  let focusedIdx = 0;
  let filteredPages = [...SPOTLIGHT_PAGES];

  function buildSpotlightHTML() {
    return `
      <div id="spotlight-overlay">
        <div id="spotlight-box">
          <input id="spotlight-input" placeholder="Go to page..." autocomplete="off" spellcheck="false" />
          <div id="spotlight-results"></div>
          <div class="spotlight-hint">↑↓ navigate &nbsp;·&nbsp; ↵ go &nbsp;·&nbsp; ESC close</div>
        </div>
      </div>`;
  }

  function renderSpotlightResults(query) {
    filteredPages = query
      ? SPOTLIGHT_PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
      : SPOTLIGHT_PAGES;
    focusedIdx = 0;

    const container = document.getElementById('spotlight-results');
    container.innerHTML = filteredPages.map((p, i) => `
      <div class="spotlight-item${i === 0 ? ' focused' : ''}" data-href="${p.href}">
        <span class="spotlight-item-icon">${p.icon}</span>
        ${p.label}
      </div>`).join('');

    container.querySelectorAll('.spotlight-item').forEach((el, i) => {
      el.addEventListener('click', () => navigateSpotlight(i));
    });
  }

  function updateFocus() {
    document.querySelectorAll('.spotlight-item').forEach((el, i) => {
      el.classList.toggle('focused', i === focusedIdx);
      if (i === focusedIdx) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function navigateSpotlight(idx) {
    const page = filteredPages[idx];
    if (page) { closeSpotlight(); EaveAPI.navigate(page.href); }
  }

  function openSpotlight() {
    spotlightOpen = true;
    document.getElementById('spotlight-overlay').classList.add('open');
    const input = document.getElementById('spotlight-input');
    input.value = '';
    renderSpotlightResults('');
    setTimeout(() => input.focus(), 50);
  }

  function closeSpotlight() {
    spotlightOpen = false;
    document.getElementById('spotlight-overlay').classList.remove('open');
  }

  function initSpotlight() {
    const el = document.createElement('div');
    el.innerHTML = buildSpotlightHTML();
    document.body.appendChild(el.firstElementChild);

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.includes('Mac');
      const trigger = isMac ? (e.metaKey && e.key === 'k') : (e.ctrlKey && e.key === 'k');

      if (trigger) { e.preventDefault(); spotlightOpen ? closeSpotlight() : openSpotlight(); return; }
      if (!spotlightOpen) return;

      if (e.key === 'Escape') { closeSpotlight(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); focusedIdx = Math.min(focusedIdx + 1, filteredPages.length - 1); updateFocus(); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); focusedIdx = Math.max(focusedIdx - 1, 0); updateFocus(); return; }
      if (e.key === 'Enter')     { navigateSpotlight(focusedIdx); return; }
    });

    // Search input
    document.getElementById('spotlight-input').addEventListener('input', (e) => {
      renderSpotlightResults(e.target.value);
    });

    // Click outside to close
    document.getElementById('spotlight-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'spotlight-overlay') closeSpotlight();
    });
  }

  /* ─── Public API ─────────────────────────────────────── */
  function init() {
    initTransitions();
    initSpotlight();

    // Show a subtle hint on first load
    const hintKey = 'eave_spotlight_hinted';
    if (!localStorage.getItem(hintKey)) {
      setTimeout(() => {
        const isMac = navigator.platform.includes('Mac');
        toast(`Press ${isMac ? '⌘K' : 'Ctrl+K'} to navigate pages`, 'default', 4000);
        localStorage.setItem(hintKey, '1');
      }, 1500);
    }
  }

  return { init, toast };

})();
