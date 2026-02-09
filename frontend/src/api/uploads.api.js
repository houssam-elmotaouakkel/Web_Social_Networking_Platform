import client from './client'

export const uploadsAPI = {
  uploadMedia: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post('/uploads/thread-media', formData, {
      headers: { 'Content-Type': undefined },
    })
  },
  remove: (filename) => client.delete(`/uploads/${filename}`),
}