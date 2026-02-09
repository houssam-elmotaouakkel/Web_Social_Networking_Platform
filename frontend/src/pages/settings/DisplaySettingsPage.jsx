import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ChevronDown, Sun, Moon, Monitor, Globe } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const LANGUAGES = [
  { code: 'en', label: 'English', abbr: 'EN' },
  { code: 'fr', label: 'Français', abbr: 'FR' },
  { code: 'ar', label: 'العربية', abbr: 'ع' },
]

const THEME_LABELS = { light: 'settings.lightMode', dark: 'settings.darkMode', auto: 'settings.autoMode' }

export default function DisplaySettingsPage() {
  const { t, i18n } = useTranslation()
  const { mode, setTheme } = useTheme()
  const navigate = useNavigate()
  const isRtl = i18n.dir() === 'rtl'

  const [openSection, setOpenSection] = useState(null)

  const BackChevron = isRtl ? ChevronRight : ChevronLeft

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode)
  }

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  // Current language label
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/settings')}
          className="md:hidden p-1 -ms-1 rounded-full hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <BackChevron size={20} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">{t('settings.categoryDisplay')}</h2>
      </div>

      {/* Appearance block */}
      <section className="border-b border-border">
        <button
          onClick={() => toggleSection('appearance')}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <Sun size={20} className="text-text-secondary shrink-0" />
          <div className="flex-1 text-start min-w-0">
            <p className="text-[15px] font-medium text-text-primary">{t('settings.appearanceSection')}</p>
            <p className="text-xs text-text-muted">{t('settings.appearanceDesc')}</p>
          </div>
          <span className="text-xs text-text-muted me-1">{t(THEME_LABELS[mode])}</span>
          <ChevronDown
            size={18}
            className={`text-text-muted shrink-0 transition-transform duration-200 ${
              openSection === 'appearance' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable content */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            openSection === 'appearance' ? 'max-h-30 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4">
            <div className="flex items-center rounded-xl bg-bg-input border border-border p-1 gap-1">
              {[
                { key: 'light', icon: Sun, labelKey: 'settings.lightMode' },
                { key: 'dark', icon: Moon, labelKey: 'settings.darkMode' },
                { key: 'auto', icon: Monitor, labelKey: 'settings.autoMode' },
              ].map(({ key, icon: Icon, labelKey }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                             text-sm font-medium cursor-pointer transition-all ${
                    mode === key
                      ? 'bg-bg-card text-text-primary shadow-sm border border-border'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{t(labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Language block */}
      <section className="border-b border-border">
        <button
          onClick={() => toggleSection('language')}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <Globe size={20} className="text-text-secondary shrink-0" />
          <div className="flex-1 text-start min-w-0">
            <p className="text-[15px] font-medium text-text-primary">{t('settings.languageSection')}</p>
            <p className="text-xs text-text-muted">{t('settings.languageDesc')}</p>
          </div>
          <span className="text-xs text-text-muted me-1">{currentLang?.label}</span>
          <ChevronDown
            size={18}
            className={`text-text-muted shrink-0 transition-transform duration-200 ${
              openSection === 'language' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable content */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            openSection === 'language' ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 space-y-1">
            {LANGUAGES.map(({ code, label, abbr }) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`w-full flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer transition-colors ${
                  i18n.language === code
                    ? 'bg-accent/10 border border-accent/30'
                    : 'hover:bg-bg-hover'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i18n.language === code
                    ? 'bg-gradient-brand text-white'
                    : 'bg-bg-hover text-text-secondary'
                }`}>
                  {abbr}
                </span>
                <span className={`text-sm font-medium ${
                  i18n.language === code ? 'text-accent' : 'text-text-primary'
                }`}>
                  {label}
                </span>
                {i18n.language === code && (
                  <span className="ms-auto text-accent text-xs font-semibold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="h-20 md:h-0" />
    </div>
  )
}
