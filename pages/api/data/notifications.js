import { supabaseServer } from '../../../lib/supabaseServer'

// Helper pour extraire le user_id depuis le cookie Whop
function getUserIdFromCookies(req) {
  const cookies = req.cookies || {}

  if (cookies.whop_user) {
    try {
      const userData = JSON.parse(decodeURIComponent(cookies.whop_user))
      return userData.email || userData.id
    } catch (e) {
      return null
    }
  }

  return null
}

export default async function handler(req, res) {
  const userId = getUserIdFromCookies(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        // Charger toutes les notifications (dismissed) de l'utilisateur
        const { data, error } = await supabaseServer
          .from('dismissed_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('dismissed_at', { ascending: false })

        if (error) throw error
        return res.status(200).json(data || [])
      }

      case 'POST': {
        // Dismiss une notification (sauvegarder avec toutes les infos)
        const { notification_key, type, title, subtitle, icon, severity, sneaker_id } = req.body

        if (!notification_key) {
          return res.status(400).json({ error: 'Missing notification_key' })
        }

        const { data, error } = await supabaseServer
          .from('dismissed_notifications')
          .upsert({
            user_id: userId,
            notification_key,
            type: type || 'unknown',
            title: title || '',
            subtitle: subtitle || '',
            icon: icon || '',
            severity: severity || 'medium',
            sneaker_id: sneaker_id || null,
            dismissed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,notification_key'
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json(data)
      }

      case 'PUT': {
        // Dismiss toutes les notifications (bulk)
        const { notifications } = req.body

        if (!notifications || !Array.isArray(notifications)) {
          return res.status(400).json({ error: 'Missing notifications array' })
        }

        const rows = notifications.map(n => ({
          user_id: userId,
          notification_key: n.notification_key || n.id,
          type: n.type || 'unknown',
          title: n.title || '',
          subtitle: n.subtitle || '',
          icon: n.icon || '',
          severity: n.severity || 'medium',
          sneaker_id: n.sneaker_id || n.sneakerId || null,
          dismissed_at: new Date().toISOString(),
        }))

        const { data, error } = await supabaseServer
          .from('dismissed_notifications')
          .upsert(rows, {
            onConflict: 'user_id,notification_key'
          })
          .select()

        if (error) throw error
        return res.status(200).json(data || [])
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        return res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('Notifications API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}