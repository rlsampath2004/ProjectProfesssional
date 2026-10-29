import React, { useState } from 'react';

export default function AssetDepreciationModal({ isOpen, onClose, assets = [], onNavigateTab }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  // Standard IT equipment depreciation rates (WDV method per IT Rules)
  const getDepreciationRate = (category) => {
    switch (category) {
      case 'Laptops':
      case 'Desktops':
        return 0.333; // 33.3% per annum
      case 'Monitors':
      case 'Keyboards & Mice':
        return 0.25; // 25% per annum
      case 'A4 Printers':
      case 'Label Printers':
        return 0.20; // 20% per annum
      case 'Switches & Firewalls':
        return 0.15; // 15% per annum
      default:
        return 0.20;
    }
  };

  // Calculate current book value based on purchase date
  const calculateDepreciation = (asset) => {
    const purchaseYear = new Date(asset.purchaseDate || '2023-01-01').getFullYear();
    const currentYear = 2026;
    const ageYears = Math.max(1, currentYear - purchaseYear);
    const rate = getDepreciationRate(asset.category);
    const original = Number(asset.value) || 50000;
    
    // Written Down Value formula: Original * (1 - rate)^age
    const currentValue = Math.max(Math.round(original * 0.1), Math.round(original * Math.pow(1 - rate, ageYears)));
    const totalDepreciated = original - currentValue;
    const isDueForReplacement = ageYears >= 3 || (currentValue / original) <= 0.25;

    return {
      original,
      currentValue,
      totalDepreciated,
      ageYears,
      isDueForReplacement
    };
  };

  const processedAssets = assets.map(a => ({
    ...a,
    ...calculateDepreciation(a)
  }));

  const filtered = processedAssets.filter(a => selectedCategory === 'All' || a.category === selectedCategory);

  const totalAcquisitionCost = processedAssets.reduce((sum, a) => sum + a.original, 0);
  const totalCurrentBookValue = processedAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalAccumulatedDepreciation = totalAcquisitionCost - totalCurrentBookValue;
  const replacementCandidates = processedAssets.filter(a => a.isDueForReplacement);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div 
          className="modal-content rounded-3 shadow-lg"
          style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}
        >
          {/* Header */}
          <div 
            className="modal-header px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <i className="bi bi-graph-down-arrow fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>
                  Hardware Asset Depreciation &amp; Replacement Forecaster
                </h5>
                <p className="text-secondary small mb-0 font-monospace">
                  Companies Act 2013 / Income Tax WDV Schedule • Fleet Book Value vs Residual Salvage
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* KPI Cards */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-3">
                <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                  <div className="text-secondary small font-monospace">TOTAL FLEET ACQUISITION</div>
                  <div className="fw-bold fs-4 text-white font-monospace">{formatCurrency(totalAcquisitionCost)}</div>
                  <div className="text-secondary small mt-1" style={{ fontSize: '11px' }}>248 Units Initial Invoiced Value</div>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                  <div className="text-secondary small font-monospace">CURRENT NET BOOK VALUE</div>
                  <div className="fw-bold fs-4 text-success font-monospace">{formatCurrency(totalCurrentBookValue)}</div>
                  <div className="text-secondary small mt-1" style={{ fontSize: '11px' }}>FY 2026-27 Balance Sheet Asset</div>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                  <div className="text-secondary small font-monospace">ACCUMULATED DEPRECIATION</div>
                  <div className="fw-bold fs-4 text-warning font-monospace">{formatCurrency(totalAccumulatedDepreciation)}</div>
                  <div className="text-secondary small mt-1" style={{ fontSize: '11px' }}>Tax Written Down Delta</div>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                  <div className="text-secondary small font-monospace">REPLACEMENT CANDIDATES</div>
                  <div className="fw-bold fs-4 text-danger font-monospace">{replacementCandidates.length} UNITS</div>
                  <div className="text-secondary small mt-1" style={{ fontSize: '11px' }}>Age ≥ 3 yrs (Ready for OLX)</div>
                </div>
              </div>
            </div>

            {/* Replacement Alert Notice */}
            {replacementCandidates.length > 0 && (
              <div 
                className="p-3 mb-4 rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-recycle fs-3 text-warning"></i>
                  <div>
                    <div className="fw-bold text-warning small font-monospace">FLEET UPGRADE RECOMMENDATION</div>
                    <div className="text-secondary small" style={{ fontSize: '12px' }}>
                      {replacementCandidates.length} devices have surpassed their 3-year commercial lifecycle and can be decommissioned to the OLX pipeline for immediate cash salvage.
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-warning btn-sm fw-bold px-3 text-black text-nowrap"
                  onClick={() => {
                    onClose();
                    onNavigateTab && onNavigateTab('olx');
                  }}
                >
                  <i className="bi bi-tag-fill me-1"></i> Open OLX Hub
                </button>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex flex-wrap gap-1">
                {['All', 'Laptops', 'Desktops', 'Monitors', 'A4 Printers', 'Switches & Firewalls'].map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm font-monospace px-2 py-1 ${selectedCategory === c ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '11px' }}
                    onClick={() => setSelectedCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <span className="text-secondary small font-monospace">
                Showing {filtered.length} units
              </span>
            </div>

            {/* Depreciation Breakdown Table */}
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0 align-middle">
                <thead className="small font-monospace" style={{ background: 'var(--kd-surface-2)', color: 'var(--kd-text-2)' }}>
                  <tr style={{ borderBottom: '1px solid var(--kd-border)' }}>
                    <th className="py-2 px-2">TAG ID</th>
                    <th className="py-2">MODEL</th>
                    <th className="py-2">ACQUIRED</th>
                    <th className="py-2">AGE</th>
                    <th className="py-2">INITIAL (₹)</th>
                    <th className="py-2">NET BOOK VALUE (₹)</th>
                    <th className="py-2">DEPRECIATION %</th>
                    <th className="py-2 text-end pe-2">RECOMMENDATION</th>
                  </tr>
                </thead>
                <tbody className="small font-monospace">
                  {filtered.slice(0, 15).map(item => {
                    const depPercent = Math.round((item.totalDepreciated / item.original) * 100);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--kd-border)' }}>
                        <td className="px-2 fw-bold" style={{ color: 'var(--kd-text-1)' }}>{item.id}</td>
                        <td style={{ color: 'var(--kd-text-1)' }}>{item.name}</td>
                        <td className="text-secondary">{item.purchaseDate || '2023-03-15'}</td>
                        <td className="text-secondary">{item.ageYears} yrs</td>
                        <td className="text-secondary">₹{item.original.toLocaleString('en-IN')}</td>
                        <td className="fw-bold text-success">₹{item.currentValue.toLocaleString('en-IN')}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '6px', background: 'var(--kd-surface-3)', minWidth: '60px' }}>
                              <div 
                                className={`progress-bar ${depPercent > 70 ? 'bg-danger' : depPercent > 40 ? 'bg-warning' : 'bg-primary'}`} 
                                style={{ width: `${depPercent}%` }}
                              />
                            </div>
                            <span className="small text-secondary">{depPercent}%</span>
                          </div>
                        </td>
                        <td className="text-end pe-2">
                          {item.isDueForReplacement ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                              REPLACE / LIQUIDATE
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                              HEALTHY FLEET
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Footer */}
          <div 
            className="modal-footer px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ background: 'var(--kd-surface-2)', borderTop: '1px solid var(--kd-border)' }}
          >
            <div className="text-secondary small font-monospace">
              <i className="bi bi-info-circle me-1"></i> Based on Indian IT Act Schedule II Written Down Value (WDV) norms.
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onClose}>
              Close Window
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

