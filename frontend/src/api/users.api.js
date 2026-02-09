import client from './client'

export const usersAPI = {
  getProfile: (userId) => client.get(`/users/${userId}`),
  getThreads: (userId, limit = 30) => client.get(`/users/${userId}/threads`, { params: { limit } }),
  updateMe: (data) => client.patch('/users/me', data),
  updatePrivacy: (isPrivate) => client.patch('/users/me/privacy', { isPrivate }),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return client.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': undefined },
    })
  },
  uploadCover: (file) => {
    const formData = new FormData()
    formData.append('cover', file)
    return client.post('/users/me/cover', formData, {
      headers: { 'Content-Type': undefined },
    })
  },
  search: (q, limit = 10) => client.get('/users/search', { params: { q, limit } }),
  suggestions: (limit = 5) => client.get('/users/suggestions', { params: { limit } }),
}