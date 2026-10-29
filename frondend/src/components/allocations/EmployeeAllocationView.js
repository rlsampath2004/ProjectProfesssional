import React, { useState, useMemo, useEffect } from 'react';
import allocationService from '../../services/allocationService';
import employeeService from '../../services/employeeService';
import assetService from '../../services/assetService';
import AllocationModal from './AllocationModal';
import ReturnAssetModal from './ReturnAssetModal';
import EmployeeDossierModal from './EmployeeDossierModal';
import HandoverReceiptModal from './HandoverReceiptModal';

export default function EmployeeAllocationView({ onNavigateTab }) {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeViewMode, setActiveViewMode] = useState('records'); // 'records' or 'employees'

  // Load from backend API with fallback
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      allocationService.getAllocations(),
      employeeService.getEmployees(),
      assetService.getAssets(),
    ]).then(([allocData, empData, assetData]) => {
      if (isMounted) {
        setAllocations(allocData);
        setEmployees(empData);
        setAvailableAssets(assetData.filter(a => a.status === 'Available'));
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Modals state
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [returnItem, setReturnItem] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [receiptItem, setReceiptItem] = useState(null);

  // Available assets for allocation
  const availablePool = useMemo(() => {
    return availableAssets;
  }, [availableAssets]);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        a.employeeName.toLowerCase().includes(q) ||
        a.assetName.toLowerCase().includes(q) ||
        a.assetId.toLowerCase().includes(q) ||
        a.serial.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'All' || a.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [allocations, searchQuery, selectedDept]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.branch.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  // Handlers
  const handleCreateAllocation = async (newAlloc) => {
    const created = await allocationService.allocateAsset(newAlloc);
    setAllocations([created, ...allocations]);
  };

  const handleConfirmReturn = async (allocId, returnData) => {
    const alloc = allocations.find(a => a.id === allocId);
    await allocationService.returnAsset(alloc?.backendId || allocId, returnData.destinationStatus, returnData.notes);
    setAllocations(allocations.map(a => 
      a.id === allocId ? { 
        ...a, 
        status: `Returned (${returnData.destinationStatus})`, 
        returnDate: returnData.returnDate,
        notes: `${a.notes} • Return note: ${returnData.notes}` 
      } : a
    ));
  };

  // Department tabs list
  const departments = [
    'All',
    'Logistics & Ops',
    'Accounts & Finance',
    'Warehouse & Dispatch',
    'Sales & Distribution',
    'IT & Infrastructure',
    'Executive Office'
  ];

  return (
    <div className="pb-4">
      {/* Modals */}
      <AllocationModal
        show={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        onAllocate={handleCreateAllocation}
        availableAssets={availablePool}
      />

      <ReturnAssetModal
        allocation={returnItem}
        onClose={() => setReturnItem(null)}
        onConfirmReturn={handleConfirmReturn}
      />

      <EmployeeDossierModal
        employee={selectedEmployee}
        allocations={allocations}
        onClose={() => setSelectedEmployee(null)}
        onReturnItem={(item) => setReturnItem(item)}
      />

      <HandoverReceiptModal
        isOpen={!!receiptItem}
        onClose={() => setReceiptItem(null)}
        allocation={receiptItem}
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
            <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>• EMPLOYEE ASSET ALLOCATION</span>
          </div>
          <h3 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.035em' }}>
            Employee Allocation &amp; Custody Hub
          </h3>
          <p className="text-secondary small mb-0">
            Digital custody agreements, staff device portfolios, return logs, and department hardware handovers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button 
            className="kd-btn-outline"
            onClick={() => onNavigateTab && onNavigateTab('assets')}
            title="Inspect Central Hardware Inventory"
          >
            <i className="bi bi-laptop"></i>
            <span>VIEW INVENTORY POOL</span>
          </button>

          <button 
            className="kd-btn-solid"
            onClick={() => setShowAllocateModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>ALLOCATE HARDWARE</span>
          </button>
        </div>
      </div>

      {/* Contextual Metric Cards with Matched Hover Shadows */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-blue">
            <div className="kd-metric-label mb-1">ACTIVE CUSTODY</div>
            <div className="kd-metric-value kd-mono text-white fs-4">
              {allocations.filter(a => a.status === 'Active Custody').length}
            </div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>DEVICES IN EMPLOYEE CUSTODY</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-emerald">
            <div className="kd-metric-label mb-1">ASSIGNED EMPLOYEES</div>
            <div className="kd-metric-value kd-mono text-success fs-4">{employees.length}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>AUTHORIZED COMPANY STAFF</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-amber">
            <div className="kd-metric-label mb-1">UNASSIGNED POOL</div>
            <div className="kd-metric-value kd-mono text-warning fs-4">{availablePool.length}</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>READY FOR IMMEDIATE HANDOVER</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="kd-metric-tile kd-hover-rose">
            <div className="kd-metric-label mb-1">PENDING VERIFICATION</div>
            <div className="kd-metric-value kd-mono text-danger fs-4">02</div>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>ANNUAL AUDIT CHECKS DUE</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Switcher Bar */}
      <div className="kd-panel mb-4">
        <div className="p-3 border-bottom border-secondary-subtle">
          <div className="row g-2 align-items-center justify-content-between">
            {/* Search Input */}
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-black border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="Search employee name, department, asset ID, or serial..."
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

            {/* View Mode Switcher */}
            <div className="col-12 col-md-auto d-flex justify-content-md-end">
              <div className="d-flex align-items-center gap-1 p-1 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                <button
                  className={`btn btn-sm px-3 py-1 kd-mono ${activeViewMode === 'records' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setActiveViewMode('records')}
                >
                  <i className="bi bi-card-checklist me-1"></i> ALLOCATION AGREEMENTS
                </button>
                <button
                  className={`btn btn-sm px-3 py-1 kd-mono ${activeViewMode === 'employees' ? 'kd-btn-solid' : 'text-secondary border-0 bg-transparent'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setActiveViewMode('employees')}
                >
                  <i className="bi bi-people me-1"></i> EMPLOYEE DIRECTORY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="px-3 py-2 d-flex align-items-center gap-1 overflow-auto" style={{ background: 'var(--kd-surface-2)' }}>
          {departments.map((dept) => {
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                className={`btn btn-sm px-2 py-1 kd-mono ${
                  isActive ? 'kd-btn-solid' : 'kd-btn-outline'
                }`}
                style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* View Mode 1: Allocation Records Table */}
      {activeViewMode === 'records' && (
        <div className="kd-table-container">
          <table className="kd-table">
            <thead>
              <tr>
                <th>REF ID</th>
                <th>CUSTODIAN EMPLOYEE</th>
                <th>DEPARTMENT &amp; BRANCH</th>
                <th>ALLOCATED ASSET</th>
                <th>SERIAL NUMBER</th>
                <th>ACCESSORIES ISSUED</th>
                <th>HANDOVER DATE</th>
                <th>STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-secondary kd-mono">
                    <i className="bi bi-folder2-open fs-3 d-block mb-2"></i>
                    NO ALLOCATION RECORDS MATCH THIS CRITERIA
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((item) => (
                  <tr key={item.id}>
                    {/* Allocation ID */}
                    <td className="kd-mono text-secondary small fw-semibold">
                      {item.id}
                    </td>

                    {/* Employee */}
                    <td>
                      <div 
                        className="text-white fw-semibold hover-text-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const emp = employees.find(e => e.id === item.employeeId) || {
                            id: item.employeeId,
                            name: item.employeeName,
                            role: 'Staff Custodian',
                            department: item.department,
                            branch: item.branch,
                            email: `${item.employeeName.toLowerCase().replace(' ', '.')}@kotharidistributors.com`,
                            phone: '+91 98200 00000'
                          };
                          setSelectedEmployee(emp);
                        }}
                      >
                        {item.employeeName}
                      </div>
                      <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
                        {item.employeeId}
                      </span>
                    </td>

                    {/* Department & Branch */}
                    <td>
                      <div className="text-light small">{item.department}</div>
                      <div className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
                        {item.branch}
                      </div>
                    </td>

                    {/* Hardware */}
                    <td>
                      <div className="text-white fw-medium small">{item.assetName}</div>
                      <span className="kd-tag kd-tag-cat-laptop py-0" style={{ fontSize: '0.65rem' }}>
                        {item.assetId}
                      </span>
                    </td>

                    {/* Serial */}
                    <td className="kd-mono text-white small">{item.serial}</td>

                    {/* Peripherals */}
                    <td className="text-secondary small text-truncate" style={{ maxWidth: '200px', fontSize: '0.75rem' }}>
                      {item.peripherals}
                    </td>

                    {/* Handover Date */}
                    <td className="kd-mono text-secondary small">{item.handoverDate}</td>

                    {/* Status */}
                    <td>
                      {item.status === 'Active Custody' ? (
                        <span className="kd-tag kd-tag-status-inuse">ACTIVE CUSTODY</span>
                      ) : (
                        <span className="kd-tag kd-tag-neutral">{item.status}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <button
                          className="kd-btn-outline py-1 px-2"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => setReceiptItem(item)}
                          title="Print Official Handover & Custody Agreement"
                        >
                          <i className="bi bi-file-earmark-text text-info me-1"></i>
                          <span className="d-none d-md-inline">AGREEMENT</span>
                        </button>

                        {item.status === 'Active Custody' ? (
                          <button
                            className="kd-btn-outline py-1 px-2"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => setReturnItem(item)}
                            title="Process Return of this asset"
                          >
                            <i className="bi bi-box-arrow-in-down me-1"></i>
                            <span className="d-none d-md-inline">RETURN</span>
                          </button>
                        ) : (
                          <span className="kd-mono text-secondary px-2" style={{ fontSize: '0.7rem' }}>
                            COMPLETED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Mode 2: Employee Directory Card Grid */}
      {activeViewMode === 'employees' && (
        <div className="row g-3">
          {filteredEmployees.map((emp) => {
            const assignedItems = allocations.filter(a => a.employeeId === emp.id && a.status === 'Active Custody');
            return (
              <div key={emp.id} className="col-12 col-md-6 col-xl-4">
                <div 
                  className="kd-panel kd-hover-card p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ cursor: 'pointer', background: 'var(--kd-surface-1)' }}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div>
                    {/* Top Row: Employee Avatar & Badge Count */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="kd-mono d-flex align-items-center justify-content-center text-white fw-bold rounded-2"
                          style={{ width: 38, height: 38, background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)', fontSize: '0.85rem' }}
                        >
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h6 className="text-white fw-bold mb-0">{emp.name}</h6>
                          <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>{emp.id}</span>
                        </div>
                      </div>

                      <span className="kd-tag kd-tag-neutral">
                        {assignedItems.length} DEVICES
                      </span>
                    </div>

                    <div className="text-secondary small mb-1">{emp.role}</div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="kd-tag kd-tag-neutral py-0" style={{ fontSize: '0.65rem' }}>{emp.department}</span>
                      <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>• {emp.branch}</span>
                    </div>

                    {/* Assigned Hardware Preview */}
                    <div className="pt-2 border-top border-secondary-subtle">
                      <div className="kd-mono text-secondary mb-2" style={{ fontSize: '0.68rem' }}>
                        ASSIGNED HARDWARE:
                      </div>
                      {assignedItems.length === 0 ? (
                        <span className="kd-mono text-secondary small" style={{ fontSize: '0.72rem' }}>
                          No equipment currently assigned.
                        </span>
                      ) : (
                        <div className="d-flex flex-column gap-1">
                          {assignedItems.map(item => (
                            <div 
                              key={item.id}
                              className="p-1 px-2 rounded-1 d-flex align-items-center justify-content-between"
                              style={{ background: 'var(--kd-surface-2)', fontSize: '0.75rem' }}
                            >
                              <span className="text-light text-truncate me-2">{item.assetName}</span>
                              <span className="kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>{item.assetId}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 mt-3 border-top border-secondary-subtle d-flex align-items-center justify-content-between">
                    <span className="kd-mono text-white fw-semibold small" style={{ fontSize: '0.72rem' }}>
                      INSPECT DOSSIER
                    </span>
                    <i className="bi bi-arrow-right text-secondary small"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ledger Footer */}
      <div className="d-flex align-items-center justify-content-between mt-3 px-2 kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
        <span>TRACKING {allocations.length} CUSTODY AGREEMENTS ACROSS {employees.length} EMPLOYEES</span>
        <span>KOTHARI DISTRIBUTORS ASSET CUSTODY CONTROL</span>
      </div>
    </div>
  );
}

