import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useLanguage } from './LanguageContext'

const noop = () => {}
const NotificationContext = createContext({
  notifications: [], history: [], count: 0,
  panelOpen: false, togglePanel: noop, closePanel: noop,
  dismissNotif: noop, dismissAll: noop, updateSneakers: noop,
})

export function NotificationProvider({ children }) {
  const { language } = useLanguage()
  const [sneakers, setSneakers] = useState([])
  const [dismissedMap, setDismissedMap] = useState({}) // { notification_key: { ...data } }
  const [history, setHistory] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const loadingRef = useRef(false)

  // Charger les notifications dismissed depuis Supabase au mount
  useEffect(() => {
    if (loadingRef.current) return
    loadingRef.current = true

    fetch('/api/data/notifications', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const map = {}
        const hist = []
        ;(data || []).forEach(n => {
          map[n.notification_key] = true
          hist.push({
            id: n.notification_key,
            type: n.type,
            icon: n.icon || '🔔',
            title: n.title,
            subtitle: n.subtitle,
            severity: n.severity,
            dismissedAt: new Date(n.dismissed_at).getTime(),
            read: true,
          })
        })
        setDismissedMap(map)
        setHistory(hist.sort((a, b) => b.dismissedAt - a.dismissedAt).slice(0, 50))
        setLoaded(true)
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [])

  // Mettre à jour les sneakers depuis n'importe quelle page
  const updateSneakers = useCallback((data) => {
    setSneakers(data)
  }, [])

  // Dismiss une notification via API Supabase
  const dismissNotif = useCallback((id, notifData) => {
    // Mettre à jour l'état local immédiatement
    setDismissedMap(prev => ({ ...prev, [id]: true }))

    // Ajouter à l'historique local
    if (notifData) {
      setHistory(prev => [{
        id,
        type: notifData.type,
        icon: notifData.icon || '🔔',
        title: notifData.title,
        subtitle: notifData.subtitle,
        severity: notifData.severity,
        dismissedAt: Date.now(),
        read: true,
      }, ...prev].slice(0, 50))
    }

    // Sauvegarder dans Supabase
    fetch('/api/data/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification_key: id,
        type: notifData?.type || 'unknown',
        title: notifData?.title || '',
        subtitle: notifData?.subtitle || '',
        icon: notifData?.icon || '',
        severity: notifData?.severity || 'medium',
        sneaker_id: notifData?.sneakerId || null,
      }),
      credentials: 'same-origin',
    }).catch(() => {})
  }, [])

  // Calculer les notifications actives
  const notifications = useMemo(() => {
    if (!loaded) return []

    const notifs = []
    const now = new Date()

    sneakers.forEach(s => {
      // Rappel stock > 30 jours
      if (s.status === 'stock' && s.buyDate) {
        const buyDate = new Date(s.buyDate)
        const daysInStock = Math.floor((now - buyDate) / (1000 * 60 * 60 * 24))

        if (daysInStock >= 30) {
          const id = `stock-${s.id}`
          if (!dismissedMap[id]) {
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
              severity: daysInStock >= 60 ? 'high' : 'medium',
              date: buyDate,
            })
          }
        }
      }

      // Rappel retirer listings après vente
      if (s.status === 'sold' && s.listedOnPlatforms && s.listedOnPlatforms.length > 0) {
        const remainingPlatforms = s.sellPlatform
          ? s.listedOnPlatforms.filter(p => p.toLowerCase() !== s.sellPlatform.toLowerCase())
          : s.listedOnPlatforms

        if (remainingPlatforms.length > 0) {
          const id = `listing-${s.id}`
          if (!dismissedMap[id]) {
            notifs.push({
              id,
              type: 'listing_reminder',
              icon: '📢',
              title: language === 'fr'
                ? `Retirez ${s.name} des autres plateformes`
                : `Remove ${s.name} from other platforms`,
              subtitle: remainingPlatforms.join(', '),
              sneakerId: s.id,
              severity: 'high',
              date: s.sellDate ? new Date(s.sellDate) : new Date(),
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
  }, [sneakers, dismissedMap, language, loaded])

  // Dismiss all
  const dismissAll = useCallback(() => {
    if (notifications.length === 0) return

    // Mettre à jour l'état local
    const newMap = { ...dismissedMap }
    const newHistory = [...history]
    const apiPayload = []

    notifications.forEach(n => {
      newMap[n.id] = true
      newHistory.unshift({
        id: n.id,
        type: n.type,
        icon: n.icon,
        title: n.title,
        subtitle: n.subtitle,
        severity: n.severity,
        dismissedAt: Date.now(),
        read: true,
      })
      apiPayload.push({
        notification_key: n.id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle,
        icon: n.icon,
        severity: n.severity,
        sneaker_id: n.sneakerId || null,
      })
    })

    setDismissedMap(newMap)
    setHistory(newHistory.slice(0, 50))

    // Sauvegarder dans Supabase
    fetch('/api/data/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: apiPayload }),
      credentials: 'same-origin',
    }).catch(() => {})
  }, [notifications, dismissedMap, history])

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => !prev)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const value = {
    notifications,
    history,
    count: notifications.length,
    panelOpen,
    togglePanel,
    closePanel,
    dismissNotif,
    dismissAll,
    updateSneakers,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}