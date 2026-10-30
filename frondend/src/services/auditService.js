import api from './api';
import { initialAuditSessions, initialDiscrepancies } from '../components/audit/AuditData';

export const transformBackendSession = (dto) => {
  return {
    id: dto.sessionCode || dto.id,
    backendId: dto.id,
    title: dto.title,
    branch: dto.branchLocation,
    startDate: dto.startDate,
    targetDate: dto.targetDate,
    status: dto.status === 'CERTIFIED' ? 'Certified' :
            dto.status === 'PENDING_SIGNOFF' ? 'Pending Signoff' : 'In Progress',
    totalItems: dto.totalItems || 0,
    verifiedItems: dto.verifiedItems || 0,
    discrepanciesCount: dto.discrepanciesCount || 0,
    auditor: dto.auditorName,
    certifiedBy: dto.certifiedBy,
    certifiedDate: dto.certifiedDate,
    certificateHash: dto.certificateHash,
  };
};

export const transformBackendDiscrepancy = (dto) => {
  return {
    id: dto.id ? String(dto.id).slice(0, 8).toUpperCase() : 'DISC-NEW',
    backendId: dto.id,
    assetId: dto.assetTag || 'AST-UNKNOWN',
    assetName: dto.assetName,
    serial: dto.serialNumber || 'SN-UNKNOWN',
    branch: dto.branchLocation || 'Head Office',
    severity: dto.severity === 'CRITICAL' ? 'Critical' :
              dto.severity === 'HIGH' ? 'High' :
              dto.severity === 'LOW' ? 'Low' : 'Medium',
    issue: dto.issue,
    reportedBy: dto.reportedBy || 'Auditor',
    reportDate: dto.reportDate || new Date().toISOString().split('T')[0],
    status: dto.status === 'RESOLVED' ? 'Resolved' :
            dto.status === 'PENDING_REPLACEMENT' ? 'Pending Replacement' : 'Investigating',
    actionRequired: dto.actionRequired || 'Inspection pending',
  };
};

export const auditService = {
  async getAuditSessions(params = {}) {
    try {
      const response = await api.get('/api/audit/sessions', { params });
      const pageData = response.data?.data;
      if (pageData?.content && Array.isArray(pageData.content) && pageData.content.length > 0) {
        return pageData.content.map(transformBackendSession);
      }
      return initialAuditSessions;
    } catch (err) {
      console.warn('[AuditService] Backend unavailable, using cached sessions:', err.message);
      return initialAuditSessions;
    }
  },

  async createAuditSession(sessionData) {
    try {
      const payload = {
        sessionCode: sessionData.id,
        title: sessionData.title,
        branchLocation: sessionData.branch,
        auditorName: sessionData.auditor,
        startDate: sessionData.startDate,
        targetDate: sessionData.targetDate,
      };
      const response = await api.post('/api/audit/sessions', payload);
      return transformBackendSession(response.data?.data);
    } catch (err) {
      console.warn('[AuditService] Backend create session failed:', err.message);
      return sessionData;
    }
  },

  async scanItem(backendSessionId, barcodeOrSerial, actualLocation) {
    try {
      const response = await api.post(`/api/audit/sessions/${backendSessionId}/scan`, {
        barcodeOrSerial,
        actualLocation,
      });
      return response.data?.data;
    } catch (err) {
      console.warn('[AuditService] Scan item failed:', err.message);
      return null;
    }
  },

  async certifyAuditSession(backendSessionId) {
    try {
      const response = await api.post(`/api/audit/sessions/${backendSessionId}/certify`);
      return transformBackendSession(response.data?.data);
    } catch (err) {
      console.warn('[AuditService] Certify failed:', err.message);
      return null;
    }
  },

  async getCertificate(backendSessionId) {
    try {
      const response = await api.get(`/api/audit/sessions/${backendSessionId}/certificate`);
      return response.data?.data;
    } catch (err) {
      console.warn('[AuditService] Certificate fetch failed:', err.message);
      return null;
    }
  },

  async getDiscrepancies(params = {}) {
    try {
      const response = await api.get('/api/audit/discrepancies', { params });
      const pageData = response.data?.data;
      if (pageData?.content && Array.isArray(pageData.content) && pageData.content.length > 0) {
        return pageData.content.map(transformBackendDiscrepancy);
      }
      return initialDiscrepancies;
    } catch (err) {
      console.warn('[AuditService] Backend unavailable, using cached discrepancies:', err.message);
      return initialDiscrepancies;
    }
  },

  async createDiscrepancy(discData) {
    try {
      const payload = {
        assetTag: discData.assetId,
        assetName: discData.assetName,
        serialNumber: discData.serial,
        branchLocation: discData.branch,
        severity: (discData.severity || 'MEDIUM').toUpperCase(),
        issue: discData.issue,
        reportedBy: discData.reportedBy,
        actionRequired: discData.actionRequired,
      };
      const response = await api.post('/api/audit/discrepancies', payload);
      return transformBackendDiscrepancy(response.data?.data);
    } catch (err) {
      console.warn('[AuditService] Create discrepancy failed:', err.message);
      return discData;
    }
  },

  async resolveDiscrepancy(backendId, remarks) {
    try {
      const response = await api.patch(`/api/audit/discrepancies/${backendId}/resolve`, null, {
        params: { remarks },
      });
      return transformBackendDiscrepancy(response.data?.data);
    } catch (err) {
      console.warn('[AuditService] Resolve discrepancy failed:', err.message);
      return null;
    }
  },
};

export default auditService;

