import api from './client.js'

export const objectivesApi = {
  list: () => api.get('/objectives'),
  getOne: (id) => api.get(`/objectives/${id}`),
  create: (data) => api.post('/objectives', data),
  update: (id, data) => api.patch(`/objectives/${id}`, data),
  remove: (id) => api.delete(`/objectives/${id}`),
  checkIn: (id) => api.post(`/objectives/${id}/check-in`),
  createMilestone: (id, data) => api.post(`/objectives/${id}/milestones`, data),
  updateMilestone: (id, milestoneId, data) => api.patch(`/objectives/${id}/milestones/${milestoneId}`, data),
  deleteMilestone: (id, milestoneId) => api.delete(`/objectives/${id}/milestones/${milestoneId}`),
  reorderMilestones: (id, milestoneIds) => api.patch(`/objectives/${id}/milestones/reorder`, { milestoneIds }),
}
