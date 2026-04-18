import api from './api'

const apiErrorMessage = (error, fallback) => {
  if (!error.response) {
    return (
      error.message ||
      'Cannot reach the API server. Start the backend and set VITE_API_BASE_URL (see .env.example).'
    )
  }
  return error.response?.data?.message || fallback
}

export const authService = {
  async login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      return data
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Login failed'))
    }
  },

  async signup(name, email, password) {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      return data
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Signup failed'))
    }
  },

  async googleAuth(credential) {
    try {
      const response = await api.post('/auth/google', { credential })
      return response.data
    } catch (error) {
      if (!error.response) {
        throw new Error(apiErrorMessage(error, 'Google authentication failed'))
      }
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Google authentication failed'
      throw new Error(message)
    }
  },

  async getCurrentUser() {
    try {
      const { data } = await api.get('/auth/me')
      return data.user
    } catch {
      return null
    }
  },

  async updateProfile(_userId, updates) {
    try {
      const { data } = await api.patch('/auth/profile', updates)
      return data.user
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Failed to update profile'))
    }
  },
}
