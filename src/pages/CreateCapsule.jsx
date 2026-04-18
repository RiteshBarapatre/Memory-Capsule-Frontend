import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Flame, Clock, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import { playUIAudio } from '../utils/sound'
import { toast } from 'sonner'
import PageTransition from '../components/PageTransition'
import AnimatedButton from '../components/AnimatedButton'
import FileUploader from '../components/FileUploader'
import { useCapsuleStore } from '../store'
import { capsuleService } from '../services'
import { cn, capsuleRules } from '../utils'

const ruleIcons = {
  Calendar,
  Flame,
  Clock,
}

const steps = [
  { id: 1, title: 'Content', description: 'Add your memory' },
  { id: 2, title: 'Rules', description: 'Set unlock conditions' },
  { id: 3, title: 'Review', description: 'Confirm and create' },
]

function CreateCapsule() {
  const navigate = useNavigate()
  const { addCapsule } = useCapsuleStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreateAnimation, setShowCreateAnimation] = useState(false)
  const animationTimeoutRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rule: 'unlock_at_date',
    unlockDate: '',
    expiresAfter: 7,
    media: [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilesChange = (files) => {
    setFormData((prev) => ({ ...prev, media: files }))
  }

  const handleGenerateMessage = async () => {
    // Validate title first
    if (!formData.title.trim()) {
      toast.error('Please add a title first before generating a message')
      return
    }

    setIsGenerating(true)
    try {
      const message = await capsuleService.generateAIMessage(formData.title)
      setFormData((prev) => ({ 
        ...prev, 
        content: prev.content ? `${prev.content}\n\n${message}` : message 
      }))
      toast.success('Message generated!')
    } catch (error) {
      toast.error(error.message || 'Failed to generate message')
    } finally {
      setIsGenerating(false)
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Please add a title')
          return false
        }
        if (!formData.content.trim()) {
          toast.error('Please add some content')
          return false
        }
        return true
      case 2:
        if (formData.rule === 'unlock_at_date' && !formData.unlockDate) {
          toast.error('Please select an unlock date')
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      playUIAudio('step')
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    playUIAudio('step')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const uploadedMedia = await Promise.all(
        formData.media.map(async (item) => {
          if (item.file) {
            const upload = await capsuleService.uploadMedia(item.file, item.type)
            return {
              type: item.type,
              url: upload.url,
              publicId: upload.publicId,
            }
          }

          return {
            type: item.type,
            url: item.url,
          }
        })
      )

      const capsuleData = {
        title: formData.title,
        content: formData.content,
        rule: formData.rule,
        unlockDate: formData.rule === 'unlock_at_date' ? formData.unlockDate : null,
        expiresAfter: formData.rule === 'auto_expire' ? formData.expiresAfter : null,
        media: uploadedMedia,
      }

      const newCapsule = await capsuleService.createCapsule(capsuleData)
      addCapsule(newCapsule)
      toast.success('Capsule created successfully!')
      playUIAudio('confirm')
      setShowCreateAnimation(true)
      animationTimeoutRef.current = window.setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (error) {
      toast.error('Failed to create capsule')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const selectedRule = capsuleRules.find((r) => r.id === formData.rule)

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <AnimatePresence>
          {showCreateAnimation && (
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
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="h-16 w-16 text-background" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold mt-6 text-gradient"
                >
                  Sealing Capsule...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Capsule</h1>
          <p className="text-muted-foreground mt-1">
            Seal a memory for the future
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                      currentStep >= step.id
                        ? 'bg-gradient-to-br from-neon-cyan to-neon-purple text-background'
                        : 'bg-secondary text-muted-foreground'
                    )}
                    animate={currentStep === step.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {step.id}
                  </motion.div>
                  <span className={cn(
                    'text-sm mt-2 hidden sm:block',
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-16 sm:w-24 lg:w-32 mx-2',
                    currentStep > step.id ? 'bg-primary' : 'bg-secondary'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="glass-card p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Content */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Give your capsule a name..."
                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-glass-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Message</label>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateMessage}
                      isLoading={isGenerating}
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Generate
                    </AnimatedButton>
                  </div>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your message to the future..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-glass-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachments</label>
                  <FileUploader onFilesChange={handleFilesChange} />
                </div>
              </motion.div>
            )}

            {/* Step 2: Rules */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="text-sm font-medium">Unlock Rule</label>
                  <div className="grid gap-3">
                    {capsuleRules.map((rule) => {
                      const Icon = ruleIcons[rule.icon]
                      return (
                        <motion.button
                          key={rule.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, rule: rule.id }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-xl border transition-all text-left',
                            formData.rule === rule.id
                              ? 'border-primary bg-primary/10'
                              : 'border-glass-border hover:border-primary/50'
                          )}
                        >
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                            formData.rule === rule.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">{rule.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {rule.description}
                            </p>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Conditional inputs based on rule */}
                <AnimatePresence mode="wait">
                  {formData.rule === 'unlock_at_date' && (
                    <motion.div
                      key="date-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium">Unlock Date</label>
                      <input
                        type="datetime-local"
                        name="unlockDate"
                        value={formData.unlockDate}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full h-12 px-4 rounded-xl bg-primary/10 border border-primary/30 text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
                      />
                    </motion.div>
                  )}

                  {formData.rule === 'auto_expire' && (
                    <motion.div
                      key="expire-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium">Expires After (days)</label>
                      <input
                        type="number"
                        name="expiresAfter"
                        value={formData.expiresAfter}
                        onChange={handleChange}
                        min={1}
                        max={365}
                        className="w-full h-12 px-4 rounded-xl bg-primary/10 border border-primary/30 text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 [&::-webkit-outer-spin-button]:text-foreground [&::-webkit-inner-spin-button]:text-foreground"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-xl bg-secondary/30 border border-glass-border space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium text-lg">{formData.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="text-foreground whitespace-pre-wrap">{formData.content}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Rule</p>
                    <p className="font-medium">{selectedRule?.label}</p>
                    {formData.rule === 'unlock_at_date' && formData.unlockDate && (
                      <p className="text-sm text-neon-cyan">
                        Unlocks: {new Date(formData.unlockDate).toLocaleString()}
                      </p>
                    )}
                    {formData.rule === 'auto_expire' && (
                      <p className="text-sm text-muted-foreground">
                        Expires after {formData.expiresAfter} days
                      </p>
                    )}
                    {formData.rule === 'destroy_after_view' && (
                      <p className="text-sm text-destructive">
                        Will be destroyed after first view
                      </p>
                    )}
                  </div>
                  
                  {formData.media.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Attachments</p>
                      <p className="font-medium">{formData.media.length} file(s)</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
                  <p className="text-sm text-neon-cyan">
                    Once created, your capsule will be sealed and the rules cannot be changed.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-glass-border">
            {currentStep > 1 ? (
              <AnimatedButton variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </AnimatedButton>
            ) : (
              <div />
            )}
            
            {currentStep < 3 ? (
              <AnimatedButton variant="primary" onClick={nextStep}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </AnimatedButton>
            ) : (
              <AnimatedButton
                variant="glow"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Create Capsule
                <ArrowRight className="h-4 w-4" />
              </AnimatedButton>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default CreateCapsule
