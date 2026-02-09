import { formatDistanceToNowStrict, format, isThisYear } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { ar } from 'date-fns/locale/ar'
import i18n from '../i18n'

const LOCALES = { fr, ar }

function getLocaleOption() {
  const lang = i18n.language?.split('-')[0]
  const locale = LOCALES[lang]
  return locale ? { locale } : {}
}

export function timeAgo(date) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return `${diffSec}s`

  const result = formatDistanceToNowStrict(d, { addSuffix: false, ...getLocaleOption() })
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' years', 'y')
    .replace(' year', 'y')

  return result
}

export function fullDate(date) {
  const d = new Date(date)
  if (isThisYear(d)) return format(d, 'MMM d', getLocaleOption())
  return format(d, 'MMM d, yyyy', getLocaleOption())
}

export function fullDateTime(date) {
  return format(new Date(date), 'MMM d, yyyy · h:mm a', getLocaleOption())
}

export function relativeTime(date) {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true, ...getLocaleOption() })
}