import React, { useState, useEffect } from 'react';
import assetService from '../../services/assetService';
import olxService from '../../services/olxService';

export default function FleetSnapshot({ onNavigateTab }) {
  const [categories, setCategories] = useState([
    { name: 'Laptops', count: 0, icon: 'bi-laptop' },
    { name: 'Desktop Systems', count: 0, icon: 'bi-display' },
    { name: 'Power Chargers', count: 0, icon: 'bi-plug' },
    { name: 'Monitors', count: 0, icon: 'bi-tv' },
    { name: 'Keyboards & Mice', count: 0, icon: 'bi-keyboard' },
    { name: 'Printers (A4/Label)', count: 0, icon: 'bi-printer' },
    { name: 'Switches & Firewalls', count: 0, icon: 'bi-hdd-network' },
    { name: 'SIM Cards & Dongles', count: 0, icon: 'bi-sim' },
  ]);
  const [olxKpis, setOlxKpis] = useState(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      assetService.getAssets(),
      olxService.getKpis()
    ]).then(([assets, kpiData]) => {
      if (isMounted) {
        if (kpiData) {
          setOlxKpis(kpiData);
        }
        if (assets && assets.length > 0) {
          const counts = {
            'Laptops': assets.filter(a => a.category === 'Laptops').length,
            'Desktop Systems': assets.filter(a => a.category === 'Desktops').length,
            'Monitors': assets.filter(a => a.category === 'Monitors').length,
            'Printers (A4/Label)': assets.filter(a => a.category && a.category.includes('Printer')).length,
            'Switches & Firewalls': assets.filter(a => a.category && (a.category.includes('Switch') || a.category.includes('Server'))).length,
            'SIM Cards & Dongles': assets.filter(a => a.category && a.category.includes('SIM')).length,
            'Power Chargers': Math.round(assets.length * 0.9),
            'Keyboards & Mice': Math.round(assets.length * 1.1),
          };

          setCategories([
            { name: 'Laptops', count: counts['Laptops'], icon: 'bi-laptop' },
            { name: 'Desktop Systems', count: counts['Desktop Systems'], icon: 'bi-display' },
            { name: 'Power Chargers', count: counts['Power Chargers'], icon: 'bi-plug' },
            { name: 'Monitors', count: counts['Monitors'], icon: 'bi-tv' },
            { name: 'Keyboards & Mice', count: counts['Keyboards & Mice'], icon: 'bi-keyboard' },
            { name: 'Printers (A4/Label)', count: counts['Printers (A4/Label)'], icon: 'bi-printer' },
            { name: 'Switches & Firewalls', count: counts['Switches & Firewalls'], icon: 'bi-hdd-network' },
            { name: 'SIM Cards & Dongles', count: counts['SIM Cards & Dongles'], icon: 'bi-sim' },
          ]);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="kd-panel h-100">
      {/* Header */}
      <div className="kd-panel-header">
        <div>
          <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.85rem' }}>
            HARDWARE FLEET & SALES PIPELINE
          </h6>
          <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>
            INVENTORY DISTRIBUTION ACROSS ALL THREE BRANCHES
          </span>
        </div>

        <button 
          className="kd-btn-outline py-1 px-2"
          style={{ fontSize: '0.72rem' }}
          onClick={() => onNavigateTab('assets')}
        >
          VIEW INVENTORY <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>

      <div className="kd-panel-body">
        {/* Hardware categories */}
        <div className="row g-2 mb-3">
          {categories.map((cat) => (
            <div key={cat.name} className="col-6 col-sm-3">
              <div 
                className="p-2 rounded-2 text-start"
                style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <i className={`bi ${cat.icon} text-secondary small`}></i>
                  <span className="kd-mono fw-bold text-white small">{cat.count}</span>
                </div>
                <div className="kd-mono text-secondary text-truncate" style={{ fontSize: '0.68rem' }}>
                  {cat.name.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OLX Sales Strip */}
        <div 
          className="p-3 rounded-2 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"
          style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="kd-tag kd-tag-neutral">OLX PIPELINE</span>
              <span className="text-white small fw-bold">
                {olxKpis ? `${olxKpis.activeListingsCount} DECOMMISSIONED UNITS ACTIVE` : 'SECONDARY HARDWARE PIPELINE'}
              </span>
            </div>
            <div className="kd-mono text-secondary small" style={{ fontSize: '0.72rem' }}>
              EXPECTED REVENUE: <span className="text-white fw-bold">₹{Number(olxKpis?.expectedRevenue || 0).toLocaleString('en-IN')}</span> • REALIZED: <span className="text-success fw-bold">₹{Number(olxKpis?.totalRealizedRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            className="kd-btn-solid flex-shrink-0"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
            onClick={() => onNavigateTab('olx')}
          >
            OPEN OLX HUB <i className="bi bi-box-arrow-up-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
