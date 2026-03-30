import api from './client.js'

export const eventsApi = {
  list: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  remove: (id) => api.delete(`/events/${id}`),
  getDeadlines: () => api.get('/events/deadlines'),
}
