import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Calendar, Lock, Unlock, Clock, Flame, 
  Edit3, Save, X, LogOut, Settings, Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import AnimatedButton from '../components/AnimatedButton'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { useAuthStore, useCapsuleStore } from '../store'
import { authService } from '../services'
import { formatDate, cn } from '../utils/helpers'

const statsConfig = [
  { key: 'total', label: 'Total Created', icon: Shield, color: 'from-neon-cyan to-neon-purple' },
  { key: 'locked', label: 'Locked', icon: Lock, color: 'from-neon-cyan to-blue-500' },
  { key: 'unlocked', label: 'Opened', icon: Unlock, color: 'from-neon-purple to-purple-500' },
  { key: 'destroyed', label: 'Destroyed', icon: Flame, color: 'from-orange-500 to-red-500' },
]

function Profile() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuthStore()
  const { getCapsuleStats } = useCapsuleStore()
  const stats = getCapsuleStats()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await authService.updateProfile(user.id, formData)
      updateUser(updated)
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and view statistics
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 lg:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-neon-cyan to-neon-purple text-background text-2xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit3 className="h-4 w-4 text-primary-foreground" />
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border border-glass-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border border-glass-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <AnimatedButton
                      variant="primary"
                      onClick={handleSave}
                      isLoading={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </AnimatedButton>
                    <AnimatedButton variant="ghost" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                      Cancel
                    </AnimatedButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        Member since {formatDate(user?.createdAt || new Date())}
                      </p>
                    </div>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </AnimatedButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Capsule Statistics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="glass-card p-4 lg:p-6"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3',
                  stat.color
                )}>
                  <stat.icon className="h-6 w-6 text-background" />
                </div>
                <p className="text-3xl font-bold">{stats[stat.key]}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Memory Journey</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Capsule Keeper Level</span>
                <span className="text-sm font-medium text-neon-cyan">Time Traveler</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">35% to next level: Memory Guardian</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-glass-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-cyan">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Memories Created</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-purple">{stats.unlocked}</p>
                <p className="text-xs text-muted-foreground">Memories Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-pink">
                  {Math.floor((stats.unlocked / Math.max(stats.total, 1)) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Settings</p>
                <p className="text-sm text-muted-foreground">Manage app preferences</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Privacy & Security</p>
                <p className="text-sm text-muted-foreground">Manage your data</p>
              </div>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Log Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default Profile
