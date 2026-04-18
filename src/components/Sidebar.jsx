import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Ghost, 
  User, 
  Lock, 
  Unlock, 
  Clock, 
  Flame 
} from 'lucide-react'
import { useUIStore, useCapsuleStore } from '../store'
import { cn } from '../utils/helpers'
import { playUIAudio } from '../utils/sound'

const navItems = [
  { path: '/dashboard', label: 'Vault', icon: LayoutDashboard },
  { path: '/create', label: 'Create Capsule', icon: PlusCircle },
  { path: '/ghost-wall', label: 'Ghost Wall', icon: Ghost },
  { path: '/profile', label: 'Profile', icon: User },
]

const filterItems = [
  { filter: 'all', label: 'All Capsules', icon: LayoutDashboard },
  { filter: 'locked', label: 'Locked', icon: Lock },
  { filter: 'unlocked', label: 'Unlocked', icon: Unlock },
  { filter: 'expired', label: 'Expired', icon: Clock },
  { filter: 'destroyed', label: 'Destroyed', icon: Flame },
]

function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const { filter, setFilter, getCapsuleStats } = useCapsuleStore()
  const stats = getCapsuleStats()
  const location = useLocation()
  const isVaultActive = location.pathname === '/dashboard'

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] glass border-r border-glass-border z-40 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-secondary/50',
                  isActive && 'bg-primary/10 text-primary neon-glow',
                  !sidebarOpen && 'justify-center'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        <AnimatePresence>
          {isVaultActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-glass-border"
            >
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Filters
                  </motion.h4>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {filterItems.map((item) => {
                  const count = item.filter === 'all' ? stats.total : stats[item.filter]
                  return (
                    <button
                      key={item.filter}
                      onClick={() => {
                        setFilter(item.filter)
                        playUIAudio('step')
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                        'hover:bg-secondary/50',
                        filter === item.filter && 'bg-accent/20 text-accent',
                        !sidebarOpen && 'justify-center'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex items-center justify-between flex-1 overflow-hidden"
                          >
                            <span className="text-sm whitespace-nowrap">{item.label}</span>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              {count}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-4">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-4 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-glass-border"
              >
                <p className="text-xs text-muted-foreground mb-2">Storage used</p>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">45% of 10GB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar