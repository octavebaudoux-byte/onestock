import { useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, Clock } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotificationPanel() {
  const { language } = useLanguage()
  const { notifications, history, panelOpen, closePanel, dismissNotif, dismissAll } = useNotifications()
  const panelRef = useRef(null)

  // Fermer quand on clique en dehors
  useEffect(() => {
    if (!panelOpen) return

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Ignorer les clics sur le bouton bell lui-même
        if (e.target.closest('[data-notification-bell]')) return
        closePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [panelOpen, closePanel])

  if (!panelOpen) return null

  const hasNotifs = notifications.length > 0
  const hasHistory = history.length > 0

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return language === 'fr' ? "à l'instant" : 'just now'
    if (mins < 60) return `${mins}min`
    if (hours < 24) return `${hours}h`
    return `${days}j`
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-dark-800 border border-blue-500/30 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            {language === 'fr' ? 'Notifications' : 'Notifications'}
          </h3>
          {hasNotifs && (
            <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasNotifs && (
            <button
              onClick={dismissAll}
              className="text-[10px] text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              {language === 'fr' ? 'Tout lire' : 'Mark all read'}
            </button>
          )}
          <button
            onClick={closePanel}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Active Notifications */}
        {hasNotifs && (
          <div>
            <div className="px-4 py-2 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              {language === 'fr' ? 'Actives' : 'Active'}
            </div>
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-l-2 ${
                  notif.severity === 'high' ? 'border-l-amber-500' : 'border-l-blue-500'
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white leading-snug">{notif.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{notif.subtitle}</p>
                </div>
                <button
                  onClick={() => dismissNotif(notif.id)}
                  className="shrink-0 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                  title={language === 'fr' ? 'Marquer comme lu' : 'Mark as read'}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {hasHistory && (
          <div>
            <div className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-700/50">
              {language === 'fr' ? 'Historique' : 'History'}
            </div>
            {history.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-3 px-4 py-2.5 opacity-50 hover:opacity-70 transition-opacity"
              >
                <span className="text-sm shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-300 leading-snug truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-gray-600" />
                    <span className="text-[10px] text-gray-500">{formatTime(item.dismissedAt)}</span>
                  </div>
                </div>
                <CheckCheck className="w-3 h-3 text-gray-600 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!hasNotifs && !hasHistory && (
          <div className="py-12 text-center">
            <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {language === 'fr' ? 'Aucune notification' : 'No notifications'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {language === 'fr' ? 'Tout est en ordre !' : 'Everything is in order!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}