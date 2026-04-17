import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Default matches Memory-Capsule-Backend `.env` PORT=6000 when present
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    env.VITE_BACKEND_URL ||
    'http://localhost:6000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
