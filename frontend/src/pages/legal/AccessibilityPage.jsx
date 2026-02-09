import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LegalLayout from './LegalLayout'

export default function AccessibilityPage() {
  const { t } = useTranslation()
  useDocumentTitle('panel.accessibility')

  return (
    <LegalLayout titleKey="panel.accessibility">
      <p><strong>{t('legal.lastUpdated')}:</strong> {t('legal.lastUpdatedDate')}</p>

      <h2>{t('legal.accessibility.commitmentTitle')}</h2>
      <p>{t('legal.accessibility.commitmentText')}</p>

      <h2>{t('legal.accessibility.featuresTitle')}</h2>
      <p>{t('legal.accessibility.featuresText')}</p>
      <ul>
        <li>{t('legal.accessibility.feature1')}</li>
        <li>{t('legal.accessibility.feature2')}</li>
        <li>{t('legal.accessibility.feature3')}</li>
        <li>{t('legal.accessibility.feature4')}</li>
        <li>{t('legal.accessibility.feature5')}</li>
      </ul>

      <h2>{t('legal.accessibility.standardsTitle')}</h2>
      <p>{t('legal.accessibility.standardsText')}</p>

      <h2>{t('legal.accessibility.feedbackTitle')}</h2>
      <p>{t('legal.accessibility.feedbackText')}</p>

      <h2>{t('legal.accessibility.contactTitle')}</h2>
      <p>{t('legal.accessibility.contactText')}</p>
    </LegalLayout>
  )
}
