import { useState } from 'react'
import { useRouter } from 'next/router'
import { Search, X } from 'lucide-react'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function GlobalSearchHeader() {
  const router = useRouter()
  const { user } = useWhopAuth()
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/price-checker?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const userName = user?.username || user?.email?.split('@')[0] || 'User'

  return (
    <div className="sticky top-0 z-20 bg-dark-900/95 backdrop-blur-lg border-b border-blue-500/20">
      <div className="px-4 md:px-6 py-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
          {/* Welcome Message */}
          <div className="flex items-center gap-2">
            <div className="text-lg">👋</div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {language === 'fr' ? 'Bonjour' : 'Welcome'}, {userName}
              </h2>
            </div>
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={language === 'fr' ? 'Rechercher un sneaker...' : 'Search for a sneaker...'}
                className={`w-full pl-9 pr-9 py-2 text-sm rounded-lg bg-dark-800 border transition-all ${
                  isFocused ? 'border-cyan-400/50' : 'border-blue-500/30'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
