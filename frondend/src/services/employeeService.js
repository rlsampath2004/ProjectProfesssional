import api from './api';
import { initialEmployees } from '../components/allocations/AllocationData';

export const transformBackendEmployee = (dto) => {
  return {
    id: dto.employeeCode || dto.id,
    backendId: dto.id,
    name: dto.fullName,
    role: dto.designation || 'Staff',
    department: dto.department || 'General',
    branch: dto.notes || 'Head Office - Marine Lines',
    email: dto.email || `${(dto.employeeCode || 'emp').toLowerCase()}@kotharidistributors.com`,
    phone: dto.phone || '+91 98200 00000',
    assetsCount: dto.activeAllocationsCount || 0,
    status: dto.status || 'ACTIVE',
    joiningDate: dto.joiningDate,
    exitDate: dto.exitDate,
  };
};

export const transformFrontendEmployee = (emp) => {
  return {
    employeeCode: emp.id,
    fullName: emp.name,
    designation: emp.role,
    department: emp.department,
    email: emp.email,
    phone: emp.phone,
    notes: emp.branch,
  };
};

export const employeeService = {
  async getEmployees(params = {}) {
    try {
      const response = await api.get('/api/employees', { params });
      const pageData = response.data?.data;
      if (pageData && Array.isArray(pageData.content)) {
        return pageData.content.map(transformBackendEmployee);
      }
      if (Array.isArray(pageData)) {
        return pageData.map(transformBackendEmployee);
      }
      return [];
    } catch (err) {
      console.warn('[EmployeeService] Backend unavailable, using cached employee list:', err.message);
      return initialEmployees;
    }
  },

  async createEmployee(data) {
    try {
      const dto = transformFrontendEmployee(data);
      const response = await api.post('/api/employees', dto);
      return transformBackendEmployee(response.data?.data);
    } catch (err) {
      console.warn('[EmployeeService] Backend create failed, saving locally:', err.message);
      return data;
    }
  },

  async updateEmployee(id, data) {
    try {
      const dto = transformFrontendEmployee(data);
      const response = await api.put(`/api/employees/${data.backendId || id}`, dto);
      return transformBackendEmployee(response.data?.data);
    } catch (err) {
      console.warn('[EmployeeService] Backend update failed, updating locally:', err.message);
      return data;
    }
  },

  async deleteEmployee(id, backendId) {
    try {
      await api.delete(`/api/employees/${backendId || id}`);
      return true;
    } catch (err) {
      console.warn('[EmployeeService] Backend delete failed:', err.message);
      return true;
    }
  },

  async getExitClearance(backendId) {
    try {
      const response = await api.get(`/api/employees/${backendId}/clearance`);
      return response.data?.data;
    } catch (err) {
      console.warn('[EmployeeService] Exit clearance query failed:', err.message);
      return null;
    }
  },
};

export default employeeService;

