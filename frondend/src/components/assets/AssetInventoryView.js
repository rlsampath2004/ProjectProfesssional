import React, { useState, useMemo, useEffect } from 'react';
import assetService from '../../services/assetService';
import AssetModal from './AssetModal';
import AssetDetailModal from './AssetDetailModal';
import AssetBarcodeModal from './AssetBarcodeModal';
import AssetDepreciationModal from './AssetDepreciationModal';

export default function AssetInventoryView({ onNavigateTab }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('id');

  // Load from backend API with fallback
  useEffect(() => {
    let isMounted = true;
    assetService.getAssets().then(data => {
      if (isMounted) {
        setAssets(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [detailAsset, setDetailAsset] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: assets.length };
    assets.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [assets]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      inUse: assets.filter(a => a.status === 'In Use').length,
      available: assets.filter(a => a.status === 'Available').length,
      unused: assets.filter(a => a.status === 'Unused').length,
      maintenance: assets.filter(a => a.status === 'Under Maintenance').length,
      sold: assets.filter(a => a.status === 'Sold (OLX)').length,
      totalValue: assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0)
    };
  }, [assets]);

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.serial.toLowerCase().includes(q) ||
        a.assignedTo.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
      const matchesLoc = selectedLocation === 'All' || a.location === selectedLocation;

      return matchesSearch && matchesCat && matchesStatus && matchesLoc;
    }).sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.purchaseDate) - new Date(a.purchaseDate);
      return a.id.localeCompare(b.id);
    });
  }, [assets, searchQuery, selectedCategory, selectedStatus, selectedLocation, sortBy]);

  // Handlers
  const handleSaveAsset = async (assetData) => {
    if (assetToEdit) {
      const updated = await assetService.updateAsset(assetData.id, assetData);
      setAssets(assets.map(a => a.id === assetData.id ? { ...assetData, ...updated } : a));
    } else {
      const created = await assetService.createAsset(assetData);
      setAssets([created, ...assets]);
    }
    setAssetToEdit(null);
  };

  const handleDeleteAsset = async (id) => {
    const asset = assets.find(a => a.id === id);
    await assetService.deleteAsset(id, asset?.backendId);
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleStatusChange = async (id, newStatus) => {
    const asset = assets.find(a => a.id === id);
    await assetService.updateStatus(id, asset?.backendId, newStatus);
    setAssets(assets.map(a => a.id === id ? { 
      ...a, 
      status: newStatus,
      assignedTo: newStatus === 'Available' || newStatus === 'Unused' || newStatus === 'Sold (OLX)' ? 'Unassigned (Pool)' : a.assignedTo
    } : a));
    if (detailAsset && detailAsset.id === id) {
      setDetailAsset({ ...detailAsset, status: newStatus });
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Direct CSV Export of filtered inventory
  const handleExportCSV = () => {
    const headers = ['Asset ID', 'Category', 'Equipment Model', 'Serial Number', 'Branch Location', 'Status', 'Condition', 'Assigned To', 'Purchase Date', 'Value (INR)', 'Specs'];
    const rows = filteredAssets.map(a => [
      `"${a.id}"`,
      `"${a.category}"`,
      `"${a.name}"`,
      `"${a.serial}"`,
      `"${a.location}"`,
      `"${a.status}"`,
      `"${a.condition}"`,
      `"${a.assignedTo}"`,
      `"${a.purchaseDate}"`,
      a.value || 0,
      `"${(a.specs || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kothari_IT_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color combinations for Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Use':
        return <span className="kd-tag kd-tag-status-inuse">IN USE</span>;
      case 'Available':
        return <span className="kd-tag kd-tag-status-avail">AVAILABLE</span>;
      case 'Unused':
        return <span className="kd-tag kd-tag-status-unused">UNUSED</span>;
      case 'Under Maintenance':
        return <span className="kd-tag kd-tag-status-maint">MAINTENANCE</span>;
      case 'Sold (OLX)':
        return <span className="kd-tag kd-tag-status-sold">SOLD (OLX)</span>;
      default:
        return <span className="kd-tag kd-tag-neutral">{status}</span>;
    }
  };

  // Color combinations for Category
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Laptops':
        return <span className="kd-tag kd-tag-cat-laptop"><i className="bi bi-laptop me-1"></i>{cat}</span>;
      case 'Desktops':
        return <span className="kd-tag kd-tag-cat-desktop"><i className="bi bi-display me-1"></i>{cat}</span>;
      case 'Monitors':
        return <span className="kd-tag kd-tag-cat-monitor"><i className="bi bi-tv me-1"></i>{cat}</span>;
      case 'A4 Printers':
      case 'Label Printers':
        return <span className="kd-tag kd-tag-cat-printer"><i className="bi bi-printer me-1"></i>{cat}</span>;
      case 'Switches & Firewalls':
        return <span className="kd-tag kd-tag-cat-network"><i className="bi bi-hdd-network me-1"></i>{cat}</span>;
      case 'SIM Cards & Dongles':
        return <span className="kd-tag kd-tag-cat-sim"><i className="bi bi-sim me-1"></i>{cat}</span>;
      default:
        return <span className="kd-tag kd-tag-cat-peripheral">{cat}</span>;
    }
  };

  return (
    <div className="pb-4">
      {/* Modals */}
      <AssetModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setAssetToEdit(null);
        }}
        onSave={handleSaveAsset}
        assetToEdit={assetToEdit}
      />

      <AssetDetailModal
        asset={detailAsset}
        onClose={() => setDetailAsset(null)}
        onEdit={(a) => {
          setAssetToEdit(a);
          setShowModal(true);
        }}
        onDelete={handleDeleteAsset}
        onStatusChange={handleStatusChange}
      />

      <AssetBarcodeModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        assets={filteredAssets}
      />

      <AssetDepreciationModal
        isOpen={showDepreciationModal}
        onClose={() => setShowDepreciationModal(false)}
        assets={assets}
        onNavigateTab={onNavigateTab}
      />

      {/* Top Command Strip */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="kd-tag kd-tag-neutral">
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" style={{ width: '0.65rem', height: '0.65rem' }}></span>
                  SYNCING...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-check-fill text-success me-1"></i>
                  BACKEND SYNCED
                </>
              )}
            </span>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>• CENTRAL ASSET REPOSITORY</span>
          </div>
          <h3 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.035em' }}>
            IT Asset Inventory &amp; Hardware Lifecycle
          </h3>
          <p className="text-secondary small mb-0">
            Real-time tracking of serial numbers, branches, working condition, custody, and OLX status.
          </p>
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Depreciation & Lifecycle Forecaster */}
          <button 
            className="kd-btn-outline"
            onClick={() => setShowDepreciationModal(true)}
            title="Inspect WDV depreciation schedule and hardware replacement candidates"
          >
            <i className="bi bi-graph-down-arrow text-warning"></i>
            <span>DEPRECIATION</span>
          </button>

          {/* Print Barcode Stickers */}
          <button 
            className="kd-btn-outline"
            onClick={() => setShowBarcodeModal(true)}
            title="Generate printable barcode sticker sheet for physical hardware"
          >
            <i className="bi bi-upc-scan text-info"></i>
            <span>PRINT LABELS</span>
          </button>

          {/* Direct CSV Download */}
          <button 
            className="kd-btn-outline"
            onClick={handleExportCSV}
            title="Export filtered assets to CSV spreadsheet"
          >
            <i className="bi bi-download text-success"></i>
            <span>EXPORT CSV</span>
          </button>

          <button 
            className="kd-btn-solid"
            onClick={() => {
              setAssetToEdit(null);
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
            <span>REGISTER ASSET</span>
          </button>
        </div>
      </div>

      {/* Metric Tiles Summary Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2">
          <div className="kd-metric-tile">
            <div className="kd-metric-label mb-1">TOTAL FLEET</div>
            <div className="kd-metric-value kd-mono fs-4">{assets.length}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>UNITS CATALOGED</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="kd-metric-tile">
            <div className="kd-metric-label mb-1">IN ACTIVE USE</div>
            <div className="kd-metric-value kd-mono text-info fs-4">{statusCounts.inUse}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              {Math.round((statusCounts.inUse / (assets.length || 1)) * 100)}% UTILIZATION
            </span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="kd-metric-tile">
            <div className="kd-metric-label mb-1">AVAILABLE POOL</div>
            <div className="kd-metric-value kd-mono text-success fs-4">{statusCounts.available}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>READY TO ASSIGN</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="kd-metric-tile">
            <div className="kd-metric-label mb-1">MAINTENANCE</div>
            <div className="kd-metric-value kd-mono text-warning fs-4">{statusCounts.maintenance}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>IN REPAIR / DEFECT</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="kd-metric-tile">
            <div className="kd-metric-label mb-1">OLX / SOLD</div>
            <div className="kd-metric-value kd-mono text-secondary fs-4">{statusCounts.sold}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>DECOMMISSIONED</span>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="kd-metric-tile">
            <div className="kd-metric-label mb-1">FLEET VALUE</div>
            <div className="kd-metric-value kd-mono text-white fs-5">{formatCurrency(statusCounts.totalValue)}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>TOTAL HARDWARE ASSETS</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="kd-panel mb-4">
        <div className="p-3 border-bottom border-secondary-subtle">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-black border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="Search serial no, asset tag, model, employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                {searchQuery && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select bg-black border-secondary text-white kd-mono"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ fontSize: '0.78rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="In Use">In Use</option>
                <option value="Available">Available</option>
                <option value="Unused">Unused</option>
                <option value="Under Maintenance">Maintenance</option>
                <option value="Sold (OLX)">Sold (OLX)</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="col-6 col-md-3">
              <select
                className="form-select bg-black border-secondary text-white kd-mono"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{ fontSize: '0.78rem' }}
              >
                <option value="All">All Locations / Branches</option>
                <option value="Head Office - Marine Lines">Head Office</option>
                <option value="Branch A - Andheri">Branch A - Andheri</option>
                <option value="Warehouse - Bhiwandi">Warehouse - Bhiwandi</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="col-12 col-md-2">
              <select
                className="form-select bg-black border-secondary text-white kd-mono"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ fontSize: '0.78rem' }}
              >
                <option value="id">Sort: Asset ID</option>
                <option value="name">Sort: Model</option>
                <option value="value">Sort: Value (High)</option>
                <option value="date">Sort: Date (Newest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="px-3 py-2 d-flex align-items-center gap-1 overflow-auto" style={{ background: 'var(--kd-surface-2)' }}>
          {[
            'All',
            'Laptops',
            'Desktops',
            'Monitors',
            'A4 Printers',
            'Label Printers',
            'Switches & Firewalls',
            'SIM Cards & Dongles',
            'Chargers & Power',
            'Keyboards & Mice'
          ].map(cat => {
            const count = categoryCounts[cat] || 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                className={`btn btn-sm px-2 py-1 kd-mono ${
                  isActive ? 'kd-btn-solid' : 'kd-btn-outline'
                }`}
                style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="ms-1 opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Asset Data Grid */}
      <div className="kd-table-container">
        <table className="kd-table">
          <thead>
            <tr>
              <th>TAG ID</th>
              <th>EQUIPMENT MODEL</th>
              <th>CATEGORY</th>
              <th>SERIAL NUMBER</th>
              <th>LOCATION</th>
              <th>STATUS</th>
              <th>CONDITION</th>
              <th>CUSTODY / ASSIGNED</th>
              <th>VALUE (INR)</th>
              <th className="text-end">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-secondary kd-mono">
                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                  NO ASSETS MATCH CURRENT SEARCH OR FILTERS
                </td>
              </tr>
            ) : (
              filteredAssets.map(asset => (
                <tr key={asset.id}>
                  {/* Tag ID */}
                  <td className="kd-mono fw-bold text-white" style={{ fontSize: '0.8rem' }}>
                    {asset.id}
                  </td>

                  {/* Name */}
                  <td>
                    <div 
                      className="text-white fw-semibold hover-text-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDetailAsset(asset)}
                    >
                      {asset.name}
                    </div>
                    <div className="text-secondary small text-truncate" style={{ maxWidth: '240px', fontSize: '0.72rem' }}>
                      {asset.specs}
                    </div>
                  </td>

                  {/* Category */}
                  <td>{getCategoryBadge(asset.category)}</td>

                  {/* Serial */}
                  <td className="kd-mono text-white small">{asset.serial}</td>

                  {/* Location */}
                  <td className="small text-secondary">{asset.location}</td>

                  {/* Status */}
                  <td>{getStatusBadge(asset.status)}</td>

                  {/* Condition */}
                  <td>
                    {asset.condition === 'Excellent' && <span className="kd-tag kd-tag-emerald">MINT</span>}
                    {asset.condition === 'Good' && <span className="kd-tag kd-tag-neutral">GOOD</span>}
                    {asset.condition === 'Minor Defect' && <span className="kd-tag kd-tag-amber">DEFECT</span>}
                    {asset.condition === 'Faulty' && <span className="kd-tag kd-tag-rose">FAULTY</span>}
                  </td>

                  {/* Custody */}
                  <td className="small text-white">
                    {asset.assignedTo === 'Unassigned (Pool)' ? (
                      <span className="text-secondary kd-mono">IN POOL</span>
                    ) : (
                      asset.assignedTo
                    )}
                  </td>

                  {/* Value */}
                  <td className="kd-mono text-white fw-medium small">
                    {formatCurrency(asset.value)}
                  </td>

                  {/* Action Buttons */}
                  <td className="text-end">
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <button 
                        className="btn btn-sm text-secondary hover-text-white p-1"
                        onClick={() => setDetailAsset(asset)}
                        title="View Asset Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>

                      <button 
                        className="btn btn-sm text-secondary hover-text-white p-1"
                        onClick={() => {
                          setAssetToEdit(asset);
                          setShowModal(true);
                        }}
                        title="Edit Asset"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      <button 
                        className="btn btn-sm text-secondary hover-text-danger p-1"
                        onClick={() => {
                          if (window.confirm(`Delete ${asset.id} (${asset.name})?`)) {
                            handleDeleteAsset(asset.id);
                          }
                        }}
                        title="Delete Asset"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Counter */}
      <div className="d-flex align-items-center justify-content-between mt-3 px-2 kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
        <span>SHOWING {filteredAssets.length} OF {assets.length} REGISTERED ASSETS</span>
        <span>CEO CONFIDENTIAL HARDWARE LEDGER</span>
      </div>
    </div>
  );
}

