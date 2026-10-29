import React, { useState, useEffect } from 'react';

export default function Navbar({ 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  mobileOpen, 
  setMobileOpen,
  onQuickLock,
  hoursLogged = "06h 45m",
  theme = "dark",
  onToggleTheme
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnDuty, setIsOnDuty] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <header className="kd-navbar fixed-top px-3 px-lg-4 d-flex align-items-center justify-content-between">
      {/* Brand & Toggler */}
      <div className="d-flex align-items-center gap-3">
        {/* Mobile Toggler */}
        <button 
          className="kd-toggler-btn d-lg-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        {/* Desktop Toggler */}
        <button 
          className="kd-toggler-btn d-none d-lg-inline-flex"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i className={`bi ${sidebarCollapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar-inset-reverse'} fs-6`}></i>
        </button>

        {/* Architectural Brand Identity */}
        <div className="d-flex align-items-center gap-2">
          <div className="kd-brand-mark">
            KD
          </div>
          <div>
            <div className="fw-bold text-white text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.88rem', lineHeight: 1.2 }}>
              Kothari Distributors
            </div>
            <div className="kd-mono text-secondary" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              CEO IT & OPERATIONS COMMAND
            </div>
          </div>
        </div>
      </div>

      {/* Center: Precision Clock (JetBrains Mono) */}
      <div className="d-none d-md-flex align-items-center gap-3 px-3 py-1 rounded-2" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
        <div className="kd-mono small text-secondary d-flex align-items-center gap-2">
          <i className="bi bi-calendar4"></i>
          <span>{formatDate(currentTime)}</span>
        </div>
        <span className="text-secondary opacity-25">/</span>
        <div className="kd-mono small text-white fw-bold d-flex align-items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span>{formatTime(currentTime)}</span>
          <span className="text-secondary" style={{ fontSize: '0.7rem' }}>IST</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-2 gap-lg-3">
        {/* Hours Logged Badge */}
        <div 
          className="d-none d-xl-flex align-items-center gap-2 px-3 py-1 rounded-2 kd-mono"
          style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', fontSize: '0.78rem' }}
          title="Daily Working Hours Logged"
        >
          <span className="text-secondary">HOURS:</span>
          <span className="text-white fw-bold">{hoursLogged}</span>
        </div>

        {/* Duty Status Switch */}
        <button
          className="kd-btn-outline py-1 px-2 px-sm-3"
          onClick={() => setIsOnDuty(!isOnDuty)}
          style={{ fontSize: '0.78rem' }}
          title="Toggle Active Duty Status"
        >
          <span 
            style={{ 
              width: 7, 
              height: 7, 
              borderRadius: '50%',
              backgroundColor: isOnDuty ? '#10b981' : '#71717a',
              display: 'inline-block'
            }}
          />
          <span className="d-none d-sm-inline">{isOnDuty ? 'ACTIVE' : 'STANDBY'}</span>
        </button>

        {/* Attractive Executive Theme Toggle Switch (Zero Text) */}
        <button
          type="button"
          className={`kd-theme-switch-pill ${theme === 'light' ? 'light-active' : 'dark-active'}`}
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Switch to Modern Executive White Theme" : "Switch to Pure Pitch Black Theme"}
          aria-label="Toggle visual theme"
        >
          <span className="kd-theme-switch-track">
            <i className="bi bi-moon-stars-fill kd-switch-moon"></i>
            <i className="bi bi-sun-fill kd-switch-sun"></i>
          </span>
          <span className="kd-theme-switch-thumb">
            <i className={`bi ${theme === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
          </span>
        </button>

        {/* Quick Lock */}
        <button
          className="kd-btn-danger-outline py-1 px-2 px-sm-3"
          onClick={onQuickLock}
          title="Lock Dashboard (Protects against other users on your laptop)"
        >
          <i className="bi bi-lock-fill"></i>
          <span className="d-none d-sm-inline">LOCK</span>
        </button>

        {/* CEO Avatar Profile */}
        <div className="d-flex align-items-center gap-2 ps-2 border-start border-secondary-subtle">
          <div 
            className="kd-mono d-flex align-items-center justify-content-center text-white fw-bold rounded-2"
            style={{ 
              width: 32, 
              height: 32, 
              background: 'var(--kd-surface-2)',
              border: '1px solid var(--kd-border)',
              fontSize: '0.78rem'
            }}
            title="Owner & CEO Account (R.L. Kothari)"
          >
            RK
          </div>
          <div className="d-none d-xxl-block text-start">
            <div className="text-white fw-semibold small" style={{ lineHeight: 1.1 }}>R.L. Kothari</div>
            <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>CEO / OWNER</div>
          </div>
        </div>
      </div>
    </header>
  );
}
