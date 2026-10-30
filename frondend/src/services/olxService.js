import api from './api';
import { initialOlxListings } from '../components/olx/OlxData';

export const transformBackendListing = (dto) => {
  return {
    id: dto.id || `OLX-${Math.floor(100 + Math.random() * 900)}`,
    backendId: dto.id,
    assetId: dto.assetId,
    assetTag: dto.assetTag || 'N/A',
    title: dto.title,
    category: dto.category || 'Laptops',
    brand: dto.brand || '',
    model: dto.model || '',
    serialNumber: dto.serialNumber || '',
    condition: dto.condition || 'Used - Good',
    dateListed: dto.dateListed || new Date().toISOString().split('T')[0],
    askingPrice: Number(dto.askingPrice || 0),
    expectedPrice: Number(dto.expectedPrice || dto.askingPrice || 0),
    soldPrice: dto.soldPrice != null ? Number(dto.soldPrice) : null,
    status: dto.status || 'Active', // 'Active', 'Negotiating', 'Sold', 'Delisted'
    olxUrl: dto.olxUrl || '',
    olxAdId: dto.olxAdId || '',
    viewsCount: dto.viewsCount || 0,
    inquiriesCount: dto.inquiriesCount || 0,
    buyerName: dto.buyerName || null,
    buyerPhone: dto.buyerPhone || null,
    paymentMode: dto.paymentMode || null,
    dateSold: dto.dateSold || null,
    soldToday: dto.soldToday || false,
    location: dto.location || 'Surat Central Warehouse',
    notes: dto.notes || '',
  };
};

export const olxService = {
  async getListings(params = {}) {
    try {
      const response = await api.get('/api/olx/listings', { params });
      const data = response.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map(transformBackendListing);
      }
      return initialOlxListings;
    } catch (err) {
      console.warn('[OlxService] Backend unavailable, using cached listings:', err.message);
      return initialOlxListings;
    }
  },

  async createListing(listingData) {
    try {
      const payload = {
        assetId: listingData.assetId || null,
        assetTag: listingData.assetTag,
        title: listingData.title,
        category: listingData.category,
        askingPrice: Number(listingData.askingPrice),
        expectedPrice: Number(listingData.expectedPrice || listingData.askingPrice),
        olxUrl: listingData.olxUrl,
        olxAdId: listingData.olxAdId,
        location: listingData.location,
        status: (listingData.status || 'ACTIVE').toUpperCase(),
        notes: listingData.notes,
      };
      const response = await api.post('/api/olx/listings', payload);
      return transformBackendListing(response.data?.data);
    } catch (err) {
      console.warn('[OlxService] Fallback to local save:', err.message);
      return {
        ...listingData,
        id: listingData.id || `OLX-${Math.floor(100 + Math.random() * 900)}`,
        dateListed: new Date().toISOString().split('T')[0],
      };
    }
  },

  async updateListing(id, listingData) {
    try {
      const payload = {
        title: listingData.title,
        category: listingData.category,
        askingPrice: Number(listingData.askingPrice),
        expectedPrice: Number(listingData.expectedPrice || listingData.askingPrice),
        olxUrl: listingData.olxUrl,
        olxAdId: listingData.olxAdId,
        location: listingData.location,
        status: (listingData.status || 'ACTIVE').toUpperCase(),
        notes: listingData.notes,
      };
      const response = await api.put(`/api/olx/listings/${id}`, payload);
      return transformBackendListing(response.data?.data);
    } catch (err) {
      console.warn('[OlxService] Fallback to local update:', err.message);
      return listingData;
    }
  },

  async markSold(id, saleData) {
    try {
      let mappedMode = 'UPI';
      if (saleData.paymentMode?.includes('Cash')) mappedMode = 'CASH';
      else if (saleData.paymentMode?.includes('Bank') || saleData.paymentMode?.includes('NEFT')) mappedMode = 'BANK_TRANSFER';
      else if (saleData.paymentMode?.includes('Cheque')) mappedMode = 'CHEQUE';

      const payload = {
        soldPrice: Number(saleData.soldPrice),
        buyerName: saleData.buyerName,
        buyerPhone: saleData.buyerPhone,
        paymentMode: mappedMode,
        dateSold: saleData.dateSold || new Date().toISOString().split('T')[0],
        notes: saleData.notes,
      };
      const response = await api.post(`/api/olx/listings/${id}/mark-sold`, payload);
      return transformBackendListing(response.data?.data);
    } catch (err) {
      console.warn('[OlxService] Fallback to local mark sold:', err.message);
      return {
        ...saleData,
        status: 'Sold',
        soldToday: true,
      };
    }
  },

  async deleteListing(id) {
    try {
      await api.delete(`/api/olx/listings/${id}`);
      return true;
    } catch (err) {
      console.warn('[OlxService] Fallback to local delete:', err.message);
      return false;
    }
  },

  async getKpis() {
    try {
      const response = await api.get('/api/olx/kpis');
      return response.data?.data;
    } catch (err) {
      console.warn('[OlxService] Failed to fetch live KPIs:', err.message);
      return null;
    }
  }
};

export default olxService;

