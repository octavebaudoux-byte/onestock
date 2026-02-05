import { supabaseServer } from '../../../lib/supabaseServer'

// Helper pour extraire le user_id depuis le cookie Whop
function getUserIdFromCookies(req) {
  const cookies = req.cookies || {}

  if (cookies.whop_user) {
    try {
      const userData = JSON.parse(decodeURIComponent(cookies.whop_user))
      // IMPORTANT: Toujours utiliser l'email comme user_id car c'est stable
      // L'ID peut changer (ex: owner_xxx est généré avec Date.now())
      return userData.email || userData.id
    } catch (e) {
      console.error('Failed to parse whop_user cookie:', e)
      return null
    }
  }

  return null
}

// Logger les opérations importantes
async function logOperation(operation, userId, details) {
  try {
    console.log(`[AUDIT] ${new Date().toISOString()} | ${operation} | user=${userId} | ${JSON.stringify(details)}`)

    // Sauvegarder dans une table de logs si elle existe
    if (supabaseServer) {
      await supabaseServer
        .from('audit_logs')
        .insert({
          operation,
          user_id: userId,
          details: JSON.stringify(details),
          created_at: new Date().toISOString()
        })
        .then(() => {})
        .catch(() => {}) // Silencieux si la table n'existe pas
    }
  } catch (e) {
    // Ne pas bloquer l'opération si le log échoue
  }
}

export default async function handler(req, res) {
  // Vérifier l'authentification
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
        // Charger toutes les sneakers de l'utilisateur
        const { data, error } = await supabaseServer
          .from('sneakers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return res.status(200).json(data || [])
      }

      case 'POST': {
        // Ajouter une nouvelle sneaker
        const sneaker = req.body

        // IMPORTANT: Forcer le user_id côté serveur pour la sécurité
        const row = {
          ...sneaker,
          user_id: userId, // Toujours utiliser l'userId du cookie
        }

        const { data, error } = await supabaseServer
          .from('sneakers')
          .insert(row)
          .select()
          .single()

        if (error) throw error

        // Log l'ajout
        await logOperation('ADD_SNEAKER', userId, { id: data.id, name: data.name })

        return res.status(201).json(data)
      }

      case 'PUT': {
        // Mettre à jour une sneaker
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing sneaker ID' })
        }

        // Vérifier que la sneaker appartient à l'utilisateur avant de la modifier
        const { data, error } = await supabaseServer
          .from('sneakers')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId) // Important: vérifier que c'est bien la sneaker de cet user
          .select()
          .single()

        if (error) throw error
        return res.status(200).json(data)
      }

      case 'DELETE': {
        // Supprimer une sneaker
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Missing sneaker ID' })
        }

        // D'abord récupérer les infos de la sneaker pour le log
        const { data: sneakerToDelete } = await supabaseServer
          .from('sneakers')
          .select('name, brand, buy_price')
          .eq('id', id)
          .eq('user_id', userId)
          .single()

        const { error } = await supabaseServer
          .from('sneakers')
          .delete()
          .eq('id', id)
          .eq('user_id', userId) // Important: vérifier que c'est bien la sneaker de cet user

        if (error) throw error

        // Log la suppression avec les détails
        await logOperation('DELETE_SNEAKER', userId, {
          id,
          name: sneakerToDelete?.name,
          brand: sneakerToDelete?.brand,
          buyPrice: sneakerToDelete?.buy_price
        })

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
