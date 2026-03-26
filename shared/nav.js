/**
 * nav.js — Eave Health shared navigation (v2)
 * Pass the active page key: 'home' | 'visits' | 'agent'
 */

window.EaveNav = (function () {

  const PAGES = [
    {
      key: 'home', label: 'Home', href: '/dashboard',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
    },
    {
      key: 'agent', label: 'Chat', href: '/chat',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`
    },
    {
      key: 'visits', label: 'Previous Visits', href: '/visits',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    }
  ];

  const BOT_NAV_KEYS   = ['home', 'agent', 'visits'];
  const BOT_NAV_LABELS = { home: 'Home', agent: 'Chat', visits: 'History' };

  function buildSidebar(active) {
    const links = PAGES.map(p => `
      <a href="${p.href}" class="nav-link${p.key === active ? ' active' : ''}">
        <span class="nav-icon">${p.icon}</span>
        ${p.label}
      </a>`).join('');

    return `
      <div id="menu-hint" aria-hidden="true">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </div>

      <div id="sidebar-trigger" role="navigation" aria-label="Main navigation">
        <div id="sidebar-panel">
          <div class="sidebar-brand">
            <div class="brand-icon">E</div>
            <span>Eave Health</span>
          </div>
          <nav class="sidebar-nav">
            <p class="nav-group-label">Menu</p>
            ${links}
          </nav>
          <div class="sidebar-footer">
            <button class="sidebar-user" aria-label="User profile">
              <div class="avatar">JD</div>
              <span class="name">John Doe</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  function buildBottomNav(active) {
    const btns = BOT_NAV_KEYS.map(key => {
      const p = PAGES.find(x => x.key === key);
      return `
        <button class="nav-btn${key === active ? ' active' : ''}"
                onclick="EaveAPI.navigate(p.href)"
                aria-label="${BOT_NAV_LABELS[key]}">
          <div class="active-dot"></div>
          <span class="nav-icon">${p.icon}</span>
          <span class="nav-label">${BOT_NAV_LABELS[key]}</span>
        </button>`;
    }).join('');

    return `
      <div id="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <nav><div class="nav-items">${btns}</div></nav>
      </div>`;
  }

  function injectStyles() {
    if (document.getElementById('eave-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'eave-nav-styles';
    style.textContent = `
      .nav-icon { width: 16px; height: 16px; display: flex; align-items: center; flex-shrink: 0; }
      .nav-icon svg { width: 100%; height: 100%; }

      #bottom-nav .nav-icon { width: 24px; height: 24px; }
      #bottom-nav .nav-btn .nav-icon { transition: transform 0.3s; }
      #bottom-nav .nav-btn.active .nav-icon { transform: translateY(-4px); }

      #sidebar-trigger {
        position: fixed;
        top: 48px; bottom: 48px; left: 0;
        width: 32px; z-index: 50;
      }
      #sidebar-trigger::before {
        content: '';
        position: absolute;
        inset-y: -48px; left: 0;
        width: 56px;
        background: transparent;
      }
      #sidebar-trigger:hover #sidebar-panel,
      #sidebar-panel:hover {
        transform: translateX(0) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      #sidebar-trigger:hover ~ #menu-hint,
      #sidebar-trigger:hover #menu-hint { opacity: 0; }
    `;
    document.head.appendChild(style);
  }

  function init(activeKey) {
    injectStyles();
    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) { console.warn('[EaveNav] No .page-wrapper found.'); return; }

    const sidebarEl = document.createElement('div');
    sidebarEl.className = 'eave-sidebar-host';
    sidebarEl.innerHTML = buildSidebar(activeKey);
    wrapper.insertBefore(sidebarEl, wrapper.firstChild);

    const navEl = document.createElement('div');
    navEl.innerHTML = buildBottomNav(activeKey);
    wrapper.appendChild(navEl.firstElementChild);
  }

  return { init };
})();
