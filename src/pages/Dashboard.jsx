import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, LayoutGrid, List, Lock, Unlock, Clock, Flame } from 'lucide-react'
import { toast } from 'sonner'
import PageTransition from '../components/PageTransition'
import Timeline from '../components/Timeline'
import AnimatedButton from '../components/AnimatedButton'
import { TimelineSkeleton } from '../components/LoadingSkeleton'
import { useCapsuleStore } from '../store'
import { capsuleService } from '../services'
import { cn } from '../utils/helpers'

const statsConfig = [
  { key: 'total', label: 'Total', icon: LayoutGrid, gradient: 'from-neon-cyan to-neon-purple' },
  { key: 'locked', label: 'Locked', icon: Lock, gradient: 'from-neon-cyan to-blue-500' },
  { key: 'unlocked', label: 'Unlocked', icon: Unlock, gradient: 'from-neon-purple to-purple-500' },
  { key: 'destroyed', label: 'Destroyed', icon: Flame, gradient: 'from-orange-500 to-red-500' },
]

function Dashboard() {
  const { 
    setCapsules, 
    getFilteredCapsules, 
    getCapsuleStats, 
    isLoading, 
    setLoading,
    filter 
  } = useCapsuleStore()
  
  const [viewMode, setViewMode] = useState('grid')
  const capsules = getFilteredCapsules()
  const stats = getCapsuleStats()

  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true)
      try {
        const data = await capsuleService.getCapsules()
        setCapsules(data)
      } catch (error) {
        toast.error('Failed to load capsules')
      }
    }
    fetchCapsules()
  }, [setCapsules, setLoading])

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Vault</h1>
            <p className="text-muted-foreground mt-1">
              Manage your memory capsules
            </p>
          </div>
          <Link to="/create">
            <AnimatedButton variant="glow">
              <Plus className="h-4 w-4" />
              New Capsule
            </AnimatedButton>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 lg:p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                  stat.gradient
                )}>
                  <stat.icon className="h-5 w-5 text-background" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{stats[stat.key]}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {capsules.length} {filter === 'all' ? '' : filter} capsule{capsules.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-secondary/50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'timeline' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Capsules Grid/Timeline */}
        {isLoading ? (
          <TimelineSkeleton count={6} />
        ) : (
          <Timeline capsules={capsules} viewMode={viewMode} />
        )}

        {/* Quick Stats Footer */}
        {!isLoading && capsules.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-8 pt-8 border-t border-glass-border"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-neon-cyan" />
              <span>{stats.locked} awaiting unlock</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{stats.expired} expired</span>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

export default Dashboard
