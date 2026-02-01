import { supabaseServer } from '../../../lib/supabaseServer'

// Helper pour extraire le user_id depuis le cookie Whop
function getUserIdFromCookies(req) {
  const cookies = req.cookies || {}

  if (cookies.whop_user) {
    try {
      const userData = JSON.parse(decodeURIComponent(cookies.whop_user))
      return userData.id || userData.email
    } catch (e) {
      console.error('Failed to parse whop_user cookie:', e)
      return null
    }
  }

  return null
}

export default async function handler(req, res) {
  const userId = getUserIdFromCookies(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - No valid session' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabaseServer
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })

        if (error) throw error
        return res.status(200).json(data || [])
      }

      case 'POST': {
        const expense = req.body

        const row = {
          ...expense,
          user_id: userId,
        }

        const { data, error } = await supabaseServer
          .from('expenses')
          .insert(row)
          .select()
          .single()

        if (error) throw error
        return res.status(201).json(data)
      }

      case 'PUT': {
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing expense ID' })
        }

        const { data, error } = await supabaseServer
          .from('expenses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json(data)
      }

      case 'DELETE': {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing expense ID' })
        }

        const { error } = await supabaseServer
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
        return res.status(200).json({ success: true })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
