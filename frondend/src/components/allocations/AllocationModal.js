import React, { useState } from 'react';
import { initialEmployees } from './AllocationData';

export default function AllocationModal({ show, onClose, onAllocate, availableAssets = [] }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployees[0].id);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [peripherals, setPeripherals] = useState('Original Charger + Carry Bag');
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Excellent');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError('Please select an available hardware asset to allocate.');
      return;
    }

    const employee = initialEmployees.find(e => e.id === selectedEmployeeId) || {
      id: selectedEmployeeId,
      name: 'Authorized Staff',
      department: 'Operations',
      branch: 'Head Office - Marine Lines'
    };

    const asset = availableAssets.find(a => a.id === selectedAssetId) || {
      id: selectedAssetId,
      name: 'Assigned Equipment',
      category: 'Hardware',
      serial: 'SN-VERIFIED'
    };

    const newAllocation = {
      id: `ALC-2024-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      branch: employee.branch,
      assetId: asset.id,
      assetName: asset.name,
      category: asset.category,
      serial: asset.serial,
      peripherals: peripherals || 'None',
      handoverDate: handoverDate,
      returnDate: null,
      conditionAtHandover: condition,
      status: 'Active Custody',
      notes: notes || 'Standard company equipment allocation.'
    };

    onAllocate(newAllocation);
    onClose();
  };

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog">
        <div className="kd-modal-header">
          <div>
            <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em' }}>
              ALLOCATE HARDWARE ASSET
            </h6>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              ASSIGN EQUIPMENT TO AUTHORIZED COMPANY STAFF
            </span>
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kd-modal-body">
            {error && (
              <div className="alert alert-danger py-2 px-3 small kd-mono mb-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {error}
              </div>
            )}

            <div className="row g-3">
              {/* Employee Selection */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">RECIPIENT EMPLOYEE</label>
                <select
                  className="form-select bg-black border-secondary text-white"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                  {initialEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role} ({emp.department} • {emp.branch})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hardware Asset Selection */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">AVAILABLE EQUIPMENT POOL</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={selectedAssetId}
                  onChange={(e) => {
                    setSelectedAssetId(e.target.value);
                    setError('');
                  }}
                  required
                >
                  <option value="">-- Choose Hardware from Available Inventory --</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      [{asset.id}] {asset.name} ({asset.category} • S/N: {asset.serial} • {asset.location})
                    </option>
                  ))}
                </select>
                <span className="kd-mono text-secondary small" style={{ fontSize: '0.68rem' }}>
                  {availableAssets.length} unassigned units currently in available pool.
                </span>
              </div>

              {/* Secondary Peripherals */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">INCLUDED PERIPHERALS & ACCESSORIES</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  value={peripherals}
                  onChange={(e) => setPeripherals(e.target.value)}
                  placeholder="e.g. 65W Type-C Charger + Dell Wireless Mouse + Backpack"
                />
              </div>

              {/* Handover Date & Initial Condition */}
              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">HANDOVER DATE</label>
                <input
                  type="date"
                  className="form-control bg-black border-secondary text-white kd-mono"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label kd-mono text-secondary small mb-1">CONDITION AT ISSUANCE</label>
                <select
                  className="form-select bg-black border-secondary text-white kd-mono"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="Excellent">Excellent (Mint / New)</option>
                  <option value="Good">Good (Tested Working)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="col-12">
                <label className="form-label kd-mono text-secondary small mb-1">HANDOVER NOTES & CUSTODY AGREEMENT</label>
                <textarea
                  rows="2"
                  className="form-control bg-black border-secondary text-white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Custody conditions, specific software installed, or branch routing details..."
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
              <i className="bi bi-shield-check"></i> CONFIRM ALLOCATION & ISSUE RECEIPT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

