import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { Search, TrendingUp, DollarSign, Loader2, X } from 'lucide-react'
import Layout from '../components/Layout'
import { searchSneakers } from '../lib/sneakersDb'
import { useLanguage } from '../contexts/LanguageContext'

export default function PriceChecker() {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedSneaker, setSelectedSneaker] = useState(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  const performSearch = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsSearching(true)

    try {
      const response = await fetch(`/api/sneakers/search?query=${encodeURIComponent(query)}&limit=20`, {
        signal: controller.signal,
      })

      if (controller.signal.aborted) return

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      } else {
        const localResults = searchSneakers(query)
        setSearchResults(localResults)
      }
    } catch (error) {
      if (error.name === 'AbortError') return
      const localResults = searchSneakers(query)
      setSearchResults(localResults)
    } finally {
      if (!controller.signal.aborted) setIsSearching(false)
    }
  }, [])

  // Auto-search avec debounce quand l'utilisateur tape
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (searchQuery.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, performSearch])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      performSearch(searchQuery)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedSneaker(null)
  }

  return (
    <>
      <Head>
        <title>Price Checker - OneStock</title>
      </Head>

      <Layout>
        <div className="min-h-screen p-4 md:p-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl border border-cyan-500/30">
                <Search className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                  Price Checker
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  {language === 'fr' ? 'Recherche les prix du marché en temps réel' : 'Search real-time market prices'}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={language === 'fr' ? 'Rechercher par nom ou SKU (ex: Jordan 1 Chicago, DZ5485)...' : 'Search by name or SKU (e.g. Jordan 1 Chicago, DZ5485)...'}
                    className="w-full pl-12 pr-12 py-4 text-lg rounded-2xl bg-dark-800 border-2 border-blue-500/30 focus:border-cyan-400/50 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { if (debounceRef.current) clearTimeout(debounceRef.current); performSearch(searchQuery) }}
                  disabled={isSearching || searchQuery.length < 2}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-2xl transition-all disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="hidden md:inline">{language === 'fr' ? 'Recherche...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span className="hidden md:inline">{language === 'fr' ? 'Rechercher' : 'Search'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selected Sneaker Details */}
          {selectedSneaker && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="card p-6 md:p-8 bg-gradient-to-br from-dark-800 to-dark-900 border-2 border-cyan-500/30">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full md:w-1/3">
                    <div className="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center p-4">
                      {selectedSneaker.imageUrl ? (
                        <img
                          src={selectedSneaker.imageUrl}
                          alt={selectedSneaker.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-6xl">👟</div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{selectedSneaker.name}</h2>
                      {selectedSneaker.brand && (
                        <p className="text-cyan-400 font-semibold text-lg">{selectedSneaker.brand}</p>
                      )}
                      {selectedSneaker.colorway && (
                        <p className="text-gray-400">{selectedSneaker.colorway}</p>
                      )}
                    </div>

                    {selectedSneaker.sku && (
                      <div className="p-3 bg-dark-700/50 rounded-lg inline-block">
                        <span className="text-sm text-gray-500">SKU: </span>
                        <span className="font-mono text-white">{selectedSneaker.sku}</span>
                      </div>
                    )}

                    {/* Prices */}
                    {(selectedSneaker.lowestPrice || selectedSneaker.lowestResellPrice) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {selectedSneaker.lowestPrice && (
                          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-emerald-400" />
                              <span className="text-sm text-emerald-300 font-semibold">
                                {language === 'fr' ? 'Prix le plus bas' : 'Lowest Price'}
                              </span>
                            </div>
                            <div className="text-3xl font-black text-emerald-400">
                              €{selectedSneaker.lowestPrice}
                            </div>
                          </div>
                        )}

                        {selectedSneaker.lowestResellPrice?.stockX && (
                          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-blue-400" />
                              <span className="text-sm text-blue-300 font-semibold">StockX</span>
                            </div>
                            <div className="text-3xl font-black text-blue-400">
                              ${selectedSneaker.lowestResellPrice.stockX}
                            </div>
                          </div>
                        )}

                        {selectedSneaker.lowestResellPrice?.goat && (
                          <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-orange-400" />
                              <span className="text-sm text-orange-300 font-semibold">GOAT</span>
                            </div>
                            <div className="text-3xl font-black text-orange-400">
                              ${selectedSneaker.lowestResellPrice.goat}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                {searchResults.length} {language === 'fr' ? 'résultat(s)' : 'result(s)'}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedSneaker(result)}
                    className="w-full flex items-center gap-4 p-4 bg-dark-800 hover:bg-dark-700 border border-blue-500/20 hover:border-cyan-400/50 rounded-xl transition-all text-left group"
                  >
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-3xl">👟</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {result.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {result.brand} {result.colorway && `• ${result.colorway}`}
                      </div>
                      {result.sku && (
                        <div className="text-xs text-gray-500 font-mono">{result.sku}</div>
                      )}
                    </div>
                    {(result.lowestPrice || result.lowestResellPrice?.stockX) && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-emerald-400">
                          {result.lowestPrice ? `€${result.lowestPrice}` : `$${result.lowestResellPrice.stockX}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.lowestPrice ? 'EUR' : 'StockX'}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedSneaker && searchResults.length === 0 && !isSearching && (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {language === 'fr' ? 'Recherche un sneaker' : 'Search for a sneaker'}
              </h3>
              <p className="text-gray-400">
                {language === 'fr'
                  ? 'Utilise la barre de recherche pour trouver les prix du marché'
                  : 'Use the search bar to find market prices'}
              </p>
            </div>
          )}

          {/* No Results */}
          {searchQuery && !isSearching && searchResults.length === 0 && !selectedSneaker && (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="text-7xl mb-6">😕</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {language === 'fr' ? 'Aucun résultat' : 'No results'}
              </h3>
              <p className="text-gray-400">
                {language === 'fr'
                  ? `Aucun résultat pour "${searchQuery}"`
                  : `No results for "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
