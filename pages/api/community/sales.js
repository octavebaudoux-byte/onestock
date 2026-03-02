import { getCommunitySales } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { name, sku } = req.query
  if (!name && !sku) return res.status(400).json({ error: 'name ou sku requis' })

  const sales = await getCommunitySales(name, sku)
  return res.status(200).json({ sales })
}