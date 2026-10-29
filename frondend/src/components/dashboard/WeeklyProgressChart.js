import React, { useState } from 'react';

export default function WeeklyProgressChart() {
  const [activeView, setActiveView] = useState('burnup'); // 'burnup' or 'velocity'

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dailyVelocity = [6, 8, 8, 9, 5, 0, 0];

  return (
    <div className="kd-panel h-100">
      {/* Header */}
      <div className="kd-panel-header">
        <div>
          <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.85rem' }}>
            WEEKLY TRAJECTORY & VELOCITY
          </h6>
          <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>
            OPERATIONS BURN-UP • 7-DAY CADENCE
          </span>
        </div>

        {/* View Switcher */}
        <div className="d-flex align-items-center gap-1 p-1 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
          <button
            className={`btn btn-sm px-2 py-0 kd-mono ${activeView === 'burnup' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
            style={{ fontSize: '0.7rem' }}
            onClick={() => setActiveView('burnup')}
          >
            BURN-UP
          </button>
          <button
            className={`btn btn-sm px-2 py-0 kd-mono ${activeView === 'velocity' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
            style={{ fontSize: '0.7rem' }}
            onClick={() => setActiveView('velocity')}
          >
            VELOCITY
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="kd-panel-body">
        {/* Terminal KPI Summary */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>DAILY VELOCITY</div>
              <div className="kd-mono text-white fw-bold fs-6">7.2 <span className="text-secondary small">TASKS</span></div>
            </div>
          </div>
          <div className="col-4">
            <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>BURNDOWN DELTA</div>
              <div className="kd-mono text-success fw-bold fs-6">+3.0 <span className="small">AHEAD</span></div>
            </div>
          </div>
          <div className="col-4">
            <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>SYSTEM EFFICIENCY</div>
              <div className="kd-mono text-white fw-bold fs-6">97.4%</div>
            </div>
          </div>
        </div>

        {/* Clean Engineering Chart */}
        <div style={{ position: 'relative', height: '175px', width: '100%' }}>
          <svg viewBox="0 0 650 175" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="sharpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Grid Lines */}
            {[35, 75, 115, 150].map((y) => (
              <line 
                key={y} 
                x1="30" 
                y1={y} 
                x2="630" 
                y2={y} 
                stroke="#1f1f23" 
                strokeWidth="1"
              />
            ))}

            {activeView === 'burnup' ? (
              <>
                {/* Target Baseline */}
                <line 
                  x1="50" 
                  y1="145" 
                  x2="600" 
                  y2="25" 
                  stroke="#52525b" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                />

                {/* Actual Area */}
                <path
                  d="M 50 145 L 140 120 L 230 95 L 325 65 L 420 45 L 420 155 L 50 155 Z"
                  fill="url(#sharpGradient)"
                />

                {/* Actual Line */}
                <path
                  d="M 50 145 L 140 120 L 230 95 L 325 65 L 420 45"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Nodes */}
                {[
                  { cx: 50, cy: 145, val: '06' },
                  { cx: 140, cy: 120, val: '14' },
                  { cx: 230, cy: 95, val: '22' },
                  { cx: 325, cy: 65, val: '31' },
                  { cx: 420, cy: 45, val: '36', current: true },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r="4"
                      fill="#000000"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {pt.current && (
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="8"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1"
                        opacity="0.4"
                      />
                    )}
                    <text
                      x={pt.cx}
                      y={pt.cy - 10}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pt.val}
                    </text>
                  </g>
                ))}
              </>
            ) : (
              // Velocity Bars
              days.map((day, i) => {
                const height = dailyVelocity[i] * 12;
                const x = 50 + i * 90;
                const y = 155 - height;
                return (
                  <g key={day}>
                    <rect
                      x={x - 14}
                      y={y}
                      width="28"
                      height={height}
                      rx="3"
                      fill="#ffffff"
                    />
                    {dailyVelocity[i] > 0 && (
                      <text
                        x={x}
                        y={y - 6}
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {dailyVelocity[i]}
                      </text>
                    )}
                  </g>
                );
              })
            )}

            {/* X Labels */}
            {days.map((d, i) => (
              <text
                key={d}
                x={50 + i * 90}
                y="170"
                fill="#71717a"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {d}
              </text>
            ))}
          </svg>
        </div>

        {/* Minimalist Legend */}
        <div className="d-flex align-items-center justify-content-center gap-4 mt-2 kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 2, background: '#ffffff', display: 'inline-block' }} />
            <span>ACTUAL PROGRESS</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 1, borderBottom: '1px dashed #71717a', display: 'inline-block' }} />
            <span>PLANNED TARGET</span>
          </div>
        </div>
      </div>
    </div>
  );
}
