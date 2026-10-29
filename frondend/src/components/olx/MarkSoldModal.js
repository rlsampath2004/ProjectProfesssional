import React, { useState } from 'react';

export default function MarkSoldModal({ isOpen, onClose, onConfirm, listing }) {
  const [soldPrice, setSoldPrice] = useState(listing ? listing.expectedPrice || listing.askingPrice : 0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI (GPay / PhonePe)');
  const [notes, setNotes] = useState('');

  if (!isOpen || !listing) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      ...listing,
      status: 'Sold',
      soldPrice: Number(soldPrice),
      buyerName: buyerName || 'Direct OLX Walk-in Buyer',
      buyerPhone: buyerPhone || 'N/A',
      paymentMode,
      dateSold: new Date().toISOString().split('T')[0],
      soldToday: true,
      notes: notes ? `${listing.notes || ''} | Sale note: ${notes}` : listing.notes
    });
    onClose();
  };

  const margin = Number(soldPrice) - (listing.expectedPrice || 0);

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
      <div className="modal-dialog modal-dialog-centered">
        <div 
          className="modal-content rounded-3 shadow-lg"
          style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)', color: 'var(--kd-text-1)' }}
        >
          
          <div 
            className="modal-header px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <i className="bi bi-check2-circle fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ color: 'var(--kd-text-1)' }}>Record OLX Device Sale</h5>
                <p className="text-secondary small mb-0 font-monospace">
                  {listing.assetTag} • {listing.brand} {listing.model}
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">

              {/* Device summary pill */}
              <div className="p-3 mb-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="text-secondary small">Device Listed:</div>
                <div className="fw-bold" style={{ color: 'var(--kd-text-1)' }}>{listing.title}</div>
                <div className="d-flex justify-content-between mt-2 pt-2 border-top font-monospace small" style={{ borderColor: 'var(--kd-border)' }}>
                  <span className="text-secondary">Asking: ₹{listing.askingPrice.toLocaleString('en-IN')}</span>
                  <span className="text-secondary">Expected Floor: ₹{listing.expectedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Sold Price */}
              <div className="mb-3">
                <label className="form-label text-success small fw-bold">
                  Final Realized Sold Amount (₹) *
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={inputStyle}>₹</span>
                  <input 
                    type="number" 
                    className="form-control text-success fs-5 fw-bold font-monospace" 
                    style={inputStyle}
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between mt-1 font-monospace" style={{ fontSize: '11px' }}>
                  <span className="text-secondary">Delta vs Expected Floor:</span>
                  <span className={margin >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                    {margin >= 0 ? `+ ₹${margin.toLocaleString('en-IN')} (Surplus Realized)` : `- ₹${Math.abs(margin).toLocaleString('en-IN')} (Discounted)`}
                  </span>
                </div>
              </div>

              {/* Buyer Name & Phone */}
              <div className="row g-2 mb-3">
                <div className="col-md-7">
                  <label className="form-label text-secondary small fw-bold">Buyer / Business Name</label>
                  <input 
                    type="text" 
                    className="form-control small" 
                    style={inputStyle}
                    placeholder="e.g. Ramesh Bhai (Navsari)"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label text-secondary small fw-bold">Buyer Phone</label>
                  <input 
                    type="text" 
                    className="form-control small font-monospace" 
                    style={inputStyle}
                    placeholder="+91 98xxx xxxxx"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="mb-3">
                <label className="form-label text-secondary small fw-bold">Settlement / Payment Mode</label>
                <select 
                  className="form-select small"
                  style={inputStyle}
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="UPI (GPay / PhonePe)">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash on Handover">Cash on Handover</option>
                  <option value="Bank NEFT / IMPS">Bank NEFT / IMPS Transfer</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>

              {/* Handover Note */}
              <div className="mb-2">
                <label className="form-label text-secondary small fw-bold">Handover &amp; Invoice Reference</label>
                <input 
                  type="text" 
                  className="form-control small" 
                  style={inputStyle}
                  placeholder="Receipt # / on-site testing confirmation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

            </div>

            <div 
              className="modal-footer px-4 py-3 d-flex justify-content-between"
              style={{ background: 'var(--kd-surface-2)', borderTop: '1px solid var(--kd-border)' }}
            >
              <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success btn-sm px-4 fw-bold">
                <i className="bi bi-currency-rupee me-1"></i> Confirm Sale &amp; Update Pipeline
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
