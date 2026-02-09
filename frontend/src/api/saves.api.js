import client from './client'

export const savesAPI = {
  getSaved: () => client.get('/saves'),
  save: (threadId) => client.post(`/saves/${threadId}`),
  unsave: (threadId) => client.delete(`/saves/${threadId}`),
}
