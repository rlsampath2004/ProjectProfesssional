import api from './api';

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
      if (Array.isArray(data)) {
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
      return [];
    } catch (err) {
      console.warn('[DashboardService] Backend unavailable:', err.message);
      return [];
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

