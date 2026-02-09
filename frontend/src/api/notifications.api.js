import client from './client'

export const notificationsAPI = {
  list: (params = {}) => client.get('/notifications', { params }),
  unreadCount: () => client.get('/notifications/unread-count'),
  markRead: (notificationId) => client.patch(`/notifications/${notificationId}/read`),
  markAllRead: () => client.patch('/notifications/read-all'),
  deleteAll: () => client.delete('/notifications'),
}