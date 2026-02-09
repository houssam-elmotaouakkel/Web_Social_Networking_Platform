import client from './client'

export const reportAPI = {
  submit: (formData) =>
    client.post('/report', formData, {
      headers: { 'Content-Type': undefined },
    }),
}
