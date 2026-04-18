import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import AnimatedButton from '../components/AnimatedButton'
import GoogleIdentityLoginButton from '../components/GoogleIdentityLoginButton'
import { useAuthStore } from '../store'
import { authService } from '../services'
import { cn, validateEmail } from '../utils/helpers'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, setLoading, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const from = location.state?.from || '/dashboard'
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { user, token } = await authService.login(formData.email, formData.password)
      login(user, token)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Login failed')
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google login failed. Please try again.')
      return
    }

    setLoading(true)
    setErrors({})
    try {
      const { user, token } = await authService.googleAuth(credentialResponse.credential)
      login(user, token)
      toast.success('Logged in with Google successfully!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Google login failed')
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh flex">
      {/* Left Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="text-background font-bold">MC</span>
            </div>
            <span className="text-xl font-bold text-gradient">Memory Capsule</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your memory vault
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-glass-border bg-secondary/50 text-primary focus:ring-primary/50"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline cursor-pointer">
                Forgot password?
              </button>
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
              Sign In
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
                intent="login"
                onCredential={handleGoogleAuth}
                disabled={isLoading}
                text="signin_with"
              />
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                Set `VITE_GOOGLE_CLIENT_ID` to enable Google login.
              </p>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              to="/signup"
              state={{ from: location.state?.from }}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>

          <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-glass-border">
            <p className="text-xs text-muted-foreground mb-2">Demo credentials:</p>
            <p className="text-sm font-mono">alex@example.com / password123</p>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Visual */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-neon-purple/10 to-neon-pink/20" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-cyan/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-purple/20 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />

        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center neon-glow">
              <Lock className="h-16 w-16 text-background" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Memories Await</h2>
            <p className="text-muted-foreground">
              Access your time capsules and unlock memories from the past. 
              Your vault is secured and waiting.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
