import { useState, useMemo, useEffect } from 'react'
import { Bell, X, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotificationBanner({ sneakers = [] }) {
  const { language } = useLanguage()
  const [dismissed, setDismissed] = useState({})
  const [expanded, setExpanded] = useState(false)

  // Charger les notifications rejetées
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('onestock_dismissed_notifs') || '{}')
      setDismissed(saved)
    } catch {}
  }, [])

  const dismissNotif = (id) => {
    const updated = { ...dismissed, [id]: Date.now() }
    setDismissed(updated)
    localStorage.setItem('onestock_dismissed_notifs', JSON.stringify(updated))
  }

  const notifications = useMemo(() => {
    const notifs = []
    const now = new Date()

    sneakers.forEach(s => {
      // Rappel stock > 30 jours
      if (s.status === 'stock' && s.buyDate) {
        const buyDate = new Date(s.buyDate)
        const daysInStock = Math.floor((now - buyDate) / (1000 * 60 * 60 * 24))

        if (daysInStock >= 30) {
          const id = `stock-${s.id}`
          if (!dismissed[id]) {
            notifs.push({
              id,
              type: 'stock_reminder',
              icon: '⏰',
              title: language === 'fr'
                ? `${s.name} en stock depuis ${daysInStock} jours`
                : `${s.name} in stock for ${daysInStock} days`,
              subtitle: language === 'fr'
                ? 'Pensez à ajuster le prix ou relister'
                : 'Consider adjusting price or relisting',
              sneakerId: s.id,
              severity: daysInStock >= 60 ? 'high' : 'medium'
            })
          }
        }
      }

      // Rappel retirer listings après vente
      if (s.status === 'sold' && s.listedOnPlatforms && s.listedOnPlatforms.length > 0) {
        // Ignorer la plateforme de vente
        const remainingPlatforms = s.sellPlatform
          ? s.listedOnPlatforms.filter(p => p.toLowerCase() !== s.sellPlatform.toLowerCase())
          : s.listedOnPlatforms

        if (remainingPlatforms.length > 0) {
          const id = `listing-${s.id}`
          if (!dismissed[id]) {
            notifs.push({
              id,
              type: 'listing_reminder',
              icon: '📢',
              title: language === 'fr'
                ? `Retirez ${s.name} des autres plateformes`
                : `Remove ${s.name} from other platforms`,
              subtitle: remainingPlatforms.join(', '),
              sneakerId: s.id,
              severity: 'high'
            })
          }
        }
      }
    })

    // Trier : high severity en premier
    notifs.sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1
      if (a.severity !== 'high' && b.severity === 'high') return 1
      return 0
    })

    return notifs
  }, [sneakers, dismissed, language])

  if (notifications.length === 0) return null

  const visibleNotifs = expanded ? notifications : notifications.slice(0, 2)

  return (
    <div className="mb-4 md:mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">
            {notifications.length} {language === 'fr' ? 'rappel' : 'reminder'}{notifications.length > 1 ? 's' : ''}
          </span>
        </div>
        {notifications.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {expanded ? (
              <>{language === 'fr' ? 'Réduire' : 'Collapse'} <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>{language === 'fr' ? `Voir tout (${notifications.length})` : `See all (${notifications.length})`} <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="space-y-1.5">
        {visibleNotifs.map(notif => (
          <div
            key={notif.id}
            className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-lg border transition-all ${
              notif.severity === 'high'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-blue-500/5 border-blue-500/20'
            }`}
          >
            <span className="text-base shrink-0">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-white truncate">{notif.title}</p>
              <p className="text-[10px] md:text-xs text-gray-400 truncate">{notif.subtitle}</p>
            </div>
            <button
              onClick={() => dismissNotif(notif.id)}
              className="shrink-0 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
              title={language === 'fr' ? 'Ignorer' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}