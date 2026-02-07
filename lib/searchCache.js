// Cache client-side pour les résultats de recherche API
// Les résultats déjà cherchés sont retournés instantanément

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function getCachedResults(query) {
  const key = query.toLowerCase().trim()
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCachedResults(query, results) {
  const key = query.toLowerCase().trim()
  // Limiter à 100 entrées
  if (cache.size > 100) {
    const oldest = cache.keys().next().value
    cache.delete(oldest)
  }
  cache.set(key, { data: results, timestamp: Date.now() })
}