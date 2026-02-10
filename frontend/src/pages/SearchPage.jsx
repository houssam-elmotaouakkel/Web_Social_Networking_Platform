import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { usersAPI } from '../api/users.api'
import { SEARCH_DEBOUNCE_MS } from '../utils/constants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

export default function SearchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useDocumentTitle('nav.search')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!val.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await usersAPI.search(val.trim(), 20)
        setResults(res.data.users)
        setSearched(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setSearched(false)
    inputRef.current?.focus()
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <h2 className="text-xl font-bold text-text-primary">{t('nav.search')}</h2>
      </div>

      {/* Search input */}
      <div className="px-4 py-3">
        <div className="flex items-center bg-bg-input rounded-full px-4 py-3 border border-border focus-within:border-accent transition-colors">
          <Search size={18} className="text-text-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('panel.searchPlaceholder')}
            value={query}
            onChange={handleChange}
            className="bg-transparent text-[15px] text-text-primary placeholder-text-muted outline-none w-full"
          />
          {query && (
            <button onClick={handleClear} className="ml-2 text-text-muted hover:text-text-primary cursor-pointer" aria-label={t('common.close')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size={24} />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            {t('panel.noResultsFor', { query })}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="divide-y divide-border">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => navigate(`/user/${user.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-hover
                           transition-colors cursor-pointer"
              >
                <Avatar src={user.avatarUrl} username={user.username} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-text-primary truncate">
                    {user.username}
                  </p>
                  {user.bio && (
                    <p className="text-sm text-text-muted truncate mt-0.5">{user.bio}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16 text-text-muted text-sm">
            {t('panel.searchPlaceholder')}
          </div>
        )}
      </div>
    </div>
  )
}
