import { supabaseServer } from '../../../lib/supabaseServer'

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
    // Récupérer tous les user_id uniques
    const { data: allSneakers, error } = await supabaseServer
      .from('sneakers')
      .select('id, name, user_id, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Grouper par user_id
    const byUser = {}
    allSneakers.forEach(s => {
      if (!byUser[s.user_id]) {
        byUser[s.user_id] = { count: 0, stock: 0, sold: 0, sneakers: [] }
      }
      byUser[s.user_id].count++
      if (s.status === 'stock') byUser[s.user_id].stock++
      if (s.status === 'sold') byUser[s.user_id].sold++
      byUser[s.user_id].sneakers.push({ id: s.id, name: s.name, status: s.status })
    })

    // Si email spécifié, filtrer
    if (email) {
      const normalizedEmail = email.trim().toLowerCase()
      const userData = byUser[normalizedEmail]
      return res.status(200).json({
        email: normalizedEmail,
        found: !!userData,
        data: userData || null,
        allUsers: Object.keys(byUser)
      })
    }

    // Sinon retourner un résumé
    const summary = Object.entries(byUser).map(([userId, data]) => ({
      user_id: userId,
      total: data.count,
      stock: data.stock,
      sold: data.sold,
      sample: data.sneakers.slice(0, 3).map(s => s.name)
    }))

    return res.status(200).json({
      totalSneakers: allSneakers.length,
      totalUsers: Object.keys(byUser).length,
      users: summary
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}