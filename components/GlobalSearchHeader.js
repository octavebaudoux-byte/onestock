import { useState } from 'react'
import { useRouter } from 'next/router'
import { Search, X, Bell } from 'lucide-react'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'
import NotificationPanel from './NotificationPanel'

export default function GlobalSearchHeader() {
  const router = useRouter()
  const { user } = useWhopAuth()
  const { language } = useLanguage()
  const { count, togglePanel, panelOpen } = useNotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/price-checker?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Extraire le nom d'utilisateur de l'email ou utiliser le username
  const getUserName = () => {
    if (!user) return 'User'
    if (user.username) return user.username
    if (user.email) return user.email.split('@')[0]
    if (user.id && user.id.includes('@')) return user.id.split('@')[0]
    return 'User'
  }
  const userName = getUserName()

  return (
    <div className="sticky top-0 z-20 bg-dark-900/95 backdrop-blur-lg border-b border-blue-500/20">
      <div className="px-3 md:px-6 py-1.5 md:py-2">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Welcome Message - compact on mobile */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-base md:text-lg">👋</span>
            <h2 className="text-xs md:text-sm font-semibold text-white whitespace-nowrap">
              {userName}
            </h2>
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                className={`w-full pl-7 md:pl-9 pr-7 md:pr-9 py-1.5 md:py-2 text-xs md:text-sm rounded-lg bg-dark-800 border transition-all ${
                  isFocused ? 'border-cyan-400/50' : 'border-blue-500/30'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-0.5 md:p-1 hover:bg-dark-700 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {/* Notification Bell */}
          <div className="relative shrink-0">
            <button
              data-notification-bell
              onClick={togglePanel}
              className={`relative p-1.5 md:p-2 rounded-lg transition-all ${
                panelOpen
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-black text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                  {count}
                </span>
              )}
            </button>
            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
