import React from 'react';

export default function AssetDetailModal({ asset, onClose, onEdit, onDelete, onStatusChange }) {
  if (!asset) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Use':
        return <span className="kd-tag kd-tag-status-inuse"><i className="bi bi-person-check-fill me-1"></i>IN USE</span>;
      case 'Available':
        return <span className="kd-tag kd-tag-status-avail"><i className="bi bi-check-circle-fill me-1"></i>AVAILABLE</span>;
      case 'Unused':
        return <span className="kd-tag kd-tag-status-unused"><i className="bi bi-box-seam me-1"></i>UNUSED</span>;
      case 'Under Maintenance':
        return <span className="kd-tag kd-tag-status-maint"><i className="bi bi-wrench me-1"></i>MAINTENANCE</span>;
      case 'Sold (OLX)':
        return <span className="kd-tag kd-tag-status-sold"><i className="bi bi-tag-fill me-1"></i>SOLD (OLX)</span>;
      default:
        return <span className="kd-tag kd-tag-neutral">{status}</span>;
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Laptops':
        return <span className="kd-tag kd-tag-cat-laptop">{cat}</span>;
      case 'Desktops':
        return <span className="kd-tag kd-tag-cat-desktop">{cat}</span>;
      case 'Monitors':
        return <span className="kd-tag kd-tag-cat-monitor">{cat}</span>;
      case 'A4 Printers':
      case 'Label Printers':
        return <span className="kd-tag kd-tag-cat-printer">{cat}</span>;
      case 'Switches & Firewalls':
        return <span className="kd-tag kd-tag-cat-network">{cat}</span>;
      case 'SIM Cards & Dongles':
        return <span className="kd-tag kd-tag-cat-sim">{cat}</span>;
      default:
        return <span className="kd-tag kd-tag-cat-peripheral">{cat}</span>;
    }
  };

  return (
    <div className="kd-modal-backdrop">
      <div className="kd-modal-dialog">
        <div className="kd-modal-header">
          <div className="d-flex align-items-center gap-2">
            <span className="kd-mono text-secondary small fw-bold">{asset.id}</span>
            <span className="text-secondary opacity-50">/</span>
            {getCategoryBadge(asset.category)}
            {getStatusBadge(asset.status)}
          </div>
          <button className="btn btn-sm text-secondary hover-text-white p-0" onClick={onClose}>
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <div className="kd-modal-body">
          {/* Main Title & Value */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-2 mb-4 pb-3 border-bottom border-secondary-subtle">
            <div>
              <h4 className="text-white fw-bold mb-1">{asset.name}</h4>
              <div className="kd-mono text-secondary small">
                SERIAL: <span className="text-white fw-semibold">{asset.serial}</span>
              </div>
            </div>
            <div className="text-sm-end">
              <div className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>ASSET VALUE</div>
              <div className="kd-mono text-white fw-bold fs-5">{formatCurrency(asset.value)}</div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6">
              <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="kd-mono text-secondary small mb-1">CUSTODY ASSIGNMENT</div>
                <div className="text-white fw-semibold">{asset.assignedTo}</div>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="kd-mono text-secondary small mb-1">BRANCH LOCATION</div>
                <div className="text-white fw-semibold">{asset.location}</div>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="kd-mono text-secondary small mb-1">WORKING CONDITION</div>
                <div className="text-white fw-semibold">
                  {asset.condition === 'Excellent' && <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Excellent (Mint)</span>}
                  {asset.condition === 'Good' && <span className="text-info"><i className="bi bi-check-circle me-1"></i>Good (Operational)</span>}
                  {asset.condition === 'Minor Defect' && <span className="text-warning"><i className="bi bi-exclamation-circle me-1"></i>Minor Defect</span>}
                  {asset.condition === 'Faulty' && <span className="text-danger"><i className="bi bi-x-circle-fill me-1"></i>Faulty (Service Required)</span>}
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="kd-mono text-secondary small mb-1">PURCHASE RECORD</div>
                <div className="kd-mono text-white fw-semibold">{asset.purchaseDate}</div>
              </div>
            </div>

            <div className="col-12">
              <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="kd-mono text-secondary small mb-1">HARDWARE SPECIFICATIONS</div>
                <div className="text-light small">{asset.specs || 'Standard manufacturer specifications recorded.'}</div>
              </div>
            </div>
          </div>

          {/* Quick Lifecycle Status Switcher */}
          <div className="p-3 rounded-2 mb-3" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
            <div className="kd-mono text-secondary small mb-2 fw-semibold">FAST STATUS OVERRIDE</div>
            <div className="d-flex flex-wrap gap-2">
              {['In Use', 'Available', 'Unused', 'Under Maintenance', 'Sold (OLX)'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm kd-mono ${asset.status === st ? 'kd-btn-solid' : 'kd-btn-outline'}`}
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                  onClick={() => onStatusChange(asset.id, st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="kd-modal-footer justify-content-between">
          <button 
            type="button" 
            className="kd-btn-danger-outline"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete asset ${asset.id} (${asset.name}) from company records?`)) {
                onDelete(asset.id);
                onClose();
              }
            }}
          >
            <i className="bi bi-trash3"></i> DELETE ASSET
          </button>

          <div className="d-flex gap-2">
            <button type="button" className="kd-btn-outline" onClick={onClose}>
              CLOSE
            </button>
            <button 
              type="button" 
              className="kd-btn-solid"
              onClick={() => {
                onClose();
                onEdit(asset);
              }}
            >
              <i className="bi bi-pencil-square"></i> EDIT DETAILS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

