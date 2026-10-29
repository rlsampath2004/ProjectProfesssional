import React, { useState } from 'react';
import { initialAuditSessions, initialDiscrepancies } from './AuditData';
import { initialAssets } from '../assets/AssetData';
import AuditSessionModal from './AuditSessionModal';
import DiscrepancyModal from './DiscrepancyModal';
import AuditCertificateModal from './AuditCertificateModal';

export default function AuditVerificationView({ onNavigateTab }) {
  const [sessions, setSessions] = useState(initialAuditSessions);
  const [discrepancies, setDiscrepancies] = useState(initialDiscrepancies);
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist', 'discrepancies', 'sessions'
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Verified items state (tracking verified asset IDs)
  const [verifiedAssetIds, setVerifiedAssetIds] = useState(new Set(['KD-LAP-001', 'KD-LAP-003', 'KD-DSK-001', 'KD-PRT-001', 'KD-NET-001']));

  // Modals state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certifiedSuccess, setCertifiedSuccess] = useState(false);

  // Toggle item verification
  const handleToggleVerify = (assetId) => {
    const updated = new Set(verifiedAssetIds);
    if (updated.has(assetId)) {
      updated.delete(assetId);
    } else {
      updated.add(assetId);
    }
    setVerifiedAssetIds(updated);
  };

  // Resolve discrepancy
  const handleResolveDiscrepancy = (id) => {
    setDiscrepancies(discrepancies.map(d => 
      d.id === id ? { ...d, status: 'Resolved' } : d
    ));
  };

  // CEO Certification Sign-off
  const handleCertifySession = (sessionId) => {
    setSessions(sessions.map(s => 
      s.id === sessionId ? {
        ...s,
        status: 'Certified',
        certifiedBy: 'R.L. Kothari (Owner & CEO)',
        certifiedDate: new Date().toISOString().split('T')[0]
      } : s
    ));
    setCertifiedSuccess(true);
    setTimeout(() => setCertifiedSuccess(false), 3500);
  };

  // Filtered assets for checklist
  const filteredAssets = initialAssets.filter(a => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.serial.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    const matchesBranch = selectedBranch === 'All' || a.location.toLowerCase().includes(selectedBranch.toLowerCase());
    return matchesSearch && matchesBranch;
  });

  const verifiedPercent = Math.round((verifiedAssetIds.size / (initialAssets.length || 1)) * 100);

  return (
    <div className="pb-4">
      {/* Modals */}
      <AuditSessionModal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onSave={(newSession) => setSessions([newSession, ...sessions])}
      />

      <DiscrepancyModal
        show={showDiscrepancyModal}
        onClose={() => setShowDiscrepancyModal(false)}
        onSave={(newDisc) => setDiscrepancies([newDisc, ...discrepancies])}
        assets={initialAssets}
      />

      <AuditCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        session={sessions[0]}
        verifiedCount={verifiedAssetIds.size}
        totalCount={initialAssets.length}
      />

      {/* Top Command Strip */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="kd-tag kd-tag-amber">STEP 4 COMPLETE</span>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>• PHYSICAL STOCKTAKE VERIFICATION</span>
          </div>
          <h3 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.035em' }}>
            Asset Audit &amp; Physical Stocktake
          </h3>
          <p className="text-secondary small mb-0">
            Reconcile physical hardware tags, serial barcodes, and discrepancies with CEO sign-off certifications.
          </p>
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* View Official Certificate */}
          <button 
            className="kd-btn-outline"
            onClick={() => setShowCertModal(true)}
            title="Inspect Official Signed Stocktake Certificate"
          >
            <i className="bi bi-award-fill text-warning"></i>
            <span>AUDIT CERTIFICATE</span>
          </button>

          <button 
            className="kd-btn-outline"
            onClick={() => setShowDiscrepancyModal(true)}
            title="Flag damaged or missing equipment"
          >
            <i className="bi bi-exclamation-triangle text-danger"></i>
            <span>FLAG DISCREPANCY</span>
          </button>

          <button 
            className="kd-btn-solid"
            onClick={() => setShowSessionModal(true)}
          >
            <i className="bi bi-play-circle"></i>
            <span>NEW AUDIT SESSION</span>
          </button>
        </div>
      </div>

      {certifiedSuccess && (
        <div 
          className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 kd-mono small mb-4" 
          style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
          onClick={() => setShowCertModal(true)}
          title="Click to view and print official certificate"
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-patch-check-fill text-success fs-5"></i>
            <span>AUDIT CERTIFICATE SIGNED &amp; SEALED BY OWNER / CEO (R.L. KOTHARI)</span>
          </div>
          <span className="badge bg-success text-black fw-bold">VIEW CERTIFICATE</span>
        </div>
      )}

      {/* KPI Tiles Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-emerald">
            <div className="kd-metric-label mb-1">AUDIT VERIFICATION RATE</div>
            <div className="kd-metric-value kd-mono text-success fs-4">{verifiedPercent}%</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
              {verifiedAssetIds.size} OF {initialAssets.length} UNITS CONFIRMED
            </span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-blue">
            <div className="kd-metric-label mb-1">AUDIT SESSIONS</div>
            <div className="kd-metric-value kd-mono text-info fs-4">{sessions.length}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>ACROSS 3 COMPANY BRANCHES</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-rose">
            <div className="kd-metric-label mb-1">OPEN DISCREPANCIES</div>
            <div className="kd-metric-value kd-mono text-danger fs-4">
              {discrepancies.filter(d => d.status !== 'Resolved').length}
            </div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>DEFECTS / FLAGGED CHECKS</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-amber">
            <div className="kd-metric-label mb-1">CEO SIGN-OFF STATUS</div>
            <div className="kd-metric-value kd-mono text-white fs-4">ACTIVE</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>Q4 AUDIT CYCLE CURRENT</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="kd-panel mb-4">
        <div className="p-3 border-bottom border-secondary-subtle d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          {/* Sub Tab Switcher */}
          <div className="d-flex align-items-center gap-1 p-1 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
            <button
              className={`btn btn-sm px-3 py-1 kd-mono ${activeTab === 'checklist' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
              style={{ fontSize: '0.72rem' }}
              onClick={() => setActiveTab('checklist')}
            >
              <i className="bi bi-qr-code-scan me-1"></i> VERIFICATION CHECKLIST
            </button>
            <button
              className={`btn btn-sm px-3 py-1 kd-mono ${activeTab === 'discrepancies' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
              style={{ fontSize: '0.72rem' }}
              onClick={() => setActiveTab('discrepancies')}
            >
              <i className="bi bi-exclamation-triangle me-1"></i> DISCREPANCY LOGS ({discrepancies.filter(d => d.status !== 'Resolved').length})
            </button>
            <button
              className={`btn btn-sm px-3 py-1 kd-mono ${activeTab === 'sessions' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
              style={{ fontSize: '0.72rem' }}
              onClick={() => setActiveTab('sessions')}
            >
              <i className="bi bi-file-earmark-check me-1"></i> AUDIT SESSIONS &amp; SIGN-OFFS
            </button>
          </div>

          {/* Quick Branch Selector & Search (Active for checklist) */}
          {activeTab === 'checklist' && (
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm bg-black border-secondary text-white kd-mono"
                style={{ width: '180px', fontSize: '0.75rem' }}
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="All">All Branches</option>
                <option value="Marine Lines">Head Office</option>
                <option value="Andheri">Branch A - Andheri</option>
                <option value="Bhiwandi">Warehouse - Bhiwandi</option>
              </select>

              <input
                type="text"
                className="form-control form-control-sm bg-black border-secondary text-white"
                placeholder="Search serial / tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '180px', fontSize: '0.75rem' }}
              />
            </div>
          )}
        </div>

        {/* Tab 1: Physical Verification Checklist */}
        {activeTab === 'checklist' && (
          <div className="kd-table-container border-0 rounded-0">
            <table className="kd-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>VERIFY</th>
                  <th>TAG ID</th>
                  <th>EQUIPMENT MODEL</th>
                  <th>SERIAL NUMBER</th>
                  <th>LOCATION</th>
                  <th>CONDITION</th>
                  <th>CUSTODIAN</th>
                  <th>AUDIT STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const isVerified = verifiedAssetIds.has(asset.id);
                  return (
                    <tr key={asset.id} style={{ background: isVerified ? 'rgba(16, 185, 129, 0.02)' : undefined }}>
                      {/* Checkbox */}
                      <td>
                        <div
                          className={`kd-task-check ${isVerified ? 'checked' : ''}`}
                          onClick={() => handleToggleVerify(asset.id)}
                          role="checkbox"
                          aria-checked={isVerified}
                          title={isVerified ? "Mark Unverified" : "Confirm Physical Verification"}
                        >
                          {isVerified && <i className="bi bi-check"></i>}
                        </div>
                      </td>

                      {/* Tag ID */}
                      <td className="kd-mono fw-bold text-white small">{asset.id}</td>

                      {/* Equipment */}
                      <td>
                        <div className="text-white fw-semibold small">{asset.name}</div>
                        <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>{asset.category}</span>
                      </td>

                      {/* Serial */}
                      <td className="kd-mono text-white small">{asset.serial}</td>

                      {/* Location */}
                      <td className="small text-secondary">{asset.location}</td>

                      {/* Condition */}
                      <td>
                        {asset.condition === 'Excellent' && <span className="kd-tag kd-tag-emerald">MINT</span>}
                        {asset.condition === 'Good' && <span className="kd-tag kd-tag-neutral">GOOD</span>}
                        {asset.condition === 'Minor Defect' && <span className="kd-tag kd-tag-amber">DEFECT</span>}
                        {asset.condition === 'Faulty' && <span className="kd-tag kd-tag-rose">FAULTY</span>}
                      </td>

                      {/* Custodian */}
                      <td className="small text-white">{asset.assignedTo}</td>

                      {/* Verification Status */}
                      <td>
                        {isVerified ? (
                          <span className="kd-tag kd-tag-emerald">
                            <i className="bi bi-check-circle-fill me-1"></i> VERIFIED
                          </span>
                        ) : (
                          <span className="kd-tag kd-tag-amber">
                            <i className="bi bi-clock me-1"></i> PENDING SWEEP
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="text-end">
                        <button
                          className={`btn btn-sm kd-mono ${isVerified ? 'kd-btn-outline' : 'kd-btn-solid'}`}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                          onClick={() => handleToggleVerify(asset.id)}
                        >
                          {isVerified ? 'UNVERIFY' : 'VERIFY MATCH'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Discrepancy Board */}
        {activeTab === 'discrepancies' && (
          <div className="p-3">
            <div className="row g-3">
              {discrepancies.map((disc) => (
                <div key={disc.id} className="col-12 col-md-6 col-xl-4">
                  <div 
                    className="kd-panel kd-hover-rose h-100 p-3 d-flex flex-column justify-content-between"
                    style={{ background: 'var(--kd-surface-1)', borderColor: disc.status === 'Resolved' ? 'var(--kd-border)' : 'rgba(239, 68, 68, 0.35)' }}
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="kd-mono text-white fw-bold">{disc.id}</span>
                        {disc.severity === 'High' && <span className="kd-tag kd-tag-rose">HIGH SEVERITY</span>}
                        {disc.severity === 'Medium' && <span className="kd-tag kd-tag-amber">MEDIUM</span>}
                        {disc.severity === 'Low' && <span className="kd-tag kd-tag-neutral">LOW</span>}
                      </div>

                      <h6 className="text-white fw-bold mb-1">{disc.assetName}</h6>
                      <div className="kd-mono text-secondary small mb-2" style={{ fontSize: '0.72rem' }}>
                        TAG: {disc.assetId} • S/N: {disc.serial} • {disc.branch}
                      </div>

                      <div className="p-2 rounded-2 mb-3" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                        <div className="kd-mono text-secondary mb-1" style={{ fontSize: '0.65rem' }}>OBSERVED DEFECT / ISSUE:</div>
                        <div className="text-light small">{disc.issue}</div>
                      </div>

                      <div className="small text-secondary mb-1" style={{ fontSize: '0.75rem' }}>
                        <span className="text-white fw-semibold">Action:</span> {disc.actionRequired}
                      </div>
                      <div className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
                        Reported by: {disc.reportedBy} on {disc.reportDate}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-top border-secondary-subtle d-flex align-items-center justify-content-between">
                      <span className={`kd-tag ${disc.status === 'Resolved' ? 'kd-tag-emerald' : 'kd-tag-rose'}`}>
                        {disc.status.toUpperCase()}
                      </span>

                      {disc.status !== 'Resolved' && (
                        <button
                          className="kd-btn-outline py-1 px-2"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => handleResolveDiscrepancy(disc.id)}
                        >
                          <i className="bi bi-check2 me-1"></i> MARK RESOLVED
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Audit Sessions & CEO Sign-offs */}
        {activeTab === 'sessions' && (
          <div className="p-3">
            <div className="row g-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="col-12 col-lg-6">
                  <div className="kd-panel p-3 h-100 d-flex flex-column justify-content-between" style={{ background: 'var(--kd-surface-1)' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="kd-mono text-white fw-bold">{sess.id}</span>
                        <span className={`kd-tag ${sess.status === 'Certified' ? 'kd-tag-emerald' : 'kd-tag-amber'}`}>
                          {sess.status.toUpperCase()}
                        </span>
                      </div>

                      <h5 className="text-white fw-bold mb-1">{sess.title}</h5>
                      <div className="text-secondary small mb-3">{sess.branch} • Lead Auditor: {sess.auditor}</div>

                      <div className="row g-2 mb-3">
                        <div className="col-4">
                          <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                            <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>VERIFIED UNITS</div>
                            <div className="kd-mono text-white fw-bold">{sess.verifiedItems}/{sess.totalItems}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                            <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>DISCREPANCIES</div>
                            <div className="kd-mono text-warning fw-bold">{sess.discrepanciesCount}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                            <div className="kd-mono text-secondary" style={{ fontSize: '0.65rem' }}>TARGET DATE</div>
                            <div className="kd-mono text-secondary small">{sess.targetDate}</div>
                          </div>
                        </div>
                      </div>

                      {sess.certifiedBy && (
                        <div className="p-2 rounded-2 mb-2 d-flex align-items-center gap-2" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <i className="bi bi-patch-check-fill text-success fs-5"></i>
                          <div className="kd-mono small text-light" style={{ fontSize: '0.72rem' }}>
                            CERTIFIED BY: <span className="text-white fw-bold">{sess.certifiedBy}</span> ON {sess.certifiedDate}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-top border-secondary-subtle d-flex align-items-center justify-content-between">
                      <span className="kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
                        STARTED: {sess.startDate}
                      </span>

                      {sess.status !== 'Certified' ? (
                        <button
                          className="kd-btn-solid py-1 px-3"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleCertifySession(sess.id)}
                        >
                          <i className="bi bi-pen-fill me-1"></i> CEO CERTIFY &amp; SIGN OFF
                        </button>
                      ) : (
                        <button
                          className="kd-btn-outline py-1 px-2"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => alert(`Official Audit Certificate for ${sess.id} downloaded.`)}
                        >
                          <i className="bi bi-printer me-1"></i> EXPORT CERTIFICATE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

