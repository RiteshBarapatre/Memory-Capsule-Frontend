import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  theme: 'dark',
  
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },
  
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },
  
  openModal: (content) => {
    set({ modalOpen: true, modalContent: content })
  },
  
  closeModal: () => {
    set({ modalOpen: false, modalContent: null })
  },
  
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },
}))

export default useUIStore
