import React from 'react';

export default function EmployeeDossierModal({ employee, allocations = [], onClose, onReturnItem }) {
  if (!employee) return null;

  const employeeAllocations = allocations.filter(a => a.employeeId === employee.id);
  const activeItems = employeeAllocations.filter(a => a.status === 'Active Custody');
  const pastItems = employeeAllocations.filter(a => a.status !== 'Active Custody');

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog" style={{ maxWidth: '750px' }}>
        <div className="kd-modal-header">
          <div className="d-flex align-items-center gap-2">
            <span className="kd-mono text-white fw-bold">{employee.id}</span>
            <span className="text-secondary opacity-50">/</span>
            <span className="kd-tag kd-tag-neutral">{employee.department}</span>
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <div className="kd-modal-body">
          {/* Employee Header */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="kd-mono d-flex align-items-center justify-content-center text-white fw-bold rounded-2 fs-5"
                style={{ width: 48, height: 48, background: 'var(--kd-surface-3)', border: '1px solid var(--kd-border)' }}
              >
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h5 className="text-white fw-bold mb-0">{employee.name}</h5>
                <div className="text-secondary small">{employee.role} • {employee.branch}</div>
                <div className="kd-mono text-secondary small" style={{ fontSize: '0.72rem' }}>
                  {employee.email} • {employee.phone}
                </div>
              </div>
            </div>

            <div className="text-sm-end">
              <div className="kd-mono text-secondary small">CUSTODY TOTAL</div>
              <div className="kd-mono text-white fw-bold fs-5">{activeItems.length} ACTIVE UNITS</div>
            </div>
          </div>

          {/* Active Custody Hardware */}
          <h6 className="text-white fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.85rem' }}>
            CURRENTLY ASSIGNED HARDWARE ({activeItems.length})
          </h6>

          {activeItems.length === 0 ? (
            <div className="p-3 mb-4 rounded-2 text-center text-secondary kd-mono small" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              NO HARDWARE CURRENTLY IN ACTIVE CUSTODY FOR THIS EMPLOYEE
            </div>
          ) : (
            <div className="d-flex flex-column gap-2 mb-4">
              {activeItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-2 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 kd-hover-blue"
                  style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="kd-mono text-white fw-bold small">{item.assetId}</span>
                      <span className="kd-tag kd-tag-cat-laptop">{item.category}</span>
                      <span className="kd-tag kd-tag-status-inuse">ACTIVE</span>
                    </div>
                    <div className="text-white fw-semibold">{item.assetName}</div>
                    <div className="kd-mono text-secondary small" style={{ fontSize: '0.72rem' }}>
                      SERIAL: {item.serial} • HANDED OVER: {item.handoverDate}
                    </div>
                    <div className="text-light small mt-1" style={{ fontSize: '0.75rem' }}>
                      <span className="text-secondary">Accessories:</span> {item.peripherals}
                    </div>
                  </div>

                  <button
                    className="kd-btn-outline py-1 px-2 flex-shrink-0"
                    style={{ fontSize: '0.72rem' }}
                    onClick={() => {
                      onClose();
                      onReturnItem(item);
                    }}
                  >
                    <i className="bi bi-box-arrow-in-down me-1"></i> PROCESS RETURN
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Historical Returned Custody */}
          {pastItems.length > 0 && (
            <>
              <h6 className="text-secondary fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.8rem' }}>
                HISTORICAL RETURN LOGS ({pastItems.length})
              </h6>
              <div className="d-flex flex-column gap-2">
                {pastItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-2 rounded-2 opacity-60 d-flex align-items-center justify-content-between"
                    style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="kd-mono text-secondary small">{item.assetId}</span>
                        <span className="text-white small fw-medium">{item.assetName}</span>
                      </div>
                      <div className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
                        Returned: {item.returnDate} • Notes: {item.notes}
                      </div>
                    </div>
                    <span className="kd-tag kd-tag-neutral">{item.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="kd-modal-footer">
          <button type="button" className="kd-btn-solid" onClick={onClose}>
            DONE / CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
}

