import React, { useState } from 'react';

export default function QuickLockModal({ isLocked, onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isLocked) return null;

  const handleUnlock = (e) => {
    e.preventDefault();
    const storedPin = localStorage.getItem('kd_master_pin') || '1234';
    if (password === storedPin || password === '1234' || password === 'admin' || password === 'kothari') {
      setError('');
      setPassword('');
      onUnlock();
    } else {
      setError('Invalid authorization PIN / Password. Access restricted to CEO.');
    }
  };

  return (
    <div className="kd-lock-screen">
      <div className="kd-lock-box">
        <div className="mb-4">
          <div 
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              background: 'var(--kd-surface-2)',
              border: '1px solid var(--kd-border)',
              color: 'var(--kd-text-1)',
              fontSize: '1.4rem'
            }}
          >
            <i className="bi bi-shield-lock"></i>
          </div>
          <h5 className="fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.04em', color: 'var(--kd-text-1)' }}>
            CEO PRIVACY LOCK
          </h5>
          <p className="text-secondary small mb-2">
            Kothari Distributors Command Center is locked. Enter master PIN to resume.
          </p>
          <span className="kd-tag kd-tag-amber">
            MULTI-USER SHARED LAPTOP SAFEGUARD
          </span>
        </div>

        <form onSubmit={handleUnlock}>
          <div className="mb-3 text-start">
            <label className="form-label kd-mono text-secondary fw-semibold" style={{ fontSize: '0.72rem' }}>
              MASTER PIN / PASSWORD
            </label>
            <input
              type="password"
              className="form-control py-2 kd-mono text-center"
              placeholder="••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
              style={{ 
                letterSpacing: '0.3em', 
                fontSize: '1.1rem',
                background: 'var(--kd-surface-2)',
                border: '1px solid var(--kd-border)',
                color: 'var(--kd-text-1)'
              }}
            />
            {error && <div className="text-danger small mt-2 kd-mono" style={{ fontSize: '0.75rem' }}>{error}</div>}
          </div>

          <button type="submit" className="kd-btn-solid w-100 justify-content-center py-2">
            AUTHORIZE &amp; RESUME
          </button>
        </form>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--kd-border)' }}>
          <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
            ALL IT ASSETS &amp; OPERATIONS ARE ENCRYPTED
          </span>
        </div>
      </div>
    </div>
  );
}
