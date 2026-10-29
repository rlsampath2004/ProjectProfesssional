import React, { useState, useEffect } from 'react';

export default function AssetModal({ show, onClose, onSave, assetToEdit }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Laptops',
    serial: '',
    location: 'Head Office - Marine Lines',
    status: 'Available',
    condition: 'Excellent',
    assignedTo: 'Unassigned (Pool)',
    purchaseDate: new Date().toISOString().split('T')[0],
    value: 50000,
    specs: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (assetToEdit) {
      setFormData(assetToEdit);
    } else {
      // Auto-generate tag based on category
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        id: `KD-AST-${randomNum}`,
        name: '',
        category: 'Laptops',
        serial: '',
        location: 'Head Office - Marine Lines',
        status: 'Available',
        condition: 'Excellent',
        assignedTo: 'Unassigned (Pool)',
        purchaseDate: new Date().toISOString().split('T')[0],
        value: 45000,
        specs: ''
      });
    }
    setErrors({});
  }, [assetToEdit, show]);

  if (!show) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Hardware name/model is required';
    if (!formData.serial.trim()) errs.serial = 'Serial number is required';
    if (!formData.id.trim()) errs.id = 'Asset ID is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog">
        <div className="kd-modal-header">
          <div>
            <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
              {assetToEdit ? 'EDIT IT ASSET RECORD' : 'REGISTER NEW IT ASSET'}
            </h6>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              KOTHARI DISTRIBUTORS HARDWARE REGISTRY
            </span>
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kd-modal-body">
            <div className="row g-3">
              {/* Asset Tag & Serial */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">ASSET TAG ID</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. KD-LAP-085"
                />
                {errors.id && <div className="text-danger small mt-1 kd-mono">{errors.id}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">SERIAL NUMBER</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={formData.serial}
                  onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                  placeholder="e.g. PF-392019A"
                />
                {errors.serial && <div className="text-danger small mt-1 kd-mono">{errors.serial}</div>}
              </div>

              {/* Hardware Model Name */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">EQUIPMENT MODEL & MAKE</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lenovo ThinkPad T14 Gen 3 / Cisco Catalyst 2960"
                />
                {errors.name && <div className="text-danger small mt-1 kd-mono">{errors.name}</div>}
              </div>

              {/* Category & Location */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">CATEGORY</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Laptops">Laptops</option>
                  <option value="Desktops">Desktops</option>
                  <option value="Monitors">Monitors</option>
                  <option value="A4 Printers">A4 Printers</option>
                  <option value="Label Printers">Label Printers</option>
                  <option value="Switches & Firewalls">Switches & Firewalls</option>
                  <option value="SIM Cards & Dongles">SIM Cards & Dongles</option>
                  <option value="Chargers & Power">Chargers & Power</option>
                  <option value="Keyboards & Mice">Keyboards & Mice</option>
                  <option value="Other IT Equipment">Other IT Equipment</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">LOCATION / BRANCH</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="Head Office - Marine Lines">Head Office - Marine Lines</option>
                  <option value="Branch A - Andheri">Branch A - Andheri</option>
                  <option value="Warehouse - Bhiwandi">Warehouse - Bhiwandi</option>
                  <option value="Transit / Remote">Transit / Remote</option>
                </select>
              </div>

              {/* Status & Condition */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">AVAILABILITY STATUS</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="In Use">In Use (Assigned)</option>
                  <option value="Available">Available for Allocation</option>
                  <option value="Unused">Unused / In Storage</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Sold (OLX)">Sold (OLX / Decommissioned)</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">WORKING CONDITION</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="Excellent">Excellent (New / Mint)</option>
                  <option value="Good">Good (Working)</option>
                  <option value="Minor Defect">Minor Defect (Functional)</option>
                  <option value="Faulty">Faulty (Needs Repair)</option>
                </select>
              </div>

              {/* Employee Assigned & Value */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">ASSIGNED EMPLOYEE / DEPT</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g. Rahul S. (Logistics) or Unassigned (Pool)"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">ASSET VALUE (INR ₹)</label>
                <input
                  type="number"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  placeholder="50000"
                />
              </div>

              {/* Specs & Hardware Notes */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">HARDWARE SPECIFICATIONS & DETAILS</label>
                <textarea
                  rows="2"
                  className="form-control bg-black border-secondary text-white"
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="e.g. Intel Core i7 12th Gen, 16GB RAM, 512GB SSD, Original Charger Included"
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
              <i className="bi bi-check2"></i> {assetToEdit ? 'UPDATE ASSET' : 'SAVE ASSET TO INVENTORY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

