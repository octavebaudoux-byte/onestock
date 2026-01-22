// API Route pour la recherche de sneakers via KicksDB
// La clé API est stockée côté serveur (variable d'environnement)

const API_BASE_URL = 'https://api.kicks.dev/v3'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, limit = 20 } = req.query

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query too short', results: [] })
  }

  // Clé API stockée dans les variables d'environnement
  const apiKey = process.env.KICKSDB_API_KEY

  if (!apiKey) {
    console.error('KICKSDB_API_KEY not configured')
    return res.status(500).json({ error: 'API not configured', results: [] })
  }

  try {
    const params = new URLSearchParams({
      query: query,
      limit: limit,
      'display[variants]': 'true',
    })

    const response = await fetch(`${API_BASE_URL}/stockx/products?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ error: 'INVALID_API_KEY', results: [] })
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'RATE_LIMIT', results: [] })
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Transformer les données
    const results = (data.data || data || []).map(product => ({
      id: product.id || product.slug,
      name: product.title || product.name,
      brand: normalizeBrand(product.brand),
      sku: product.sku || '',
      model: product.model || '',
      imageUrl: product.image || product.gallery?.[0] || '',
      gallery: product.gallery || [],
      colorway: product.colorway || '',
      retailPrice: product.retail_price || null,
      lowestPrice: product.min_price || null,
      highestPrice: product.max_price || null,
      avgPrice: product.avg_price || null,
      variants: (product.variants || []).slice(0, 10).map(v => ({
        size: v.size,
        lowestAsk: v.lowest_ask,
        currency: v.currency || 'EUR',
      })),
    }))

    // Cache de 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    return res.status(200).json({ results, error: null })

  } catch (error) {
    console.error('KicksDB API error:', error)
    return res.status(500).json({ error: 'NETWORK_ERROR', results: [] })
  }
}

function normalizeBrand(brand) {
  if (!brand) return ''

  const brandMap = {
    'air jordan': 'Jordan',
    'jordan': 'Jordan',
    'jordan brand': 'Jordan',
    'nike': 'Nike',
    'adidas': 'Adidas',
    'adidas originals': 'Adidas',
    'new balance': 'New Balance',
    'asics': 'Asics',
    'asics sportstyle': 'Asics',
    'puma': 'Puma',
    'reebok': 'Reebok',
    'converse': 'Converse',
    'vans': 'Vans',
    'salomon': 'Salomon',
    'yeezy': 'Yeezy',
  }

  const lowerBrand = brand.toLowerCase().trim()
  return brandMap[lowerBrand] || brand
}
