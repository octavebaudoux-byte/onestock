import { supabaseServer } from '../../../lib/supabaseServer'

// Debug endpoint pour voir toutes les dépenses dans la base
// GET /api/admin/debug-expenses?secret=onestock-admin-fix-2024
// DELETE /api/admin/debug-expenses?secret=onestock-admin-fix-2024&email=xxx pour supprimer

export default async function handler(req, res) {
  const { secret, email } = req.query
  const adminSecret = process.env.ADMIN_SECRET || 'onestock-admin-fix-2024'

  if (secret !== adminSecret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    if (req.method === 'GET') {
      // Lister toutes les dépenses
      const { data, error } = await supabaseServer
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Grouper par user_id
      const grouped = {}
      for (const exp of data || []) {
        const uid = exp.user_id || 'unknown'
        if (!grouped[uid]) grouped[uid] = []
        grouped[uid].push(exp)
      }

      return res.status(200).json({
        total: data?.length || 0,
        byUser: grouped,
        expenses: data
      })
    }

    if (req.method === 'DELETE') {
      if (!email) {
        return res.status(400).json({ error: 'Email requis pour supprimer' })
      }

      const normalizedEmail = email.trim().toLowerCase()

      // Supprimer toutes les dépenses de cet utilisateur
      const { data, error } = await supabaseServer
        .from('expenses')
        .delete()
        .eq('user_id', normalizedEmail)
        .select()

      if (error) throw error

      return res.status(200).json({
        success: true,
        deleted: data?.length || 0,
        message: `Supprimé ${data?.length || 0} dépenses pour ${normalizedEmail}`
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Debug expenses error:', error)
    return res.status(500).json({ error: error.message })
  }
}
