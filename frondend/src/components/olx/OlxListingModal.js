import React, { useState } from 'react';
import { availableDecommissionedAssets } from './OlxData';

export default function OlxListingModal({ isOpen, onClose, onSave, editingItem }) {
  const [formData, setFormData] = useState(
    editingItem || {
      assetTag: 'KD-LAP-010',
      title: 'Dell Latitude 3490 - Core i5 8th Gen / 8GB / 256GB SSD',
      category: 'Laptops',
      brand: 'Dell',
      model: 'Latitude 3490',
      serialNumber: 'DLL-LAT-3490-22',
      condition: 'Used - Good',
      askingPrice: 19500,
      expectedPrice: 18000,
      olxUrl: 'https://www.olx.in/item/dell-latitude-3490-i5-8th-gen-iid-1759492100',
      olxAdId: '1759492100',
      location: 'Surat Central Warehouse',
      status: 'Active',
      notes: 'Clean chassis, battery life 3+ hours, original charger provided.'
    }
  );

  if (!isOpen) return null;

  const handleAssetSelect = (e) => {
    const tag = e.target.value;
    const found = availableDecommissionedAssets.find(a => a.assetTag === tag);
    if (found) {
      setFormData({
        ...formData,
        assetTag: found.assetTag,
        title: `${found.name} (Surplus Commercial Fleet)`,
        category: found.category,
        serialNumber: found.serial,
        askingPrice: Math.round(found.estValue * 1.15),
        expectedPrice: found.estValue,
        olxUrl: `https://www.olx.in/item/kothari-distributors-${found.assetTag.toLowerCase()}-iid-1759${Math.floor(100000 + Math.random() * 900000)}`
      });
    }
  };

  const handleGenerateAdCopy = () => {
    const copy = `[Kothari Distributors Official Fleet Sale]\n• Model: ${formData.title}\n• Serial Verification: ${formData.serialNumber}\n• Condition: Tested & 100% operational (${formData.condition})\n• Included: Original power adapter & cable\n• Inspection location: Central Warehouse, Surat\n• Genuine business surplus. Instant testing available upon pickup.`;
    setFormData({
      ...formData,
      notes: copy
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.askingPrice) return;
    
    onSave({
      ...formData,
      id: editingItem ? editingItem.id : `OLX-00${Math.floor(10 + Math.random() * 90)}`,
      dateListed: editingItem ? editingItem.dateListed : new Date().toISOString().split('T')[0],
      viewsCount: editingItem ? editingItem.viewsCount : 0,
      inquiriesCount: editingItem ? editingItem.inquiriesCount : 0,
      soldToday: false
    });
    onClose();
  };

  const inputStyle = {
    background: 'var(--kd-surface-2)',
    border: '1px solid var(--kd-border)',
    color: 'var(--kd-text-1)'
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
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
                style={{ width: '42px', height: '42px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <i className="bi bi-tag-fill fs-5"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ letterSpacing: '-0.3px', color: 'var(--kd-text-1)' }}>
                  {editingItem ? 'Edit OLX Listing' : 'Publish Decommissioned Asset to OLX'}
                </h5>
                <p className="text-secondary small mb-0 font-monospace">
                  Direct OLX Sales Sync • Asking Price vs Expected Margin
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3" style={{ maxHeight: '68vh', overflowY: 'auto' }}>

              {/* Fast Pick from Decommissioned Hardware */}
              {!editingItem && (
                <div className="p-3 mb-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                  <label className="form-label text-warning small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-lightning-charge-fill"></i>
                    Auto-Fill From Decommissioned Fleet
                  </label>
                  <select 
                    className="form-select small"
                    style={inputStyle}
                    onChange={handleAssetSelect}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select a retired device ready for resale --</option>
                    {availableDecommissionedAssets.map(asset => (
                      <option key={asset.assetTag} value={asset.assetTag}>
                        [{asset.assetTag}] {asset.name} (SN: {asset.serial}) — Est. ₹{asset.estValue.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="row g-3">
                {/* Title */}
                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label text-secondary small fw-bold mb-0">OLX Listing Title (Search-Optimized) *</label>
                    <button 
                      type="button" 
                      className="btn btn-link btn-sm p-0 text-decoration-none font-monospace"
                      style={{ fontSize: '11px' }}
                      onClick={handleGenerateAdCopy}
                    >
                      <i className="bi bi-magic me-1"></i> Auto-Generate Description
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="form-control small" 
                    style={inputStyle}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Category & Serial */}
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-bold">Category</label>
                  <select 
                    className="form-select small"
                    style={inputStyle}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Desktops">Desktops</option>
                    <option value="Printers">Printers</option>
                    <option value="Network">Network Equipment</option>
                    <option value="Peripherals">Peripherals &amp; Monitors</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-bold">Asset Tag</label>
                  <input 
                    type="text" 
                    className="form-control small font-monospace" 
                    style={inputStyle}
                    value={formData.assetTag}
                    onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-bold">Serial Number</label>
                  <input 
                    type="text" 
                    className="form-control small font-monospace" 
                    style={inputStyle}
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>

                {/* Asking Price & Expected Price */}
                <div className="col-md-6">
                  <label className="form-label text-info small fw-bold">
                    OLX Public Asking Price (₹) *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text" style={inputStyle}>₹</span>
                    <input 
                      type="number" 
                      className="form-control fw-bold" 
                      style={inputStyle}
                      value={formData.askingPrice}
                      onChange={(e) => setFormData({ ...formData, askingPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-text text-secondary" style={{ fontSize: '11px' }}>
                    Visible on OLX ad listing
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-success small fw-bold">
                    Expected Minimum Net Realization (₹) *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text" style={inputStyle}>₹</span>
                    <input 
                      type="number" 
                      className="form-control fw-bold" 
                      style={inputStyle}
                      value={formData.expectedPrice}
                      onChange={(e) => setFormData({ ...formData, expectedPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-text text-secondary" style={{ fontSize: '11px' }}>
                    Lowest acceptable bargaining floor for CEO approval
                  </div>
                </div>

                {/* OLX URL */}
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold d-flex justify-content-between">
                    <span>Direct OLX Ad URL</span>
                    {formData.olxUrl && (
                      <a 
                        href={formData.olxUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-primary text-decoration-none"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i> Preview Link
                      </a>
                    )}
                  </label>
                  <input 
                    type="url" 
                    className="form-control small font-monospace" 
                    style={inputStyle}
                    placeholder="https://www.olx.in/item/..."
                    value={formData.olxUrl}
                    onChange={(e) => setFormData({ ...formData, olxUrl: e.target.value })}
                  />
                </div>

                {/* Condition & Status */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">Physical Condition</label>
                  <input 
                    type="text" 
                    className="form-control small" 
                    style={inputStyle}
                    placeholder="e.g. Refurbished - Grade A, Mint, Used - Good"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">Listing Status</label>
                  <select 
                    className="form-select small"
                    style={inputStyle}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active (Live on OLX)</option>
                    <option value="Negotiating">In Negotiation / Offer Received</option>
                    <option value="Draft">Draft / Staged</option>
                    <option value="Sold">Sold &amp; Settled</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold">Executive / Public Inspection Notes</label>
                  <textarea 
                    className="form-control small" 
                    style={inputStyle}
                    rows="3"
                    placeholder="Included accessories, battery health, pickup instructions..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="modal-footer px-4 py-3 d-flex justify-content-between"
              style={{ background: 'var(--kd-surface-2)', borderTop: '1px solid var(--kd-border)' }}
            >
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm px-3" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm px-4 fw-bold"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                {editingItem ? 'Save Listing Changes' : 'Sync & Save OLX Listing'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
