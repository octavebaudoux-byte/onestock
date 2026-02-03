import { supabaseServer } from '../../../lib/supabaseServer'

// Extraire l'ID utilisateur depuis les cookies Whop
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

// Convertir camelCase en snake_case
function camelToSnake(obj) {
  const result = {}
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    result[snakeKey] = obj[key]
  }
  return result
}

// Convertir snake_case en camelCase
function snakeToCamel(obj) {
  const result = {}
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}

export default async function handler(req, res) {
  // Vérifier que Supabase est configuré
  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // Extraire l'ID utilisateur depuis les cookies
  const userId = getUserIdFromCookies(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - No user found' })
  }

  try {
    switch (req.method) {
      // GET - Récupérer tous les comptes
      case 'GET': {
        const { data, error } = await supabaseServer
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return res.status(200).json(data || [])
      }

      // POST - Créer un nouveau compte
      case 'POST': {
        const account = req.body

        // Forcer le user_id côté serveur pour la sécurité
        const row = {
          ...camelToSnake(account),
          user_id: userId,
        }

        // Supprimer id et dates si présents
        delete row.id
        delete row.created_at
        delete row.updated_at

        const { data, error } = await supabaseServer
          .from('accounts')
          .insert(row)
          .select()
          .single()

        if (error) throw error
        return res.status(201).json(data)
      }

      // PUT - Mettre à jour un compte
      case 'PUT': {
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing account id' })
        }

        // Vérifier que le compte appartient à l'utilisateur
        const { data: existing, error: checkError } = await supabaseServer
          .from('accounts')
          .select('user_id')
          .eq('id', id)
          .single()

        if (checkError || !existing) {
          return res.status(404).json({ error: 'Account not found' })
        }

        if (existing.user_id !== userId) {
          return res.status(403).json({ error: 'Forbidden - Not your account' })
        }

        // Mettre à jour
        const row = camelToSnake(updates)
        delete row.id
        delete row.user_id
        delete row.created_at
        delete row.updated_at

        const { data, error } = await supabaseServer
          .from('accounts')
          .update(row)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json(data)
      }

      // DELETE - Supprimer un compte
      case 'DELETE': {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing account id' })
        }

        // Vérifier que le compte appartient à l'utilisateur
        const { data: existing, error: checkError } = await supabaseServer
          .from('accounts')
          .select('user_id')
          .eq('id', id)
          .single()

        if (checkError || !existing) {
          return res.status(404).json({ error: 'Account not found' })
        }

        if (existing.user_id !== userId) {
          return res.status(403).json({ error: 'Forbidden - Not your account' })
        }

        // Supprimer
        const { error } = await supabaseServer
          .from('accounts')
          .delete()
          .eq('id', id)

        if (error) throw error
        return res.status(200).json({ success: true })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Accounts API error:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.toString()
    })
  }
}
