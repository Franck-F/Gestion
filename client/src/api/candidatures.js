import api from './client.js'

export const candidaturesApi = {
  list: (params) => api.get('/candidatures', { params }),
  getOne: (id) => api.get(`/candidatures/${id}`),
  create: (data) => api.post('/candidatures', data),
  update: (id, data) => api.patch(`/candidatures/${id}`, data),
  remove: (id) => api.delete(`/candidatures/${id}`),
  updateStatus: (id, status) => api.patch(`/candidatures/${id}/status`, { status }),
  getStats: () => api.get('/candidatures/stats'),
  getReminders: () => api.get('/candidatures/reminders'),

  listContacts: (id) => api.get(`/candidatures/${id}/contacts`),
  createContact: (id, data) => api.post(`/candidatures/${id}/contacts`, data),
  updateContact: (id, contactId, data) => api.patch(`/candidatures/${id}/contacts/${contactId}`, data),
  deleteContact: (id, contactId) => api.delete(`/candidatures/${id}/contacts/${contactId}`),

  uploadAttachment: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/candidatures/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteAttachment: (id, attachmentId) => api.delete(`/candidatures/${id}/attachments/${attachmentId}`),
}
