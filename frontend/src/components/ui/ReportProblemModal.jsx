import { useState, useRef, useEffect } from 'react'
import { X, Paperclip, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { reportAPI } from '../../api/report.api'
import toast from 'react-hot-toast'

export default function ReportProblemModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [sending, setSending] = useState(false)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(t('report.fileTooLarge'))
        return
      }
      setFile(f)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!message.trim()) return

    setSending(true)
    try {
      const formData = new FormData()
      formData.append('message', message.trim())
      if (file) formData.append('screenshot', file)

      await reportAPI.submit(formData)
      toast.success(t('report.sentSuccess'))
      setMessage('')
      setFile(null)
      onClose()
    } catch {
      toast.error(t('report.sentError'))
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-bold text-text-primary text-center mb-4">
          {t('report.title')}
        </h2>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-bg-card/95 backdrop-blur-xl p-1">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('report.placeholder')}
            maxLength={2000}
            rows={6}
            className="w-full bg-transparent text-text-primary placeholder-text-muted
                       text-sm resize-none p-4 outline-none"
          />

          {/* Preview */}
          {preview && (
            <div className="px-4 pb-2">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="preview"
                  className="h-20 rounded-lg border border-border object-cover"
                />
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-bg-primary border border-border
                             rounded-full flex items-center justify-center cursor-pointer
                             hover:bg-danger hover:border-danger hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            {/* Attachment button */}
            <button
              onClick={() => fileRef.current?.click()}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              title={t('report.attachFile')}
            >
              <Paperclip size={20} />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
              className="px-5 py-1.5 rounded-full text-sm font-medium
                         text-text-muted border border-border
                         hover:text-text-primary hover:border-text-muted
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all cursor-pointer"
            >
              {sending ? t('report.sending') : t('report.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
