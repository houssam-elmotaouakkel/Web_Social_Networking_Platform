import { Component } from 'react'
import { useTranslation } from 'react-i18next'

function ErrorFallbackUI({ onRefresh }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-text-primary">{t('errorBoundary.title')}</h1>
      <p className="text-text-muted text-sm max-w-md">
        {t('errorBoundary.description')}
      </p>
      <button
        onClick={onRefresh}
        className="px-4 py-2 rounded-full bg-gradient-brand text-white text-sm font-medium
                   hover:bg-gradient-brand-hover transition-colors cursor-pointer"
      >
        {t('errorBoundary.refresh')}
      </button>
    </div>
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.handleReset })
      }

      return <ErrorFallbackUI onRefresh={() => window.location.reload()} />
    }

    return this.props.children
  }
}
