import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LegalLayout from './LegalLayout'

export default function CookiePolicyPage() {
  const { t } = useTranslation()
  useDocumentTitle('panel.cookiePolicy')

  return (
    <LegalLayout titleKey="panel.cookiePolicy">
      <p><strong>{t('legal.lastUpdated')}:</strong> {t('legal.lastUpdatedDate')}</p>

      <h2>{t('legal.cookies.whatTitle')}</h2>
      <p>{t('legal.cookies.whatText')}</p>

      <h2>{t('legal.cookies.howTitle')}</h2>
      <p>{t('legal.cookies.howText')}</p>
      <ul>
        <li><strong>{t('legal.cookies.essentialLabel')}</strong> — {t('legal.cookies.essentialText')}</li>
        <li><strong>{t('legal.cookies.preferencesLabel')}</strong> — {t('legal.cookies.preferencesText')}</li>
        <li><strong>{t('legal.cookies.analyticsLabel')}</strong> — {t('legal.cookies.analyticsText')}</li>
      </ul>

      <h2>{t('legal.cookies.thirdPartyTitle')}</h2>
      <p>{t('legal.cookies.thirdPartyText')}</p>

      <h2>{t('legal.cookies.manageTitle')}</h2>
      <p>{t('legal.cookies.manageText')}</p>

      <h2>{t('legal.cookies.contactTitle')}</h2>
      <p>{t('legal.cookies.contactText')}</p>
    </LegalLayout>
  )
}
