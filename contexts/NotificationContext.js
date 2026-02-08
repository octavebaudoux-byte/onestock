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
  const [dismissedMap, setDismissedMap] = useState({})
  const [history, setHistory] = useState([])
  const [emailNotifs, setEmailNotifs] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const loadingRef = useRef(false)

  // Charger les notifications dismissed + email depuis Supabase au mount
  useEffect(() => {
    if (loadingRef.current) return
    loadingRef.current = true

    Promise.all([
      fetch('/api/data/notifications', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : []),
      fetch('/api/data/email-notifications', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([dismissedData, emailData]) => {
        // Dismissed notifications (sneaker-based)
        const map = {}
        const hist = []
        ;(dismissedData || []).forEach(n => {
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

        // Email notifications (dismissed ones go to history too)
        ;(emailData || []).forEach(n => {
          if (n.dismissed_at) {
            hist.push({
              id: `email-${n.id}`,
              type: 'email_trigger',
              icon: '📧',
              title: n.email_subject || n.trigger_phrase,
              subtitle: `${n.trigger_label || n.trigger_phrase} • ${n.email_from || ''}`,
              severity: 'medium',
              dismissedAt: new Date(n.dismissed_at).getTime(),
              read: true,
            })
          }
        })

        setDismissedMap(map)
        setEmailNotifs(emailData || [])
        setHistory(hist.sort((a, b) => b.dismissedAt - a.dismissedAt).slice(0, 50))
        setLoaded(true)
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [])

  const updateSneakers = useCallback((data) => {
    setSneakers(data)
  }, [])

  // Dismiss une notification (sneaker-based ou email)
  const dismissNotif = useCallback((id, notifData) => {
    // Si c'est une notification email
    if (notifData?._emailNotifId) {
      // Update local
      setEmailNotifs(prev => prev.map(n =>
        n.id === notifData._emailNotifId ? { ...n, dismissed_at: new Date().toISOString() } : n
      ))
      setHistory(prev => [{
        id,
        type: 'email_trigger',
        icon: '📧',
        title: notifData.title,
        subtitle: notifData.subtitle,
        severity: 'medium',
        dismissedAt: Date.now(),
        read: true,
      }, ...prev].slice(0, 50))

      // Save to Supabase
      fetch('/api/data/email-notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notifData._emailNotifId }),
        credentials: 'same-origin',
      }).catch(() => {})
      return
    }

    // Sneaker-based notification
    setDismissedMap(prev => ({ ...prev, [id]: true }))

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

  // Calculer les notifications actives (sneaker-based)
  const sneakerNotifs = useMemo(() => {
    if (!loaded) return []

    const notifs = []
    const now = new Date()

    sneakers.forEach(s => {
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

    return notifs
  }, [sneakers, dismissedMap, language, loaded])

  // Notifications email actives (non-dismissed)
  const activeEmailNotifs = useMemo(() => {
    return emailNotifs
      .filter(n => !n.dismissed_at)
      .map(n => ({
        id: `email-${n.id}`,
        _emailNotifId: n.id,
        type: 'email_trigger',
        icon: '📧',
        title: n.email_subject || n.trigger_phrase,
        subtitle: `${n.trigger_label || n.trigger_phrase} • ${n.email_from || ''}`,
        severity: 'high',
        date: n.email_date ? new Date(n.email_date) : new Date(),
      }))
  }, [emailNotifs])

  // Merger toutes les notifications
  const notifications = useMemo(() => {
    const all = [...sneakerNotifs, ...activeEmailNotifs]
    all.sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1
      if (a.severity !== 'high' && b.severity === 'high') return 1
      return 0
    })
    return all
  }, [sneakerNotifs, activeEmailNotifs])

  // Dismiss all
  const dismissAll = useCallback(() => {
    if (notifications.length === 0) return

    const newMap = { ...dismissedMap }
    const newHistory = [...history]
    const sneakerPayload = []
    const hasEmailNotifs = notifications.some(n => n._emailNotifId)

    notifications.forEach(n => {
      if (n._emailNotifId) {
        // Email notification
        setEmailNotifs(prev => prev.map(en =>
          en.id === n._emailNotifId ? { ...en, dismissed_at: new Date().toISOString() } : en
        ))
      } else {
        // Sneaker notification
        newMap[n.id] = true
        sneakerPayload.push({
          notification_key: n.id,
          type: n.type,
          title: n.title,
          subtitle: n.subtitle,
          icon: n.icon,
          severity: n.severity,
          sneaker_id: n.sneakerId || null,
        })
      }

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
    })

    setDismissedMap(newMap)
    setHistory(newHistory.slice(0, 50))

    // Save sneaker dismissals
    if (sneakerPayload.length > 0) {
      fetch('/api/data/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: sneakerPayload }),
        credentials: 'same-origin',
      }).catch(() => {})
    }

    // Save email dismissals
    if (hasEmailNotifs) {
      fetch('/api/data/email-notifications', {
        method: 'POST',
        credentials: 'same-origin',
      }).catch(() => {})
    }
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