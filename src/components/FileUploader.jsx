import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image, Mic, File } from 'lucide-react'
import { cn } from '../utils/helpers'

function FileUploader({ 
  accept = 'image/*,audio/*', 
  multiple = true, 
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesChange,
  className 
}) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFiles = (newFiles) => {
    setError(null)
    
    const validFiles = Array.from(newFiles).filter((file) => {
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB limit`)
        return false
      }
      return true
    })

    const totalFiles = files.length + validFiles.length
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const filesWithPreview = validFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}`,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : null,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('audio/') ? 'audio' : 'file',
    }))

    const updatedFiles = [...files, ...filesWithPreview]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (id) => {
    const updatedFiles = files.filter((f) => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return Image
      case 'audio': return Mic
      default: return File
    }
  }

  return (
    <div className={className}>
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-glass-border hover:border-primary/50 hover:bg-secondary/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <motion.div
          animate={{ y: isDragging ? -5 : 0 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images and voice notes (max {maxSize / 1024 / 1024}MB each)
            </p>
          </div>
        </motion.div>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive mt-2"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((item) => {
              const FileIcon = getFileIcon(item.type)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-glass-border"
                >
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(item.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUploader
