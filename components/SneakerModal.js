import { useState, useEffect, useRef } from 'react'
import { X, Search, FileText, Loader2 } from 'lucide-react'
import { POPULAR_BRANDS, PLATFORMS, BUY_PLATFORMS, CONDITIONS, CATEGORIES, generateId, getSizesForBrand } from '../lib/store'
import { searchSneakers } from '../lib/sneakersDb'
import { useToast } from '../contexts/ToastContext'

export default function SneakerModal({ isOpen, onClose, onSave, sneaker, mode = 'add' }) {
  const { showToast } = useToast()
  // mode peut être: 'add' (inventaire), 'sale' (vente directe), 'edit'
  const [formData, setFormData] = useState({
    name: '',
    category: 'sneakers',
    brand: '',
    sku: '',
    size: '42',
    condition: 'new',
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
    buyPlatform: 'SNKRS',
    status: 'stock',
    itemReceived: false,
    sellPrice: '',
    sellDate: '',
    sellPlatform: '',
    fees: '',
    notes: '',
    imageUrl: '',
    invoiceUrl: '',
    paymentStatus: 'pending',
    deliveryStatus: 'pending',
    listedOnPlatforms: [],
    targetSellPrice: '',
  })

  // Search state
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [apiError, setApiError] = useState(null)
  const latestQueryRef = useRef('')

  useEffect(() => {
    if (sneaker) {
      // Gérer la compatibilité avec l'ancien champ listedOnPlatform (singulier)
      let platforms = []
      if (sneaker.listedOnPlatforms && Array.isArray(sneaker.listedOnPlatforms)) {
        platforms = sneaker.listedOnPlatforms
      } else if (sneaker.listedOnPlatform && sneaker.listedOnPlatform !== '') {
        platforms = [sneaker.listedOnPlatform]
      }

      setFormData({
        ...sneaker,
        category: sneaker.category || 'sneakers',
        status: mode === 'sale' ? 'sold' : (sneaker.status || 'stock'),
        itemReceived: sneaker.itemReceived ?? false,
        paymentStatus: sneaker.paymentStatus || 'pending',
        deliveryStatus: sneaker.deliveryStatus || 'pending',
        buyDate: sneaker.buyDate?.split('T')[0] || '',
        sellDate: sneaker.sellDate?.split('T')[0] || (mode === 'sale' ? new Date().toISOString().split('T')[0] : ''),
        invoiceUrl: sneaker.invoiceUrl || '',
        listedOnPlatforms: platforms,
      })
    } else {
      setFormData({
        name: '',
        category: 'sneakers',
        brand: '',
        sku: '',
        size: '42',
        condition: 'new',
        buyPrice: '',
        buyDate: new Date().toISOString().split('T')[0],
        buyPlatform: 'SNKRS',
        status: mode === 'sale' ? 'sold' : 'stock',
        itemReceived: false,
        sellPrice: '',
        sellDate: mode === 'sale' ? new Date().toISOString().split('T')[0] : '',
        sellPlatform: '',
        fees: '',
        notes: '',
        imageUrl: '',
        invoiceUrl: '',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
        listedOnPlatforms: [],
        targetSellPrice: '',
      })
      setShowSearch(mode === 'add' || mode === 'sale')
    }
    setSearchQuery('')
    setSearchResults([])
  }, [sneaker, isOpen, mode])

  // Recherche avec debounce via API route (server-side pour éviter CORS)
  useEffect(() => {
    latestQueryRef.current = searchQuery

    // Toujours effacer les anciens résultats quand la query change
    setSearchResults([])

    if (searchQuery.length < 3) {
      setApiError(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setApiError(null)

    const abortController = new AbortController()
    const queryAtRequest = searchQuery

    const timeoutId = setTimeout(async () => {
      const fetchUrl = `/api/sneakers/search?query=${encodeURIComponent(queryAtRequest)}&limit=20`
      console.log('[Search] Fetching for query:', queryAtRequest)

      try {
        const response = await fetch(fetchUrl, {
          signal: abortController.signal,
          cache: 'no-store',
        })

        if (abortController.signal.aborted) return
        // Vérifier que la query n'a pas changé pendant le fetch
        if (latestQueryRef.current !== queryAtRequest) return

        const data = await response.json()

        // Double-vérification après parsing JSON
        if (latestQueryRef.current !== queryAtRequest) return

        if (response.ok && data.results?.length > 0) {
          console.log('[Search] Got', data.results.length, 'results for:', queryAtRequest)
          setSearchResults(data.results)
        } else {
          setSearchResults(searchSneakers(queryAtRequest))
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        if (latestQueryRef.current !== queryAtRequest) return
        console.error('[Search] Error:', err.message)
        setSearchResults(searchSneakers(queryAtRequest))
      } finally {
        if (!abortController.signal.aborted && latestQueryRef.current === queryAtRequest) {
          setIsSearching(false)
        }
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [searchQuery])

  const handleSelectSneaker = (result) => {
    // Mapper la marque si elle est dans notre liste
    let brand = result.brand
    if (brand) {
      // Normaliser le nom de marque
      const brandLower = brand.toLowerCase()
      if (brandLower.includes('jordan') || brandLower.includes('air jordan')) {
        brand = 'Jordan'
      } else if (brandLower.includes('yeezy')) {
        brand = 'Yeezy'
      } else {
        // Chercher dans notre liste
        const found = POPULAR_BRANDS.find(b => b.toLowerCase() === brandLower)
        brand = found || brand
      }
    }

    setFormData(prev => ({
      ...prev,
      name: result.name || prev.name,
      brand: brand || prev.brand,
      sku: result.sku || prev.sku,
      imageUrl: result.imageUrl || prev.imageUrl,
    }))
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const data = {
      ...formData,
      id: sneaker?.id || generateId(),
      buyPrice: parseFloat(formData.buyPrice) || 0,
      sellPrice: formData.sellPrice ? parseFloat(formData.sellPrice) : null,
      fees: formData.fees ? parseFloat(formData.fees) : 0,
      targetSellPrice: formData.targetSellPrice ? parseFloat(formData.targetSellPrice) : null,
      createdAt: sneaker?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Détecter si c'est une vente et s'il y avait des plateformes listées
    const wasListed = sneaker?.listedOnPlatforms && sneaker.listedOnPlatforms.length > 0
    const isBeingSold = data.status === 'sold'
    const soldPlatform = data.sellPlatform

    if (isBeingSold && wasListed) {
      // Filtrer les plateformes où il faut retirer l'annonce (toutes sauf celle où vendu)
      const platformsToRemove = sneaker.listedOnPlatforms.filter(p => p !== soldPlatform)

      if (platformsToRemove.length > 0) {
        // Afficher la notification toast
        showToast({
          message: '✅ Vente enregistrée !',
          platforms: platformsToRemove,
          onRemindLater: () => {
            // Stocker un rappel dans localStorage
            const reminders = JSON.parse(localStorage.getItem('platform_reminders') || '[]')
            reminders.push({
              sneakerId: data.id,
              sneakerName: data.name,
              platforms: platformsToRemove,
              timestamp: new Date().toISOString()
            })
            localStorage.setItem('platform_reminders', JSON.stringify(reminders))
          }
        })
      }
    }

    onSave(data)
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTogglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      listedOnPlatforms: prev.listedOnPlatforms.includes(platform)
        ? prev.listedOnPlatforms.filter(p => p !== platform)
        : [...prev.listedOnPlatforms, platform]
    }))
  }

  if (!isOpen) return null

  const profit = formData.sellPrice
    ? parseFloat(formData.sellPrice) - parseFloat(formData.buyPrice || 0) - parseFloat(formData.fees || 0)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-dark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-dark-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">
            {mode === 'add' && '➕ Ajouter à l\'inventaire'}
            {mode === 'sale' && '💰 Enregistrer une vente'}
            {mode === 'edit' && '✏️ Modifier la paire'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Search Section */}
          {(mode === 'add' || mode === 'sale') && (
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-2">
                🔍 Rechercher une paire
              </label>
              <div className="relative">
                {isSearching ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearch(true)
                  }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Tape un nom ou SKU (ex: Jordan 1 Chicago, DZ5485)..."
                  className="w-full pl-10 pr-10"
                />
              </div>

              {/* API Error message */}
              {apiError && (
                <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                  {apiError === 'API_KEY_MISSING' && '⚠️ Clé API non configurée - Utilisation de la base locale'}
                  {apiError === 'INVALID_API_KEY' && '⚠️ Clé API invalide - Utilisation de la base locale'}
                  {apiError === 'RATE_LIMIT' && '⚠️ Limite API atteinte - Utilisation de la base locale'}
                  {apiError === 'NETWORK_ERROR' && '⚠️ Erreur réseau - Utilisation de la base locale'}
                </div>
              )}

              {/* Search Results Dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-dark-700 border border-gray-600 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectSneaker(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-dark-600 transition-colors text-left border-b border-gray-700 last:border-b-0"
                    >
                      <div className="w-14 h-14 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                        {result.imageUrl ? (
                          <img
                            src={result.imageUrl}
                            alt={result.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">👟</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate text-sm">{result.name}</div>
                        <div className="text-xs text-gray-400">{result.brand} {result.colorway && `• ${result.colorway}`}</div>
                        <div className="text-xs text-gray-500 font-mono">{result.sku}</div>
                      </div>
                      {(result.lowestPrice || result.lowestResellPrice?.stockX) && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Prix</div>
                          <div className="text-sm text-emerald-400">
                            {result.lowestPrice ? `€${result.lowestPrice}` : `$${result.lowestResellPrice.stockX}`}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {showSearch && searchQuery.length >= 3 && searchResults.length === 0 && (
                <div className="absolute z-20 w-full mt-2 bg-dark-700 border border-gray-600 rounded-xl p-4 text-center text-gray-500 text-sm">
                  Aucun résultat pour "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Preview if data selected */}
          {formData.imageUrl && (
            <div className="flex items-center gap-4 p-4 bg-dark-700 rounded-xl">
              <div className="w-20 h-20 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{formData.name || 'Nom non défini'}</div>
                <div className="text-sm text-gray-400">{formData.brand} {formData.sku && `• ${formData.sku}`}</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', name: '', brand: '', sku: '' }))}
                className="text-gray-500 hover:text-red-400 text-sm"
              >
                Effacer
              </button>
            </div>
          )}

          {/* Image URL manual */}
          {!formData.imageUrl && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Image URL (optionnel)</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full"
              />
            </div>
          )}

          {/* Nom et SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom du modèle *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jordan 1 Retro High OG"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">SKU / Référence</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="DZ5485-612"
                className="w-full"
              />
            </div>
          </div>

          {/* Catégorie, Marque et Taille */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    category: cat,
                    size: cat === 'clothing' ? 'M' : '42',
                  }))
                }}
                className="w-full"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Marque *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full"
              >
                <option value="">Sélectionner</option>
                {POPULAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Taille *</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="w-full"
              >
                {getSizesForBrand(formData.brand, formData.category).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">État *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full"
              >
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section Achat */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4 text-emerald-400">Achat</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Prix d'achat *</label>
                <input
                  type="number"
                  name="buyPrice"
                  value={formData.buyPrice}
                  onChange={handleChange}
                  placeholder="180"
                  required
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date d'achat</label>
                <input
                  type="date"
                  name="buyDate"
                  value={formData.buyDate}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Plateforme d'achat</label>
                <select
                  name="buyPlatform"
                  value={formData.buyPlatform}
                  onChange={handleChange}
                  className="w-full"
                >
                  {BUY_PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plateforme de mise en vente et Prix cible - visible en mode add et edit (si en stock) */}
            {(mode === 'add' || (mode === 'edit' && formData.status === 'stock')) && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    💎 Prix de vente cible (optionnel)
                  </label>
                  <input
                    type="number"
                    name="targetSellPrice"
                    value={formData.targetSellPrice}
                    onChange={handleChange}
                    placeholder="250"
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3">
                    📢 Mis en vente sur (cochez une ou plusieurs plateformes)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PLATFORMS.map(platform => (
                      <label
                        key={platform}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.listedOnPlatforms.includes(platform)
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-dark-700 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.listedOnPlatforms.includes(platform)}
                          onChange={() => handleTogglePlatform(platform)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium">{platform}</span>
                      </label>
                    ))}
                  </div>
                  {formData.listedOnPlatforms.length > 0 && (
                    <div className="mt-2 text-xs text-blue-400">
                      {formData.listedOnPlatforms.length} plateforme{formData.listedOnPlatforms.length > 1 ? 's' : ''} sélectionnée{formData.listedOnPlatforms.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Toggle Livraison - en mode add ou edit (si en stock) */}
            {(mode === 'add' || (mode === 'edit' && formData.status === 'stock')) && (
              <div
                onClick={() => setFormData(prev => ({ ...prev, itemReceived: !prev.itemReceived }))}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all mt-4 ${
                  formData.itemReceived
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-amber-500/20 border-amber-500 text-amber-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{formData.itemReceived ? '✅' : '🚚'}</span>
                    <div className="font-medium">
                      {formData.itemReceived ? 'Livré' : 'En cours de livraison'}
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    formData.itemReceived ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.itemReceived ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Vente - masquée en mode 'add' */}
          {mode !== 'add' && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-3">
              <span className="text-blue-400">Vente</span>
              {mode === 'edit' && (
                <label className="flex items-center gap-2 text-sm font-normal">
                  <input
                    type="checkbox"
                    checked={formData.status === 'sold'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: e.target.checked ? 'sold' : 'stock',
                      sellDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  Vendu
                </label>
              )}
              {mode === 'sale' && (
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Mode vente</span>
              )}
            </h3>

            {formData.status === 'sold' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prix de vente *</label>
                    <input
                      type="number"
                      name="sellPrice"
                      value={formData.sellPrice}
                      onChange={handleChange}
                      placeholder="250"
                      required={formData.status === 'sold'}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Frais (plateforme, envoi)</label>
                    <input
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleChange}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date de vente</label>
                    <input
                      type="date"
                      name="sellDate"
                      value={formData.sellDate}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Plateforme de vente</label>
                    <select
                      name="sellPlatform"
                      value={formData.sellPlatform}
                      onChange={handleChange}
                      className="w-full"
                    >
                      <option value="">Sélectionner</option>
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Statuts paiement et livraison - Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, paymentStatus: prev.paymentStatus === 'received' ? 'pending' : 'received' }))}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                      formData.paymentStatus === 'received'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-dark-600/50 border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{formData.paymentStatus === 'received' ? '💰' : '⏳'}</span>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        formData.paymentStatus === 'received' ? 'bg-emerald-500' : 'bg-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          formData.paymentStatus === 'received' ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                    <div className="mt-2 font-medium">
                      {formData.paymentStatus === 'received' ? 'Paiement reçu' : 'Paiement en attente'}
                    </div>
                  </div>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, deliveryStatus: prev.deliveryStatus === 'delivered' ? 'pending' : 'delivered' }))}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                      formData.deliveryStatus === 'delivered'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-dark-600/50 border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{formData.deliveryStatus === 'delivered' ? '✅' : '📦'}</span>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        formData.deliveryStatus === 'delivered' ? 'bg-emerald-500' : 'bg-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          formData.deliveryStatus === 'delivered' ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                    <div className="mt-2 font-medium">
                      {formData.deliveryStatus === 'delivered' ? 'Colis livré' : 'Colis en attente'}
                    </div>
                  </div>
                </div>

                {/* Facture */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Facture / Preuve de vente (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="invoiceUrl"
                      value={formData.invoiceUrl}
                      onChange={handleChange}
                      placeholder="https://... (lien vers la facture)"
                      className="w-full"
                    />
                    {formData.invoiceUrl && (
                      <a
                        href={formData.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary px-3 flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        Voir
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lien vers Google Drive, Dropbox, ou autre hébergement
                  </p>
                </div>
              </div>
            )}

            {/* Profit display */}
            {formData.status === 'sold' && profit !== null && (
              <div className={`mt-4 p-4 rounded-lg ${profit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <div className="text-sm text-gray-400">Profit estimé</div>
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {profit >= 0 ? '+' : ''}{profit.toFixed(2)} €
                </div>
              </div>
            )}
          </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Infos supplémentaires..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" className={`btn flex-1 ${mode === 'sale' ? 'bg-cyan-600 hover:bg-cyan-500' : 'btn-primary'}`}>
              {mode === 'add' && '➕ Ajouter au stock'}
              {mode === 'sale' && '💰 Enregistrer la vente'}
              {mode === 'edit' && '✅ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
