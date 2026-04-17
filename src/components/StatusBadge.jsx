import { motion } from 'framer-motion'
import { Lock, Unlock, Clock, Flame } from 'lucide-react'
import { cn } from '../utils/helpers'

const statusConfig = {
  locked: {
    label: 'Locked',
    icon: Lock,
    className: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
  },
  unlocked: {
    label: 'Unlocked',
    icon: Unlock,
    className: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
  },
  expired: {
    label: 'Expired',
    icon: Clock,
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
  destroyed: {
    label: 'Destroyed',
    icon: Flame,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
}

function StatusBadge({ status, size = 'default', showLabel = true }) {
  const config = statusConfig[status] || statusConfig.locked
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && config.label}
    </motion.span>
  )
}

export default StatusBadge
