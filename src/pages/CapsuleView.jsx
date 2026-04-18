import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, Unlock, ArrowLeft, Calendar, Eye, 
  Flame, Clock, Trash2, Share2 
} from 'lucide-react'
import { playUIAudio } from '../utils/sound'
import { toast } from 'sonner'
import PageTransition from '../components/PageTransition'
import AnimatedButton from '../components/AnimatedButton'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Skeleton } from '../components/LoadingSkeleton'
import { useCapsuleStore, useAuthStore } from '../store'
import { capsuleService } from '../services'
import { formatDate, getTimeUntilUnlock, getAutoExpireInfo, cn } from '../utils/helpers'

function CapsuleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentCapsule, setCurrentCapsule, updateCapsule, removeCapsule } = useCapsuleStore()
  const { user } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [showDestroyAnimation, setShowDestroyAnimation] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [forceDestroyed, setForceDestroyed] = useState(false)

  useEffect(() => {
    const fetchCapsule = async () => {
      setIsLoading(true);
      try {
        const capsule = await capsuleService.getCapsuleById(id);
        setCurrentCapsule(capsule);
      } catch (error) {
        toast.error("Capsule not found");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCapsule();
  }, [id, setCurrentCapsule, navigate]);

  useEffect(() => {
    if (
      currentCapsule &&
      currentCapsule.status === "unlocked" &&
      currentCapsule.rule === "destroy_after_view" &&
      !forceDestroyed
    ) {
      // Mark as destroyed in the global store list and backend instantly,
      // but keep currentCapsule unchanged locally so the user can read it for as long as they want.
      const destroyedPayload = {
        status: "destroyed",
        destroyedAt: new Date().toISOString(),
      };

      updateCapsule(id, destroyedPayload);

      capsuleService.markCapsuleDestroyed(id).catch((error) => {
        console.error("Failed to mark capsule destroyed:", error);
      });

      setForceDestroyed(true);

      toast.info("This capsule has been opened and will be permanently destroyed when you leave.");
    }
  }, [currentCapsule?.status, currentCapsule?.rule, forceDestroyed, id, updateCapsule]);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const updated = await capsuleService.unlockCapsule(id)
      console.log('Unlock response:', updated)  // Debug log
      setShowUnlockAnimation(true)
      playUIAudio('confirm')
      
      // Display unlock animation
      setTimeout(() => {
        setShowUnlockAnimation(false)
        setCurrentCapsule(updated)
        updateCapsule(id, updated)
        
        // If destroy_after_view, show destruction animation
        if (updated?.rule === 'destroy_after_view' && updated?.status === 'destroyed') {
          console.log('Triggering destroy animation')  // Debug log
          setTimeout(() => {
            playUIAudio('danger')
            setShowDestroyAnimation(true)
            
            // Show the destroy animation for 3 seconds, then reset state
            setTimeout(() => {
              setShowDestroyAnimation(false)
              toast.info('Capsule has been destroyed after viewing')
              
              // Redirect back to dashboard after 2 more seconds
              setTimeout(() => {
                navigate('/dashboard')
              }, 2000)
            }, 3000)
          }, 1000)
        } else {
          console.log('Not destroying - rule:', updated?.rule, 'status:', updated?.status)  // Debug log
        }
      }, 2000)
    } catch (error) {
      toast.error(error.message || 'Cannot unlock yet')
      console.error('Unlock error:', error)
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await capsuleService.deleteCapsule(id);
      removeCapsule(id);
      toast.success("Capsule deleted");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete capsule");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/capsule/${id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentCapsule?.title || 'Memory Capsule',
          text: 'Check out this memory capsule',
          url: shareUrl,
        })
        toast.success('Capsule link shared')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Capsule link copied to clipboard')
      }
    } catch (error) {
      toast.error('Unable to share the link')
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
    );
  }

  if (!currentCapsule) {
    return null;
  }

  const timeInfo = currentCapsule.unlockDate
    ? getTimeUntilUnlock(currentCapsule.unlockDate)
    : { canUnlock: true };
  const expireInfo = currentCapsule.rule === 'auto_expire' ? getAutoExpireInfo(currentCapsule) : null;

  const isLocked = currentCapsule.status === "locked";
  const isDestroyed = currentCapsule.status === "destroyed" || forceDestroyed;
  const canUnlock =
    isLocked &&
    (timeInfo.canUnlock || currentCapsule.rule === "destroy_after_view");

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
                      "0 0 20px var(--neon-cyan)",
                      "0 0 60px var(--neon-cyan)",
                      "0 0 20px var(--neon-cyan)",
                    ],
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center neon-glow"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255, 118, 117, 0.65)",
                      "0 0 60px rgba(255, 118, 117, 0.95)",
                      "0 0 20px rgba(255, 118, 117, 0.65)",
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Flame className="h-16 w-16 text-background" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
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
                  {currentCapsule.rule === "destroy_after_view" &&
                    !isDestroyed && (
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive border border-destructive/30">
                        One-time view
                      </span>
                    )}
                </div>
                <h1 className="text-2xl font-bold">{currentCapsule.title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <AnimatedButton variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </AnimatedButton>
                {currentCapsule?.userId === user?.id && (
                  <AnimatedButton 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </AnimatedButton>
                )}
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
              {expireInfo && currentCapsule.status !== 'expired' && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Clock className="h-4 w-4" />
                  Expires in {expireInfo.text}
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 relative">
            {/* Locked State */}
            {isLocked && (
              <div className="relative">
                <div
                  className={cn(
                    "transition-all duration-300",
                    !canUnlock && "blur-lg select-none pointer-events-none"
                  )}
                >
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
                    <p className="text-lg font-medium mb-1">
                      This capsule is still sealed
                    </p>
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
                    {currentCapsule.rule === "destroy_after_view" && (
                      <p className="text-sm text-destructive mt-3">
                        Warning: This capsule will self-destruct after viewing
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Unlocked State */}
            {currentCapsule.status === "unlocked" && (
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
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCapsule.media.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-xl overflow-hidden bg-secondary"
                      >
                        {item.type === "image" && (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-48 object-cover"
                          />
                        )}
                        {item.type === "audio" && (
                          <div className="p-4 bg-gradient-to-br from-neon-cyan/5 via-neon-purple/5 to-neon-pink/5 border border-glass-border rounded-3xl">
                            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-2xl bg-background/90 border border-glass-border">
                              <span className="text-sm font-semibold text-foreground">
                                Voice Note
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Audio
                              </span>
                            </div>
                            <div className="rounded-3xl overflow-hidden bg-background/95 border border-glass-border">
                              <audio
                                src={item.url}
                                controls
                                className="w-full"
                                preload="metadata"
                              />
                            </div>
                          </div>
                        )}
                        {item.type === "video" && (
                          <div className="p-4 bg-gradient-to-br from-neon-cyan/5 via-neon-purple/5 to-neon-pink/5 border border-glass-border rounded-3xl">
                            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-2xl bg-background/90 border border-glass-border">
                              <span className="text-sm font-semibold text-foreground">
                                Memory Video
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Video
                              </span>
                            </div>
                            <div className="rounded-3xl overflow-hidden bg-background/95 border border-glass-border">
                              <video
                                src={item.url}
                                controls
                                className="w-full h-48 object-cover"
                                preload="metadata"
                              />
                            </div>
                          </div>
                        )}
                        {item.type === "text" && (
                          <div className="p-4 text-sm text-muted-foreground">
                            {item.content || "Text content available"}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Destroyed State */}
            {currentCapsule.status === "destroyed" && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                  <Flame className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Capsule Destroyed
                </h3>
                <p className="text-muted-foreground">
                  This memory has been permanently erased after viewing.
                </p>
              </div>
            )}

            {/* Expired State */}
            {currentCapsule.status === "expired" && (
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
            <AnimatedButton
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton variant="destructive" onClick={handleDelete}>
              Delete
            </AnimatedButton>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}

export default CapsuleView;
