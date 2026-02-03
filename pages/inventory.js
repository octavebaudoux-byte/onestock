import { useState, useMemo } from 'react'
import Head from 'next/head'
import { Search } from 'lucide-react'
import Layout from '../components/Layout'
import SneakerModal from '../components/SneakerModal'
import SneakerCard from '../components/SneakerCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatPrice, exportToCSV } from '../lib/store'
import { useData } from '../hooks/useData'
import { useLanguage } from '../contexts/LanguageContext'

export default function Inventory() {
  const { sneakers, loading, save, update, remove } = useData()
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSneaker, setEditingSneaker] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null })

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('stock')
  const [filterBrand, setFilterBrand] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Expand sneakers by quantity
  const expandedSneakers = useMemo(() => {
    return sneakers.flatMap(sneaker => {
      const qty = sneaker.quantity || 1
      if (qty <= 1) return [sneaker]
      return Array.from({ length: qty }, (_, i) => ({
        ...sneaker,
        _instanceIndex: i,
        _uniqueKey: `${sneaker.id}-${i}`
      }))
    })
  }, [sneakers])

  // Filtrage et tri
  const filteredSneakers = useMemo(() => {
    let result = [...expandedSneakers]

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
  }, [expandedSneakers, searchTerm, filterStatus, filterBrand, sortBy])

  // Handlers
  const handleSaveSneaker = async (sneaker) => {
    await save(sneaker)
    setEditingSneaker(null)
  }

  const handleDeleteSneaker = async (id) => {
    setConfirmDialog({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (confirmDialog.id) {
      await remove(confirmDialog.id)
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

  const handleSellSneaker = (sneaker) => {
    setEditingSneaker(sneaker)
    setModalMode('sale')
    setIsModalOpen(true)
  }

  const handleExport = () => {
    exportToCSV(sneakers, 'stock')
  }

  // Marques présentes dans le stock
  const brandsInStock = [...new Set(sneakers.map(s => s.brand))].sort()

  // Stats rapides (incluant les quantités)
  const stockCount = sneakers
    .filter(s => s.status === 'stock')
    .reduce((sum, s) => sum + (s.quantity || 1), 0)
  const soldCount = sneakers
    .filter(s => s.status === 'sold')
    .reduce((sum, s) => sum + (s.quantity || 1), 0)
  const totalValue = sneakers
    .filter(s => s.status === 'stock')
    .reduce((sum, s) => sum + ((s.buyPrice || 0) * (s.quantity || 1)), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{t('inventory.title')} - OneStock</title>
      </Head>

      <Layout onAddClick={openAddModal} onAddSaleClick={openSaleModal} onExportClick={handleExport}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('inventory.title')}</h1>
              <p className="text-gray-400">
                {stockCount} {t('inventory.inStock')} • {soldCount} {t('inventory.sold')} • {formatPrice(totalValue)} {t('inventory.value')}
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
                placeholder={t('inventory.searchPlaceholder')}
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
              <option value="all">{t('inventory.allStatuses')}</option>
              <option value="stock">{t('inventory.inStock')}</option>
              <option value="sold">{t('inventory.sold')}</option>
            </select>

            {/* Brand filter */}
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="min-w-[140px]"
            >
              <option value="all">{t('inventory.allBrands')}</option>
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
              <option value="date">{t('inventory.sortRecent')}</option>
              <option value="name">{t('inventory.sortName')}</option>
              <option value="price_asc">{t('inventory.sortPriceAsc')}</option>
              <option value="price_desc">{t('inventory.sortPriceDesc')}</option>
              <option value="profit">{t('inventory.sortProfit')}</option>
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500 mb-4">
            {filteredSneakers.length} {filteredSneakers.length > 1 ? t('inventory.resultsPlural') : t('inventory.results')}
          </div>

          {/* Grid */}
          {filteredSneakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center sm:justify-items-start px-4 sm:px-0">
              {filteredSneakers.map((sneaker, index) => (
                <div
                  key={sneaker._uniqueKey || sneaker.id}
                  className="w-full flex justify-center sm:justify-start animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SneakerCard
                    sneaker={sneaker}
                    onEdit={handleEditSneaker}
                    onDelete={handleDeleteSneaker}
                    onToggle={handleToggle}
                    onSell={handleSellSneaker}
                    instanceIndex={sneaker._instanceIndex || 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-400 mb-2">{t('inventory.noPairs')}</p>
              <p className="text-sm text-gray-500">
                {sneakers.length === 0
                  ? t('inventory.addFirst')
                  : t('inventory.tryFilters')}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title={t('dashboard.deleteConfirm') || 'Supprimer cette paire ?'}
        message="Cette action est irréversible. Toutes les données de cette paire seront définitivement supprimées."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
      />
    </>
  )
}
