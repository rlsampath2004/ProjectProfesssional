import api from './api';
import { initialAllocations } from '../components/allocations/AllocationData';
import { mapBackendToCategory } from './assetService';

export const transformBackendAllocation = (dto) => {
  return {
    id: dto.receiptNumber || dto.id,
    backendId: dto.id,
    employeeId: dto.employeeCode || dto.employeeId,
    employeeName: dto.employeeName,
    department: dto.department || 'General Operations',
    branch: 'Head Office - Marine Lines',
    assetId: dto.assetTag || dto.assetId,
    assetName: dto.assetName,
    category: mapBackendToCategory(dto.assetType || 'LAPTOP'),
    serial: dto.assetSerialNumber || 'SN-UNKNOWN',
    peripherals: 'Standard Corporate Accessory Kit',
    handoverDate: dto.issueDate || new Date().toISOString().split('T')[0],
    returnDate: dto.actualReturnDate,
    expectedReturnDate: dto.expectedReturnDate,
    conditionAtHandover: dto.issueCondition || 'Good',
    conditionAtReturn: dto.returnCondition,
    status: dto.status === 'ACTIVE' ? 'Active Custody' : 'Returned',
    notes: dto.returnNotes || (dto.undertakingAccepted ? 'Undertaking accepted digitally' : 'Pending verification'),
  };
};

export const allocationService = {
  async getAllocations(params = {}) {
    try {
      const response = await api.get('/api/allocations', { params });
      const pageData = response.data?.data;
      if (pageData && Array.isArray(pageData.content)) {
        return pageData.content.map(transformBackendAllocation);
      }
      if (Array.isArray(pageData)) {
        return pageData.map(transformBackendAllocation);
      }
      return [];
    } catch (err) {
      console.warn('[AllocationService] Backend unavailable, using cached allocations:', err.message);
      return initialAllocations;
    }
  },

  async allocateAsset(allocationData) {
    try {
      const payload = {
        assetId: allocationData.assetBackendId,
        employeeId: allocationData.employeeBackendId,
        issueDate: allocationData.handoverDate,
        expectedReturnDate: allocationData.expectedReturnDate,
        issueCondition: allocationData.conditionAtHandover || 'Good',
        undertakingAccepted: true,
      };
      const response = await api.post('/api/allocations', payload);
      return transformBackendAllocation(response.data?.data);
    } catch (err) {
      console.warn('[AllocationService] Backend allocate failed, recording locally:', err.message);
      return allocationData;
    }
  },

  async returnAsset(backendId, returnCondition, returnNotes) {
    try {
      const response = await api.post(`/api/allocations/${backendId}/return`, {
        returnDate: new Date().toISOString().split('T')[0],
        returnCondition: returnCondition || 'Good',
        returnNotes: returnNotes || 'Checked into inventory',
      });
      return transformBackendAllocation(response.data?.data);
    } catch (err) {
      console.warn('[AllocationService] Backend return failed:', err.message);
      return null;
    }
  },

  async getHandoverReceipt(backendId) {
    try {
      const response = await api.get(`/api/allocations/${backendId}/receipt`);
      return response.data?.data;
    } catch (err) {
      console.warn('[AllocationService] Receipt fetch failed:', err.message);
      return null;
    }
  },
};

export default allocationService;

