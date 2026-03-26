/**
 * provider-nav.js — Eave Provider shared navigation
 * Role-aware: adapts links and user display based on localStorage role
 * Usage: EaveProviderNav.init('lookup' | 'vitals')
 */
window.EaveProviderNav = (function () {

  const DOCTOR_PAGES = [
    {
      key: 'lookup', label: 'Patient Lookup', href: 'provider-lookup.html',
      icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/></svg>`
    },
    {
      key: 'schedule', label: 'My Schedule', href: '#', badge: '3',
      icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
    }
  ];

  const NURSE_PAGES = [
    {
      key: 'lookup', label: 'Patient Lookup', href: 'provider-lookup.html',
      icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/></svg>`
    },
    {
      key: 'vitals', label: 'Vitals Entry', href: 'nurse-vitals.html',
      icon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`
    }
  ];

  function getRole() { return localStorage.getItem('eave_role') || 'doctor'; }

  function getUserDisplay() {
    const role = getRole();
    const name = localStorage.getItem('eave_provider_name') || (role === 'nurse' ? 'Nurse On Duty' : 'Dr. Jenkins');
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return { name, initials };
  }

  function build(activeKey) {
    const role = getRole();
    const pages = role === 'nurse' ? NURSE_PAGES : DOCTOR_PAGES;
    const { name, initials } = getUserDisplay();

    const navItems = pages.map(p => {
      const badge = p.badge ? `<span class="prov-nav-badge">${p.badge}</span>` : '';
      return `
        <button class="prov-nav-btn${p.key === activeKey ? ' active' : ''}" onclick="location.href='${p.href}'">
          <div class="prov-nav-left">${p.icon}${p.label}</div>
          ${badge}
        </button>`;
    }).join('');

    return `
      <div id="prov-menu-hint" aria-hidden="true">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </div>
      <div id="prov-sidebar-trigger">
        <div id="prov-sidebar-panel">
          <div class="prov-brand">
            <div class="prov-brand-icon">E</div>
            <span>Eave ${role === 'nurse' ? 'Nursing' : 'Provider'}</span>
          </div>
          <nav class="prov-nav">
            <p class="prov-nav-group-label">${role === 'nurse' ? 'Nurse Portal' : 'Provider Portal'}</p>
            ${navItems}
          </nav>
          <div class="prov-footer">
            <button class="prov-user">
              <div class="prov-avatar">${initials}</div>
              <div class="prov-user-info">
                <span class="prov-user-name">${name}</span>
                <span class="prov-user-role">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-left:auto;color:#6b7280;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  function injectStyles() {
    if (document.getElementById('eave-prov-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'eave-prov-nav-styles';
    style.textContent = `
      #prov-menu-hint { position:fixed;top:32px;left:32px;z-index:30;color:#4b5563;pointer-events:none;transition:opacity 0.3s; }
      #prov-sidebar-trigger { position:fixed;top:48px;bottom:48px;left:0;width:32px;z-index:50; }
      #prov-sidebar-trigger::before { content:'';position:absolute;inset-y:-48px;left:0;width:56px;background:transparent; }
      #prov-sidebar-trigger:hover #prov-sidebar-panel,
      #prov-sidebar-panel:hover { transform:translateX(0)!important;opacity:1!important;pointer-events:auto!important; }
      #prov-sidebar-trigger:hover ~ #prov-menu-hint { opacity:0; }
      #prov-sidebar-panel {
        position:absolute;top:0;left:16px;width:250px;max-height:600px;height:75vh;
        background:#141414;border:1px solid #252528;border-radius:20px;padding:16px;
        display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.8);
        transform:translateX(-110%);opacity:0;
        transition:transform 0.3s cubic-bezier(0.16,1,0.3,1),opacity 0.3s;pointer-events:none;
      }
      .prov-brand { display:flex;align-items:center;gap:12px;margin-bottom:40px;padding:0 8px;margin-top:8px; }
      .prov-brand-icon { width:24px;height:24px;background:white;color:black;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;border-radius:4px; }
      .prov-brand span { color:white;font-weight:500;font-size:13px; }
      .prov-nav { display:flex;flex-direction:column;gap:2px;flex:1; }
      .prov-nav-group-label { padding:0 12px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;font-family:monospace; }
      .prov-nav-btn { display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:500;background:transparent;border:1px solid transparent;color:#9ca3af;cursor:pointer;transition:all 0.15s;text-align:left;width:100%; }
      .prov-nav-btn:hover { background:rgba(255,255,255,0.05);color:#e5e7eb; }
      .prov-nav-btn.active { background:rgba(255,255,255,0.08);color:white;border-color:rgba(255,255,255,0.08); }
      .prov-nav-left { display:flex;align-items:center;gap:12px; }
      .prov-nav-badge { font-size:10px;background:rgba(255,255,255,0.1);color:#d1d5db;padding:2px 6px;border-radius:4px; }
      .prov-footer { margin-top:auto;padding-top:16px;border-top:1px solid rgba(34,34,34,0.6); }
      .prov-user { display:flex;align-items:center;gap:10px;padding:8px;border-radius:6px;cursor:pointer;background:transparent;border:none;width:100%;color:#d1d5db;transition:all 0.15s; }
      .prov-user:hover { background:rgba(255,255,255,0.05); }
      .prov-avatar { width:28px;height:28px;background:#1a1a1a;border:1px solid #374151;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:600;flex-shrink:0; }
      .prov-user-info { display:flex;flex-direction:column;gap:1px;text-align:left; }
      .prov-user-name { font-size:13px;font-weight:500;color:white; }
      .prov-user-role { font-size:10px;color:#6b7280;text-transform:capitalize;font-family:monospace; }
    `;
    document.head.appendChild(style);
  }

  function init(activeKey) {
    injectStyles();
    const host = document.createElement('div');
    host.innerHTML = build(activeKey);
    Array.from(host.children).forEach(el => document.body.insertBefore(el, document.body.firstChild));
  }

  return { init };
})();
