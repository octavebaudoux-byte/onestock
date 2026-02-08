import { supabaseServer } from '../../../lib/supabaseServer'

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
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' })

  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        // Charger toutes les notifications email (actives + historique)
        const { data, error } = await supabaseServer
          .from('email_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('email_date', { ascending: false })
          .limit(100)

        if (error) throw error
        return res.status(200).json(data || [])
      }

      case 'PUT': {
        // Dismiss une notification email
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing notification ID' })
        }

        const { data, error } = await supabaseServer
          .from('email_notifications')
          .update({ dismissed_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json(data)
      }

      case 'POST': {
        // Dismiss all email notifications
        const { error } = await supabaseServer
          .from('email_notifications')
          .update({ dismissed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('dismissed_at', null)

        if (error) throw error
        return res.status(200).json({ success: true })
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST'])
        return res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('Email Notifications API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}