import React, { useState } from 'react';

export default function DiscrepancyModal({ show, onClose, onSave, assets = [] }) {
  const [formData, setFormData] = useState({
    assetId: assets[0]?.id || 'KD-LAP-001',
    severity: 'Medium',
    issue: '',
    reportedBy: 'R.L. Kothari (CEO)',
    actionRequired: ''
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.issue.trim()) return;

    const matchedAsset = assets.find(a => a.id === formData.assetId);

    const newDiscrepancy = {
      id: `DISC-${Math.floor(100 + Math.random() * 900)}`,
      assetId: formData.assetId,
      assetName: matchedAsset ? matchedAsset.name : 'Hardware Asset',
      serial: matchedAsset ? matchedAsset.serial : 'SN-UNKNOWN',
      branch: matchedAsset ? matchedAsset.location : 'Head Office',
      severity: formData.severity,
      issue: formData.issue,
      reportedBy: formData.reportedBy,
      reportDate: new Date().toISOString().split('T')[0],
      status: 'Investigating',
      actionRequired: formData.actionRequired || 'Inspection pending.'
    };

    onSave(newDiscrepancy);
    onClose();
  };

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog">
        <div className="kd-modal-header">
          <div>
            <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
              FLAG AUDIT DISCREPANCY
            </h6>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              RECORD DAMAGED, MISMATCHED, OR MISSING HARDWARE
            </span>
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kd-modal-body">
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label className="form-label kd-mono text-secondary small mb-1">AFFECTED HARDWARE ASSET</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.id}] {a.name} (S/N: {a.serial})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label kd-mono text-secondary small mb-1">SEVERITY LEVEL</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="Low">Low (Cosmetic/Label)</option>
                  <option value="Medium">Medium (Defect/Wear)</option>
                  <option value="High">High (Missing/Damaged)</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">DISCREPANCY FINDINGS &amp; OBSERVATIONS</label>
                <textarea
                  rows="3"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="Describe physical defect, mismatched serial numbers, unreturned power adapter, or physical damage observed during inspection..."
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">RECOMMENDED RESOLUTION ACTION</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="e.g. Schedule vendor repair, issue replacement charger, or write-off to OLX"
                  value={formData.actionRequired}
                  onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="kd-modal-footer">
            <button type="button" className="kd-btn-outline" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="kd-btn-solid">
              <i className="bi bi-exclamation-triangle"></i> RECORD AUDIT DISCREPANCY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

