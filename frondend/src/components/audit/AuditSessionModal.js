import React, { useState } from 'react';

export default function AuditSessionModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    branch: 'Head Office - Marine Lines',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    auditor: 'Neha Patel (Stock Auditor)',
    totalItems: 50
  });

  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Audit session title is required.');
      return;
    }

    const newSession = {
      id: `ADT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      ...formData,
      status: 'In Progress',
      verifiedItems: 0,
      discrepanciesCount: 0,
      certifiedBy: null,
      certifiedDate: null
    };

    onSave(newSession);
    onClose();
  };

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog">
        <div className="kd-modal-header">
          <div>
            <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
              COMMENCE PHYSICAL STOCKTAKE SESSION
            </h6>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              BRANCH HARDWARE AUDIT &amp; SERIAL VERIFICATION
            </span>
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kd-modal-body">
            {error && <div className="alert alert-danger py-2 small kd-mono mb-3">{error}</div>}

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">AUDIT SESSION TITLE</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="e.g. Q4 2026 Head Office Comprehensive Hardware Audit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">BRANCH / LOCATION</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                >
                  <option value="Head Office - Marine Lines">Head Office - Marine Lines</option>
                  <option value="Branch A - Andheri">Branch A - Andheri</option>
                  <option value="Warehouse - Bhiwandi">Warehouse - Bhiwandi</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">LEAD AUDITOR</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  value={formData.auditor}
                  onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">AUDIT COMMENCE DATE</label>
                <input
                  type="date"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">TARGET CONCLUSION DATE</label>
                <input
                  type="date"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">TARGET ASSET SAMPLE SIZE</label>
                <input
                  type="number"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={formData.totalItems}
                  onChange={(e) => setFormData({ ...formData, totalItems: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="kd-modal-footer">
            <button type="button" className="kd-btn-outline" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="kd-btn-solid">
              <i className="bi bi-play-fill"></i> INITIATE AUDIT SESSION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

