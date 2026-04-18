import api from './api.js'

export const capsuleService = {
  async getCapsules() {
    const response = await api.get('/capsules')
    return response.data?.data || []
  },

  async getCapsulesByUserId(userId) {
    if (!userId) {
      return []
    }
    const response = await api.get(`/capsules/user/${userId}`)
    return response.data?.data || []
  },

  async getCapsuleById(id) {
    const response = await api.get(`/capsules/${id}`)
    return response.data?.data
  },

  async createCapsule(capsuleData) {
    const response = await api.post('/capsules', capsuleData)
    return response.data?.data
  },

  async uploadMedia(file, type) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data?.data
  },

  async unlockCapsule(id) {
    const response = await api.patch(`/capsules/${id}/unlock`)
    return response.data?.data
  },

  async markCapsuleDestroyed(id) {
    const response = await api.patch(`/capsules/${id}/destroy`)
    return response.data?.data
  },

  async deleteCapsule(id) {
    await api.delete(`/capsules/${id}`)
    return { success: true }
  },

  async generateAIMessage(prompt) {
    try {
      const response = await api.post('/capsules/generate-message', { prompt })
      return response.data?.data?.message || response.data?.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate message with AI')
    }
  },
}
