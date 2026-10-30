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
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Auto-lock after 15 minutes of inactivity (or customizable)
      timeoutId = setTimeout(() => {
        setIsLocked(true);
      }, 15 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    // Tab-switch panic mode: instantly blackouts screen if browser is minimized or tab switched
    const handleVisibilityChange = () => {
      const tabLockSetting = localStorage.getItem('kd_tab_switch_lock');
      const isEnabled = tabLockSetting === null ? true : tabLockSetting === 'true';
      if (document.hidden && isEnabled) {
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        hoursLogged="06h 45m"
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
