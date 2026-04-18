import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'

import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CreateCapsule from './pages/CreateCapsule'
import CapsuleView from './pages/CapsuleView'
import GhostWall from './pages/GhostWall'
import MemoryFlow from './pages/MemoryFlow'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateCapsule />} />
              <Route path="/capsule/:id" element={<CapsuleView />} />
              <Route path="/ghost-wall" element={<GhostWall />} />
              <Route path="/memory-flow" element={<MemoryFlow />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
      
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'oklch(0.12 0.015 280 / 0.9)',
            border: '1px solid oklch(0.4 0.1 280 / 0.3)',
            color: 'oklch(0.95 0 0)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </>
  )
}

export default App
