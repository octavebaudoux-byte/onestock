import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'

export default function SneakerSearch({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Debounce la recherche
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search-sneaker?query=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (response.ok) {
          setResults(data.results || [])
        } else {
          setError(data.error || 'Erreur lors de la recherche')
        }
      } catch (err) {
        setError('Impossible de contacter le serveur')
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSelect = (sneaker) => {
    onSelect({
      name: sneaker.name,
      brand: sneaker.brand,
      sku: sneaker.sku,
      imageUrl: sneaker.imageUrl,
      retailPrice: sneaker.retailPrice,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Search panel */}
      <div className="relative bg-dark-800 rounded-2xl w-full max-w-2xl border border-gray-700 animate-fadeIn overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou SKU (ex: Jordan 1, DZ5485)..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
          />
          <button onClick={onClose} className="p-1 hover:bg-dark-600 rounded">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-4 text-red-400 text-sm">{error}</div>
          )}

          {results.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {results.map((sneaker) => (
                <button
                  key={sneaker.id}
                  onClick={() => handleSelect(sneaker)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-dark-700 transition-colors text-left"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                    {sneaker.imageUrl ? (
                      <img
                        src={sneaker.imageUrl}
                        alt={sneaker.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = ''
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">👟</div>'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{sneaker.name}</h3>
                    <p className="text-sm text-gray-400">{sneaker.brand}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="font-mono">{sneaker.sku}</span>
                      {sneaker.colorway && (
                        <>
                          <span>•</span>
                          <span>{sneaker.colorway}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="text-right">
                    {sneaker.retailPrice && (
                      <div className="text-sm">
                        <span className="text-gray-500">Retail:</span>{' '}
                        <span className="text-white">${sneaker.retailPrice}</span>
                      </div>
                    )}
                    {sneaker.lowestResellPrice?.stockX && (
                      <div className="text-sm">
                        <span className="text-gray-500">StockX:</span>{' '}
                        <span className="text-emerald-400">${sneaker.lowestResellPrice.stockX}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-3xl mb-2">🔍</div>
              <p>Aucun résultat pour "{query}"</p>
              <p className="text-sm mt-1">Essaie avec un autre nom ou SKU</p>
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-3xl mb-2">👟</div>
              <p>Tape au moins 2 caractères pour rechercher</p>
              <p className="text-sm mt-2 text-gray-600">
                Exemples: "Jordan 1 Chicago", "Yeezy 350", "DZ5485"
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
