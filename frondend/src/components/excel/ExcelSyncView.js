import React, { useState } from 'react';
import { sampleExcelFiles, syncHistoryLogs } from './ExcelData';
import { initialAssets } from '../assets/AssetData';

export default function ExcelSyncView({ onNavigateTab }) {
  const [selectedFile, setSelectedFile] = useState(sampleExcelFiles[0]);
  const [stagedRecords, setStagedRecords] = useState(sampleExcelFiles[0].records);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Dynamic CSV Export for Excel
  const handleExportToExcel = () => {
    const headers = ['Asset Tag', 'Category', 'Equipment Model', 'Serial Number', 'Branch Location', 'Condition', 'Status', 'Assigned To', 'Value (INR)', 'Specs'];
    const rows = initialAssets.map(a => [
      `"${a.id}"`,
      `"${a.category}"`,
      `"${a.name}"`,
      `"${a.serial}"`,
      `"${a.location}"`,
      `"${a.condition}"`,
      `"${a.status}"`,
      `"${a.assignedTo || 'Unassigned (Pool)'}"`,
      a.value || 0,
      `"${(a.specs || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kothari_IT_Asset_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Encrypted JSON Snapshot Backup
  const handleExportJSONSnapshot = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      company: 'Kothari Distributors Pvt. Ltd.',
      backupDate: new Date().toISOString(),
      exportType: 'CEO Master IT Hardware & Inventory Backup',
      totalUnits: initialAssets.length,
      assets: initialAssets
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Kothari_Fleet_Snapshot_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Empty Master Template
  const handleDownloadTemplate = () => {
    const headers = ['Asset Tag', 'Category', 'Brand & Model', 'Serial Number', 'Branch Location', 'Condition', 'Status', 'Purchase Price', 'Assigned Employee'];
    const sample = [
      ['KD-LAP-101', 'Laptops', 'Dell Latitude 3420 i5', 'DLL-LAT-9921', 'Surat Office', 'Working', 'Available', '58000', 'Unassigned'],
      ['KD-PRT-102', 'Printers', 'HP LaserJet Pro M404dn', 'HPL-404-998', 'Central Warehouse', 'Working', 'In Use', '26000', 'Rajesh K.']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sample.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Kothari_IT_Inventory_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulated file drop or picker
  const handleSimulateUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportSuccess(false);
      if (file) {
        setSelectedFile({
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          dateUploaded: 'Just now',
          rowCount: 6,
          status: 'Parsed & Validated',
          records: sampleExcelFiles[0].records
        });
        setStagedRecords(sampleExcelFiles[0].records);
      }
    }, 600);
  };

  // Commit import to master state
  const handleCommitImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportSuccess(true);
      // Remove imported items or mark as synced
    }, 800);
  };

  // Remove a staged row
  const handleRemoveRow = (index) => {
    setStagedRecords(stagedRecords.filter((_, i) => i !== index));
  };

  const duplicateCount = stagedRecords.filter(r => r.isDuplicate).length;
  const validCount = stagedRecords.length - duplicateCount;

  return (
    <div className="py-3 px-2 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge px-2 py-1" style={{ background: 'var(--kd-surface-2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '11px' }}>
              <i className="bi bi-file-earmark-spreadsheet-fill me-1"></i> EXCEL & CLOUD SYNC ENGINE
            </span>
            <span className="text-secondary small font-monospace">• Smart Column Mapping • Conflict Guard</span>
          </div>
          <h2 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>
            Excel Records Import & Export Hub
          </h2>
          <p className="text-secondary small mb-0 mt-1">
            Import existing Excel asset spreadsheets, auto-detect duplicate serial numbers, and export certified records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Download Master Template */}
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm text-light d-flex align-items-center gap-2 px-3"
            onClick={handleDownloadTemplate}
          >
            <i className="bi bi-download"></i>
            <span>Blank Template (.csv)</span>
          </button>

          {/* Export Master Database */}
          <button 
            type="button" 
            className="btn btn-outline-success btn-sm fw-bold d-flex align-items-center gap-2 px-3"
            onClick={handleExportToExcel}
            title="Download complete hardware catalog as CSV/Excel"
          >
            <i className="bi bi-file-earmark-excel-fill text-success"></i>
            <span>Export Fleet to CSV</span>
          </button>

          {/* Export JSON Cloud Snapshot */}
          <button 
            type="button" 
            className="btn btn-outline-info btn-sm fw-bold d-flex align-items-center gap-2 px-3"
            onClick={handleExportJSONSnapshot}
            title="Download full encrypted database snapshot as JSON"
          >
            <i className="bi bi-cloud-arrow-down-fill text-info"></i>
            <span>Backup JSON Snapshot</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {importSuccess && (
        <div 
          className="alert alert-success d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border-0"
          style={{ background: '#064e3b', color: '#a7f3d0' }}
        >
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-check-circle-fill fs-4"></i>
            <div>
              <div className="fw-bold">Excel Import Successfully Merged!</div>
              <div className="small font-monospace">{validCount} new IT assets have been added to the master fleet register.</div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-light" 
            onClick={() => onNavigateTab && onNavigateTab('assets')}
          >
            View in Fleet Inventory →
          </button>
        </div>
      )}

      {/* 2-Column Workflow: Left Upload Zone, Right Summary & Mapper */}
      <div className="row g-4 mb-4">
        
        {/* Left: Drag and Drop Upload Card */}
        <div className="col-12 col-lg-7">
          <div className="card bg-black border border-dark rounded-3 h-100 p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white fw-bold mb-0">Upload Excel Spreadsheet</h5>
              <span className="badge bg-dark text-secondary font-monospace small">.XLSX, .XLS, .CSV</span>
            </div>

            {/* Dropzone Box */}
            <label 
              htmlFor="excel-upload-input" 
              className="d-flex flex-column align-items-center justify-content-center p-4 rounded-3 text-center cursor-pointer"
              style={{
                border: '2px dashed var(--kd-border)',
                background: 'var(--kd-surface-1)',
                minHeight: '180px',
                cursor: 'pointer'
              }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}
              >
                <i className="bi bi-cloud-arrow-up-fill fs-3"></i>
              </div>
              <div className="text-light fw-bold mb-1">
                Drag and drop your Excel asset sheet here, or <span className="text-primary text-decoration-underline">browse file</span>
              </div>
              <div className="text-secondary small font-monospace mb-2">
                Supports Kothari Distributors standard columns, warehouse stock sheets & branch records
              </div>
              <input 
                id="excel-upload-input" 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="d-none" 
                onChange={handleSimulateUpload} 
              />
            </label>

            {/* Current File Metadata */}
            {selectedFile && (
              <div className="mt-3 p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-file-earmark-excel-fill text-success fs-3"></i>
                    <div>
                      <div className="text-light fw-bold font-monospace small">{selectedFile.fileName}</div>
                      <div className="text-secondary" style={{ fontSize: '11px' }}>
                        {selectedFile.fileSize} • Uploaded {selectedFile.dateUploaded} • {stagedRecords.length} records parsed
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-black text-success border border-success font-monospace small px-2 py-1">
                    READY TO MERGE
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Smart Column Mapper & Conflict Rules */}
        <div className="col-12 col-lg-5">
          <div className="card bg-black border border-dark rounded-3 h-100 p-4">
            <h5 className="text-white fw-bold mb-3">Smart Column Auto-Mapper</h5>
            <p className="text-secondary small mb-3">
              Kothari AI engine automatically maps your Excel headers to system fields.
            </p>

            <div className="d-flex flex-column gap-2 mb-4">
              {[
                { excelCol: 'Asset Tag / ID', target: 'assetTag', status: 'Mapped 100%' },
                { excelCol: 'Equipment Category', target: 'category', status: 'Mapped 100%' },
                { excelCol: 'Brand & Model Spec', target: 'model', status: 'Mapped 100%' },
                { excelCol: 'Device Serial Number', target: 'serialNumber', status: 'Mapped 100%' },
                { excelCol: 'Depot / Branch Location', target: 'branch', status: 'Mapped 100%' },
                { excelCol: 'Working Condition', target: 'condition', status: 'Mapped 100%' },
                { excelCol: 'Assigned Staff', target: 'assignedTo', status: 'Mapped 100%' }
              ].map((mapItem, idx) => (
                <div 
                  key={idx} 
                  className="d-flex align-items-center justify-content-between px-3 py-2 rounded-2"
                  style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}
                >
                  <div className="d-flex align-items-center gap-2 font-monospace small">
                    <span className="text-light">{mapItem.excelCol}</span>
                    <i className="bi bi-arrow-right text-muted"></i>
                    <span className="text-primary fw-bold">{mapItem.target}</span>
                  </div>
                  <span className="badge bg-black text-success font-monospace" style={{ fontSize: '10px' }}>
                    <i className="bi bi-check2 me-1"></i> {mapItem.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Duplicate Serial Guard Toggle */}
            <div className="p-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <div className="form-check form-switch mb-1">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="skipDuplicatesCheck" 
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                />
                <label className="form-check-label text-warning small fw-bold" htmlFor="skipDuplicatesCheck">
                  Duplicate Serial Protection Active
                </label>
              </div>
              <div className="text-secondary" style={{ fontSize: '11px' }}>
                Prevents overwriting existing active laptops or equipment if serial number matches current fleet.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Staged Data Preview & Import Table */}
      <div className="card bg-black border border-dark rounded-3 overflow-hidden mb-4">
        
        {/* Table Controls Header */}
        <div className="p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-bottom border-dark">
          <div>
            <h5 className="text-white fw-bold mb-0">Staged Records Preview ({stagedRecords.length} Items)</h5>
            <div className="text-secondary small font-monospace mt-1">
              {validCount} ready for master import • {duplicateCount > 0 ? <span className="text-warning fw-bold">{duplicateCount} duplicate warning</span> : '0 conflicts'}
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm fw-bold px-4 d-flex align-items-center gap-2"
            onClick={handleCommitImport}
            disabled={isProcessing || stagedRecords.length === 0}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                <span>Importing records...</span>
              </>
            ) : (
              <>
                <i className="bi bi-cloud-arrow-down-fill"></i>
                <span>Confirm Import to Master Fleet ({validCount} Items)</span>
              </>
            )}
          </button>
        </div>

        {/* Data Grid */}
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead style={{ background: 'var(--kd-surface-2)', borderBottom: '1px solid var(--kd-border)' }}>
              <tr className="text-secondary small font-monospace">
                <th className="ps-3 py-3">ASSET TAG</th>
                <th className="py-3">CATEGORY</th>
                <th className="py-3">MODEL & HARDWARE</th>
                <th className="py-3">SERIAL NUMBER</th>
                <th className="py-3">BRANCH</th>
                <th className="py-3">VALUATION</th>
                <th className="py-3">INTEGRITY CHECK</th>
                <th className="pe-3 py-3 text-end">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {stagedRecords.map((rec, idx) => (
                <tr 
                  key={idx} 
                  style={{ 
                    borderBottom: '1px solid var(--kd-border)',
                    background: rec.isDuplicate ? 'rgba(239, 68, 68, 0.05)' : 'transparent' 
                  }}
                >
                  <td className="ps-3 py-3">
                    <span className="badge border font-monospace small px-2 py-1" style={{ background: 'var(--kd-surface-2)', borderColor: 'var(--kd-border)', color: 'var(--kd-text-1)' }}>
                      {rec.tag}
                    </span>
                  </td>
                  <td className="py-3 text-secondary small">{rec.category}</td>
                  <td className="py-3">
                    <span className="fw-bold small" style={{ color: 'var(--kd-text-1)' }}>{rec.model}</span>
                    <div className="text-muted" style={{ fontSize: '11px' }}>Assigned: {rec.assignedTo}</div>
                  </td>
                  <td className="py-3 font-monospace small" style={{ color: 'var(--kd-text-1)' }}>{rec.serial}</td>
                  <td className="py-3 text-secondary small">{rec.branch}</td>
                  <td className="py-3 font-monospace text-info small">₹{rec.value.toLocaleString('en-IN')}</td>
                  <td className="py-3">
                    {rec.isDuplicate ? (
                      <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Duplicate Serial (In Use)
                      </span>
                    ) : (
                      <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <i className="bi bi-check2 me-1"></i> Valid Unique
                      </span>
                    )}
                  </td>
                  <td className="pe-3 py-3 text-end">
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm py-1 px-2"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleRemoveRow(idx)}
                      title="Exclude from import"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Historical Sync Logs */}
      <div className="card rounded-3 p-4" style={{ background: 'var(--kd-surface-1)', border: '1px solid var(--kd-border)' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--kd-text-1)' }}>Spreadsheet Synchronization & Cloud Backup Log</h5>
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0 align-middle">
            <thead className="small font-monospace" style={{ background: 'var(--kd-surface-2)', color: 'var(--kd-text-2)' }}>
              <tr style={{ borderBottom: '1px solid var(--kd-border)' }}>
                <th className="py-2 px-2">BATCH ID</th>
                <th className="py-2">TIMESTAMP</th>
                <th className="py-2">SOURCE</th>
                <th className="py-2">RECORDS</th>
                <th className="py-2">ADDED</th>
                <th className="py-2">CONFLICTS</th>
                <th className="py-2">OPERATOR</th>
              </tr>
            </thead>
            <tbody className="small font-monospace">
              {syncHistoryLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--kd-border)' }}>
                  <td className="text-info px-2">{log.id}</td>
                  <td style={{ color: 'var(--kd-text-1)' }}>{log.timestamp}</td>
                  <td className="text-secondary">{log.source}</td>
                  <td className="text-secondary">{log.recordsProcessed}</td>
                  <td className="text-success fw-bold">+{log.added}</td>
                  <td className={log.conflicts > 0 ? 'text-warning' : 'text-secondary'}>{log.conflicts}</td>
                  <td style={{ color: 'var(--kd-text-1)' }}>{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

