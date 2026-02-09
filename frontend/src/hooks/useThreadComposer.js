import { useState, useRef, useCallback, useEffect } from 'react'
import { threadsAPI } from '../api/threads.api'
import { uploadsAPI } from '../api/uploads.api'
import { THREAD_MAX_LENGTH } from '../utils/constants'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * Shared logic for composing threads (used by CreateThread & ComposeModal).
 * @param {Function} onCreated — called with the new thread after successful post
 * @param {Function} t — i18next translation function
 * @param {Object} [options]
 * @param {Function} [options.onPostSuccess] — extra callback after post (e.g. close modal)
 */
export function useThreadComposer({ onCreated, t, onPostSuccess }) {
  const { user } = useAuth()
  const defaultVis = user?.defaultVisibility || 'PUBLIC'

  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState([])
  const [visibility, setVisibility] = useState(defaultVis)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const remaining = THREAD_MAX_LENGTH - content.length

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await uploadsAPI.uploadMedia(file)
      setMediaUrls((prev) => [...prev, data.url])
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.uploadFailed'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }, [t])

  const removeMedia = useCallback(async (url) => {
    const filename = url.split('/').pop()
    try { await uploadsAPI.remove(filename) } catch { /* ignore */ }
    setMediaUrls((prev) => prev.filter((u) => u !== url))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && mediaUrls.length === 0) return
    setPosting(true)
    try {
      const { data } = await threadsAPI.create({
        content: content.trim(),
        mediaUrls,
        visibility,
      })
      const newThread = { ...data.thread, likesCount: 0, repliesCount: 0 }
      onCreated?.(newThread)
      setContent('')
      setMediaUrls([])
      setVisibility(defaultVis)
      toast.success(t('thread.threadPostedToast'))
      onPostSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.failedToPost'))
    } finally {
      setPosting(false)
    }
  }, [content, mediaUrls, visibility, defaultVis, onCreated, onPostSuccess, t])

  const cycleVisibility = useCallback(() => {
    setVisibility((v) =>
      v === 'PUBLIC' ? 'FOLLOWERS' : v === 'FOLLOWERS' ? 'PRIVATE' : 'PUBLIC'
    )
  }, [])

  const autoResize = useCallback((e) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }, [])

  const reset = useCallback(() => {
    setContent('')
    setMediaUrls([])
    setVisibility(defaultVis)
  }, [defaultVis])

  const canPost = content.trim().length > 0 || mediaUrls.length > 0
  const hasDraft = content.trim().length > 0 || mediaUrls.length > 0

  // Cleanup orphaned uploads on unmount (user navigated away without posting)
  const mediaUrlsRef = useRef(mediaUrls)
  mediaUrlsRef.current = mediaUrls

  useEffect(() => {
    return () => {
      mediaUrlsRef.current.forEach((url) => {
        const filename = url.split('/').pop()
        uploadsAPI.remove(filename).catch(() => {})
      })
    }
  }, [])

  return {
    content, setContent,
    mediaUrls,
    visibility, setVisibility,
    uploading,
    posting,
    remaining,
    fileInputRef,
    textareaRef,
    handleFileSelect,
    removeMedia,
    handleSubmit,
    cycleVisibility,
    autoResize,
    reset,
    canPost,
    hasDraft,
  }
}
