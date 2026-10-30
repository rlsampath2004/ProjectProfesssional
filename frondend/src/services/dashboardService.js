import api from './api';

export const initialTasksList = [
  {
    id: '1',
    title: 'Sign off quarterly IT physical stocktake for Branch B',
    priority: 'CRITICAL',
    category: 'IT ASSETS',
    due: 'TODAY 17:00',
    completed: false
  },
  {
    id: '2',
    title: 'Verify OLX payment received for 2 sold Lenovo ThinkPads',
    priority: 'HIGH',
    category: 'OLX SALES',
    due: 'TODAY 18:30',
    completed: false
  },
  {
    id: '3',
    title: 'Approve allocation of Dell 24" Monitors to Billing Desk',
    priority: 'NORMAL',
    category: 'IT ASSETS',
    due: 'TODAY 19:00',
    completed: true
  },
  {
    id: '4',
    title: 'Review weekly hours report and overtime entries',
    priority: 'NORMAL',
    category: 'OPERATIONS',
    due: 'TOMORROW 10:00',
    completed: true
  },
  {
    id: '5',
    title: 'Import latest vendor hardware invoices via Excel',
    priority: 'HIGH',
    category: 'OPERATIONS',
    due: 'TOMORROW 14:00',
    completed: true
  }
];

export const dashboardService = {
  async getOverview() {
    try {
      const response = await api.get('/api/dashboard/overview');
      return response.data?.data;
    } catch (err) {
      console.warn('[DashboardService] Could not fetch live overview:', err.message);
      return null;
    }
  },

  async getTasks() {
    try {
      const response = await api.get('/api/tasks');
      const data = response.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          category: t.category,
          due: t.due,
          completed: t.completed,
          completedAt: t.completedAt
        }));
      }
      return initialTasksList;
    } catch (err) {
      console.warn('[DashboardService] Backend unavailable, using cached tasks:', err.message);
      return initialTasksList;
    }
  },

  async createTask(taskData) {
    try {
      const response = await api.post('/api/tasks', taskData);
      const t = response.data?.data;
      return {
        id: t.id,
        title: t.title,
        priority: t.priority,
        category: t.category,
        due: t.due,
        completed: t.completed,
      };
    } catch (err) {
      console.warn('[DashboardService] Fallback to local task create:', err.message);
      return {
        ...taskData,
        id: `TASK-${Date.now()}`,
        completed: false
      };
    }
  },

  async toggleTask(id) {
    try {
      const response = await api.patch(`/api/tasks/${id}/toggle`);
      const t = response.data?.data;
      return t?.completed;
    } catch (err) {
      console.warn('[DashboardService] Fallback to local task toggle:', err.message);
      return null;
    }
  },

  async deleteTask(id) {
    try {
      await api.delete(`/api/tasks/${id}`);
      return true;
    } catch (err) {
      console.warn('[DashboardService] Fallback to local task delete:', err.message);
      return true;
    }
  }
};

export default dashboardService;

