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
          .from('email_triggers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return res.status(200).json(data || [])
      }

      case 'POST': {
        const { phrase, label } = req.body

        if (!phrase || !phrase.trim()) {
          return res.status(400).json({ error: 'Phrase required' })
        }

        const { data, error } = await supabaseServer
          .from('email_triggers')
          .upsert({
            user_id: userId,
            phrase: phrase.trim(),
            label: label || null,
          }, {
            onConflict: 'user_id,phrase'
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json(data)
      }

      case 'DELETE': {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing trigger ID' })
        }

        const { error } = await supabaseServer
          .from('email_triggers')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
        return res.status(200).json({ success: true })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('Email Triggers API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}