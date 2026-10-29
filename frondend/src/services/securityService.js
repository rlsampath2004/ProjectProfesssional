import api from './api';
import { securityAuditLogs } from '../components/security/SecurityData';

export const transformBackendSecurityEvent = (event) => {
  let type = 'info';
  let status = 'Authorized';

  if (event.severity === 'CRITICAL' || event.eventType.includes('THEFT') || event.eventType.includes('FAILURE')) {
    type = 'danger';
    status = 'Security Alert';
  } else if (event.severity === 'WARN' || event.eventType.includes('LOCKED')) {
    type = 'warning';
    status = 'Restricted';
  } else if (event.eventType.includes('SUCCESS')) {
    type = 'success';
    status = 'Verified';
  }

  return {
    id: event.id ? String(event.id).slice(0, 8).toUpperCase() : `AUD-${Math.floor(Math.random() * 1000)}`,
    backendId: event.id,
    timestamp: event.createdAt ? new Date(event.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN'),
    event: event.details || event.eventType,
    device: event.userAgent ? (event.userAgent.includes('Mobile') ? 'Mobile Terminal' : 'Office Workstation') : 'System Core',
    ip: event.ipAddress || 'Internal Loopback',
    status,
    type,
  };
};

export const securityService = {
  async getSecurityLogs(params = {}) {
    try {
      const response = await api.get('/api/security/events', { params });
      const pageData = response.data?.data;
      if (pageData?.content && Array.isArray(pageData.content) && pageData.content.length > 0) {
        return pageData.content.map(transformBackendSecurityEvent);
      }
      return securityAuditLogs;
    } catch (err) {
      console.warn('[SecurityService] Backend events unavailable, using cached audit logs:', err.message);
      return securityAuditLogs;
    }
  },
};

export default securityService;

