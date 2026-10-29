import React from 'react';

export default function QuickNavCards({ onNavigateTab }) {
  const modules = [
    {
      id: 'assets',
      title: 'IT Asset Inventory',
      code: 'AST-01',
      icon: 'bi-laptop',
      stats: '248 UNITS',
      description: 'Laptops, desktops, label & A4 printers, network switches, firewalls & SIM cards.',
      tagClass: 'kd-tag-neutral'
    },
    {
      id: 'allocation',
      title: 'Employee Allocation',
      code: 'ALC-02',
      icon: 'bi-people',
      stats: '185 ASSIGNED',
      description: 'Digital custody logs, staff assignment history, and handover acknowledgments.',
      tagClass: 'kd-tag-neutral'
    },
    {
      id: 'audit',
      title: 'Audit & Verification',
      code: 'ADT-03',
      icon: 'bi-patch-check',
      stats: '03 PENDING',
      description: 'Physical branch stocktake, serial number validation, and discrepancy alerts.',
      tagClass: 'kd-tag-amber'
    },
    {
      id: 'olx',
      title: 'OLX Sales Pipeline',
      code: 'SLS-04',
      icon: 'bi-tag',
      stats: '14 LISTED',
      description: 'Decommissioned equipment listings, asking prices, and realized sales tracking.',
      tagClass: 'kd-tag-neutral'
    },
    {
      id: 'excel',
      title: 'Excel Data Migration',
      code: 'XLS-05',
      icon: 'bi-file-earmark-spreadsheet',
      stats: 'SYNC READY',
      description: 'Seamlessly upload existing company spreadsheets or export clean data backups.',
      tagClass: 'kd-tag-neutral'
    }
  ];

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.85rem' }}>
          OPERATIONAL COMMAND MODULES
        </h6>
        <span className="kd-mono text-secondary small" style={{ fontSize: '0.7rem' }}>DIRECT SYSTEM SHORTCUTS</span>
      </div>

      <div className="row g-3">
        {modules.map((m) => (
          <div key={m.id} className="col-12 col-md-6 col-xl">
            <div 
              className="kd-panel kd-hover-card h-100 p-3 d-flex flex-column justify-content-between"
              style={{ cursor: 'pointer', background: 'var(--kd-surface-1)' }}
              onClick={() => onNavigateTab(m.id)}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>{m.code}</span>
                  <span className={`kd-tag ${m.tagClass}`}>{m.stats}</span>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${m.icon} text-white fs-6`}></i>
                  <h6 className="text-white fw-bold mb-0" style={{ fontSize: '0.92rem' }}>{m.title}</h6>
                </div>

                <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem', lineHeight: '1.45' }}>
                  {m.description}
                </p>
              </div>

              <div className="pt-2 border-top border-secondary-subtle d-flex align-items-center justify-content-between">
                <span className="kd-mono text-white fw-semibold" style={{ fontSize: '0.72rem' }}>
                  OPEN MODULE
                </span>
                <i className="bi bi-arrow-right text-secondary small"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
