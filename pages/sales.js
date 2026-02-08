import { useState, useMemo, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { TrendingUp, DollarSign, ShoppingBag, Zap, ArrowUpRight, Percent, LayoutGrid, List } from 'lucide-react'
import Layout from '../components/Layout'
import SneakerModal from '../components/SneakerModal'
import SaleCard from '../components/SaleCard'
import SneakerRow from '../components/SneakerRow'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatPrice, exportToCSV } from '../lib/store'
import { useData } from '../hooks/useData'
import { useLanguage } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'

export default function Sales() {
  const { sneakers, loading, save, update, remove } = useData()
  const { t } = useLanguage()
  const { updateSneakers } = useNotifications()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSneaker, setEditingSneaker] = useState(null)
  useEffect(() => { updateSneakers(sneakers) }, [sneakers, updateSneakers])
  const [timeRange, setTimeRange] = useState('all')
  const [modalMode, setModalMode] = useState('sale')
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null })

  // Vue grille/liste
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    const saved = localStorage.getItem('onestock_sales_view_mode')
    if (saved === 'grid' || saved === 'list') setViewMode(saved)
  }, [])

  const toggleViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('onestock_sales_view_mode', mode)
  }

  // Filtrer les ventes
  const sales = useMemo(() => {
    let result = sneakers.filter(s => s.status === 'sold')

    // Filtre par période
    if (timeRange !== 'all') {
      const now = new Date()
      const startDate = new Date()

      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      result = result.filter(s => new Date(s.sellDate) >= startDate)
    }

    return result.sort((a, b) => new Date(b.sellDate) - new Date(a.sellDate))
  }, [sneakers, timeRange])

  // Calculer les stats
  const salesStats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + (s.sellPrice || 0), 0)
    const totalCost = sales.reduce((sum, s) => sum + s.buyPrice, 0)
    const totalFees = sales.reduce((sum, s) => sum + (s.fees || 0), 0)
    const totalProfit = totalRevenue - totalCost - totalFees

    const avgProfit = sales.length > 0 ? totalProfit / sales.length : 0
    const avgROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0
    const bestSale = sales.reduce((best, s) => {
      const profit = (s.sellPrice || 0) - s.buyPrice - (s.fees || 0)
      const bestProfit = best ? ((best.sellPrice || 0) - best.buyPrice - (best.fees || 0)) : -Infinity
      return profit > bestProfit ? s : best
    }, null)

    // Calculer la durée moyenne en stock
    const salesWithDuration = sales.filter(s => s.buyDate && s.sellDate)
    const avgStockDuration = salesWithDuration.length > 0
      ? salesWithDuration.reduce((sum, s) => {
          const buy = new Date(s.buyDate)
          const sell = new Date(s.sellDate)
          const days = Math.floor((sell - buy) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / salesWithDuration.length
      : 0

    // Calculer la rotation (ventes des 30 derniers jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const salesRotation = sales.filter(s => s.sellDate && new Date(s.sellDate) >= thirtyDaysAgo).length

    return {
      count: sales.length,
      totalRevenue,
      totalCost,
      totalFees,
      totalProfit,
      avgProfit,
      avgROI,
      bestSale,
      avgStockDuration,
      salesRotation,
    }
  }, [sales])

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

  const handleExport = () => {
    exportToCSV(sneakers, 'sold')
  }

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
        <title>{t('sales.title')} - OneStock</title>
      </Head>

      <Layout onAddClick={openAddModal} onAddSaleClick={openSaleModal} onExportClick={handleExport}>
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div>
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{t('sales.title')}</h1>
              <p className="text-xs md:text-base text-gray-400">{t('sales.subtitle')}</p>
            </div>

            {/* Time range filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="min-w-[100px] md:min-w-[160px] text-sm md:text-base"
            >
              <option value="all">{t('sales.allSales')}</option>
              <option value="week">{t('sales.thisWeek')}</option>
              <option value="month">{t('sales.thisMonth')}</option>
              <option value="year">{t('sales.thisYear')}</option>
            </select>
          </div>

          {/* Stats Cards avec style amélioré - 2 colonnes sur mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
            {/* Nombre de ventes */}
            <Link href="/stats" className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/30 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-blue-300/70 text-[10px] md:text-sm mb-1 md:mb-2">
                <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                {t('sales.salesCount')}
              </div>
              <div className="text-xl md:text-3xl font-black text-white">{salesStats.count}</div>
              <div className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-blue-400/60">{t('sales.pairsSold')}</div>
            </Link>

            {/* Chiffre d'affaires */}
            <Link href="/stats" className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-purple-300/70 text-[10px] md:text-sm mb-1 md:mb-2">
                <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                {t('sales.revenue')}
              </div>
              <div className="text-lg md:text-3xl font-black text-white">{formatPrice(salesStats.totalRevenue)}</div>
              <div className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-purple-400/60">{t('sales.totalRevenue')}</div>
            </Link>

            {/* Profit total */}
            <Link href="/stats" className={`group relative border rounded-xl md:rounded-2xl p-3 md:p-5 transition-all duration-300 hover:shadow-lg ${
              salesStats.totalProfit >= 0
                ? 'bg-gradient-to-br from-cyan-500/10 to-emerald-600/20 border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-cyan-500/20'
                : 'bg-gradient-to-br from-red-500/10 to-orange-600/20 border-red-500/30 hover:border-red-400/50 hover:shadow-red-500/20'
            }`}>
              <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className={`w-3 h-3 md:w-4 md:h-4 ${salesStats.totalProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`} />
              </div>
              <div className={`flex items-center gap-1 md:gap-2 text-[10px] md:text-sm mb-1 md:mb-2 ${salesStats.totalProfit >= 0 ? 'text-cyan-300/70' : 'text-red-300/70'}`}>
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                {t('sales.totalProfit')}
              </div>
              <div className={`text-lg md:text-3xl font-black ${salesStats.totalProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {salesStats.totalProfit >= 0 ? '+' : ''}{formatPrice(salesStats.totalProfit)}
              </div>
              <div className="mt-0.5 md:mt-1 hidden md:flex items-center justify-between">
                <span className={`text-xs ${salesStats.totalProfit >= 0 ? 'text-cyan-400/60' : 'text-red-400/60'}`}>
                  {t('sales.fees')}: {formatPrice(salesStats.totalFees)}
                </span>
                {salesStats.avgROI !== 0 && (
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    salesStats.avgROI >= 0 ? 'text-cyan-400 bg-cyan-500/20' : 'text-red-400 bg-red-500/20'
                  }`}>
                    <Percent className="w-3 h-3" />
                    {salesStats.avgROI >= 0 ? '+' : ''}{salesStats.avgROI.toFixed(0)}% ROI
                  </span>
                )}
              </div>
            </Link>

            {/* Profit moyen */}
            <Link href="/stats" className="group relative bg-gradient-to-br from-amber-500/10 to-orange-600/20 border border-amber-500/30 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-amber-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
              <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-amber-300/70 text-[10px] md:text-sm mb-1 md:mb-2">
                <Zap className="w-3 h-3 md:w-4 md:h-4" />
                {t('sales.avgProfit')}
              </div>
              <div className={`text-lg md:text-4xl font-black ${salesStats.avgProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {salesStats.avgProfit >= 0 ? '+' : ''}{formatPrice(salesStats.avgProfit)}
              </div>
              <div className="mt-0.5 md:mt-2 hidden md:flex items-center justify-between">
                <span className="text-xs text-amber-400/60">{t('sales.perSale')}</span>
                {salesStats.count > 0 && salesStats.totalCost > 0 && (
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    salesStats.avgProfit >= 0 ? 'text-amber-400 bg-amber-500/20' : 'text-red-400 bg-red-500/20'
                  }`}>
                    <Percent className="w-3 h-3" />
                    {salesStats.avgProfit >= 0 ? '+' : ''}{((salesStats.avgProfit / (salesStats.totalCost / salesStats.count)) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Duration and Rotation Stats - caché sur mobile */}
          <div className="hidden md:grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 border border-indigo-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300/70 text-sm mb-2">
                    <span className="text-lg">⏱️</span>
                    Durée moyenne en stock
                  </div>
                  <div className="text-3xl font-black text-white">
                    {salesStats.avgStockDuration > 0 ? `${Math.round(salesStats.avgStockDuration)} jours` : 'N/A'}
                  </div>
                  <div className="mt-1 text-xs text-indigo-400/60">Temps moyen entre achat et vente</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/20 border border-teal-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-300/70 text-sm mb-2">
                    <span className="text-lg">🔄</span>
                    Rotation (30 derniers jours)
                  </div>
                  <div className="text-3xl font-black text-white">
                    {salesStats.salesRotation} {salesStats.salesRotation > 1 ? 'ventes' : 'vente'}
                  </div>
                  <div className="mt-1 text-xs text-teal-400/60">Nombre de paires vendues ce mois</div>
                </div>
              </div>
            </div>
          </div>

          {/* Best sale - compact sur mobile */}
          {salesStats.bestSale && (
            <div className="mb-4 md:mb-8 p-3 md:p-5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/30 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-400 mb-2 md:mb-3">
                <span className="text-base md:text-lg">🏆</span>
                <span className="font-semibold">{t('sales.bestSale')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  {salesStats.bestSale.imageUrl ? (
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-dark-600 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                      <img src={salesStats.bestSale.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-dark-600 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-2xl flex-shrink-0">👟</div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs md:text-base truncate">{salesStats.bestSale.name}</div>
                    <div className="text-[10px] md:text-sm text-gray-400">{salesStats.bestSale.brand} • {salesStats.bestSale.size}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-base md:text-2xl font-black text-emerald-400">
                    +{formatPrice((salesStats.bestSale.sellPrice || 0) - salesStats.bestSale.buyPrice - (salesStats.bestSale.fees || 0))}
                  </div>
                  <div className="text-[10px] md:text-sm text-gray-500 hidden md:block">
                    {formatPrice(salesStats.bestSale.buyPrice)} → {formatPrice(salesStats.bestSale.sellPrice)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales list */}
          {sales.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-white">
                  {t('sales.history')} <span className="text-xs md:text-sm text-gray-500 font-normal ml-1">{sales.length} {sales.length > 1 ? t('sales.salesPlural') : t('sales.sale')}</span>
                </h2>
                <div className="flex items-center gap-1 bg-dark-800 border border-blue-500/20 rounded-lg p-0.5">
                  <button
                    onClick={() => toggleViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 px-0">
                  {sales.map((sneaker, index) => (
                    <div key={sneaker.id} className="animate-slideUp w-full" style={{ animationDelay: `${index * 50}ms` }}>
                      <SaleCard
                        sneaker={sneaker}
                        onEdit={handleEditSneaker}
                        onDelete={handleDeleteSneaker}
                        onToggle={handleToggle}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {sales.map((sneaker, index) => (
                    <div key={sneaker.id} className="animate-slideUp" style={{ animationDelay: `${index * 30}ms` }}>
                      <SneakerRow
                        sneaker={sneaker}
                        onEdit={handleEditSneaker}
                        onDelete={handleDeleteSneaker}
                        onToggle={handleToggle}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-8 md:py-16">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">💰</div>
              <p className="text-lg md:text-xl text-gray-300 mb-2">{t('sales.noSales')}</p>
              <p className="text-xs md:text-sm text-gray-500">
                {t('sales.markAsSold')}
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
