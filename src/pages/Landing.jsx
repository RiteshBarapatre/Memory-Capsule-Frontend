import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Clock, Flame, Ghost, Shield, Sparkles } from 'lucide-react'
import AnimatedButton from '../components/AnimatedButton'

const features = [
  {
    icon: Lock,
    title: 'Time-Locked Capsules',
    description: 'Seal your memories until a future date of your choosing.',
  },
  {
    icon: Flame,
    title: 'Self-Destructing Messages',
    description: 'Create capsules that vanish after a single view.',
  },
  {
    icon: Clock,
    title: 'Auto-Expiring Content',
    description: 'Set content to fade away after a duration.',
  },
  {
    icon: Ghost,
    title: 'Ghost Wall',
    description: 'Share anonymous thoughts that slowly disappear.',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Your memories are encrypted and protected.',
  },
  {
    icon: Sparkles,
    title: 'AI Assistance',
    description: 'Let AI help craft the perfect message.',
  },
]

function Landing() {
  return (
    <div className="min-h-screen bg-background gradient-mesh overflow-hidden">
      {/* Hero Section */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="text-background font-bold">MC</span>
            </div>
            <span className="text-xl font-bold text-gradient">Memory Capsule</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/login">
              <AnimatedButton variant="ghost">Sign In</AnimatedButton>
            </Link>
            <Link to="/signup">
              <AnimatedButton variant="primary">Get Started</AnimatedButton>
            </Link>
          </motion.div>
        </nav>
      </header>

      <main>
        {/* Hero Content */}
        <section className="relative px-6 lg:px-12 pt-20 pb-32">
          {/* Floating orbs */}
          <motion.div
            className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-neon-cyan/10 blur-3xl"
            animate={{ 
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-40 right-1/4 w-96 h-96 rounded-full bg-neon-purple/10 blur-3xl"
            animate={{ 
              y: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-glass-border text-sm mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-4 w-4 text-neon-cyan" />
                Preserve Your Memories in Time
              </motion.span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gradient">Seal Today.</span>
                <br />
                <span className="text-foreground">Unlock Tomorrow.</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
                Create digital time capsules that unlock at the perfect moment. 
                Store memories, messages, and moments for your future self or loved ones.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <AnimatedButton variant="glow" size="lg">
                    Start Your Vault
                    <ArrowRight className="h-5 w-5" />
                  </AnimatedButton>
                </Link>
                <Link to="/login">
                  <AnimatedButton variant="outline" size="lg">
                    Sign In
                  </AnimatedButton>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Floating capsule preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl mx-auto mt-20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 rounded-2xl blur-2xl" />
              <div className="relative glass-card p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-neon-cyan" />
                    <span className="text-sm font-medium">Time Capsule</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Unlocks Dec 31, 2025</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Letter to Future Self</h3>
                <p className="text-muted-foreground mb-4 blur-sm select-none">
                  Dear future me, I hope you remembered to chase your dreams...
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-secondary/50" />
                  <div className="w-16 h-16 rounded-lg bg-secondary/50" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-12 py-24 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Features Built for <span className="text-gradient">Your Memories</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to preserve, protect, and share your most precious moments.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center mb-4 group-hover:neon-glow transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-12 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/30 via-neon-purple/30 to-neon-pink/30 rounded-3xl blur-3xl" />
              <div className="relative glass-card p-8 lg:p-12 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Ready to Start Your <span className="text-gradient">Memory Vault</span>?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join thousands of people preserving their precious memories for the future.
                </p>
                <Link to="/signup">
                  <AnimatedButton variant="glow" size="lg">
                    Create Your First Capsule
                    <ArrowRight className="h-5 w-5" />
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-glass-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="text-background font-bold text-sm">MC</span>
            </div>
            <span className="font-semibold">Memory Capsule</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2026 Memory Capsule. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
