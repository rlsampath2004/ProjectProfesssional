// Audit Sessions and Discrepancy Records for Kothari Distributors

export const initialAuditSessions = [
  {
    id: 'ADT-2026-Q4',
    title: 'Q4 2026 Head Office Physical Stocktake',
    branch: 'Head Office - Marine Lines',
    startDate: '2026-10-20',
    targetDate: '2026-10-31',
    status: 'In Progress',
    totalItems: 98,
    verifiedItems: 92,
    discrepanciesCount: 2,
    auditor: 'Neha Patel (Stock Auditor)',
    certifiedBy: null,
    certifiedDate: null
  },
  {
    id: 'ADT-2026-WHS',
    title: 'Bhiwandi Warehouse Annual Hardware Audit',
    branch: 'Warehouse - Bhiwandi',
    startDate: '2026-10-10',
    targetDate: '2026-10-25',
    status: 'Pending Signoff',
    totalItems: 114,
    verifiedItems: 114,
    discrepanciesCount: 1,
    auditor: 'Vikram Desai & Neha Patel',
    certifiedBy: null,
    certifiedDate: null
  },
  {
    id: 'ADT-2026-BRA',
    title: 'Branch A Andheri Mid-Year Infrastructure Review',
    branch: 'Branch A - Andheri',
    startDate: '2026-06-15',
    targetDate: '2026-06-22',
    status: 'Certified',
    totalItems: 36,
    verifiedItems: 36,
    discrepanciesCount: 0,
    auditor: 'Suresh Verma',
    certifiedBy: 'R.L. Kothari (Owner & CEO)',
    certifiedDate: '2026-06-23'
  }
];

export const initialDiscrepancies = [
  {
    id: 'DISC-001',
    assetId: 'KD-NET-003',
    assetName: 'TP-Link JetStream 16-Port Managed Switch',
    serial: 'TL-894102934',
    branch: 'Warehouse - Bhiwandi',
    severity: 'High',
    issue: 'Port 7 & 8 port flapping; physical casing warm to touch during rack inspection.',
    reportedBy: 'Vikram Desai',
    reportDate: '2026-10-18',
    status: 'Investigating',
    actionRequired: 'Replace RJ45 module or route to vendor service.'
  },
  {
    id: 'DISC-002',
    assetId: 'KD-CHG-002',
    assetName: 'Dell 65W Barrel Pin Power Adapter',
    serial: 'DL-CHG-84910',
    branch: 'Branch A - Andheri',
    severity: 'Medium',
    issue: 'Charger cable strain relief frayed near jack connector.',
    reportedBy: 'Priya Mehta',
    reportDate: '2026-10-22',
    status: 'Pending Replacement',
    actionRequired: 'Issue spare adapter from pool; discard damaged unit.'
  },
  {
    id: 'DISC-003',
    assetId: 'KD-LAP-005',
    assetName: 'Lenovo ThinkPad E14 Gen 2',
    serial: 'PF-109284Z',
    branch: 'Head Office - Marine Lines',
    severity: 'Low',
    issue: 'Asset tag barcode worn; needs reprint prior to OLX handoff.',
    reportedBy: 'Neha Patel',
    reportDate: '2026-10-26',
    status: 'Resolved',
    actionRequired: 'New barcode printed on TSC Label printer.'
  }
];

