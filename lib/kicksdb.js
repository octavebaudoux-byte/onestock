// KicksDB API Integration
// Documentation: https://docs.kicks.dev
// Free tier: 1000 requests/month

const API_BASE_URL = 'https://api.kicks.dev/v3'

// Cache pour réduire les appels API
const searchCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Récupérer la clé API depuis localStorage
function getApiKey() {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('sneakstock_data')
  if (data) {
    const parsed = JSON.parse(data)
    return parsed.settings?.kicksdbApiKey || null
  }
  return null
}

// Sauvegarder la clé API
export function saveApiKey(apiKey) {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem('sneakstock_data')
  const parsed = data ? JSON.parse(data) : { sneakers: [], sales: [], settings: {} }
  parsed.settings = { ...parsed.settings, kicksdbApiKey: apiKey }
  localStorage.setItem('sneakstock_data', JSON.stringify(parsed))
}

// Rechercher des sneakers via StockX endpoint
export async function searchSneakersKicksDB(query, options = {}) {
  const apiKey = getApiKey()

  if (!apiKey) {
    console.warn('KicksDB API key not configured')
    return { results: [], error: 'API_KEY_MISSING' }
  }

  if (!query || query.length < 2) {
    return { results: [], error: null }
  }

  // Vérifier le cache
  const cacheKey = `search:${query.toLowerCase()}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { results: cached.data, error: null, fromCache: true }
  }

  try {
    const params = new URLSearchParams({
      query: query,
      limit: options.limit || 20,
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
        return { results: [], error: 'INVALID_API_KEY' }
      }
      if (response.status === 429) {
        return { results: [], error: 'RATE_LIMIT' }
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Transformer les données pour notre format
    const results = (data.data || data || []).map(product => ({
      id: product.id || product.slug,
      name: product.title || product.name,
      brand: normalizeBrand(product.brand),
      sku: product.sku || '',
      model: product.model || '',
      imageUrl: product.image || product.gallery?.[0] || '',
      gallery: product.gallery || [],
      gender: product.gender || 'unisex',
      colorway: product.colorway || '',
      retailPrice: product.retail_price || null,
      lowestPrice: product.min_price || null,
      highestPrice: product.max_price || null,
      avgPrice: product.avg_price || null,
      weeklyOrders: product.weekly_orders || 0,
      variants: (product.variants || []).map(v => ({
        size: v.size,
        lowestAsk: v.lowest_ask,
        currency: v.currency || 'EUR',
      })),
    }))

    // Mettre en cache
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    })

    return { results, error: null }

  } catch (error) {
    console.error('KicksDB API error:', error)
    return { results: [], error: 'NETWORK_ERROR' }
  }
}

// Rechercher via GOAT (backup ou alternative)
export async function searchSneakersGOAT(query, options = {}) {
  const apiKey = getApiKey()

  if (!apiKey) {
    return { results: [], error: 'API_KEY_MISSING' }
  }

  try {
    const params = new URLSearchParams({
      query: query,
      limit: options.limit || 20,
      'display[variants]': 'true',
    })

    const response = await fetch(`${API_BASE_URL}/goat/products?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    const results = (data.data || data || []).map(product => ({
      id: product.id || product.slug,
      name: product.name,
      brand: normalizeBrand(product.brand),
      sku: product.sku || '',
      model: product.model || '',
      colorway: product.colorway || '',
      imageUrl: product.image_url || product.images?.[0] || '',
      gallery: product.images || [],
      retailPrice: product.retail_prices?.eur || product.retail_prices?.usd || null,
      releaseDate: product.release_date || null,
      category: product.category || 'sneakers',
      variants: (product.variants || []).map(v => ({
        size: v.size,
        lowestAsk: v.lowest_ask,
        currency: v.currency || 'EUR',
      })),
    }))

    return { results, error: null }

  } catch (error) {
    console.error('GOAT API error:', error)
    return { results: [], error: 'NETWORK_ERROR' }
  }
}

// Récupérer les détails d'un produit par ID
export async function getProductDetails(productId, source = 'stockx') {
  const apiKey = getApiKey()

  if (!apiKey) {
    return { product: null, error: 'API_KEY_MISSING' }
  }

  try {
    const endpoint = source === 'goat'
      ? `${API_BASE_URL}/goat/products/${productId}`
      : `${API_BASE_URL}/stockx/products/${productId}`

    const params = new URLSearchParams({
      'display[variants]': 'true',
      'display[traits]': 'true',
      'display[statistics]': 'true',
    })

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const product = data.data || data

    return {
      product: {
        id: product.id,
        name: product.title || product.name,
        brand: normalizeBrand(product.brand),
        sku: product.sku || '',
        model: product.model || '',
        imageUrl: product.image || product.image_url || '',
        gallery: product.gallery || product.images || [],
        colorway: product.colorway || '',
        retailPrice: product.retail_price || null,
        lowestPrice: product.min_price || null,
        variants: product.variants || [],
        statistics: product.statistics || {},
      },
      error: null,
    }

  } catch (error) {
    console.error('Product details error:', error)
    return { product: null, error: 'NETWORK_ERROR' }
  }
}

// Recherche par SKU
export async function searchBySKU(sku) {
  const apiKey = getApiKey()

  if (!apiKey || !sku) {
    return { results: [], error: apiKey ? null : 'API_KEY_MISSING' }
  }

  // Vérifier le cache
  const cacheKey = `sku:${sku.toUpperCase()}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { results: cached.data, error: null, fromCache: true }
  }

  try {
    // Essayer d'abord StockX
    const params = new URLSearchParams({
      query: sku,
      limit: 10,
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
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const products = data.data || data || []

    // Filtrer par SKU exact ou proche
    const results = products
      .filter(p => p.sku && p.sku.toUpperCase().includes(sku.toUpperCase()))
      .map(product => ({
        id: product.id,
        name: product.title || product.name,
        brand: normalizeBrand(product.brand),
        sku: product.sku,
        imageUrl: product.image || '',
        lowestPrice: product.min_price,
        variants: product.variants || [],
      }))

    // Mettre en cache
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    })

    return { results, error: null }

  } catch (error) {
    console.error('SKU search error:', error)
    return { results: [], error: 'NETWORK_ERROR' }
  }
}

// Normaliser les noms de marques
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
    'fear of god': 'Fear of God',
    'off-white': 'Off-White',
    'balenciaga': 'Balenciaga',
    'gucci': 'Gucci',
    'louis vuitton': 'Louis Vuitton',
    'dior': 'Dior',
    'travis scott': 'Travis Scott',
  }

  const lowerBrand = brand.toLowerCase().trim()
  return brandMap[lowerBrand] || brand
}

// Vider le cache
export function clearCache() {
  searchCache.clear()
}

// Vérifier si l'API est configurée
export function isApiConfigured() {
  return !!getApiKey()
}

// Tester la connexion API
export async function testApiConnection() {
  const apiKey = getApiKey()

  if (!apiKey) {
    return { success: false, error: 'API_KEY_MISSING' }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/stockx/products?query=jordan&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      return { success: true, error: null }
    } else if (response.status === 401) {
      return { success: false, error: 'INVALID_API_KEY' }
    } else if (response.status === 429) {
      return { success: false, error: 'RATE_LIMIT' }
    } else {
      return { success: false, error: `HTTP_${response.status}` }
    }

  } catch (error) {
    return { success: false, error: 'NETWORK_ERROR' }
  }
}
