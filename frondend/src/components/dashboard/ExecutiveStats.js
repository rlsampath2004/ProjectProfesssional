import React from 'react';

export default function ExecutiveStats({
  hoursLogged = "06h 45m",
  completedTasks = 14,
  totalTasks = 17,
  weeklyTargetPercent = 94,
  pendingAlertsCount = 3,
  onNavigateTab
}) {
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="row g-3 mb-4">
      {/* 1. Daily Hours Logged */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="kd-metric-tile kd-hover-blue">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="kd-metric-label">HOURS LOGGED TODAY</span>
            <span className="kd-tag kd-tag-emerald">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              ACTIVE
            </span>
          </div>

          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="kd-metric-value kd-mono">{hoursLogged}</span>
            <span className="kd-mono small text-secondary">/ 08.0h</span>
          </div>

          <div className="kd-bar-track mb-3">
            <div 
              className="kd-bar-fill"
              style={{ width: '84%', background: 'var(--kd-text-1)' }}
            />
          </div>

          <div className="d-flex align-items-center justify-content-between kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
            <span>PUNCH: 09:15 AM</span>
            <span className="text-white">84% OF TARGET</span>
          </div>
        </div>
      </div>

      {/* 2. Task Completion Percentage */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="kd-metric-tile kd-hover-emerald">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="kd-metric-label">TASK COMPLETION</span>
            <span className="kd-tag kd-tag-neutral kd-mono">
              +12% YESTERDAY
            </span>
          </div>

          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="kd-metric-value kd-mono">{completionPercentage}%</span>
            <span className="kd-mono small text-secondary">({completedTasks}/{totalTasks})</span>
          </div>

          <div className="kd-bar-track mb-3">
            <div 
              className="kd-bar-fill"
              style={{ width: `${completionPercentage}%`, background: '#10b981' }}
            />
          </div>

          <div className="d-flex align-items-center justify-content-between kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
            <span>COMPLETED: {completedTasks}</span>
            <span className="text-white">{totalTasks - completedTasks} PENDING</span>
          </div>
        </div>
      </div>

      {/* 3. Weekly Project Targets */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="kd-metric-tile kd-hover-amber">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="kd-metric-label">WEEKLY TARGET</span>
            <span className="kd-tag kd-tag-amber">ON TRACK</span>
          </div>

          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="kd-metric-value kd-mono">{weeklyTargetPercent}%</span>
            <span className="kd-mono small text-secondary">VELOCITY</span>
          </div>

          <div className="kd-bar-track mb-3">
            <div 
              className="kd-bar-fill"
              style={{ width: `${weeklyTargetPercent}%`, background: '#f59e0b' }}
            />
          </div>

          <div className="d-flex align-items-center justify-content-between kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
            <span>PHASE 2 AUDIT</span>
            <span className="text-white">DUE FRI</span>
          </div>
        </div>
      </div>

      {/* 4. Pending Attention / Action Center */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="kd-metric-tile kd-hover-rose" style={{ borderColor: 'rgba(239, 68, 68, 0.35)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="kd-metric-label text-danger">REQUIRES CEO ACTION</span>
            <span className="kd-tag kd-tag-rose">URGENT</span>
          </div>

          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="kd-metric-value kd-mono text-danger">{String(pendingAlertsCount).padStart(2, '0')}</span>
            <span className="kd-mono small text-secondary">ITEMS</span>
          </div>

          <div className="kd-bar-track mb-3">
            <div 
              className="kd-bar-fill"
              style={{ width: '100%', background: '#ef4444' }}
            />
          </div>

          <div className="d-flex align-items-center justify-content-between kd-mono" style={{ fontSize: '0.72rem' }}>
            <span className="text-secondary text-truncate me-2">UNVERIFIED HARDWARE</span>
            <button 
              className="btn btn-link p-0 text-white text-decoration-underline kd-mono fw-semibold"
              style={{ fontSize: '0.72rem' }}
              onClick={() => onNavigateTab && onNavigateTab('audit')}
            >
              RESOLVE &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
