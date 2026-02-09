import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function LegalLayout({ titleKey, children }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            aria-label={t('common.goBack')}
            className="p-2 rounded-full hover:bg-bg-hover cursor-pointer transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">{t(titleKey)}</h1>
        </div>

        {/* Content */}
        <article className="prose prose-sm max-w-none
          text-text-secondary
          [&_h2]:text-text-primary [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:text-text-primary [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:mb-3 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
          [&_li]:text-text-secondary
          [&_strong]:text-text-primary
          [&_a]:text-accent [&_a]:hover:underline
        ">
          {children}
        </article>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Nexora
        </div>
      </div>
    </div>
  )
}
