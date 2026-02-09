import client from './client'

export const repostsAPI = {
  getReposted: () => client.get('/reposts'),
  repost: (threadId) => client.post(`/reposts/${threadId}`),
  unrepost: (threadId) => client.delete(`/reposts/${threadId}`),
}
