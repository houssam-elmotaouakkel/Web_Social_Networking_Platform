import client from './client'

export const feedAPI = {
  get: (params = {}) => client.get('/feed', { params }),
}