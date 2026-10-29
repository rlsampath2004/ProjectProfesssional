import React from 'react';

export default function AuditCertificateModal({ isOpen, onClose, session, verifiedCount = 0, totalCount = 0 }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certNumber = `CERT-AUD-${session ? session.id : '2026-Q4'}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const reconciliationRate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 98;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content rounded-3" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}>
          
          {/* Header */}
          <div className="modal-header px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}
              >
                <i className="bi bi-award-fill fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>
                  Executive Physical Stocktake &amp; Audit Certificate
                </h5>
                <p className="text-secondary small mb-0 font-monospace">
                  Annual Hardware Verification Certificate • Certificate No: {certNumber}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button 
                type="button" 
                className="btn btn-primary btn-sm fw-bold px-3 d-flex align-items-center gap-2"
                onClick={handlePrint}
              >
                <i className="bi bi-printer-fill"></i>
                <span>Print Official Certificate</span>
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary" 
                onClick={onClose}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            
            <div 
              className="p-4 rounded-3 text-center position-relative"
              style={{
                background: 'var(--kd-surface-2)',
                border: '2px double #f59e0b',
                padding: '2.5rem 2rem'
              }}
            >
              {/* Badge watermark */}
              <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3" style={{ borderColor: 'var(--kd-border)' }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold px-2 py-1 rounded text-black bg-white fs-5">KD</span>
                  <div className="text-start">
                    <div className="fw-bold text-uppercase fs-6" style={{ letterSpacing: '0.06em', color: 'var(--kd-text-1)' }}>
                      Kothari Distributors Pvt. Ltd.
                    </div>
                    <div className="text-secondary font-monospace" style={{ fontSize: '10px' }}>
                      CORPORATE IT ASSET AUDIT &amp; GOVERNANCE BOARD
                    </div>
                  </div>
                </div>

                <div className="text-end font-monospace" style={{ fontSize: '11px' }}>
                  <span className="badge bg-warning text-black fw-bold px-2 py-1">CERTIFIED AUDIT</span>
                  <div className="text-secondary mt-1">{timestamp}</div>
                </div>
              </div>

              {/* Title */}
              <h3 className="fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.05em', color: 'var(--kd-text-1)' }}>
                CERTIFICATE OF PHYSICAL STOCKTAKE VERIFICATION
              </h3>
              <p className="text-secondary small font-monospace mb-4">
                THIS IS TO CERTIFY THAT THE PHYSICAL IT HARDWARE FLEET AT ALL 3 OPERATIONAL FACILITIES HAS BEEN INSPECTED, BARCODE RECONCILED, AND COMPLIANCE VERIFIED.
              </p>

              {/* Audit Metrics Grid */}
              <div className="row g-3 my-3 text-start">
                <div className="col-4">
                  <div className="p-3 rounded-2 text-center" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
                    <div className="text-secondary small font-monospace">VERIFIED UNITS</div>
                    <div className="fw-bold fs-4 text-success">{verifiedCount || 248}</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>Serial barcode confirmed</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-3 rounded-2 text-center" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
                    <div className="text-secondary small font-monospace">RECONCILIATION SCORE</div>
                    <div className="fw-bold fs-4 text-primary">{reconciliationRate}%</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>Fleet accuracy rating</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-3 rounded-2 text-center" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
                    <div className="text-secondary small font-monospace">STATUS</div>
                    <div className="fw-bold fs-5 text-warning">DISCREPANCIES RESOLVED</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>100% accounted for</div>
                  </div>
                </div>
              </div>

              {/* Legal confirmation */}
              <div className="p-3 my-4 rounded-2 text-start font-monospace small" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', fontSize: '11px', color: 'var(--kd-text-2)' }}>
                <div><strong>SCOPE:</strong> Laptops (ThinkPad/Latitude/MacBook), Desktops, Billing POS Terminals, Label Printers, Core Cisco Firewalls, SIM Card dongles.</div>
                <div className="mt-1"><strong>LOCATIONS:</strong> Marine Lines Head Office, Andheri Branch A, Bhiwandi Central Depot.</div>
                <div className="mt-1"><strong>CRYPTOGRAPHIC HASH:</strong> SHA256: 8f9b4a1c7e92384a56c09df13426781290bb3ce50</div>
              </div>

              {/* Signatures */}
              <div className="row g-3 pt-3 mt-2 border-top" style={{ borderColor: 'var(--kd-border)' }}>
                <div className="col-6 text-start">
                  <div className="text-secondary font-monospace small">LEAD AUDIT INSPECTOR:</div>
                  <div className="fw-bold mt-1" style={{ color: 'var(--kd-text-1)' }}>Vikram Sethi</div>
                  <div className="text-muted font-monospace" style={{ fontSize: '10px' }}>Chief Systems Auditor &amp; Security Officer</div>
                </div>

                <div className="col-6 text-end">
                  <div className="text-secondary font-monospace small">CHIEF EXECUTIVE APPROVAL:</div>
                  <div className="fw-bold text-success font-monospace mt-1">
                    <i className="bi bi-patch-check-fill me-1"></i> R.L. Kothari
                  </div>
                  <div className="text-muted font-monospace" style={{ fontSize: '10px' }}>Owner &amp; Chief Executive Officer</div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--kd-surface-2)', borderTop: '1px solid var(--kd-border)' }}>
            <div className="text-secondary small font-monospace">
              <i className="bi bi-shield-check text-success me-1"></i> Valid for Fiscal Year 2026-2027 Statutory Auditing &amp; Insurance Valuation.
            </div>
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-sm btn-primary fw-bold px-3 d-flex align-items-center gap-2" onClick={handlePrint}>
                <i className="bi bi-printer-fill"></i>
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

