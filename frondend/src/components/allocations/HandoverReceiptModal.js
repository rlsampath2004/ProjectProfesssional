import React from 'react';

export default function HandoverReceiptModal({ isOpen, onClose, allocation, employee }) {
  if (!isOpen || !allocation) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptId = `ACK-${allocation.id || '001'}-${new Date().getFullYear()}`;
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

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
                style={{ width: '42px', height: '42px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <i className="bi bi-file-earmark-check-fill fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>
                  IT Hardware Handover &amp; Custody Undertaking Form
                </h5>
                <p className="text-secondary small mb-0 font-monospace">
                  Official Legal Custody Agreement • Ref: {receiptId}
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
                <span>Print Agreement</span>
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

          {/* Printable Document Body */}
          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            
            {/* Document Header Letterhead */}
            <div className="p-4 rounded-3 mb-4" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3" style={{ borderColor: 'var(--kd-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="fw-bold px-2 py-1 rounded-2 text-black bg-white fs-4" 
                    style={{ letterSpacing: '0.04em' }}
                  >
                    KD
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--kd-text-1)' }}>
                      Kothari Distributors Pvt. Ltd.
                    </h5>
                    <div className="text-secondary font-monospace" style={{ fontSize: '11px' }}>
                      Commercial Operations, Fleet Logistics &amp; Wholesale Distribution • Surat, Gujarat
                    </div>
                  </div>
                </div>
                <div className="text-end font-monospace">
                  <div className="badge bg-success text-black fw-bold px-2 py-1" style={{ fontSize: '11px' }}>
                    DIGITALLY AUTHORIZED
                  </div>
                  <div className="text-secondary small mt-1">Date: {todayFormatted}</div>
                </div>
              </div>

              <div className="text-center my-3">
                <h6 className="fw-bold text-uppercase" style={{ letterSpacing: '0.08em', color: 'var(--kd-text-1)' }}>
                  IT ASSET CUSTODY &amp; RESPONSIBILITY UNDERTAKING
                </h6>
                <div className="text-secondary small font-monospace">
                  Ref No: <strong>{receiptId}</strong>
                </div>
              </div>

              {/* Custodian & Hardware Breakdown */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-2 h-100" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
                    <div className="text-secondary small font-monospace mb-2 fw-bold text-uppercase">
                      PART A: CUSTODIAN EMPLOYEE
                    </div>
                    <div className="fw-bold fs-6" style={{ color: 'var(--kd-text-1)' }}>
                      {allocation.employeeName}
                    </div>
                    <div className="text-secondary font-monospace small mt-1">
                      Staff ID: <strong style={{ color: 'var(--kd-text-1)' }}>{allocation.employeeId}</strong>
                    </div>
                    <div className="text-secondary font-monospace small">
                      Dept: <strong style={{ color: 'var(--kd-text-1)' }}>{allocation.department}</strong>
                    </div>
                    <div className="text-secondary font-monospace small">
                      Branch: <strong style={{ color: 'var(--kd-text-1)' }}>{allocation.branch}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-2 h-100" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
                    <div className="text-secondary small font-monospace mb-2 fw-bold text-uppercase">
                      PART B: ISSUED IT ASSET
                    </div>
                    <div className="fw-bold fs-6 text-primary">
                      {allocation.assetName}
                    </div>
                    <div className="text-secondary font-monospace small mt-1">
                      Asset Tag: <span className="badge bg-dark border font-monospace text-warning">{allocation.assetId}</span>
                    </div>
                    <div className="text-secondary font-monospace small mt-1">
                      Serial No: <strong style={{ color: 'var(--kd-text-1)' }}>{allocation.serial}</strong>
                    </div>
                    <div className="text-secondary font-monospace small mt-1">
                      Accessories Issued: <strong style={{ color: 'var(--kd-text-1)' }}>{allocation.peripherals || 'Original Charger & Power Cable'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custody Clauses */}
              <div className="p-3 rounded-2 mb-3 small" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', lineHeight: '1.6' }}>
                <div className="fw-bold text-uppercase font-monospace mb-2" style={{ color: 'var(--kd-text-1)', fontSize: '11px' }}>
                  UNDERTAKING CLAUSES &amp; CONDITIONS OF USE:
                </div>
                <ol className="mb-0 ps-3 text-secondary" style={{ fontSize: '12px' }}>
                  <li>The equipment remains the exclusive property of <strong>Kothari Distributors Pvt. Ltd.</strong> and is issued solely for company business purposes.</li>
                  <li>The employee accepts fiduciary responsibility to safeguard the equipment against damage, unauthorized third-party access, or loss.</li>
                  <li>All proprietary ERP records, inventory databases, and business documents accessed via this device are strictly confidential.</li>
                  <li>Upon conclusion of employment or reassignment, the employee agrees to immediately return all listed items in operational working condition.</li>
                </ol>
              </div>

              {/* Signatures Section */}
              <div className="row g-3 pt-3 border-top" style={{ borderColor: 'var(--kd-border)' }}>
                <div className="col-6">
                  <div className="p-3 rounded-2 text-center" style={{ background: 'var(--kd-surface-1)', border: '1px dashed var(--kd-border)' }}>
                    <div className="font-monospace small text-secondary mb-3">EMPLOYEE ACKNOWLEDGEMENT</div>
                    <div className="fw-bold text-decoration-underline" style={{ color: 'var(--kd-text-1)', minHeight: '28px' }}>
                      {allocation.employeeName}
                    </div>
                    <div className="text-muted font-monospace" style={{ fontSize: '10px' }}>
                      Signature &amp; Date ({allocation.handoverDate})
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 rounded-2 text-center" style={{ background: 'var(--kd-surface-1)', border: '1px dashed var(--kd-border)' }}>
                    <div className="font-monospace small text-secondary mb-3">EXECUTIVE AUTHORIZATION</div>
                    <div className="fw-bold text-success font-monospace" style={{ minHeight: '28px' }}>
                      <i className="bi bi-shield-check me-1"></i> R.L. Kothari (Owner &amp; CEO)
                    </div>
                    <div className="text-muted font-monospace" style={{ fontSize: '10px' }}>
                      Kothari Distributors Pvt. Ltd. Authorized Stamp
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--kd-surface-2)', borderTop: '1px solid var(--kd-border)' }}>
            <div className="text-secondary small font-monospace">
              <i className="bi bi-shield-lock-fill text-success me-1"></i> Digitally tracked and backed up to CEO Cloud Database.
            </div>
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-sm btn-primary fw-bold px-3 d-flex align-items-center gap-2" onClick={handlePrint}>
                <i className="bi bi-printer-fill"></i>
                <span>Print Handover Undertaking</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

