import { motion } from 'framer-motion'
import CapsuleCard from './CapsuleCard'

function Timeline({ capsules, viewMode = 'grid' }) {
  if (capsules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">No capsules found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first memory capsule to get started
        </p>
      </motion.div>
    )
  }

  if (viewMode === 'timeline') {
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan via-neon-purple to-neon-pink opacity-30" />
        
        <div className="space-y-6">
          {capsules.map((capsule, index) => (
            <motion.div
              key={capsule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple border-2 border-background" />
              
              <CapsuleCard capsule={capsule} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {capsules.map((capsule, index) => (
        <CapsuleCard key={capsule.id} capsule={capsule} index={index} />
      ))}
    </div>
  )
}

export default Timeline
