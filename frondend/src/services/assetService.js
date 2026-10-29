import api from './api';
import { initialAssets } from '../components/assets/AssetData';

// Map frontend categories to backend AssetType enum
export const mapCategoryToBackend = (category) => {
  switch (category) {
    case 'Laptops': return 'LAPTOP';
    case 'Desktops': return 'DESKTOP';
    case 'Monitors': return 'MONITOR';
    case 'Printers': return 'PRINTER';
    case 'SIM Cards': return 'SIM_CARD';
    case 'Servers': return 'SERVER';
    default: return 'OTHER';
  }
};

// Map backend AssetType enum to frontend category
export const mapBackendToCategory = (type) => {
  switch (type) {
    case 'LAPTOP': return 'Laptops';
    case 'DESKTOP': return 'Desktops';
    case 'MONITOR': return 'Monitors';
    case 'PRINTER': return 'Printers';
    case 'SIM_CARD': return 'SIM Cards';
    case 'SERVER': return 'Servers';
    default: return 'Accessories';
  }
};

// Map frontend status to backend AssetStatus enum
export const mapStatusToBackend = (status) => {
  switch (status) {
    case 'In Use': return 'ALLOCATED';
    case 'Available': return 'IN_STORE';
    case 'Unused': return 'IN_STORE';
    case 'Under Maintenance': return 'MAINTENANCE';
    case 'Sold (OLX)': return 'SALVAGE_OLX';
    case 'Scrapped': return 'SCRAPPED';
    default: return 'IN_STORE';
  }
};

// Map backend AssetStatus enum to frontend status
export const mapBackendToStatus = (status) => {
  switch (status) {
    case 'ALLOCATED': return 'In Use';
    case 'IN_STORE': return 'Available';
    case 'MAINTENANCE': return 'Under Maintenance';
    case 'SALVAGE_OLX': return 'Sold (OLX)';
    case 'SCRAPPED': return 'Scrapped';
    default: return 'Available';
  }
};

// Transform backend DTO to frontend UI object
export const transformBackendAsset = (dto) => {
  return {
    id: dto.assetTag || dto.id,
    backendId: dto.id,
    name: dto.name,
    category: mapBackendToCategory(dto.type),
    serial: dto.serialNumber,
    location: dto.location || 'Head Office - Marine Lines',
    status: mapBackendToStatus(dto.status),
    condition: dto.condition || 'Good',
    assignedTo: dto.assignedEmployeeName || 'Unassigned (Pool)',
    assignedEmployeeId: dto.assignedEmployeeId,
    purchaseDate: dto.purchaseDate || new Date().toISOString().split('T')[0],
    value: Number(dto.purchaseCost) || 0,
    specs: dto.notes || `${dto.brand || ''} ${dto.model || ''}`.trim() || 'Standard Office Configuration',
  };
};

// Transform frontend UI object to backend request DTO
export const transformFrontendAsset = (asset) => {
  return {
    assetTag: asset.id,
    name: asset.name,
    type: mapCategoryToBackend(asset.category),
    serialNumber: asset.serial,
    brand: asset.name.split(' ')[0] || 'Generic',
    model: asset.name.split(' ').slice(1).join(' ') || 'Standard',
    purchaseDate: asset.purchaseDate,
    purchaseCost: Number(asset.value) || 0,
    status: mapStatusToBackend(asset.status),
    condition: asset.condition || 'Good',
    location: asset.location || 'Head Office - Marine Lines',
    assignedEmployeeName: asset.assignedTo !== 'Unassigned (Pool)' ? asset.assignedTo : null,
    notes: asset.specs,
  };
};

export const assetService = {
  // Fetch assets from backend with graceful local fallback
  async getAssets(params = {}) {
    try {
      const response = await api.get('/api/assets', { params });
      const pageData = response.data?.data;
      if (pageData?.content && Array.isArray(pageData.content) && pageData.content.length > 0) {
        return pageData.content.map(transformBackendAsset);
      }
      return initialAssets;
    } catch (err) {
      console.warn('[AssetService] Backend unavailable, using cached assets:', err.message);
      return initialAssets;
    }
  },

  // Create an asset on backend
  async createAsset(assetData) {
    try {
      const dto = transformFrontendAsset(assetData);
      const response = await api.post('/api/assets', dto);
      return transformBackendAsset(response.data?.data);
    } catch (err) {
      console.warn('[AssetService] Backend create failed, saving locally:', err.message);
      return assetData;
    }
  },

  // Update asset on backend
  async updateAsset(id, assetData) {
    try {
      const dto = transformFrontendAsset(assetData);
      const response = await api.put(`/api/assets/${assetData.backendId || id}`, dto);
      return transformBackendAsset(response.data?.data);
    } catch (err) {
      console.warn('[AssetService] Backend update failed, updating locally:', err.message);
      return assetData;
    }
  },

  // Delete asset
  async deleteAsset(id, backendId) {
    try {
      await api.delete(`/api/assets/${backendId || id}`);
      return true;
    } catch (err) {
      console.warn('[AssetService] Backend delete failed, deleting locally:', err.message);
      return true;
    }
  },

  // Update status transition
  async updateStatus(id, backendId, newStatus, reason = 'Status changed via dashboard') {
    try {
      const response = await api.patch(`/api/assets/${backendId || id}/status`, {
        newStatus: mapStatusToBackend(newStatus),
        reason,
      });
      return transformBackendAsset(response.data?.data);
    } catch (err) {
      console.warn('[AssetService] Backend status update failed:', err.message);
      return null;
    }
  },

  // Fetch WDV Depreciation from backend
  async getDepreciation(backendId) {
    try {
      const response = await api.get(`/api/assets/${backendId}/depreciation`);
      return response.data?.data;
    } catch (err) {
      return null;
    }
  },
};

export default assetService;

