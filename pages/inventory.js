import { useState, useMemo } from 'react'
import Head from 'next/head'
import { Search } from 'lucide-react'
import Layout from '../components/Layout'
import SneakerModal from '../components/SneakerModal'
import SneakerCard from '../components/SneakerCard'
import { formatPrice, exportToCSV } from '../lib/store'
import { useData } from '../hooks/useData'

export default function Inventory() {
  const { sneakers, loading, save, update, remove } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSneaker, setEditingSneaker] = useState(null)
  const [modalMode, setModalMode] = useState('add')

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('stock')
  const [filterBrand, setFilterBrand] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Filtrage et tri
  const filteredSneakers = useMemo(() => {
    let result = [...sneakers]

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.brand.toLowerCase().includes(term) ||
        s.sku?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus)
    }

    // Brand filter
    if (filterBrand !== 'all') {
      result = result.filter(s => s.brand === filterBrand)
    }

    // Sort
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price_asc':
        result.sort((a, b) => a.buyPrice - b.buyPrice)
        break
      case 'price_desc':
        result.sort((a, b) => b.buyPrice - a.buyPrice)
        break
      case 'profit':
        result.sort((a, b) => {
          const profitA = a.status === 'sold' ? (a.sellPrice - a.buyPrice - (a.fees || 0)) : -Infinity
          const profitB = b.status === 'sold' ? (b.sellPrice - b.buyPrice - (b.fees || 0)) : -Infinity
          return profitB - profitA
        })
        break
    }

    return result
  }, [sneakers, searchTerm, filterStatus, filterBrand, sortBy])

  // Handlers
  const handleSaveSneaker = async (sneaker) => {
    await save(sneaker)
    setEditingSneaker(null)
  }

  const handleDeleteSneaker = async (id) => {
    if (confirm('Supprimer cette paire ?')) {
      await remove(id)
    }
  }

  const handleEditSneaker = (sneaker) => {
    setEditingSneaker(sneaker)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleToggle = async (id, updates) => {
    await update(id, updates)
  }

  const openAddModal = () => {
    setEditingSneaker(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openSaleModal = () => {
    setEditingSneaker(null)
    setModalMode('sale')
    setIsModalOpen(true)
  }

  const handleExport = () => {
    exportToCSV(sneakers, 'stock')
  }

  // Marques présentes dans le stock
  const brandsInStock = [...new Set(sneakers.map(s => s.brand))].sort()

  // Stats rapides
  const stockCount = sneakers.filter(s => s.status === 'stock').length
  const soldCount = sneakers.filter(s => s.status === 'sold').length
  const totalValue = sneakers
    .filter(s => s.status === 'stock')
    .reduce((sum, s) => sum + (s.buyPrice || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Inventaire - OneStock</title>
      </Head>

      <Layout onAddClick={openAddModal} onAddSaleClick={openSaleModal} onExportClick={handleExport}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Inventaire</h1>
              <p className="text-gray-400">
                {stockCount} en stock • {soldCount} vendues • {formatPrice(totalValue)} de valeur
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[140px]"
            >
              <option value="all">Tous les statuts</option>
              <option value="stock">En stock</option>
              <option value="sold">Vendues</option>
            </select>

            {/* Brand filter */}
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="min-w-[140px]"
            >
              <option value="all">Toutes les marques</option>
              {brandsInStock.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[160px]"
            >
              <option value="date">Plus récent</option>
              <option value="name">Nom A-Z</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="profit">Meilleur profit</option>
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500 mb-4">
            {filteredSneakers.length} résultat{filteredSneakers.length > 1 ? 's' : ''}
          </div>

          {/* Grid */}
          {filteredSneakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center sm:justify-items-start px-4 sm:px-0">
              {filteredSneakers.map(sneaker => (
                <div key={sneaker.id} className="w-full flex justify-center sm:justify-start">
                  <SneakerCard
                    sneaker={sneaker}
                    onEdit={handleEditSneaker}
                    onDelete={handleDeleteSneaker}
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-400 mb-2">Aucune paire trouvée</p>
              <p className="text-sm text-gray-500">
                {sneakers.length === 0
                  ? 'Ajoute ta première paire pour commencer'
                  : 'Essaie de modifier tes filtres'}
              </p>
            </div>
          )}
        </div>
      </Layout>

      <SneakerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSneaker(null)
        }}
        onSave={handleSaveSneaker}
        sneaker={editingSneaker}
        mode={modalMode}
      />
    </>
  )
}
