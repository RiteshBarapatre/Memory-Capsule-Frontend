import { mockCapsules, delay } from '../utils/mockData'

let capsules = [...mockCapsules]

export const capsuleService = {
  async getCapsules() {
    await delay(600)
    return capsules
  },
  
  async getCapsuleById(id) {
    await delay(400)
    const capsule = capsules.find((c) => c.id === id)
    if (!capsule) {
      throw new Error('Capsule not found')
    }
    return capsule
  },
  
  async createCapsule(capsuleData) {
    await delay(800)
    
    const newCapsule = {
      id: `capsule_${Date.now()}`,
      ...capsuleData,
      status: 'locked',
      createdAt: new Date().toISOString(),
      viewCount: 0,
    }
    
    capsules = [newCapsule, ...capsules]
    return newCapsule
  },
  
  async updateCapsule(id, updates) {
    await delay(500)
    const index = capsules.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error('Capsule not found')
    }
    
    capsules[index] = { ...capsules[index], ...updates }
    return capsules[index]
  },
  
  async deleteCapsule(id) {
    await delay(400)
    capsules = capsules.filter((c) => c.id !== id)
    return { success: true }
  },
  
  async unlockCapsule(id) {
    await delay(600)
    const index = capsules.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error('Capsule not found')
    }
    
    const capsule = capsules[index]
    
    // Check if capsule can be unlocked
    if (capsule.unlockDate && new Date(capsule.unlockDate) > new Date()) {
      throw new Error('Capsule is still locked')
    }
    
    capsules[index] = { 
      ...capsule, 
      status: 'unlocked',
      unlockedAt: new Date().toISOString(),
      viewCount: capsule.viewCount + 1,
    }
    
    // Handle one-view capsules
    if (capsule.rule === 'destroy_after_view') {
      setTimeout(() => {
        capsules[index] = { ...capsules[index], status: 'destroyed' }
      }, 5000)
    }
    
    return capsules[index]
  },
  
  async generateAIMessage(prompt) {
    await delay(1500)
    
    const messages = [
      "Time flows like a river, carrying memories that shape who we become. May this capsule remind you of the dreams you once held dear.",
      "In the tapestry of life, each moment is a thread. This capsule preserves a single, precious strand of your story.",
      "The future you will look back at this moment with different eyes. Treasure what matters, release what doesn't.",
      "Some memories are meant to be revisited. Others are meant to transform. Let this capsule be whatever you need it to be.",
      "Across the bridge of time, this message travels to find you. May it bring the wisdom or joy you seek.",
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  },
}
