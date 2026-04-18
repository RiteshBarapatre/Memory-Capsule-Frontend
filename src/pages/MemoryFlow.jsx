import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Lock } from 'lucide-react'
import { toast } from 'sonner'
import PageTransition from '../components/PageTransition'
import AnimatedButton from '../components/AnimatedButton'
import StatusBadge from '../components/StatusBadge'
import { useCapsuleStore, useAuthStore } from '../store'
import { capsuleService } from '../services'
import { formatDate, truncateText } from '../utils/helpers'
import slideshowMusic from '../../lib/slideshowMusic.mp3'

function MemoryFlow() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { capsules, setCapsules } = useCapsuleStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    const fetchCapsules = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const data = await capsuleService.getCapsulesByUserId(user.id)
        setCapsules(data)
        setCurrentIndex(0)
      } catch (error) {
        toast.error('Failed to load your memories')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCapsules()
  }, [setCapsules, user?.id])

  useEffect(() => {
    if (currentIndex >= capsules.length) {
      setCurrentIndex(0)
    }
  }, [capsules.length, currentIndex])

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlay || capsules.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % capsules.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay, capsules.length])

  // Handle audio play/pause based on muted state and autoplay
  useEffect(() => {
    if (!audioRef.current) return

    if (isMuted || !isAutoPlay) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }, [isMuted, isAutoPlay])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + capsules.length) % capsules.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % capsules.length)
  }

  const handleDotClick = (index) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </PageTransition>
    )
  }

  if (capsules.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-xl space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-4xl">🎬</span>
            </motion.div>
            <h2 className="text-3xl font-bold">Memory Flow is empty</h2>
            <p className="text-muted-foreground text-lg">
              You don't have any saved capsules yet. Create your first memory capsule and watch it appear in the Memory Flow.
            </p>
            <AnimatedButton variant="primary" size="lg" onClick={() => navigate('/create')}>
              Create First Capsule
            </AnimatedButton>
          </div>
        </div>
      </PageTransition>
    )
  }

  const currentCapsule = capsules[currentIndex]
  const lockedCount = capsules.filter((c) => c.status === 'locked').length
  const unlockedCount = capsules.filter((c) => c.status === 'unlocked').length
  const destroyedCount = capsules.filter((c) => c.status === 'destroyed').length
  const expiredCount = capsules.filter((c) => c.status === 'expired').length

  return (
    <PageTransition>
      <div className="w-full h-[calc(100vh-5rem)] flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-80 flex-shrink-0 rounded-3xl glass-card border border-glass-border p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-2">
                Memory Flow
              </p>
              <h1 className="text-3xl font-bold">Your Memory Stream</h1>
              <p className="text-sm text-muted-foreground leading-6 mt-2">
                Browse your capsules in a beautifully animated slideshow. Locked capsules are blurred until opened.
              </p>
            </motion.div>

            <div className="grid gap-3">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-glass-border">
                <p className="text-xs text-muted-foreground">Total memories</p>
                <p className="mt-2 text-2xl font-semibold">{capsules.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/30 border border-glass-border grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Unlocked</p>
                  <p className="mt-1 font-semibold">{unlockedCount}</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Locked</p>
                  <p className="mt-1 font-semibold">{lockedCount}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/30 border border-glass-border grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Destroyed</p>
                  <p className="mt-1 font-semibold">{destroyedCount}</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Expired</p>
                  <p className="mt-1 font-semibold">{expiredCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-4 border border-neon-cyan/10">
              <p className="text-sm font-semibold mb-2">Quick tips</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use the controls to move through your memories.</li>
                <li>• Enable autoplay for a hands-free review.</li>
                <li>• Locked memories are blurred until opened in the main vault.</li>
              </ul>
            </div>
            <AnimatedButton onClick={() => navigate('/create')} className="w-full" variant="glow">
              Create New Capsule
            </AnimatedButton>
          </div>
        </div>

        {/* Slideshow Container */}
        <div className="flex-1 relative overflow-hidden rounded-2xl glass-card mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex flex-col items-center justify-center p-12 relative overflow-hidden"
            >
              {/* Background gradient animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-transparent to-neon-purple/20"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              {/* Content */}
              <div className="relative z-10 text-center max-w-2xl">
                {/* Status Badge */}
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="inline-block mb-6"
                >
                  <StatusBadge status={currentCapsule.status} size="lg" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6 text-gradient"
                >
                  {currentCapsule.title}
                </motion.h2>

                {/* Content */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-8"
                >
                  <motion.p
                    className={`text-lg text-muted-foreground leading-relaxed line-clamp-6 transition-all duration-300 ${
                      currentCapsule.status === 'locked' ? 'blur-sm opacity-80 select-none' : ''
                    }`}
                  >
                    {truncateText(currentCapsule.content, 300)}
                  </motion.p>

                  {currentCapsule.status === 'locked' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 text-center rounded-2xl p-4">
                      <Lock className="h-8 w-8 mb-3 text-neon-cyan" />
                      <p className="text-sm font-semibold text-foreground">Locked content</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        This memory is sealed. Open it from your vault to reveal the full message.
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Meta Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"
                >
                  <div className="px-4 py-2 rounded-lg bg-secondary/30 border border-glass-border">
                    Created {formatDate(currentCapsule.createdAt)}
                  </div>
                  {currentCapsule.media && currentCapsule.media.length > 0 && (
                    <div className="px-4 py-2 rounded-lg bg-secondary/30 border border-glass-border">
                      📎 {currentCapsule.media.length} attachment{currentCapsule.media.length > 1 ? 's' : ''}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Navigation Arrows */}
              <motion.button
                onClick={handlePrevious}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Gradient blur effect */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, rgba(0,220,220,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 100%, rgba(168,85,247,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 0%, rgba(0,220,220,0.1) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={slideshowMusic}
          loop
          volume="0.3"
        />

        {/* Controls and Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <AnimatedButton
              variant="ghost"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className=""
            >
              {isAutoPlay ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </AnimatedButton>

            <AnimatedButton
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  Muted
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Sound
                </>
              )}
            </AnimatedButton>

            <div className="text-sm text-muted-foreground px-4 py-2 rounded-lg bg-secondary/30 border border-glass-border">
              {currentIndex + 1} / {capsules.length}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {capsules.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => handleDotClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-neon-cyan to-neon-purple'
                    : 'w-3 bg-secondary hover:bg-secondary/80'
                }`}
              />
            ))}
          </div>

          {/* Current Capsule Title */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{currentCapsule.title}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default MemoryFlow
