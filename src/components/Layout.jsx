import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useUIStore } from '../store'
import { playUIAudio } from '../utils/sound'

function Layout() {
  const { sidebarOpen } = useUIStore()
  const location = useLocation()
  const firstRouteRender = useRef(true)

  useEffect(() => {
    if (firstRouteRender.current) {
      firstRouteRender.current = false
      return
    }
    playUIAudio('tab')
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <motion.main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-20'
          } mt-16 min-h-[calc(100vh-4rem)]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export default Layout
