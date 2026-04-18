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
    const messages = [
      'Time flows like a river, carrying memories that shape who we become. May this capsule remind you of the dreams you once held dear.',
      'In the tapestry of life, each moment is a thread. This capsule preserves a single, precious strand of your story.',
      'The future you will look back at this moment with different eyes. Treasure what matters, release what does not.',
      'Some memories are meant to be revisited. Others are meant to transform. Let this capsule be whatever you need it to be.',
      'Across the bridge of time, this message travels to find you. May it bring the wisdom or joy you seek.',
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  },
}
