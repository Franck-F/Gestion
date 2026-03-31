import api from './client.js'

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
  getVapidKey: () => api.get('/notifications/vapid-key'),
  subscribePush: (subscription) => api.post('/notifications/push/subscribe', { subscription }),
  unsubscribePush: () => api.post('/notifications/push/unsubscribe'),
  updatePreferences: (data) => api.patch('/notifications/preferences', data),
}
