import React, { useEffect } from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Command',
      icon: 'bi-grid-1x2',
      badge: 'LIVE',
      badgeClass: 'kd-tag-emerald',
    },
    {
      id: 'assets',
      label: 'IT Asset Inventory',
      icon: 'bi-laptop',
      badge: '248',
      badgeClass: 'kd-tag-neutral',
    },
    {
      id: 'allocation',
      label: 'Employee Allocation',
      icon: 'bi-people',
      badge: '185',
      badgeClass: 'kd-tag-neutral',
    },
    {
      id: 'audit',
      label: 'Audit & Verification',
      icon: 'bi-shield-check',
      badge: '3 DUE',
      badgeClass: 'kd-tag-amber',
    },
    {
      id: 'olx',
      label: 'OLX Sales Pipeline',
      icon: 'bi-tag',
      badge: '14 ACTIVE',
      badgeClass: 'kd-tag-neutral',
    },
    {
      id: 'excel',
      label: 'Excel Sync & Backup',
      icon: 'bi-file-earmark-spreadsheet',
      badge: 'READY',
      badgeClass: 'kd-tag-neutral',
    },
    {
      id: 'security',
      label: 'Security & Profile',
      icon: 'bi-shield-lock',
      badge: 'CEO',
      badgeClass: 'kd-tag-rose',
    }
  ];

  // Lock body scroll when mobile drawer is open to prevent background bouncing
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Handle ESC key and viewport resize transitions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 992 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen, setMobileOpen]);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  // On phone screens (when mobileOpen), always show labels, badges, and headers
  const isExpanded = !sidebarCollapsed || mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="kd-mobile-backdrop d-lg-none" 
          onClick={() => setMobileOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside 
        className={`kd-sidebar ${sidebarCollapsed && !mobileOpen ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Mobile Top Header (Brand & Explicit Close Button) */}
        <div className="kd-sidebar-mobile-header d-flex d-lg-none align-items-center justify-content-between px-3 py-3 border-bottom border-secondary-subtle">
          <div className="d-flex align-items-center gap-2">
            <div className="kd-brand-mark" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              KD
            </div>
            <div>
              <div className="fw-bold text-white text-uppercase" style={{ fontSize: '0.84rem', letterSpacing: '0.06em', lineHeight: 1.2 }}>
                Kothari Command
              </div>
              <div className="kd-mono text-secondary" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>
                EXECUTIVE PORTAL
              </div>
            </div>
          </div>
          <button
            type="button"
            className="kd-sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            title="Close Navigation"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {isExpanded && (
          <div className="px-3 pt-3 pb-2 text-uppercase text-secondary fw-bold kd-sidebar-section-title" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            Modules & Operations
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-grow-1 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`kd-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }
                }}
                title={!isExpanded ? item.label : undefined}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="kd-nav-icon">
                  <i className={`bi ${item.icon}`}></i>
                </span>

                {isExpanded && (
                  <div className="d-flex align-items-center justify-content-between flex-grow-1 ms-2 overflow-hidden">
                    <span className="text-truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`kd-tag ms-2 ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Minimalist Security & Sync Status */}
        <div className="p-3 border-top border-secondary-subtle kd-sidebar-footer">
          {isExpanded ? (
            <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>LAPTOP PRIVACY</span>
                <span className="kd-tag kd-tag-emerald py-0" style={{ fontSize: '0.62rem' }}>STRICT</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>CLOUD SYNC</span>
                <span className="kd-mono text-white fw-semibold" style={{ fontSize: '0.68rem' }}>ONLINE</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-secondary py-1" title="Security Active">
              <i className="bi bi-shield-check fs-6"></i>
            </div>
          )}

          {/* Desktop Collapse Button */}
          <div className="d-none d-lg-block mt-2">
            <button
              className="btn btn-sm w-100 text-secondary border border-secondary-subtle py-1"
              style={{ fontSize: '0.72rem', background: 'var(--kd-surface-2)' }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} me-1`}></i>
              {!sidebarCollapsed && <span>COLLAPSE</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
