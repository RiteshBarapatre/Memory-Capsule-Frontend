import api from './api'
import { mockUsers, generateToken, delay } from '../utils/mockData'

// Simulated auth service with mock data
export const authService = {
  async login(email, password) {
    await delay(800)
    
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    )
    
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    const { password: _, ...userWithoutPassword } = user
    const token = generateToken()
    
    return { user: userWithoutPassword, token }
  },
  
  async signup(name, email, password) {
    await delay(1000)
    
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error('Email already exists')
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
    }
    
    mockUsers.push({ ...newUser, password })
    const token = generateToken()
    
    return { user: newUser, token }
  },

  async googleAuth(credential) {
    try {
      const response = await api.post('/auth/google', { credential })
      return response.data
    } catch (error) {
      if (!error.response) {
        throw new Error(
          'Cannot reach the API server. Make sure the backend is running and VITE_API_PROXY_TARGET matches its port.'
        )
      }
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Google authentication failed'
      throw new Error(message)
    }
  },
  
  async getCurrentUser() {
    await delay(300)
    return mockUsers[0]
  },
  
  async updateProfile(userId, updates) {
    await delay(500)
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User not found')
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    const { password: _, ...userWithoutPassword } = mockUsers[userIndex]
    return userWithoutPassword
  },
}
