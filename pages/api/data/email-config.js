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
        const { data, error } = await supabaseServer
          .from('email_connections')
          .select('id, email, imap_host, imap_port, is_active, last_check_at, last_error, created_at')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        // Ne pas renvoyer le mot de passe
        return res.status(200).json(data || null)
      }

      case 'POST': {
        const { email, app_password, imap_host, imap_port } = req.body

        if (!email || !app_password) {
          return res.status(400).json({ error: 'Email and app password required' })
        }

        const { data, error } = await supabaseServer
          .from('email_connections')
          .upsert({
            user_id: userId,
            email,
            app_password,
            imap_host: imap_host || 'imap.gmail.com',
            imap_port: imap_port || 993,
            is_active: true,
            last_error: null,
          }, {
            onConflict: 'user_id'
          })
          .select('id, email, imap_host, imap_port, is_active, last_check_at, created_at')
          .single()

        if (error) throw error
        return res.status(201).json(data)
      }

      case 'DELETE': {
        const { error } = await supabaseServer
          .from('email_connections')
          .delete()
          .eq('user_id', userId)

        if (error) throw error
        return res.status(200).json({ success: true })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('Email Config API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}