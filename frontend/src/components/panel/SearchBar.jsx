import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { usersAPI } from '../../api/users.api'
import { SEARCH_DEBOUNCE_MS } from '../../utils/constants'
import Avatar from '../ui/Avatar'

export default function SearchBar() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const navigate = useNavigate()
  const ref = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!val.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await usersAPI.search(val.trim(), 8)
        setResults(res.data.users)
        setOpen(true)
        setHighlightedIndex(-1)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  function handleSelect(userId) {
    setOpen(false)
    setQuery('')
    setResults([])
    navigate(`/user/${userId}`)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setOpen(false)
    setHighlightedIndex(-1)
  }

  function handleKeyDown(e) {
    if (!open || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i < results.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i > 0 ? i - 1 : results.length - 1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[highlightedIndex].id)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-bg-input rounded-full px-4 py-2.5 border border-border focus-within:border-accent transition-colors">
        <Search size={16} className="text-text-muted mr-3 shrink-0" />
        <input
          type="text"
          placeholder={t('panel.searchPlaceholder')}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `search-result-${highlightedIndex}` : undefined}
          className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
        />
        {query && (
          <button onClick={handleClear} className="ml-2 text-text-muted hover:text-text-primary" aria-label={t('common.close')}>
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50" role="listbox">
          {loading && (
            <div className="p-4 text-center text-text-muted text-sm">{t('panel.searching')}</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-text-muted text-sm">
              {t('panel.noResultsFor', { query })}
            </div>
          )}
          {!loading &&
            results.map((user, idx) => (
              <button
                key={user.id}
                id={`search-result-${idx}`}
                role="option"
                aria-selected={idx === highlightedIndex}
                onClick={() => handleSelect(user.id)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  idx === highlightedIndex ? 'bg-bg-hover' : 'hover:bg-bg-hover'
                }`}
              >
                <Avatar src={user.avatarUrl} username={user.username} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.username}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-text-muted truncate">{user.bio}</p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
