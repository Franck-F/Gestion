import api from './client.js'

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getUpcomingDeadlines: () => api.get('/dashboard/upcoming-deadlines'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
}
