import { mockGhostPosts, delay } from '../utils/mockData'

let ghostPosts = [...mockGhostPosts]

export const ghostService = {
  async getPosts() {
    await delay(500)
    // Return posts that haven't expired
    return ghostPosts.filter((p) => new Date(p.expiresAt) > new Date())
  },
  
  async createPost(content) {
    await delay(600)
    
    const newPost = {
      id: `ghost_${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      fadeLevel: 0,
    }
    
    ghostPosts = [newPost, ...ghostPosts]
    return newPost
  },
  
  // Simulate fade effect over time
  updateFadeLevels() {
    ghostPosts = ghostPosts.map((post) => {
      const age = Date.now() - new Date(post.createdAt).getTime()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      const fadeLevel = Math.min(age / maxAge, 1)
      return { ...post, fadeLevel }
    })
    return ghostPosts
  },
}
