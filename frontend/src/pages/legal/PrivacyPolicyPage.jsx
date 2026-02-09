import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LegalLayout from './LegalLayout'

export default function PrivacyPolicyPage() {
  const { t } = useTranslation()
  useDocumentTitle('panel.privacyPolicy')

  return (
    <LegalLayout titleKey="panel.privacyPolicy">
      <p><strong>{t('legal.lastUpdated')}:</strong> {t('legal.lastUpdatedDate')}</p>

      <h2>{t('legal.privacy.introTitle')}</h2>
      <p>{t('legal.privacy.introText')}</p>

      <h2>{t('legal.privacy.collectTitle')}</h2>
      <p>{t('legal.privacy.collectText')}</p>
      <ul>
        <li>{t('legal.privacy.collectItem1')}</li>
        <li>{t('legal.privacy.collectItem2')}</li>
        <li>{t('legal.privacy.collectItem3')}</li>
        <li>{t('legal.privacy.collectItem4')}</li>
      </ul>

      <h2>{t('legal.privacy.useTitle')}</h2>
      <p>{t('legal.privacy.useText')}</p>
      <ul>
        <li>{t('legal.privacy.useItem1')}</li>
        <li>{t('legal.privacy.useItem2')}</li>
        <li>{t('legal.privacy.useItem3')}</li>
        <li>{t('legal.privacy.useItem4')}</li>
      </ul>

      <h2>{t('legal.privacy.sharingTitle')}</h2>
      <p>{t('legal.privacy.sharingText')}</p>

      <h2>{t('legal.privacy.securityTitle')}</h2>
      <p>{t('legal.privacy.securityText')}</p>

      <h2>{t('legal.privacy.rightsTitle')}</h2>
      <p>{t('legal.privacy.rightsText')}</p>
      <ul>
        <li>{t('legal.privacy.rightsItem1')}</li>
        <li>{t('legal.privacy.rightsItem2')}</li>
        <li>{t('legal.privacy.rightsItem3')}</li>
        <li>{t('legal.privacy.rightsItem4')}</li>
      </ul>

      <h2>{t('legal.privacy.retentionTitle')}</h2>
      <p>{t('legal.privacy.retentionText')}</p>

      <h2>{t('legal.privacy.contactTitle')}</h2>
      <p>{t('legal.privacy.contactText')}</p>
    </LegalLayout>
  )
}
