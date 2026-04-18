import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'
import { motion } from 'framer-motion'

function ProtectedRoute() {
  const { isAuthenticated, hasHydrated } = useAuthStore()
  const location = useLocation()

  // Wait for store to hydrate from localStorage
  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
