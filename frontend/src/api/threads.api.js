import client from './client'

export const threadsAPI = {
  create: (data) => client.post('/threads', data),
  getOne: (threadId) => client.get(`/threads/${threadId}`),
  reply: (threadId, data) => client.post(`/threads/${threadId}/replies`, data),
  remove: (threadId) => client.delete(`/threads/${threadId}`),
  removeReply: (replyId) => client.delete(`/threads/replies/${replyId}`),
  trending: (limit = 5) => client.get('/threads/trending', { params: { limit } }),
  updateVisibility: (threadId, visibility) =>
    client.patch(`/threads/${threadId}/visibility`, { visibility }),
  archive: (threadId) => client.patch(`/threads/${threadId}/archive`),
  unarchive: (threadId) => client.patch(`/threads/${threadId}/unarchive`),
  getArchived: () => client.get('/threads/me/archived'),
}