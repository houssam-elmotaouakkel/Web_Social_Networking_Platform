import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel, variant = 'danger' }) {
  const { t } = useTranslation()
  const cancelRef = useRef(null)

  useEffect(() => {
    if (isOpen) cancelRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
         onClick={onCancel} role="dialog" aria-modal="true">
      <div className="bg-bg-primary border border-border rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4"
           onClick={(e) => e.stopPropagation()}>
        <p className="text-text-primary text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary
                       rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <Button
            onClick={onConfirm}
            className={variant === 'danger'
              ? 'bg-danger hover:bg-red-600 text-white'
              : ''}
            size="sm"
          >
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
