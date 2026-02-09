import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Sets document.title reactively using a translation key.
 * Falls back to "Nexora" when no suffix is provided.
 */
export function useDocumentTitle(titleKey) {
  const { t } = useTranslation()

  useEffect(() => {
    const base = 'Nexora'
    document.title = titleKey ? `${t(titleKey)} · ${base}` : base
  }, [titleKey, t])
}
