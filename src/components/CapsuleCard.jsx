import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Unlock, Clock, Flame, Eye, Calendar } from 'lucide-react'
import { cn, formatDate, getTimeUntilUnlock, truncateText } from '../utils/helpers'
import StatusBadge from './StatusBadge'

const statusConfig = {
  locked: {
    icon: Lock,
    gradient: 'from-neon-cyan/20 to-neon-cyan/5',
    glow: 'hover:shadow-[0_0_30px_rgba(0,220,220,0.3)]',
  },
  unlocked: {
    icon: Unlock,
    gradient: 'from-neon-purple/20 to-neon-purple/5',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
  },
  expired: {
    icon: Clock,
    gradient: 'from-muted/30 to-muted/10',
    glow: 'hover:shadow-[0_0_20px_rgba(100,100,100,0.2)]',
  },
  destroyed: {
    icon: Flame,
    gradient: 'from-destructive/20 to-destructive/5',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  },
}

function CapsuleCard({ capsule, index = 0 }) {
  const config = statusConfig[capsule.status] || statusConfig.locked
  const StatusIcon = config.icon
  const timeInfo = capsule.unlockDate ? getTimeUntilUnlock(capsule.unlockDate) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
    >
      <Link to={`/capsule/${capsule.id}`}>
        <div
          className={cn(
            'relative p-5 rounded-xl glass-card transition-all duration-300',
            `bg-gradient-to-br ${config.gradient}`,
            config.glow,
            capsule.status === 'destroyed' && 'opacity-60'
          )}
        >
          {/* Status Icon Background */}
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <StatusIcon className="h-20 w-20" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <StatusBadge status={capsule.status} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {capsule.title}
          </h3>

          {/* Content Preview */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {truncateText(capsule.content, 100)}
          </p>

          {/* Media Indicator */}
          {capsule.media && capsule.media.length > 0 && (
            <div className="flex gap-2 mb-4">
              {capsule.media.map((item, i) => (
                <div
                  key={i}
                   className={item.type !== 'text' ? 'w-12 h-12 rounded-lg bg-secondary/50 overflow-hidden' : undefined}
                >
                  {item.type === 'image' && (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.type === 'text' && (<div className="space h-12"></div>
                  )}
                  {item.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex gap-0.5 items-end h-4">
                        {[1, 2, 3, 4].map((n) => (
                          <motion.div
                            key={n}
                            className="w-1 bg-primary rounded-full"
                            animate={{ height: [4, 12, 4] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: n * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-glass-border">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(capsule.createdAt)}
            </div>
            
            {capsule.status === 'locked' && timeInfo && !timeInfo.canUnlock && (
              <div className="flex items-center gap-1 text-neon-cyan">
                <Lock className="h-3 w-3" />
                <span>{timeInfo.text}</span>
              </div>
            )}
            
            {capsule.status === 'locked' && timeInfo?.canUnlock && (
              <span className="text-neon-purple animate-pulse">Ready to unlock</span>
            )}
            
            {capsule.rule === 'destroy_after_view' && capsule.status === 'locked' && (
              <span className="text-destructive">One-time view</span>
            )}
          </div>

          {/* Hover Gradient Effect */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CapsuleCard
