import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import AnimatedButton from '../components/AnimatedButton'
import GoogleIdentityLoginButton from '../components/GoogleIdentityLoginButton'
import { useAuthStore } from '../store'
import { authService } from '../services'
import { cn, validateEmail, validatePassword } from '../utils/helpers'

const passwordRequirements = [
  { label: 'At least 6 characters', check: (p) => p.length >= 6 },
  { label: 'Contains a number', check: (p) => /\d/.test(p) },
]

function Signup() {
  const navigate = useNavigate()
  const { login, setLoading, isLoading } = useAuthStore()
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { user, token } = await authService.signup(
        formData.name,
        formData.email,
        formData.password
      )
      login(user, token)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google signup failed. Please try again.')
      return
    }

    setLoading(true)
    setErrors({})
    try {
      const { user, token } = await authService.googleAuth(credentialResponse.credential)
      login(user, token)
      toast.success('Account created with Google!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Google signup failed')
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh flex">
      {/* Left Panel - Visual */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-neon-purple/20 via-neon-cyan/10 to-neon-pink/20" />
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-neon-purple/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-neon-cyan/20 blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            y: [0, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />

        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center neon-glow-purple">
              <User className="h-16 w-16 text-background" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Begin Your Journey</h2>
            <p className="text-muted-foreground">
              Create your account and start preserving memories 
              that will stand the test of time.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="text-background font-bold">MC</span>
            </div>
            <span className="text-xl font-bold text-gradient">Memory Capsule</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Start building your memory vault today
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={cn(
                    'w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                    errors.name ? 'border-destructive' : 'border-glass-border'
                  )}
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.name}
                </motion.p>
              )}
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
                  placeholder="you@example.com"
                  className={cn(
                    'w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                    errors.email ? 'border-destructive' : 'border-glass-border'
                  )}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={cn(
                    'w-full h-12 pl-10 pr-12 rounded-xl bg-secondary/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                    errors.password ? 'border-destructive' : 'border-glass-border'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req) => {
                  const met = req.check(formData.password)
                  return (
                    <div
                      key={req.label}
                      className={cn(
                        'flex items-center gap-2 text-xs transition-colors',
                        met ? 'text-neon-cyan' : 'text-muted-foreground'
                      )}
                    >
                      <Check className={cn('h-3 w-3', met ? 'opacity-100' : 'opacity-30')} />
                      {req.label}
                    </div>
                  )
                })}
              </div>
              
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={cn(
                    'w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                    errors.confirmPassword ? 'border-destructive' : 'border-glass-border'
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
              >
                {errors.submit}
              </motion.div>
            )}

            <AnimatedButton
              type="submit"
              variant="glow"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
              <ArrowRight className="h-5 w-5" />
            </AnimatedButton>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-glass-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {isGoogleEnabled ? (
              <GoogleIdentityLoginButton
                intent="signup"
                onCredential={handleGoogleAuth}
                disabled={isLoading}
                text="signup_with"
              />
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                Set `VITE_GOOGLE_CLIENT_ID` to enable Google signup.
              </p>
            )}

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <button type="button" className="text-primary hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-primary hover:underline">Privacy Policy</button>
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
