import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LegalLayout from './LegalLayout'

export default function TermsOfServicePage() {
  const { t } = useTranslation()
  useDocumentTitle('panel.termsOfService')

  return (
    <LegalLayout titleKey="panel.termsOfService">
      <p><strong>{t('legal.lastUpdated')}:</strong> {t('legal.lastUpdatedDate')}</p>

      <h2>{t('legal.tos.acceptanceTitle')}</h2>
      <p>{t('legal.tos.acceptanceText')}</p>

      <h2>{t('legal.tos.accountTitle')}</h2>
      <p>{t('legal.tos.accountText')}</p>
      <ul>
        <li>{t('legal.tos.accountRule1')}</li>
        <li>{t('legal.tos.accountRule2')}</li>
        <li>{t('legal.tos.accountRule3')}</li>
        <li>{t('legal.tos.accountRule4')}</li>
      </ul>

      <h2>{t('legal.tos.contentTitle')}</h2>
      <p>{t('legal.tos.contentText')}</p>
      <ul>
        <li>{t('legal.tos.contentRule1')}</li>
        <li>{t('legal.tos.contentRule2')}</li>
        <li>{t('legal.tos.contentRule3')}</li>
        <li>{t('legal.tos.contentRule4')}</li>
      </ul>

      <h2>{t('legal.tos.intellectualPropertyTitle')}</h2>
      <p>{t('legal.tos.intellectualPropertyText')}</p>

      <h2>{t('legal.tos.terminationTitle')}</h2>
      <p>{t('legal.tos.terminationText')}</p>

      <h2>{t('legal.tos.disclaimerTitle')}</h2>
      <p>{t('legal.tos.disclaimerText')}</p>

      <h2>{t('legal.tos.changesTitle')}</h2>
      <p>{t('legal.tos.changesText')}</p>

      <h2>{t('legal.tos.contactTitle')}</h2>
      <p>{t('legal.tos.contactText')}</p>
    </LegalLayout>
  )
}
