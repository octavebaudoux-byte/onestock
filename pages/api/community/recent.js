import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  if (!supabase) return res.status(200).json({ sales: [], stats: { total: 0, avgProfit: 0, sellers: 0 } })

  // Utilisateurs avec partage activé
  const { data: prefs } = await supabase
    .from('community_prefs')
    .select('user_id, show_name, display_name')
    .eq('share_sales', true)

  if (!prefs || prefs.length === 0) {
    return res.status(200).json({ sales: [], stats: { total: 0, avgProfit: 0, sellers: 0 } })
  }

  const userIds = prefs.map(p => p.user_id)

  const { data: sales } = await supabase
    .from('sneakers')
    .select('name, brand, size, sell_price, buy_price, fees, sell_date, sell_platform, user_id, sku')
    .eq('status', 'sold')
    .in('user_id', userIds)
    .order('sell_date', { ascending: false })
    .limit(100)

  if (!sales) return res.status(200).json({ sales: [], stats: { total: 0, avgProfit: 0, sellers: 0 } })

  const result = sales.map(s => {
    const pref = prefs.find(p => p.user_id === s.user_id)
    const profit = (s.sell_price || 0) - (s.buy_price || 0) - (s.fees || 0)
    return {
      name: s.name,
      brand: s.brand,
      size: s.size,
      sellPrice: s.sell_price,
      profit,
      sellDate: s.sell_date,
      platform: s.sell_platform,
      seller: pref?.show_name && pref?.display_name ? pref.display_name : 'Anonyme',
    }
  })

  const stats = {
    total: result.length,
    avgProfit: result.length > 0 ? Math.round(result.reduce((s, r) => s + r.profit, 0) / result.length) : 0,
    sellers: prefs.length,
  }

  return res.status(200).json({ sales: result, stats })
}