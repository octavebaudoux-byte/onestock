import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { TrendingUp, DollarSign, ShoppingBag, Zap, ArrowUpRight, Percent } from 'lucide-react'
import Layout from '../components/Layout'
import SneakerModal from '../components/SneakerModal'
import SaleCard from '../components/SaleCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatPrice, exportToCSV } from '../lib/store'
import { useData } from '../hooks/useData'
import { useLanguage } from '../contexts/LanguageContext'

export default function Sales() {
  const { sneakers, loading, save, update, remove } = useData()
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSneaker, setEditingSneaker] = useState(null)
  const [timeRange, setTimeRange] = useState('all')
  const [modalMode, setModalMode] = useState('sale')
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null })

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

    return {
      count: sales.length,
      totalRevenue,
      totalCost,
      totalFees,
      totalProfit,
      avgProfit,
      avgROI,
      bestSale,
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
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('sales.title')}</h1>
              <p className="text-gray-400">{t('sales.subtitle')}</p>
            </div>

            {/* Time range filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="min-w-[160px]"
            >
              <option value="all">{t('sales.allSales')}</option>
              <option value="week">{t('sales.thisWeek')}</option>
              <option value="month">{t('sales.thisMonth')}</option>
              <option value="year">{t('sales.thisYear')}</option>
            </select>
          </div>

          {/* Stats Cards avec style amélioré */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Nombre de ventes */}
            <Link href="/stats" className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/30 rounded-2xl p-5 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-center gap-2 text-blue-300/70 text-sm mb-2">
                <ShoppingBag className="w-4 h-4" />
                {t('sales.salesCount')}
              </div>
              <div className="text-3xl font-black text-white">{salesStats.count}</div>
              <div className="mt-1 text-xs text-blue-400/60">{t('sales.pairsSold')}</div>
            </Link>

            {/* Chiffre d'affaires */}
            <Link href="/stats" className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-2xl p-5 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-center gap-2 text-purple-300/70 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                {t('sales.revenue')}
              </div>
              <div className="text-3xl font-black text-white">{formatPrice(salesStats.totalRevenue)}</div>
              <div className="mt-1 text-xs text-purple-400/60">{t('sales.totalRevenue')}</div>
            </Link>

            {/* Profit total */}
            <Link href="/stats" className={`group relative border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${
              salesStats.totalProfit >= 0
                ? 'bg-gradient-to-br from-cyan-500/10 to-emerald-600/20 border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-cyan-500/20'
                : 'bg-gradient-to-br from-red-500/10 to-orange-600/20 border-red-500/30 hover:border-red-400/50 hover:shadow-red-500/20'
            }`}>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className={`w-4 h-4 ${salesStats.totalProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`} />
              </div>
              <div className={`flex items-center gap-2 text-sm mb-2 ${salesStats.totalProfit >= 0 ? 'text-cyan-300/70' : 'text-red-300/70'}`}>
                <TrendingUp className="w-4 h-4" />
                {t('sales.totalProfit')}
              </div>
              <div className={`text-3xl font-black ${salesStats.totalProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {salesStats.totalProfit >= 0 ? '+' : ''}{formatPrice(salesStats.totalProfit)}
              </div>
              <div className="mt-1 flex items-center justify-between">
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
            <Link href="/stats" className="group relative bg-gradient-to-br from-amber-500/10 to-orange-600/20 border border-amber-500/30 rounded-2xl p-5 hover:border-amber-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-2 text-amber-300/70 text-sm mb-2">
                <Zap className="w-4 h-4" />
                {t('sales.avgProfit')}
              </div>
              <div className={`text-4xl font-black ${salesStats.avgProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {salesStats.avgProfit >= 0 ? '+' : ''}{formatPrice(salesStats.avgProfit)}
              </div>
              <div className="mt-2 flex items-center justify-between">
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

          {/* Best sale */}
          {salesStats.bestSale && (
            <div className="mb-8 p-5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-emerald-400 mb-3">
                <span className="text-lg">🏆</span>
                <span className="font-semibold">{t('sales.bestSale')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {salesStats.bestSale.imageUrl ? (
                    <div className="w-16 h-16 bg-dark-600 rounded-xl overflow-hidden">
                      <img src={salesStats.bestSale.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-dark-600 rounded-xl flex items-center justify-center text-2xl">👟</div>
                  )}
                  <div>
                    <div className="font-bold text-white">{salesStats.bestSale.name}</div>
                    <div className="text-sm text-gray-400">{salesStats.bestSale.brand} • Taille {salesStats.bestSale.size}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    +{formatPrice((salesStats.bestSale.sellPrice || 0) - salesStats.bestSale.buyPrice - (salesStats.bestSale.fees || 0))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(salesStats.bestSale.buyPrice)} → {formatPrice(salesStats.bestSale.sellPrice)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales list avec les nouvelles cards */}
          {sales.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{t('sales.history')}</h2>
                <span className="text-sm text-gray-500">{sales.length} {sales.length > 1 ? t('sales.salesPlural') : t('sales.sale')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center sm:justify-items-start px-4 sm:px-0">
                {sales.map((sneaker, index) => (
                  <div key={sneaker.id} className="animate-slideUp w-full flex justify-center sm:justify-start" style={{ animationDelay: `${index * 50}ms` }}>
                    <SaleCard
                      sneaker={sneaker}
                      onEdit={handleEditSneaker}
                      onDelete={handleDeleteSneaker}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-xl text-gray-300 mb-2">{t('sales.noSales')}</p>
              <p className="text-sm text-gray-500">
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
    </>
  )
}
