import React from 'react';

export default function PlaceholderView({ title, icon, subtitle, nextStepNumber, features = [], onBackToDashboard }) {
  return (
    <div className="kd-panel p-4 p-md-5 text-center">
      <div 
        className="mx-auto mb-3 d-flex align-items-center justify-content-center text-white"
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          background: 'var(--kd-surface-2)',
          border: '1px solid var(--kd-border)',
          fontSize: '1.8rem'
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="kd-tag kd-tag-neutral mb-2">
        SCHEDULED FOR STEP {nextStepNumber}
      </div>

      <h4 className="text-white fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.03em' }}>{title}</h4>
      <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '520px' }}>
        {subtitle}
      </p>

      {/* Feature Blueprint */}
      <div className="row g-2 justify-content-center mb-4 text-start">
        {features.map((feat, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg-4">
            <div 
              className="p-3 rounded-2 h-100"
              style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
            >
              <div className="d-flex align-items-center gap-2 mb-1 text-white small fw-bold">
                <i className="bi bi-check2"></i> {feat.title}
              </div>
              <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                {feat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center">
        <button className="kd-btn-solid" onClick={onBackToDashboard}>
          <i className="bi bi-arrow-left"></i> RETURN TO EXECUTIVE COMMAND
        </button>
      </div>
    </div>
  );
}
