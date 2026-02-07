// API Route pour la recherche de sneakers via KicksDB
// La clé API est stockée côté serveur (variable d'environnement)
// Cache serveur pour éviter les appels API répétés

const API_BASE_URL = 'https://api.kicks.dev/v3'

// Cache serveur en mémoire (persiste entre les requêtes en dev/prod)
const serverCache = new Map()
const CACHE_TTL = 3 * 60 * 1000 // 3 minutes

function getCached(key) {
  const entry = serverCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    serverCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  // Limiter la taille du cache à 200 entrées
  if (serverCache.size > 200) {
    const oldest = serverCache.keys().next().value
    serverCache.delete(oldest)
  }
  serverCache.set(key, { data, timestamp: Date.now() })
}

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
    console.error('[API Search] KICKSDB_API_KEY not configured!')
    return res.status(500).json({ error: 'API not configured', results: [] })
  }

  // Vérifier le cache serveur
  const cacheKey = `${query.toLowerCase().trim()}:${limit}`
  const cached = getCached(cacheKey)
  if (cached) {
    res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=300')
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json({ results: cached, error: null })
  }

  try {
    const url = `${API_BASE_URL}/stockx/products?query=${encodeURIComponent(query)}&limit=${limit}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
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
    const results = (data.data || []).map(product => ({
      id: product.id || product.slug,
      name: product.title || product.name,
      brand: normalizeBrand(product.brand),
      sku: product.sku || '',
      imageUrl: product.image || product.gallery?.[0] || '',
      colorway: product.colorway || '',
      lowestPrice: product.min_price || null,
    }))

    // Mettre en cache serveur
    setCache(cacheKey, results)

    res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=300')
    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json({ results, error: null })

  } catch (error) {
    console.error('[API Search] Error:', error.message)
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
    'ugg': 'UGG',
    'saucony': 'Saucony',
    'on': 'On Running',
    'hoka': 'Hoka',
  }

  const lowerBrand = brand.toLowerCase().trim()
  return brandMap[lowerBrand] || brand
}
