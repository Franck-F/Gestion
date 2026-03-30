import api from './client.js'

export const boursesApi = {
  list: () => api.get('/bourses'),
  getOne: (id) => api.get(`/bourses/${id}`),
  create: (data) => api.post('/bourses', data),
  update: (id, data) => api.patch(`/bourses/${id}`, data),
  remove: (id) => api.delete(`/bourses/${id}`),
  addDoc: (id, data) => api.post(`/bourses/${id}/documents`, data),
  updateDoc: (id, docId, data) => api.patch(`/bourses/${id}/documents/${docId}`, data),
  removeDoc: (id, docId) => api.delete(`/bourses/${id}/documents/${docId}`),
}
