import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useLanguage } from './LanguageContext'

const NotificationContext = createContext({})

export function NotificationProvider({ children }) {
  const { language } = useLanguage()
  const [sneakers, setSneakers] = useState([])
  const [dismissed, setDismissed] = useState({})
  const [panelOpen, setPanelOpen] = useState(false)

  // Charger les notifications rejetées au mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('onestock_dismissed_notifs') || '{}')
      setDismissed(saved)
    } catch {}
  }, [])

  // Mettre à jour les sneakers depuis n'importe quelle page
  const updateSneakers = useCallback((data) => {
    setSneakers(data)
  }, [])

  const dismissNotif = useCallback((id) => {
    setDismissed(prev => {
      const updated = { ...prev, [id]: Date.now() }
      localStorage.setItem('onestock_dismissed_notifs', JSON.stringify(updated))
      return updated
    })
  }, [])

  const dismissAll = useCallback(() => {
    setDismissed(prev => {
      const updated = { ...prev }
      notifications.forEach(n => { updated[n.id] = Date.now() })
      localStorage.setItem('onestock_dismissed_notifs', JSON.stringify(updated))
      return updated
    })
  }, [notifications])

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => !prev)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  // Calculer les notifications
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
  }, [sneakers, dismissed, language])

  // Historique : notifications déjà lues (les plus récentes en premier, max 20)
  const history = useMemo(() => {
    const items = []
    const now = new Date()

    sneakers.forEach(s => {
      // Stock reminders passés (dismissed)
      if (s.status === 'stock' && s.buyDate) {
        const buyDate = new Date(s.buyDate)
        const daysInStock = Math.floor((now - buyDate) / (1000 * 60 * 60 * 24))
        if (daysInStock >= 30) {
          const id = `stock-${s.id}`
          if (dismissed[id]) {
            items.push({
              id,
              type: 'stock_reminder',
              icon: '⏰',
              title: language === 'fr'
                ? `${s.name} en stock depuis ${daysInStock} jours`
                : `${s.name} in stock for ${daysInStock} days`,
              subtitle: language === 'fr' ? 'Ignoré' : 'Dismissed',
              dismissedAt: dismissed[id],
              read: true,
            })
          }
        }
      }

      // Listing reminders passés
      if (s.status === 'sold' && s.listedOnPlatforms && s.listedOnPlatforms.length > 0) {
        const remainingPlatforms = s.sellPlatform
          ? s.listedOnPlatforms.filter(p => p.toLowerCase() !== s.sellPlatform.toLowerCase())
          : s.listedOnPlatforms

        if (remainingPlatforms.length > 0) {
          const id = `listing-${s.id}`
          if (dismissed[id]) {
            items.push({
              id,
              type: 'listing_reminder',
              icon: '📢',
              title: language === 'fr'
                ? `Retirez ${s.name} des autres plateformes`
                : `Remove ${s.name} from other platforms`,
              subtitle: remainingPlatforms.join(', '),
              dismissedAt: dismissed[id],
              read: true,
            })
          }
        }
      }
    })

    items.sort((a, b) => b.dismissedAt - a.dismissedAt)
    return items.slice(0, 20)
  }, [sneakers, dismissed, language])

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