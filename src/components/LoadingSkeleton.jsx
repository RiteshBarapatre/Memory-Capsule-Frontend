import { motion } from 'framer-motion'
import { cn } from '../utils/helpers'

function Skeleton({ className }) {
  return (
    <motion.div
      className={cn(
        'rounded-lg bg-secondary/50 animate-pulse',
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

function CapsuleCardSkeleton() {
  return (
    <div className="p-5 rounded-xl glass-card">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-8" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-glass-border">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

function TimelineSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CapsuleCardSkeleton key={i} />
      ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export { Skeleton, CapsuleCardSkeleton, TimelineSkeleton, ProfileSkeleton, FormSkeleton }
export default TimelineSkeleton
