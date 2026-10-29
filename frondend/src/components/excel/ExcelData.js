// Mock sample Excel import batches and historical synchronizations for Kothari Distributors

export const sampleExcelFiles = [
  {
    fileName: 'Kothari_IT_Inventory_Master_2026.xlsx',
    fileSize: '1.4 MB',
    dateUploaded: '2026-10-29 08:30 IST',
    rowCount: 24,
    status: 'Ready to Map',
    records: [
      { tag: 'KD-LAP-011', category: 'Laptops', model: 'Dell Latitude 3420 i5 11th Gen', serial: 'DLL-LAT-3420-99', branch: 'Surat Office', condition: 'Brand New', status: 'Available', value: 58000, assignedTo: 'Unassigned', isDuplicate: false },
      { tag: 'KD-DSK-008', category: 'Desktops', model: 'HP ProDesk 400 G6 Core i5', serial: 'HP-PD400-8812', branch: 'Surat Central Warehouse', condition: 'Working', status: 'In Use', value: 42000, assignedTo: 'Prakash Patel (Warehouse)', isDuplicate: false },
      { tag: 'KD-PRT-010', category: 'Printers', model: 'TVS RP-3150 Thermal Label Printer', serial: 'TVS-RP31-440', branch: 'Ring Road Depot', condition: 'Working', status: 'In Use', value: 8500, assignedTo: 'Dispatch Counter 2', isDuplicate: false },
      { tag: 'KD-LAP-001', category: 'Laptops', model: 'Lenovo ThinkPad T14 Gen 2', serial: 'LNV-TKP-14-8821', branch: 'Surat Office', condition: 'Working', status: 'In Use', value: 84000, assignedTo: 'R.L. Kothari (Owner)', isDuplicate: true }, // Duplicate serial alert!
      { tag: 'KD-NET-007', category: 'Network', model: 'TP-Link TL-SG1016D 16-Port Switch', serial: 'TPL-SG16-5591', branch: 'GIDC Godown', condition: 'Working', status: 'Available', value: 4200, assignedTo: 'Unassigned', isDuplicate: false },
      { tag: 'KD-SIM-006', category: 'SIM Cards', model: 'Airtel Enterprise 5G CUG SIM', serial: 'SIM-8991-006', branch: 'Surat Office', condition: 'Working', status: 'In Use', value: 500, assignedTo: 'Manoj Joshi (Logistics)', isDuplicate: false }
    ]
  },
  {
    fileName: 'Kothari_Branch_Depot_Assets_Q3.xlsx',
    fileSize: '840 KB',
    dateUploaded: '2026-10-25 17:15 IST',
    rowCount: 18,
    status: 'Archived',
    records: []
  }
];

export const syncHistoryLogs = [
  { id: 'LOG-881', timestamp: '2026-10-29 08:30 IST', source: 'Excel Master Upload', recordsProcessed: 24, added: 23, conflicts: 1, user: 'R.L. Kothari (Owner)' },
  { id: 'LOG-880', timestamp: '2026-10-25 17:15 IST', source: 'Branch Depot Sheet', recordsProcessed: 18, added: 18, conflicts: 0, user: 'R.L. Kothari (Owner)' },
  { id: 'LOG-879', timestamp: '2026-10-18 11:00 IST', source: 'Warehouse Stocktake Audit', recordsProcessed: 42, added: 5, conflicts: 0, user: 'R.L. Kothari (Owner)' }
];

