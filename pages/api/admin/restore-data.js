import { supabaseServer } from '../../../lib/supabaseServer'

// ADMIN ONLY: Restaurer des données pour un utilisateur
// Usage: POST /api/admin/restore-data?secret=YOUR_SECRET
// Body: { "email": "user@email.com", "sneakers": [...] }

export default async function handler(req, res) {
  // GET: Liste tous les utilisateurs et leur nombre de sneakers
  if (req.method === 'GET') {
    const { secret } = req.query
    const adminSecret = process.env.ADMIN_SECRET || 'onestock-admin-fix-2024'

    if (secret !== adminSecret) {
      return res.status(403).json({ error: 'Accès refusé' })
    }

    if (!supabaseServer) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    try {
      const { data: sneakers, error } = await supabaseServer
        .from('sneakers')
        .select('user_id, id, name, status')

      if (error) throw error

      // Grouper par user
      const byUser = {}
      sneakers.forEach(s => {
        if (!byUser[s.user_id]) {
          byUser[s.user_id] = { total: 0, stock: 0, sold: 0 }
        }
        byUser[s.user_id].total++
        if (s.status === 'stock') byUser[s.user_id].stock++
        if (s.status === 'sold') byUser[s.user_id].sold++
      })

      return res.status(200).json({
        totalSneakers: sneakers.length,
        users: byUser
      })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  // POST: Ajouter des sneakers en bulk pour un utilisateur
  if (req.method === 'POST') {
    const { secret } = req.query
    const adminSecret = process.env.ADMIN_SECRET || 'onestock-admin-fix-2024'

    if (secret !== adminSecret) {
      return res.status(403).json({ error: 'Accès refusé' })
    }

    if (!supabaseServer) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { email, sneakers } = req.body

    if (!email || !sneakers || !Array.isArray(sneakers)) {
      return res.status(400).json({ error: 'email et sneakers[] requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    try {
      // Préparer les sneakers avec le bon user_id
      const rows = sneakers.map(s => ({
        user_id: normalizedEmail,
        name: s.name || 'Unknown',
        brand: s.brand || 'Unknown',
        sku: s.sku || '',
        size: s.size || '',
        category: s.category || 'Sneakers',
        condition: s.condition || 'new',
        buy_price: s.buyPrice || s.buy_price || 0,
        buy_date: s.buyDate || s.buy_date || null,
        buy_platform: s.buyPlatform || s.buy_platform || '',
        sell_price: s.sellPrice || s.sell_price || null,
        sell_date: s.sellDate || s.sell_date || null,
        sell_platform: s.sellPlatform || s.sell_platform || '',
        fees: s.fees || 0,
        target_sell_price: s.targetSellPrice || s.target_sell_price || null,
        status: s.status || 'stock',
        image_url: s.imageUrl || s.image_url || '',
        notes: s.notes || '',
        item_received: s.itemReceived || s.item_received || false,
        payment_status: s.paymentStatus || s.payment_status || 'pending',
        delivery_status: s.deliveryStatus || s.delivery_status || 'pending',
        quantity: s.quantity || 1,
      }))

      const { data, error } = await supabaseServer
        .from('sneakers')
        .insert(rows)
        .select()

      if (error) throw error

      return res.status(200).json({
        success: true,
        message: `${data.length} sneakers ajoutées pour ${normalizedEmail}`,
        count: data.length
      })
    } catch (error) {
      console.error('Restore data error:', error)
      return res.status(500).json({
        error: 'Erreur lors de la restauration',
        message: error.message
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}