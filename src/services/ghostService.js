import api from './api.js'

export const ghostService = {
  async getPosts() {
    try {
      const response = await api.get('/ghost-posts')
      if (response.data.success) {
        // Map backend response to frontend format
        const posts = response.data.data.map(post => ({
          ...post,
          fadeLevel: post.currentFadeLevel ?? 0,
          timeRemaining: post.timeRemaining ?? 0,
        }))
        return posts
      }
      throw new Error('Failed to fetch ghost posts')
    } catch (error) {
      console.error('Error fetching ghost posts:', error)
      throw error
    }
  },

  async createPost(content, expiresAt) {
    try {
      if (!expiresAt) {
        throw new Error('Expiration time is required')
      }

      const response = await api.post('/ghost-posts', {
        content,
        expiresAt,
        fadeLevel: 0
      })

      if (response.data.success) {
        // Map backend response to frontend format
        const post = {
          ...response.data.data,
          fadeLevel: 0, // New posts start with 0 fade
        }
        return post
      }
      throw new Error('Failed to create ghost post')
    } catch (error) {
      console.error('Error creating ghost post:', error)
      throw error
    }
  },

  async deletePost(postId) {
    try {
      const response = await api.delete(`/ghost-posts/${postId}`)
      if (response.data.success) {
        return true
      }
      throw new Error('Failed to delete ghost post')
    } catch (error) {
      console.error('Error deleting ghost post:', error)
      throw error
    }
  },

  // Simulate fade effect over time (client-side calculation)
  updateFadeLevels(posts) {
    return posts.map((post) => {
      const now = new Date()
      const createdTime = new Date(post.createdAt).getTime()
      const expiresTime = new Date(post.expiresAt).getTime()
      const totalDuration = expiresTime - createdTime
      const elapsedTime = now.getTime() - createdTime
      const progress = Math.min(elapsedTime / totalDuration, 1)

      return {
        ...post,
        fadeLevel: Math.round(progress * 100) / 100, // Add fadeLevel for frontend compatibility
        currentFadeLevel: Math.round(progress * 100) / 100,
        timeRemaining: Math.max(expiresTime - now.getTime(), 0)
      }
    })
  },
}
