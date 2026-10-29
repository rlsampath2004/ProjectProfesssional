import React, { useState } from 'react';

export default function AssetBarcodeModal({ isOpen, onClose, assets = [] }) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', ...new Set(assets.map(a => a.category))];
  const locations = ['All', ...new Set(assets.map(a => a.location))];

  const filteredAssets = assets.filter(a => {
    const matchCat = filterCategory === 'All' || a.category === filterCategory;
    const matchLoc = filterLocation === 'All' || a.location === filterLocation;
    return matchCat && matchLoc;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content rounded-3" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}>
          
          {/* Header */}
          <div className="modal-header px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}
              >
                <i className="bi bi-upc-scan fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>
                  Physical Asset Barcode &amp; Label Tag Generator
                </h5>
                <p className="text-secondary small mb-0 font-monospace">
                  Industrial Equipment Tags for Laptops, Desktops, Printers &amp; Network Gear • Print-Ready A4 Sheet
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
                <span>Print Sticker Sheet ({filteredAssets.length} Labels)</span>
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

          {/* Filter Bar */}
          <div className="px-4 py-2 d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-bold font-monospace">CATEGORY:</span>
                <select 
                  className="form-select form-select-sm py-1 font-monospace"
                  style={{ width: '160px', background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)', fontSize: '11px' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-bold font-monospace">BRANCH:</span>
                <select 
                  className="form-select form-select-sm py-1 font-monospace"
                  style={{ width: '200px', background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)', fontSize: '11px' }}
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <span className="text-secondary small font-monospace">
              Showing <strong style={{ color: 'var(--kd-text-1)' }}>{filteredAssets.length}</strong> printable stickers
            </span>
          </div>

          {/* Modal Body / Sticker Sheet */}
          <div className="modal-body p-4 kd-print-sheet" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            <div className="row g-3">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="col-12 col-md-6 col-xl-4">
                  <div 
                    className="p-3 rounded-2 h-100 d-flex flex-column justify-content-between position-relative"
                    style={{
                      background: 'var(--kd-surface-2)',
                      border: '2px solid var(--kd-border)',
                      borderLeft: '4px solid #38bdf8'
                    }}
                  >
                    {/* Header */}
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span 
                            className="fw-bold px-1 rounded-1 text-black bg-white" 
                            style={{ fontSize: '10px', letterSpacing: '0.05em' }}
                          >
                            KD
                          </span>
                          <span className="fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'var(--kd-text-1)' }}>
                            Kothari Distributors
                          </span>
                        </div>
                        <span className="badge font-monospace text-uppercase" style={{ background: 'var(--kd-surface-3)', color: 'var(--kd-text-2)', fontSize: '9px' }}>
                          {asset.category}
                        </span>
                      </div>

                      {/* Tag ID in Huge Mono */}
                      <div className="d-flex align-items-baseline justify-content-between my-2">
                        <div className="font-monospace fw-bold fs-5" style={{ color: 'var(--kd-text-1)', letterSpacing: '1px' }}>
                          {asset.id}
                        </div>
                        <span className="text-secondary font-monospace" style={{ fontSize: '10px' }}>
                          VERIFIED ASSET
                        </span>
                      </div>

                      {/* Model & Specs */}
                      <div className="fw-semibold small text-truncate" style={{ color: 'var(--kd-text-1)' }} title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="text-secondary font-monospace mt-1" style={{ fontSize: '10px' }}>
                        SN: <span className="fw-bold" style={{ color: 'var(--kd-text-1)' }}>{asset.serial}</span>
                      </div>
                    </div>

                    {/* Simulated Code-128 Barcode & Footer */}
                    <div className="mt-3 pt-2 border-top border-secondary-subtle">
                      <div 
                        className="d-flex align-items-center justify-content-center gap-1 my-1 py-1 px-2 rounded-1"
                        style={{ background: 'var(--kd-surface-1)', height: '32px' }}
                      >
                        {/* High-density Barcode Line Simulation */}
                        {[2,1,3,1,2,3,1,2,1,3,2,1,2,1,3,1,2,2,1,3,1,2,1,3,2,1,2,3,1,2,1,2,3,1,2,1,3].map((width, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-block',
                              width: `${width}px`,
                              height: '24px',
                              backgroundColor: 'var(--kd-text-1)',
                              opacity: idx % 2 === 0 ? 0.95 : 0
                            }}
                          />
                        ))}
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-1 text-secondary font-monospace" style={{ fontSize: '9px' }}>
                        <span>LOC: {asset.location.split(' - ')[0]}</span>
                        <span>PROPERTY OF KOTHARI DISTRIBUTORS</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--kd-surface-2)', borderTop: '1px solid var(--kd-border)' }}>
            <div className="text-secondary small font-monospace">
              <i className="bi bi-info-circle me-1"></i> Compatible with Avery 5160 / A4 Self-Adhesive IT Equipment Sticker Rolls.
            </div>
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-sm btn-primary fw-bold px-3 d-flex align-items-center gap-2" onClick={handlePrint}>
                <i className="bi bi-printer-fill"></i>
                <span>Print Sticker Labels</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

