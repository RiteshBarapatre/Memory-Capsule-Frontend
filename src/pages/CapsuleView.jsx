import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, Unlock, ArrowLeft, Calendar, Eye, 
  Flame, Clock, Trash2, Share2 
} from 'lucide-react'
import { toast } from 'sonner'
import PageTransition from '../components/PageTransition'
import AnimatedButton from '../components/AnimatedButton'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Skeleton } from '../components/LoadingSkeleton'
import { useCapsuleStore } from '../store'
import { capsuleService } from '../services'
import { formatDate, getTimeUntilUnlock, cn } from '../utils/helpers'

function CapsuleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentCapsule, setCurrentCapsule, updateCapsule, removeCapsule } = useCapsuleStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [showDestroyAnimation, setShowDestroyAnimation] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchCapsule = async () => {
      setIsLoading(true)
      try {
        const capsule = await capsuleService.getCapsuleById(id)
        setCurrentCapsule(capsule)
      } catch (error) {
        toast.error('Capsule not found')
        navigate('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCapsule()
  }, [id, setCurrentCapsule, navigate])

  const handleUnlock = async () => {
    setIsUnlocking(true)
    try {
      const updated = await capsuleService.unlockCapsule(id)
      setShowUnlockAnimation(true)
      
      setTimeout(() => {
        setCurrentCapsule(updated)
        updateCapsule(id, updated)
        setShowUnlockAnimation(false)
        
        if (updated.rule === 'destroy_after_view') {
          setTimeout(() => {
            setShowDestroyAnimation(true)
            setTimeout(() => {
              updateCapsule(id, { status: 'destroyed' })
              setCurrentCapsule({ ...updated, status: 'destroyed' })
              setShowDestroyAnimation(false)
              toast.info('Capsule has been destroyed after viewing')
            }, 3000)
          }, 5000)
        }
      }, 2000)
    } catch (error) {
      toast.error(error.message || 'Cannot unlock yet')
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleDelete = async () => {
    try {
      await capsuleService.deleteCapsule(id)
      removeCapsule(id)
      toast.success('Capsule deleted')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to delete capsule')
    }
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </PageTransition>
    )
  }

  if (!currentCapsule) {
    return null
  }

  const timeInfo = currentCapsule.unlockDate 
    ? getTimeUntilUnlock(currentCapsule.unlockDate) 
    : { canUnlock: true }

  const isLocked = currentCapsule.status === 'locked'
  const isDestroyed = currentCapsule.status === 'destroyed'
  const canUnlock = isLocked && (timeInfo.canUnlock || currentCapsule.rule === 'destroy_after_view')

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vault
        </Link>

        {/* Unlock Animation Overlay */}
        <AnimatePresence>
          {showUnlockAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center neon-glow"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px var(--neon-cyan)',
                      '0 0 60px var(--neon-cyan)',
                      '0 0 20px var(--neon-cyan)',
                    ]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Unlock className="h-16 w-16 text-background" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold mt-6 text-gradient"
                >
                  Unlocking Memory...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Destroy Animation Overlay */}
        <AnimatePresence>
          {showDestroyAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg"
            >
              <motion.div className="text-center">
                <motion.div
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 2.5 }}
                >
                  <Flame className="h-16 w-16 text-background" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="text-2xl font-bold mt-6 text-destructive"
                >
                  Self-Destructing...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capsule Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={currentCapsule.status} size="lg" />
                  {currentCapsule.rule === 'destroy_after_view' && !isDestroyed && (
                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive border border-destructive/30">
                      One-time view
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{currentCapsule.title}</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <AnimatedButton variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </AnimatedButton>
                <AnimatedButton 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </AnimatedButton>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {formatDate(currentCapsule.createdAt)}
              </div>
              {isLocked && currentCapsule.unlockDate && !timeInfo.canUnlock && (
                <div className="flex items-center gap-1 text-neon-cyan">
                  <Clock className="h-4 w-4" />
                  Unlocks in {timeInfo.text}
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 relative">
            {/* Locked State */}
            {isLocked && (
              <div className="relative">
                <div className={cn(
                  'transition-all duration-300',
                  !canUnlock && 'blur-lg select-none pointer-events-none'
                )}>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {currentCapsule.content}
                  </p>
                </div>
                
                {!canUnlock && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-secondary/80 flex items-center justify-center mb-4"
                    >
                      <Lock className="h-10 w-10 text-neon-cyan" />
                    </motion.div>
                    <p className="text-lg font-medium mb-1">This capsule is still sealed</p>
                    <p className="text-sm text-muted-foreground">
                      Unlocks in {timeInfo.text}
                    </p>
                  </div>
                )}
                
                {canUnlock && (
                  <div className="mt-8 text-center">
                    <AnimatedButton
                      variant="glow"
                      size="lg"
                      onClick={handleUnlock}
                      isLoading={isUnlocking}
                    >
                      <Unlock className="h-5 w-5" />
                      Unlock Capsule
                    </AnimatedButton>
                    {currentCapsule.rule === 'destroy_after_view' && (
                      <p className="text-sm text-destructive mt-3">
                        Warning: This capsule will self-destruct after viewing
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Unlocked State */}
            {currentCapsule.status === 'unlocked' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {currentCapsule.content}
                </p>
                
                {/* Media */}
                {currentCapsule.media && currentCapsule.media.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {currentCapsule.media.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-xl overflow-hidden bg-secondary"
                      >
                        {item.type === 'image' && (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-48 object-cover"
                          />
                        )}
                        {item.type === 'audio' && (
                          <div className="h-48 flex items-center justify-center">
                            <div className="text-center">
                              <div className="flex gap-1 items-end justify-center h-8 mb-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <motion.div
                                    key={n}
                                    className="w-2 bg-neon-cyan rounded-full"
                                    animate={{ height: [8, 24, 8] }}
                                    transition={{
                                      duration: 0.6,
                                      repeat: Infinity,
                                      delay: n * 0.1,
                                    }}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">Voice Note</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Destroyed State */}
            {isDestroyed && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                  <Flame className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Capsule Destroyed</h3>
                <p className="text-muted-foreground">
                  This memory has been permanently erased after viewing.
                </p>
              </div>
            )}

            {/* Expired State */}
            {currentCapsule.status === 'expired' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Capsule Expired</h3>
                <p className="text-muted-foreground">
                  This capsule has expired and is no longer accessible.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Capsule"
          description="Are you sure you want to delete this capsule? This action cannot be undone."
        >
          <div className="flex justify-end gap-3 mt-6">
            <AnimatedButton variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </AnimatedButton>
            <AnimatedButton variant="destructive" onClick={handleDelete}>
              Delete
            </AnimatedButton>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}

export default CapsuleView
