import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Send, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "../components/PageTransition";
import AnimatedButton from "../components/AnimatedButton";
import { Skeleton } from "../components/LoadingSkeleton";
import { ghostService } from "../services";
import { cn, formatRelativeTime, formatTimeRemaining } from "../utils/helpers";

function GhostCard({ post, index }) {
  const opacity = Math.max(0.3, 1 - post.fadeLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{
        opacity: opacity,
        y: 0,
        scale: 1,
        filter: `blur(${post.fadeLevel * 2}px)`,
      }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
      }}
      whileHover={{ scale: 1.02, opacity: Math.min(1, opacity + 0.2) }}
      className="glass-card p-5 cursor-default"
      style={{
        opacity,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-pink/30 flex items-center justify-center shrink-0">
          <Ghost className="h-5 w-5 text-neon-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground leading-relaxed">{post.content}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span className="text-neon-pink">
              Fading: {Math.round(post.fadeLevel * 100)}%
            </span>
            {post.timeRemaining != null && (
              <span className="text-neon-cyan">
                Time left: {formatTimeRemaining(post.timeRemaining)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GhostWall() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const data = await ghostService.getPosts();
      setPosts(data);
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Update fade levels periodically
    const interval = setInterval(() => {
      setPosts((currentPosts) => {
        const updated = ghostService.updateFadeLevels(currentPosts);
        return updated.filter((p) => new Date(p.expiresAt) > new Date());
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      const post = await ghostService.createPost(newPost.trim());
      setPosts((prev) => [post, ...prev]);
      setNewPost("");
      toast.success("Your thought has been released");
      inputRef.current?.blur();
    } catch (error) {
      toast.error("Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchPosts();
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 mb-4"
          >
            <Ghost className="h-8 w-8 text-neon-purple" />
          </motion.div>
          <h1 className="text-3xl font-bold">Ghost Wall</h1>
          <p className="text-muted-foreground mt-2">
            Anonymous thoughts that fade with time
          </p>
        </div>

        {/* Post Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card p-4 mb-8"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center shrink-0">
              <Ghost className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an anonymous thought..."
                rows={3}
                maxLength={280}
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span
                  className={cn(
                    "text-xs",
                    newPost.length > 250
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {newPost.length}/280
                </span>
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newPost.trim()}
                  isLoading={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  Release
                </AnimatedButton>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-neon-purple/10 border border-neon-purple/30 mb-6"
        >
          <p className="text-sm text-muted-foreground">
            All posts are anonymous and will gradually fade over 24 hours until
            they disappear completely. No post history is stored.
          </p>
        </motion.div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <AnimatedButton variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </AnimatedButton>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Ghost className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">The wall is empty</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share a thought
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <GhostCard key={post.id} post={post} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Floating Ghost Animation */}
        <div className="fixed bottom-8 right-8 pointer-events-none opacity-20">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Ghost className="h-24 w-24 text-neon-purple" />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default GhostWall;
