import React, { useState } from 'react';

export default function ReturnAssetModal({ allocation, onClose, onConfirmReturn }) {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [destinationStatus, setDestinationStatus] = useState('Available');
  const [notes, setNotes] = useState('');

  if (!allocation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmReturn(allocation.id, {
      returnDate,
      returnCondition,
      destinationStatus,
      notes: notes || 'Equipment inspected and returned to central pool.'
    });
    onClose();
  };

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog">
        <div className="kd-modal-header">
          <div>
            <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
              PROCESS ASSET RETURN & CUSTODY RELEASE
            </h6>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              REVERT EQUIPMENT TO AVAILABLE POOL OR MAINTENANCE
            </span>
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kd-modal-body">
            {/* Asset & Custodian Overview */}
            <div className="p-3 rounded-2 mb-3" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="kd-mono text-white fw-bold">{allocation.assetId}</span>
                <span className="kd-mono text-secondary small">SERIAL: {allocation.serial}</span>
              </div>
              <h5 className="text-white fw-bold mb-1">{allocation.assetName}</h5>
              <div className="small text-secondary mb-2">
                Current Custodian: <span className="text-white fw-semibold">{allocation.employeeName}</span> ({allocation.department})
              </div>
              <div className="kd-mono text-secondary small" style={{ fontSize: '0.72rem' }}>
                Handed over on: {allocation.handoverDate} • Peripherals: {allocation.peripherals}
              </div>
            </div>

            <div className="row g-3">
              {/* Return Date */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">RETURN INSPECTION DATE</label>
                <input
                  type="date"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {/* Physical Condition on Return */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">CONDITION UPON RETURN</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={returnCondition}
                  onChange={(e) => {
                    const cond = e.target.value;
                    setReturnCondition(cond);
                    if (cond === 'Faulty' || cond === 'Minor Defect') {
                      setDestinationStatus('Under Maintenance');
                    } else {
                      setDestinationStatus('Available');
                    }
                  }}
                >
                  <option value="Excellent">Excellent (No Wear)</option>
                  <option value="Good">Good (Working Normal)</option>
                  <option value="Minor Defect">Minor Defect (Scratch/Wear)</option>
                  <option value="Faulty">Faulty (Needs Service/Damaged)</option>
                </select>
              </div>

              {/* Inventory Destination */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">ROUTE INVENTORY STATUS TO</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={destinationStatus}
                  onChange={(e) => setDestinationStatus(e.target.value)}
                >
                  <option value="Available">Available for Allocation (Ready Pool)</option>
                  <option value="Under Maintenance">Under Maintenance (Technical Service)</option>
                  <option value="Unused">Unused / In Long-Term Storage</option>
                  <option value="Sold (OLX)">Decommission &amp; Route to OLX Pipeline</option>
                </select>
              </div>

              {/* Return Checklist & Notes */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">RETURN INSPECTION REMARKS</label>
                <textarea
                  rows="2"
                  className="form-control bg-black border-secondary text-white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note accessories returned (charger, cords, bag) and operational condition..."
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div className="kd-modal-footer">
            <button type="button" className="kd-btn-outline" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="kd-btn-solid">
              <i className="bi bi-box-arrow-in-down"></i> CONFIRM RETURN &amp; UPDATE LEDGER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

