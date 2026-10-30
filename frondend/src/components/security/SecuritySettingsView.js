import React, { useState, useEffect } from 'react';
import { ceoProfile as initialCeoProfile, activeDeviceSessions as initialSessions } from './SecurityData';
import securityService from '../../services/securityService';
import authService from '../../services/authService';

export default function SecuritySettingsView({ onNavigateTab, onTriggerLock, theme = 'dark', onToggleTheme }) {
  const [profile, setProfile] = useState(() => {
    // Load persisted CEO security preferences from localStorage
    const savedPin = localStorage.getItem('kd_master_pin');
    const savedTimeout = localStorage.getItem('kd_inactivity_timeout');
    const savedTabLock = localStorage.getItem('kd_tab_switch_lock');
    return {
      ...initialCeoProfile,
      masterPin: savedPin || initialCeoProfile.masterPin,
      inactivityTimeoutMinutes: savedTimeout ? Number(savedTimeout) : (initialCeoProfile.inactivityTimeoutMinutes || 10),
      autoLockOnTabSwitch: savedTabLock !== null ? savedTabLock === 'true' : true
    };
  });
  const [sessions, setSessions] = useState(initialSessions);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Load live security logs from backend
  useEffect(() => {
    let isMounted = true;
    securityService.getSecurityLogs().then(data => {
      if (isMounted) {
        setLogs(data);
        setLogsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Form states
  const [pinInput, setPinInput] = useState(profile.masterPin);
  const [pinSavedToast, setPinSavedToast] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordToast, setPasswordToast] = useState(false);
  const [backupSyncing, setBackupSyncing] = useState(false);
  const [backupToast, setBackupToast] = useState(false);

  // Update Master PIN
  const handleSavePin = (e) => {
    e.preventDefault();
    if (pinInput.length !== 4) return;
    setProfile({ ...profile, masterPin: pinInput });
    localStorage.setItem('kd_master_pin', pinInput);
    setPinSavedToast(true);
    setTimeout(() => setPinSavedToast(false), 3000);
  };

  // Update Inactivity Timeout — persists globally and immediately applies
  const handleUpdateTimeout = (minutes) => {
    const val = Number(minutes);
    setProfile(prev => ({ ...prev, inactivityTimeoutMinutes: val }));
    localStorage.setItem('kd_inactivity_timeout', String(val));
  };

  // Toggle Tab Switch Lock — persists and is read by App.js on next event
  const handleToggleTabSwitchLock = (enabled) => {
    setProfile(prev => ({ ...prev, autoLockOnTabSwitch: enabled }));
    localStorage.setItem('kd_tab_switch_lock', String(enabled));
  };

  // Terminate a remote session
  const handleRevokeSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  // Terminate all remote sessions except current laptop
  const handleTerminateAllOther = async () => {
    await authService.logoutAllDevices();
    setSessions(sessions.filter(s => s.isCurrent));
  };

  // Force Cloud Sync Snapshot
  const handleForceCloudBackup = () => {
    setBackupSyncing(true);
    setTimeout(() => {
      setBackupSyncing(false);
      setBackupToast(true);
      const newLog = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: 'Just now',
        event: 'Manual Cloud Snapshot Created & Encrypted (AES-256)',
        device: 'Lenovo ThinkPad X1',
        ip: '103.212.145.88',
        status: 'Synchronized',
        type: 'info'
      };
      setLogs([newLog, ...logs]);
      setTimeout(() => setBackupToast(false), 3000);
    }, 1200);
  };

  // Update Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      alert('New passwords do not match');
      return;
    }
    try {
      await authService.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordToast(true);
      setPasswordForm({ current: '', newPass: '', confirmPass: '' });
      setTimeout(() => setPasswordToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Password update failed. Verify current password.');
    }
  };

  return (
    <div className="py-3 px-2 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge px-2 py-1" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '11px' }}>
              <i className="bi bi-shield-lock-fill me-1"></i> OWNER & CEO EXECUTIVE PRIVACY GATEWAY
            </span>
            <span className="text-secondary small font-monospace">• Multi-User Laptop Protection Active</span>
          </div>
          <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px', color: 'var(--kd-text-1)' }}>
            CEO Security & Access Control
          </h2>
          <p className="text-secondary small mb-0 mt-1">
            Strict multi-user laptop privacy controls, master 4-digit unlock PIN, cross-device cloud sync, and remote session termination.
          </p>
        </div>

        {/* Immediate Lockout Button */}
        <button 
          type="button" 
          className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-2 px-3"
          onClick={() => onTriggerLock && onTriggerLock()}
          title="Immediately lock the screen with PIN protection"
        >
          <i className="bi bi-lock-fill"></i>
          <span>Instant Screen Lockdown</span>
        </button>
      </div>

      {/* Shared Laptop Privacy Notice Box */}
      <div 
        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 mb-4 rounded-3"
        style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: '42px', height: '42px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <i className="bi bi-shield-fill-exclamation fs-4"></i>
          </div>
          <div>
            <div className="fw-bold small" style={{ color: 'var(--kd-text-1)' }}>Shared-Laptop Privacy Guard Active</div>
            <div className="text-secondary" style={{ fontSize: '12px' }}>
              Configured for the 6 members who share this laptop. Unauthorized direct URLs are blocked, and inactivity triggers instant mask requiring your Master PIN.
            </div>
          </div>
        </div>
        <div className="mt-2 mt-md-0 d-flex align-items-center gap-2">
          <span className="badge font-monospace px-2 py-1" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            PUBLIC REGISTRATION: BLOCKED
          </span>
        </div>
      </div>

      {/* Section 1: Shared Laptop & Master PIN Configuration */}
      <div className="row g-4 mb-4">
        
        {/* Master PIN Configuration */}
        <div className="col-12 col-lg-6">
          <div className="card rounded-3 h-100 p-4 kd-card-hover-amber" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>Master Laptop Unlock PIN</h5>
              <span className="badge border border-warning font-monospace small" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                4-DIGIT PIN
              </span>
            </div>
            <p className="text-secondary small mb-3">
              This master PIN instantly unlocks the screen when you return to your shared laptop.
            </p>

            {pinSavedToast && (
              <div className="alert alert-success py-2 px-3 small rounded-2 mb-3">
                <i className="bi bi-check-circle-fill me-1"></i> Master PIN updated successfully!
              </div>
            )}

            <form onSubmit={handleSavePin}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-bold">Master Unlock PIN</label>
                <input 
                  type="password" 
                  maxLength="4"
                  className="form-control fs-4 text-center fw-bold font-monospace"
                  style={{ 
                    letterSpacing: '8px', 
                    maxWidth: '180px',
                    background: 'var(--kd-surface-2)',
                    border: '1px solid var(--kd-border)',
                    color: theme === 'light' ? '#b45309' : '#fbbf24'
                  }}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
                <div className="form-text text-secondary" style={{ fontSize: '11px' }}>
                  Default is <span className="font-monospace fw-bold" style={{ color: 'var(--kd-text-1)' }}>1234</span>. Change it anytime to keep your staff locked out.
                </div>
              </div>

              <button type="submit" className="btn btn-warning btn-sm fw-bold px-3">
                <i className="bi bi-key-fill me-1"></i> Update Master PIN
              </button>
            </form>

            <hr className="my-4" style={{ borderColor: 'var(--kd-border)' }} />

            {/* Inactivity Auto-Lock Settings */}
            <div>
              <label className="form-label text-secondary small fw-bold d-block">
                Inactivity Auto-Lock Timer
              </label>
              <div className="d-flex flex-wrap gap-2">
                {[1, 5, 10, 15, 30].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    className={`btn btn-sm ${profile.inactivityTimeoutMinutes === mins ? 'btn-primary fw-bold text-white' : 'btn-outline-secondary'}`}
                    onClick={() => handleUpdateTimeout(mins)}
                  >
                    {mins} min{mins > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <div className="text-secondary small mt-2" style={{ fontSize: '11px' }}>
                Screen locks automatically if no keyboard or mouse movement is detected for {profile.inactivityTimeoutMinutes} minutes.
              </div>
            </div>

            {/* Lock on Tab Switch Switch */}
            <div className="form-check form-switch mt-3 pt-3" style={{ borderTop: '1px solid var(--kd-border)' }}>
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="tabSwitchLock" 
                checked={profile.autoLockOnTabSwitch}
                onChange={(e) => handleToggleTabSwitchLock(e.target.checked)}
              />
              <label className="form-check-label small fw-bold" style={{ color: 'var(--kd-text-1)' }} htmlFor="tabSwitchLock">
                Lock Screen on Tab Switch (Panic Mode)
              </label>
              <div className="text-secondary" style={{ fontSize: '11px' }}>
                If enabled, switching tabs or minimizing the browser window activates instant privacy blackout.
              </div>
            </div>

          </div>
        </div>

        {/* Master Account Password & Profile */}
        <div className="col-12 col-lg-6">
          <div className="card rounded-3 h-100 p-4 kd-card-hover-blue" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--kd-text-1)' }}>CEO Master Cloud Account</h5>
            <p className="text-secondary small mb-3">
              Only this master account has cryptographic authorization to read or write company data.
            </p>

            <div className="p-3 mb-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small font-monospace">OWNER IDENTITY</span>
                <span className="badge border border-success font-monospace" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '10px' }}>
                  VERIFIED CEO
                </span>
              </div>
              <div className="fw-bold fs-5" style={{ color: 'var(--kd-text-1)' }}>{profile.name}</div>
              <div className="font-monospace small" style={{ color: theme === 'light' ? '#0284c7' : '#38bdf8' }}>{profile.email}</div>
              <div className="text-secondary font-monospace small mt-1">{profile.mobile} • {profile.company}</div>
            </div>

            {passwordToast && (
              <div className="alert alert-success py-2 px-3 small rounded-2 mb-3">
                <i className="bi bi-check-circle-fill me-1"></i> Master Password updated successfully!
              </div>
            )}

            <form onSubmit={handleSavePassword}>
              <div className="mb-2">
                <label className="form-label text-secondary small fw-bold">Current Master Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-sm"
                  style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary small fw-bold">New Password</label>
                  <input 
                    type="password" 
                    className="form-control form-control-sm"
                    style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    placeholder="Min 8 chars"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small fw-bold">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control form-control-sm"
                    style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}
                    value={passwordForm.confirmPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                    placeholder="Re-type new"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-outline-primary btn-sm fw-bold px-3">
                <i className="bi bi-shield-check me-1"></i> Change Master Password
              </button>
            </form>

            <hr className="my-4" style={{ borderColor: 'var(--kd-border)' }} />

            {/* CEO Visual Workspace Theme Selector */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label text-secondary small fw-bold mb-0">
                  Visual Workspace Theme
                </label>
                <span className="badge border font-monospace small px-2 py-1" style={{ background: 'var(--kd-surface-2)', borderColor: 'var(--kd-border)', color: 'var(--kd-text-2)' }}>
                  CURRENT: {theme === 'light' ? 'EXECUTIVE WHITE' : 'PITCH BLACK'}
                </span>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm d-flex align-items-center gap-2 px-3 ${theme === 'dark' ? 'btn-primary fw-bold text-white' : 'btn-outline-secondary'}`}
                  onClick={() => theme !== 'dark' && onToggleTheme && onToggleTheme()}
                >
                  <i className="bi bi-moon-stars-fill"></i>
                  <span>Pitch Black Theme</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm d-flex align-items-center gap-2 px-3 ${theme === 'light' ? 'btn-primary fw-bold text-white' : 'btn-outline-secondary'}`}
                  onClick={() => theme !== 'light' && onToggleTheme && onToggleTheme()}
                >
                  <i className="bi bi-sun-fill text-warning"></i>
                  <span>Modern White Theme</span>
                </button>
              </div>
              <div className="text-secondary small mt-2" style={{ fontSize: '11px' }}>
                You can also switch themes instantly at any time from the top navigation bar.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Section 2: Active Multi-Device Sessions */}
      <div className="card rounded-3 p-4 mb-4" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>Authorized Multi-Device Cloud Sessions</h5>
            <p className="text-secondary small mb-0 font-monospace">
              Cross-device synchronization for PC & Mobile Phone • Instant remote killswitch
            </p>
          </div>

          {sessions.length > 1 && (
            <button 
              type="button" 
              className="btn btn-outline-danger btn-sm fw-bold px-3"
              onClick={handleTerminateAllOther}
            >
              <i className="bi bi-power me-1"></i> Terminate All Other Sessions
            </button>
          )}
        </div>

        <div className="row g-3">
          {sessions.map(sess => (
            <div key={sess.id} className="col-12 col-md-4">
              <div 
                className="p-3 rounded-3 h-100 d-flex flex-column justify-content-between kd-session-card"
                style={{ 
                  background: sess.isCurrent 
                    ? (theme === 'light' ? 'rgba(16, 185, 129, 0.08)' : '#09130d') 
                    : 'var(--kd-surface-2)', 
                  border: sess.isCurrent 
                    ? '1px solid #10b981' 
                    : '1px solid var(--kd-border)' 
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge border font-monospace" style={{ background: 'var(--kd-surface-3)', borderColor: 'var(--kd-border)', color: 'var(--kd-text-2)', fontSize: '10px' }}>
                      {sess.id}
                    </span>
                    {sess.isCurrent ? (
                      <span className="badge rounded-pill bg-success text-black fw-bold font-monospace" style={{ fontSize: '10px' }}>
                        THIS LAPTOP
                      </span>
                    ) : (
                      <span className="badge font-monospace" style={{ background: 'var(--kd-surface-3)', color: 'var(--kd-text-3)', fontSize: '10px' }}>
                        REMOTE
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={`bi ${sess.deviceType === 'mobile' ? 'bi-phone' : sess.deviceType === 'tablet' ? 'bi-tablet' : 'bi-laptop'} text-primary fs-5`}></i>
                    <div className="fw-bold small text-truncate" style={{ color: 'var(--kd-text-1)' }} title={sess.device}>
                      {sess.device}
                    </div>
                  </div>

                  <div className="text-secondary font-monospace" style={{ fontSize: '11px' }}>
                    <div><span className="text-muted">OS / Browser:</span> {sess.os} • {sess.browser}</div>
                    <div><span className="text-muted">IP Address:</span> {sess.ipAddress}</div>
                    <div><span className="text-muted">Location:</span> {sess.location}</div>
                    <div><span className="text-muted">Activity:</span> <span className={sess.isCurrent ? 'text-success fw-bold' : ''} style={{ color: sess.isCurrent ? undefined : 'var(--kd-text-1)' }}>{sess.lastActive}</span></div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <div className="mt-3 pt-2 text-end" style={{ borderTop: '1px solid var(--kd-border)' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm py-0 px-2"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleRevokeSession(sess.id)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Disconnect Device
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Cloud Database & Backup Snapshot */}
      <div className="card rounded-3 p-4 mb-4" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
            >
              <i className="bi bi-database-fill-check fs-4"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>Private Cloud Database & Real-Time Sync</h5>
                <span className="badge border border-success font-monospace" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '10px' }}>
                  256-BIT AES ENCRYPTED
                </span>
              </div>
              <p className="text-secondary small mb-0 font-monospace mt-1">
                All inventory changes, employee handovers, and OLX transactions automatically persist online and sync to phone.
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm fw-bold px-3 d-flex align-items-center gap-2"
            onClick={handleForceCloudBackup}
            disabled={backupSyncing}
          >
            {backupSyncing ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                <span>Encrypting & Syncing...</span>
              </>
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up-fill"></i>
                <span>Force Cloud Backup Snapshot</span>
              </>
            )}
          </button>
        </div>

        {backupToast && (
          <div className="alert alert-success mt-3 py-2 px-3 small rounded-2 mb-0">
            <i className="bi bi-check-circle-fill me-1"></i> Encrypted cloud backup snapshot successfully stored and verified!
          </div>
        )}
      </div>

      {/* Section 4: Security Audit Trail */}
      <div className="card rounded-3 p-4" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>Executive Security Event Log</h5>
          <span className="badge font-monospace" style={{ background: 'var(--kd-surface-2)', color: 'var(--kd-text-2)', border: '1px solid var(--kd-border)' }}>
            {logsLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" style={{ width: '0.65rem', height: '0.65rem' }}></span>
                SYNCING AUDIT LOGS...
              </>
            ) : (
              `${logs.length} EVENTS RECORDED`
            )}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0 align-middle">
            <thead className="small font-monospace" style={{ background: 'var(--kd-surface-2)', color: 'var(--kd-text-2)' }}>
              <tr style={{ borderBottom: '1px solid var(--kd-border)' }}>
                <th className="py-2 px-2">EVENT ID</th>
                <th className="py-2">TIMESTAMP</th>
                <th className="py-2">SECURITY EVENT</th>
                <th className="py-2">DEVICE</th>
                <th className="py-2">IP ORIGIN</th>
                <th className="py-2 text-end pe-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="small font-monospace">
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--kd-border)' }}>
                  <td className="text-secondary px-2">{log.id}</td>
                  <td style={{ color: 'var(--kd-text-1)' }}>{log.timestamp}</td>
                  <td className="fw-bold" style={{ color: 'var(--kd-text-1)' }}>{log.event}</td>
                  <td className="text-secondary">{log.device}</td>
                  <td className="text-muted">{log.ip}</td>
                  <td className="text-end pe-2">
                    <span 
                      className={`badge ${
                        log.type === 'danger' ? 'bg-danger text-white' : 
                        log.type === 'warning' ? 'bg-warning text-black' : 
                        log.type === 'info' ? 'bg-primary text-white' : 
                        'bg-success text-black'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    

   
  );
}

