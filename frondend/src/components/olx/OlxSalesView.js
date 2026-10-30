import React, { useState, useEffect } from 'react';
import { weeklySalesTrend } from './OlxData';
import OlxListingModal from './OlxListingModal';
import MarkSoldModal from './MarkSoldModal';
import olxService from '../../services/olxService';

export default function OlxSalesView({ onNavigateTab }) {
  const [listings, setListings] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'negotiating', 'sold'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);
  const [selectedForSold, setSelectedForSold] = useState(null);
  const [syncStatus, setSyncStatus] = useState('Syncing...');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchListings = async () => {
      try {
        const data = await olxService.getListings();
        if (isMounted && data) {
          setListings(data);
          setSyncStatus('Synced just now');
        }
      } catch (err) {
        console.warn('[OlxSalesView] Could not load initial listings:', err);
      }
    };
    fetchListings();
    return () => { isMounted = false; };
  }, []);

  // Computed KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const devicesSoldToday = listings.filter(item => 
    item.soldToday || (item.status === 'Sold' && (item.dateSold === todayStr || item.dateSold === '2026-10-29'))
  );
  const soldTodayCount = devicesSoldToday.length;
  
  const revenueSoldToday = devicesSoldToday.reduce((acc, curr) => acc + (curr.soldPrice || 0), 0);
  
  // Expected sales for today (active + negotiating items scheduled or projected)
  const expectedSalesToday = 24000; // Today's target benchmark
  
  const totalSalesRealized = listings
    .filter(item => item.status === 'Sold')
    .reduce((acc, curr) => acc + (curr.soldPrice || 0), 0);

  const pendingListingsCount = listings.filter(item => item.status === 'Active' || item.status === 'Negotiating').length;

  // Filter listings
  const filteredListings = listings.filter(item => {
    // Tab filter
    if (filterTab === 'active' && item.status !== 'Active') return false;
    if (filterTab === 'negotiating' && item.status !== 'Negotiating') return false;
    if (filterTab === 'sold' && item.status !== 'Sold') return false;

    // Category filter
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchTag = (item.assetTag || '').toLowerCase().includes(q);
      const matchSerial = (item.serialNumber || '').toLowerCase().includes(q);
      const matchAd = (item.olxAdId || '').toLowerCase().includes(q);
      const matchBuyer = (item.buyerName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchSerial && !matchAd && !matchBuyer) return false;
    }

    return true;
  });

  // Handle Save from Listing Modal (Add or Edit)
  const handleSaveListing = async (listingData) => {
    try {
      if (editingListing && (editingListing.backendId || editingListing.id)) {
        const idToUpdate = editingListing.backendId || editingListing.id;
        const saved = await olxService.updateListing(idToUpdate, listingData);
        setListings(listings.map(item => (item.id === listingData.id || item.backendId === idToUpdate) ? saved : item));
      } else {
        const created = await olxService.createListing(listingData);
        setListings([created, ...listings]);
      }
    } catch (err) {
      console.error('Failed to save listing:', err);
    }
    setEditingListing(null);
  };

  // Handle Mark as Sold
  const handleConfirmSold = async (updatedListing) => {
    try {
      if (selectedForSold && (selectedForSold.backendId || selectedForSold.id)) {
        const id = selectedForSold.backendId || selectedForSold.id;
        const saved = await olxService.markSold(id, updatedListing);
        setListings(listings.map(item => (item.id === updatedListing.id || item.backendId === id) ? saved : item));
      } else {
        setListings(listings.map(item => item.id === updatedListing.id ? updatedListing : item));
      }
    } catch (err) {
      console.error('Failed to mark sold:', err);
    }
    setSelectedForSold(null);
  };

  // Trigger manual OLX sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const data = await olxService.getListings();
      setListings(data);
      setSyncStatus('Just now');
    } catch (err) {
      console.warn('Sync failed:', err);
      setSyncStatus('Offline snapshot');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <i className="bi bi-broadcast me-1"></i> Live on OLX
          </span>
        );
      case 'Negotiating':
        return (
          <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <i className="bi bi-chat-dots-fill me-1"></i> Offer In Negotiation
          </span>
        );
      case 'Sold':
        return (
          <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <i className="bi bi-check2-circle me-1"></i> Sold & Settled
          </span>
        );
      case 'Draft':
        return (
          <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
            <i className="bi bi-pencil-square me-1"></i> Draft Staged
          </span>
        );
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="py-3 px-2 px-md-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge px-2 py-1" style={{ background: 'var(--kd-surface-2)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', fontSize: '11px' }}>
              <i className="bi bi-shop me-1"></i> SECONDARY HARDWARE LIQUIDATION
            </span>
            <span className="text-secondary small font-monospace">• Auto-Sync & Manual Gateway</span>
          </div>
          <h2 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>
            OLX Device Sales & Revenue Center
          </h2>
          <p className="text-secondary small mb-0 mt-1">
            Directly open OLX, track active listings, monitor asking prices vs expected margins, and record walk-in cash or UPI sales.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Direct OLX Quick Launcher */}
          <a 
            href="https://www.olx.in/myads" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-outline-warning btn-sm fw-bold d-flex align-items-center gap-2 px-3"
            style={{ borderRadius: '6px', borderColor: '#d97706' }}
            title="Open official OLX Portal in new tab"
          >
            <i className="bi bi-box-arrow-up-right"></i>
            <span>Open OLX Account</span>
          </a>

          {/* Sync OLX Data Button */}
          <button 
            type="button" 
            className="btn btn-dark btn-sm text-secondary border-secondary d-flex align-items-center gap-2 px-3"
            onClick={handleTriggerSync}
            disabled={isSyncing}
          >
            <i className={`bi bi-arrow-repeat ${isSyncing ? 'spin' : ''}`}></i>
            <span>{isSyncing ? 'Syncing...' : 'Sync OLX'}</span>
          </button>

          {/* Add New Listing Button */}
          <button 
            type="button" 
            className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-2 px-3"
            onClick={() => {
              setEditingListing(null);
              setShowListingModal(true);
            }}
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Post New Device to OLX</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div 
        className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center p-3 mb-4 rounded-3"
        style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <i className="bi bi-cloud-check-fill"></i>
          </div>
          <div>
            <div className="text-light fw-bold small">OLX Direct Ad Links & Manual Sales Reconciler</div>
            <div className="text-secondary" style={{ fontSize: '11px' }}>
              Connected account: <span className="text-info font-monospace">kothari.distributors.surat@gmail.com</span> • Last synchronized: {syncStatus}
            </div>
          </div>
        </div>
        <div className="mt-2 mt-sm-0">
          <span className="badge bg-black text-secondary border border-dark font-monospace small px-2 py-1">
            API STATUS: <span className="text-success">ONLINE</span>
          </span>
        </div>
      </div>

      {/* Top 5 Executive KPI Cards */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Sold Today */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card bg-black border border-dark rounded-3 h-100 p-3 kd-card-hover-green">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Devices Sold Today</span>
              <span 
                className="badge rounded-circle p-2"
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
              >
                <i className="bi bi-bag-check-fill"></i>
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-white font-monospace">{soldTodayCount}</span>
              <span className="text-secondary small">units</span>
            </div>
            <div className="mt-2 text-success small font-monospace" style={{ fontSize: '11px' }}>
              ₹{revenueSoldToday.toLocaleString('en-IN')} collected today
            </div>
          </div>
        </div>

        {/* KPI 2: Expected Sales Today */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card bg-black border border-dark rounded-3 h-100 p-3 kd-card-hover-amber">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Expected Today</span>
              <span 
                className="badge rounded-circle p-2"
                style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
              >
                <i className="bi bi-bullseye"></i>
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-warning font-monospace">₹{expectedSalesToday.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 text-secondary small" style={{ fontSize: '11px' }}>
              Paced at <span className="text-light fw-bold">{Math.round((revenueSoldToday / expectedSalesToday) * 100)}%</span> of target
            </div>
          </div>
        </div>

        {/* KPI 3: Total Sales Realized */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card bg-black border border-dark rounded-3 h-100 p-3 kd-card-hover-blue">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Sales Realized</span>
              <span 
                className="badge rounded-circle p-2"
                style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
              >
                <i className="bi bi-cash-stack"></i>
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-info font-monospace">₹{totalSalesRealized.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 text-secondary small" style={{ fontSize: '11px' }}>
              From decommissioned hardware
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Live Listings */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card bg-black border border-dark rounded-3 h-100 p-3 kd-card-hover-purple">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Pending Listings</span>
              <span 
                className="badge rounded-circle p-2"
                style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}
              >
                <i className="bi bi-hourglass-split"></i>
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-white font-monospace">{pendingListingsCount}</span>
              <span className="text-secondary small">live ads</span>
            </div>
            <div className="mt-2 text-secondary small" style={{ fontSize: '11px' }}>
              Ready for customer inquiry
            </div>
          </div>
        </div>

        {/* KPI 5: Active Negotiations */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card bg-black border border-dark rounded-3 h-100 p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Negotiating Offers</span>
              <span 
                className="badge rounded-circle p-2"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
              >
                <i className="bi bi-chat-quote-fill"></i>
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-white font-monospace">
                {listings.filter(i => i.status === 'Negotiating').length}
              </span>
              <span className="text-secondary small">active</span>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '11px' }}>
              Customer pickups pending
            </div>
          </div>
        </div>
      </div>

      {/* Sales Velocity Trends Card */}
      <div className="card bg-black border border-dark rounded-3 p-3 p-md-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <div>
            <h5 className="text-white fw-bold mb-0">7-Day OLX Sales & Target Trajectory</h5>
            <p className="text-secondary small mb-0 font-monospace">Daily Realized Revenue (₹) vs Expected Target</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 small font-monospace text-secondary">
              <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></span> Realized
            </div>
            <div className="d-flex align-items-center gap-2 small font-monospace text-secondary">
              <span style={{ width: '12px', height: '3px', background: '#eab308' }}></span> Expected
            </div>
          </div>
        </div>

        {/* Trend Bar Chart */}
        <div className="row g-2 align-items-end pt-3" style={{ minHeight: '140px' }}>
          {weeklySalesTrend.map((day, idx) => {
            const maxVal = 30000;
            const barHeight = Math.max(12, Math.round((day.revenue / maxVal) * 100));
            const isToday = day.day.includes('Today');

            return (
              <div key={idx} className="col text-center">
                <div className="d-flex flex-column align-items-center justify-content-end" style={{ height: '100px' }}>
                  {day.revenue > 0 && (
                    <span className="text-info font-monospace mb-1" style={{ fontSize: '10px' }}>
                      ₹{(day.revenue / 1000).toFixed(1)}k
                    </span>
                  )}
                  <div 
                    className="w-100 rounded-top"
                    style={{ 
                      height: `${barHeight}%`, 
                      background: isToday ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : day.revenue > 0 ? '#1e3a8a' : '#1c1917',
                      border: isToday ? '1px solid #60a5fa' : '1px solid #1e293b',
                      transition: 'height 0.3s ease'
                    }}
                    title={`${day.date}: ₹${day.revenue.toLocaleString('en-IN')} (${day.salesCount} sold)`}
                  ></div>
                </div>
                <div className="border-top border-dark mt-2 pt-1">
                  <div className={`font-monospace small ${isToday ? 'text-primary fw-bold' : 'text-secondary'}`} style={{ fontSize: '11px' }}>
                    {day.day}
                  </div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>
                    {day.salesCount} sold
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card bg-black border border-dark rounded-3 p-3 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3">
          
          {/* Status Tabs */}
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary fw-bold' : 'btn-dark text-secondary border-dark'}`}
              onClick={() => setFilterTab('all')}
            >
              All Listings ({listings.length})
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${filterTab === 'active' ? 'btn-primary fw-bold' : 'btn-dark text-secondary border-dark'}`}
              onClick={() => setFilterTab('active')}
            >
              Active Live ({listings.filter(i => i.status === 'Active').length})
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${filterTab === 'negotiating' ? 'btn-primary fw-bold' : 'btn-dark text-secondary border-dark'}`}
              onClick={() => setFilterTab('negotiating')}
            >
              In Negotiation ({listings.filter(i => i.status === 'Negotiating').length})
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${filterTab === 'sold' ? 'btn-primary fw-bold' : 'btn-dark text-secondary border-dark'}`}
              onClick={() => setFilterTab('sold')}
            >
              Sold Devices ({listings.filter(i => i.status === 'Sold').length})
            </button>
          </div>

          {/* Right Filters */}
          <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
            {/* Category Dropdown */}
            <select 
              className="form-select form-select-sm bg-black text-light border-secondary"
              style={{ width: 'auto' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Hardware</option>
              <option value="Laptops">Laptops</option>
              <option value="Desktops">Desktops</option>
              <option value="Printers">Printers</option>
              <option value="Network">Network</option>
              <option value="Peripherals">Peripherals</option>
            </select>

            {/* Search Input */}
            <div className="input-group input-group-sm" style={{ minWidth: '240px' }}>
              <span className="input-group-text bg-black text-secondary border-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-black text-light border-secondary" 
                placeholder="Search title, serial, OLX ad #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="btn btn-dark text-secondary border-secondary" 
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* OLX Device Listings Table / Cards */}
      <div className="card rounded-3 overflow-hidden" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}>
              <tr className="text-secondary small font-monospace">
                <th className="ps-3 py-3">ASSET & AD ID</th>
                <th className="py-3">DEVICE SPECIFICATION</th>
                <th className="py-3">ASKING PRICE</th>
                <th className="py-3">EXPECTED FLOOR</th>
                <th className="py-3">STATUS</th>
                <th className="py-3">STATS & BUYER</th>
                <th className="pe-3 py-3 text-end">DIRECT OLX & ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                    No OLX listings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredListings.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--kd-border)' }}>
                    
                    {/* Tag & OLX Ad ID */}
                    <td className="ps-3 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge border font-monospace small px-2 py-1" style={{ background: 'var(--kd-surface-2)', borderColor: 'var(--kd-border)', color: 'var(--kd-text-1)' }}>
                          {item.assetTag}
                        </span>
                      </div>
                      <div className="text-muted font-monospace mt-1" style={{ fontSize: '11px' }}>
                        Ad ID: {item.olxAdId || 'N/A'}
                      </div>
                    </td>

                    {/* Specification */}
                    <td className="py-3" style={{ maxWidth: '320px' }}>
                      <div className="fw-bold text-truncate" style={{ color: 'var(--kd-text-1)' }} title={item.title}>
                        {item.title}
                      </div>
                      <div className="d-flex align-items-center gap-2 text-secondary small font-monospace mt-1">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>SN: {item.serialNumber || 'N/A'}</span>
                        <span>•</span>
                        <span className="text-warning">{item.condition}</span>
                      </div>
                    </td>

                    {/* Asking Price */}
                    <td className="py-3">
                      <span className="text-info fw-bold font-monospace fs-6">
                        ₹{item.askingPrice.toLocaleString('en-IN')}
                      </span>
                      <div className="text-muted" style={{ fontSize: '10px' }}>Public listing price</div>
                    </td>

                    {/* Expected Floor */}
                    <td className="py-3">
                      <span className="text-success fw-bold font-monospace">
                        ₹{item.expectedPrice.toLocaleString('en-IN')}
                      </span>
                      <div className="text-muted" style={{ fontSize: '10px' }}>Min benchmark</div>
                    </td>

                    {/* Status */}
                    <td className="py-3">
                      {getStatusBadge(item.status)}
                      {item.status === 'Sold' && item.soldPrice && (
                        <div className="text-success small font-monospace mt-1 fw-bold">
                          Realized: ₹{item.soldPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Buyer & Stats */}
                    <td className="py-3">
                      {item.status === 'Sold' ? (
                        <div>
                          <div className="text-light small fw-bold">
                            <i className="bi bi-person-check-fill text-success me-1"></i>
                            {item.buyerName || 'Walk-in buyer'}
                          </div>
                          <div className="text-muted font-monospace" style={{ fontSize: '11px' }}>
                            {item.paymentMode || 'Cash'} • {item.dateSold}
                          </div>
                        </div>
                      ) : (
                        <div className="font-monospace small text-secondary">
                          <div><i className="bi bi-eye text-muted me-1"></i> {item.viewsCount} views</div>
                          <div><i className="bi bi-chat-left-text text-muted me-1"></i> {item.inquiriesCount} inquiries</div>
                        </div>
                      )}
                    </td>

                    {/* Direct OLX & Actions */}
                    <td className="pe-3 py-3 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        {/* Direct OLX Link */}
                        {item.olxUrl && (
                          <a 
                            href={item.olxUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-outline-warning btn-sm py-1 px-2 font-monospace"
                            style={{ fontSize: '11px' }}
                            title="Open live ad on OLX.in"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i> OLX Ad
                          </a>
                        )}

                        {/* Mark as Sold Button */}
                        {item.status !== 'Sold' && (
                          <button 
                            type="button" 
                            className="btn btn-outline-success btn-sm py-1 px-2"
                            style={{ fontSize: '11px' }}
                            onClick={() => {
                              setSelectedForSold(item);
                              setShowMarkSoldModal(true);
                            }}
                            title="Record sale amount and buyer"
                          >
                            <i className="bi bi-currency-rupee me-1"></i> Mark Sold
                          </button>
                        )}

                        {/* Edit Ad */}
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm py-1 px-2"
                          style={{ fontSize: '11px' }}
                          onClick={() => {
                            setEditingListing(item);
                            setShowListingModal(true);
                          }}
                          title="Edit listing details"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Listing Modal */}
      <OlxListingModal 
        isOpen={showListingModal}
        onClose={() => {
          setShowListingModal(false);
          setEditingListing(null);
        }}
        onSave={handleSaveListing}
        editingItem={editingListing}
      />

      {/* Mark As Sold Modal */}
      <MarkSoldModal 
        isOpen={showMarkSoldModal}
        onClose={() => {
          setShowMarkSoldModal(false);
          setSelectedForSold(null);
        }}
        onConfirm={handleConfirmSold}
        listing={selectedForSold}
      />

    </div>
  );
}

