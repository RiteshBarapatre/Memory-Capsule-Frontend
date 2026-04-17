import { create } from 'zustand'

const useCapsuleStore = create((set, get) => ({
  capsules: [],
  currentCapsule: null,
  filter: 'all',
  isLoading: false,
  error: null,
  
  setCapsules: (capsules) => {
    set({ capsules, isLoading: false, error: null })
  },
  
  addCapsule: (capsule) => {
    set({ capsules: [capsule, ...get().capsules] })
  },
  
  updateCapsule: (id, updates) => {
    set({
      capsules: get().capsules.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })
  },
  
  removeCapsule: (id) => {
    set({ capsules: get().capsules.filter((c) => c.id !== id) })
  },
  
  setCurrentCapsule: (capsule) => {
    set({ currentCapsule: capsule })
  },
  
  setFilter: (filter) => {
    set({ filter })
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  setError: (error) => {
    set({ error, isLoading: false })
  },
  
  getFilteredCapsules: () => {
    const { capsules, filter } = get()
    if (filter === 'all') return capsules
    return capsules.filter((c) => c.status === filter)
  },
  
  getCapsuleStats: () => {
    const { capsules } = get()
    return {
      total: capsules.length,
      locked: capsules.filter((c) => c.status === 'locked').length,
      unlocked: capsules.filter((c) => c.status === 'unlocked').length,
      expired: capsules.filter((c) => c.status === 'expired').length,
      destroyed: capsules.filter((c) => c.status === 'destroyed').length,
    }
  },
}))

export default useCapsuleStore
