import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'
import AnimatedButton from '../components/AnimatedButton'
import { authService } from '../services'
import { cn, validateEmail } from '../utils/helpers'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    } else if (!validateEmail(email)) {
      setError('Invalid email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await authService.forgotPassword(email)
      setIsSent(true)
      toast.success('Password reset email sent!')
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl bg-secondary/30 border border-glass-border backdrop-blur-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center neon-glow">
            <Mail className="h-8 w-8 text-background" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">
            {isSent 
              ? "We've sent a password reset link to your email." 
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="you@example.com"
                  className={cn(
                    'w-full h-12 pl-10 pr-4 rounded-xl bg-background/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                    error ? 'border-destructive' : 'border-glass-border'
                  )}
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <AnimatedButton
              type="submit"
              variant="glow"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Link
              <Send className="h-5 w-5" />
            </AnimatedButton>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <AnimatedButton
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setIsSent(false)}
            >
              Try another email
            </AnimatedButton>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
