import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ExecutiveDashboard from './components/dashboard/ExecutiveDashboard';
import AssetInventoryView from './components/assets/AssetInventoryView';
import EmployeeAllocationView from './components/allocations/EmployeeAllocationView';
import AuditVerificationView from './components/audit/AuditVerificationView';
import OlxSalesView from './components/olx/OlxSalesView';
import ExcelSyncView from './components/excel/ExcelSyncView';
import SecuritySettingsView from './components/security/SecuritySettingsView';
import QuickLockModal from './components/dashboard/QuickLockModal';
import authService from './services/authService';
import dashboardService from './services/dashboardService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [overview, setOverview] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kd_theme') || 'dark';
  });

  // Calculate live hours logged since business start (09:15 AM)
  const calculateHoursLogged = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(9, 15, 0, 0);
    let diffMinutes = Math.floor((now - start) / (1000 * 60));
    if (diffMinutes < 0) diffMinutes = 30;
    if (diffMinutes > 8 * 60) diffMinutes = 8 * 60;
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  const [hoursLogged, setHoursLogged] = useState(calculateHoursLogged);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoursLogged(calculateHoursLogged());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Seamless Backend Authentication Handshake & Live Overview Bootstrap
  useEffect(() => {
    let isMounted = true;
    const bootstrapBackendConnection = async () => {
      try {
        await authService.ensureAuthenticated();
        const overviewData = await dashboardService.getOverview();
        if (isMounted && overviewData) {
          setOverview(overviewData);
        }
      } catch (err) {
        console.warn('[App] Backend connection notice:', err);
      }
    };
    bootstrapBackendConnection();
    return () => { isMounted = false; };
  }, []);

  // Apply theme to document element and body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
    }
    localStorage.setItem('kd_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Inactivity auto-lock safety (vital for the 6 people sharing the laptop!)
  useEffect(() => {
    let timeoutId;
    // Read timeout from Security Settings (default 10 minutes if not set)
    const getInactivityMs = () => {
      const stored = localStorage.getItem('kd_inactivity_timeout');
      const minutes = stored ? parseInt(stored, 10) : 10;
      return (isNaN(minutes) || minutes < 1 ? 10 : minutes) * 60 * 1000;
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLocked(true);
      }, getInactivityMs());
    };

    // Only listen to meaningful interaction events — not mousemove (too frequent, causes CPU churn)
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer(); // Start the initial timer

    // Tab-switch panic mode: instantly blackouts screen if user switches away
    // Only activates if user has explicitly opted in (kd_tab_switch_lock = 'true')
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const tabLockSetting = localStorage.getItem('kd_tab_switch_lock');
        const isEnabled = tabLockSetting === 'true'; // Default OFF — don't lock on every tab navigation
        if (isEnabled) {
          setIsLocked(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for session expired events from the API interceptor
    const handleSessionExpired = () => setIsLocked(true);
    window.addEventListener('kd_session_expired', handleSessionExpired);

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('kd_session_expired', handleSessionExpired);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard 
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onQuickLock={() => setIsLocked(true)}
            overview={overview}
            hoursLogged={hoursLogged}
          />
        );

      case 'assets':
        return (
          <AssetInventoryView 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        );

      case 'allocation':
        return (
          <EmployeeAllocationView 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        );

      case 'audit':
        return (
          <AuditVerificationView 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        );

      case 'olx':
        return (
          <OlxSalesView 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        );

      case 'excel':
        return (
          <ExcelSyncView 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        );

      case 'security':
        return (
          <SecuritySettingsView 
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onTriggerLock={() => setIsLocked(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );

      default:
        return (
          <ExecutiveDashboard 
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onQuickLock={() => setIsLocked(true)}
            overview={overview}
            hoursLogged={hoursLogged}
          />
        );
    }
  };

  return (
    <div className={`min-vh-100 ${theme === 'light' ? 'bg-light text-dark' : 'bg-black text-white'} position-relative`}>
      {/* CEO Privacy Lock Screen (Protects against the 6 laptop users) */}
      <QuickLockModal 
        isLocked={isLocked} 
        onUnlock={() => setIsLocked(false)} 
      />

      {/* Top Workday-Style Executive Navbar */}
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onQuickLock={() => setIsLocked(true)}
        hoursLogged={hoursLogged}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Left Collapsible Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        overview={overview}
      />

      {/* Main Content Stage */}
      <main className={`kd-main-stage ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="container-fluid px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
