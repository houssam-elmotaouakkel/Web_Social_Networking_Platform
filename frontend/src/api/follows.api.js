import client from './client'

export const followsAPI = {
  follow: (userId) => client.post(`/follows/users/${userId}/follow`),
  unfollow: (userId) => client.delete(`/follows/users/${userId}/follow`),
  getStatus: (userId) => client.get(`/follows/users/${userId}/status`),  
  getRequests: () => client.get('/follows/follow-requests'),
  acceptRequest: (requestId) => client.post(`/follows/follow-requests/${requestId}/accept`),
  rejectRequest: (requestId) => client.post(`/follows/follow-requests/${requestId}/reject`),
  getFollowers: (userId, limit = 50) => client.get(`/follows/users/${userId}/followers`, { params: { limit } }),
  getFollowing: (userId, limit = 50) => client.get(`/follows/users/${userId}/following`, { params: { limit } }),
}