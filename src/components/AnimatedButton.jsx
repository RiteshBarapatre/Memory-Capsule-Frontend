import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils/helpers'

const variants = {
  primary: 'bg-gradient-to-r from-neon-cyan to-neon-purple text-background hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-glass-border bg-transparent hover:bg-secondary/50',
  ghost: 'hover:bg-secondary/50',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  glow: 'bg-gradient-to-r from-neon-cyan to-neon-purple text-background neon-glow hover:opacity-90',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
}

const AnimatedButton = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

export default AnimatedButton
