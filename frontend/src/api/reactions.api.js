import client from './client'

export const reactionsAPI = {
  toggleLike: (targetType, targetId) =>
    client.post('/reactions/toggle-like', { targetType, targetId }),
}