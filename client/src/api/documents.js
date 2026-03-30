import api from './client.js'

export const documentsApi = {
  list: (params) => api.get('/documents', { params }),
  getOne: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.patch(`/documents/${id}`, data),
  remove: (id) => api.delete(`/documents/${id}`),
  addVersion: (id, file, versionLabel) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('versionLabel', versionLabel)
    return api.post(`/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteVersion: (id, versionId) => api.delete(`/documents/${id}/versions/${versionId}`),
}
