import client from './client'

export const settingsAPI = {
  getMe: () => client.get('/settings/me'),
  updateMe: (data) => client.patch('/settings/me', data),
}